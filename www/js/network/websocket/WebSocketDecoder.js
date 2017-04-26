/**
 * svc数据包解码器
 * */
class WebSocketDecoder extends BaseProxy{
    constructor(){
        super();
        this.isDecoding = false;//是否正在解码
        this.waitDecodeArr = [];//等待解码的数据包集合
    }

    /**
     * 解码
     * @param arrBuffer  ArrayBuffer
     * */
    decodePkg(arrBuffer){
        this.waitDecodeArr.push(arrBuffer);
        if(this.isDecoding){
            return;
        }
        this._decode();
    }

    _decode(){
        this.isDecoding = true;
        if(this.waitDecodeArr.length > 0){
            let pkg = new SvcPack();
            let arrBuffer = this.waitDecodeArr.shift()
            let dataView = new DataView(arrBuffer);
            let offset = 0;
            //解析包头
            let pkgHead = dataView.getUint16(offset);
            offset += 2;
            pkg.size = dataView.getUint32(offset);
            offset += 4;
            pkg.sequence = dataView.getUint32(offset);
            offset += 4;
            pkg.packetType = dataView.getUint8(offset);
            offset += 1;
            pkg.commandID = dataView.getUint32(offset);
            offset += 4;
            pkg.sessionType = dataView.getUint8(offset);
            offset += 1;
            pkg.offlineAct = dataView.getUint8(offset);
            offset += 1;
            pkg.cryptType = dataView.getUint8(offset);
            offset += 1;
            pkg.pubKeyIndex = dataView.getUint16(offset);
            offset += 2;
            pkg.timeout = dataView.getUint16(offset);
            offset += 2;
            pkg.source = MyTool.mergeUint32ToUint64Str(dataView.getUint32(offset),dataView.getUint32(offset + 4));
            offset += 8;
            pkg.target = MyTool.mergeUint32ToUint64Str(dataView.getUint32(offset),dataView.getUint32(offset + 4));
            offset += 8;
            pkg.reserved = dataView.getUint16(offset);
            offset += 2;
            if(arrBuffer.byteLength == 41){
                //解析包尾部
                packfoot = dataView.getUint8(offset);
                //证明已经处理完毕,交给delegate处理
                WebSocketDecoder.instance.delegate.analysisBody(pkg);
                //decode下一个包
                WebSocketDecoder.instance._decode();
                return;
            }
            //继续解析包体
            let u8Buffer = new Uint8Array(arrBuffer,40,pkg.size - 41);
            offset = pkg.size - 1;
            //解析包尾部
            packfoot = dataView.getUint8(offset);

            //解析并从数组中移除第一个数据包
            new CryptoTool(pkg.sequence).decodeAES256(u8Buffer,(callbackData)=>{
                if(callbackData.code === 0){
                    pkg.data = WebSocketDecoder.instance.dataObjByArrayBuff(pkg.commandID,callbackData.data.data);
                }else{
                    console.log(callbackData.msg);
                }
                WebSocketDecoder.instance.delegate.analysisBody(pkg);
                //decode下一个包
                WebSocketDecoder.instance._decode();
            })
        }else{
            this.isDecoding = false;
        }
    }

    /**
     * 将arrayBuffer数据解析成一个object
     * */
    dataObjByArrayBuff(cmdID,buff){
        let obj = {};
        let dv = new DataView(buff);
        if(SVCCommandHeader.decodeStruct.has(cmdID)){
            let dataStuct = SVCCommandHeader.decodeStruct.get(cmdID);
            let j = dataStuct.length;
            let byteOffset = 0
            for(let i = 0;i < j;i+=2){
                let preKey = i>1 ? dataStuct[i-2]:"";
                byteOffset = this._readData(obj,dv,dataStuct[i],byteOffset,dataStuct[i+1],preKey)
            }
        }
        return obj;
    }

    _readData(obj,dv,key,byteOffset,valType,preKey){
        let ofset = byteOffset;
        switch(valType){
            case "c":
                obj[key] = dv.getInt8(ofset);
                ofset+=1;
                break;
            case "C":
                obj[key] = dv.getUint8(ofset);
                ofset+=1;
                break;
            case "s":
                obj[key] = dv.getInt16(ofset);
                ofset+=2;
                break;
            case "S":
                obj[key] = dv.getUint16(ofset);
                ofset+=2;
                break;
            case "i":
                obj[key] = dv.getInt32(ofset);
                ofset+=4;
                break;
            case "I":
                obj[key] = dv.getUint32(ofset);
                ofset+=4;
                break;
            case "l":
                obj[key] = MyTool.mergeUint32ToUint64Str(dv.getUint32(ofset),dv.getUint32(ofset+4))
                ofset+=8;
                break;
            case "L":
                obj[key] = MyTool.mergeUint32ToUint64Str(dv.getUint32(ofset),dv.getUint32(ofset+4))
                ofset+=8;
                break;
            case "str":
                let strLen = dv.getUint32(ofset);
                ofset+=4;
                let str = MyTool.stringByUTF8Buffer(new DataView(dv.buffer,ofset,strLen).buffer)
                obj[key] = str;
                ofset+=strLen+1;
                break;
            default:
                //解析复杂结构
                if(typeof valType === "Array"){
                    let j = obj[preKey];//获取循环次数
                    let subArr = [];
                    if(valType.length == 1){
                        let subValType = valType[0];
                        //简单数组结构
                        for(let i=0;i<j;i++)
                        {
                            ofset = this._readData(subArr,dv,i,ofset,subValType,"")
                        }
                    }else{
                        //数组与字典的混合型结构
                        for(let i=0;i<j;i++)
                        {
                            let subObj = {};
                            //ofset = this._readData(subObj,dv,i,ofset,subValType,"")
                            let subLength = valType.length;
                            for(let z=0;z<subLength;z++){
                                let preKey = z>1?valType[z-2]:"";
                                ofset = this._readData(subObj,dv,valType[z],ofset,valType[z+1],preKey)
                            }
                            subArr.push(subObj);
                        }
                    }
                    obj[key] = subArr;
                }else{
                    throw new Error("为识别的类型")
                }
                break;
        }
        return ofset;
    }
}

WebSocketDecoder.instance = new WebSocketDecoder();

/**
 * 一个解析后的数据包
 * */
class SvcPack extends BaseObject{
    constructor(){
        this.size = 0;
        this.sequence = 0;
        this.packetType = 0;
        this.commandID = 0;
        this.sessionType = 0;
        this.offlineAct = 0;
        this.cryptType = 0;
        this.pubKeyIndex = 0;
        this.timeout = 15;
        this.source = 0;
        this.target = 0;
        this.reserved = 0;
        this.data = null;//包体数据(解密后的)
    }
}