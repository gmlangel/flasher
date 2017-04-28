/**
 * svc数据包编码器
 * */
class WebSocketEncoder extends BaseProxy{
    constructor(){
        super();
        this.isEncoding = false;//是否正在解码
        this.waitEncodeArr = [];//等待解码的数据包集合
    }

    /**
     * 将一个obj编码为一个arrayBuffer数据包
     * @param svcPackObj SvcPack 一个Obj数据包
     * */
    encodePkg(svcPackObj){
        this.waitEncodeArr.push(obj);
        if(this.isEncoding){
            return;
        }
        this._encode();
    }

    _encode(){
        this.isEncoding = true;
        if(this.waitEncodeArr.length > 0){
            let pkg = this.waitEncodeArr.shift();
            let offset = 0;
            if(null == pkg.data){
                let dv = this._tempFunc1(pkg,null);
                WebSocketEncoder.instance.delegate.sendData(dv.buffer);
                WebSocketEncoder.instance._encode();
            }else{
                let buff = this.arrayBufferByObj(pkg.data);
                new CryptoTool(pkg.sequence).encodeAES256(buff,(callbackData)=>{
                    if(callbackData.code === 0){
                        let dv = WebSocketDecoder.instance._tempFunc1(pkg,callbackData.data.data)
                        WebSocketEncoder.instance.delegate.sendData(dv.buffer);//向远端发送
                        WebSocketEncoder.instance._encode();//尝试下一个封包
                    }else{
                        console.log(callbackData.msg);
                    }
                })
            }
        }else{
            this.isEncoding = false;
        }
    }

    _tempFunc1(pkg,bodyBuffer){
        if(bodyBuffer)
        {
            pkg.size = 41 + bodyBuffer.byteLength;
        }
        let dv = new DataView(new ArrayBuffer(pkg.size));
        dv.setUint16(offset,0xEA67);
        offset += 2;
        dv.setUint32(offset,pkg.size);
        offset += 4;
        dv.setUint32(offset,pkg.sequence);
        offset += 4;
        dv.setUint8(offset,pkg.packetType)
        offset += 1;
        dv.setUint32(offset,pkg.commandID);
        offset += 4;
        dv.setUint8(offset,pkg.sessionType)
        offset += 1;
        dv.setUint8(offset,pkg.offlineAct)
        offset += 1;
        dv.setUint8(offset,pkg.cryptType)
        offset += 1;
        dv.setUint16(offset,pkg.pubKeyIndex);
        offset += 2;
        dv.setUint16(offset,pkg.timeout);
        offset += 2;
        let [sH,sL] = MyTool.twoUint32ByUint64Str(pkg.source);
        dv.setUint32(offset,sH);
        offset += 4;
        dv.setUint32(offset,sL);
        offset += 4;
        let [tH,tL] = MyTool.twoUint32ByUint64Str(pkg.source);
        dv.setUint32(offset,tH);
        offset += 4;
        dv.setUint32(offset,tL);
        offset += 4;
        dv.setUint16(offset,pkg.reserved);
        offset += 2;
        if(bodyBuffer)
        {
            let u8Buffer = new Uint8Array(bodyBuffer);
            u8Buffer.forEach(byte => {
                dv.setUint8(offset,byte);
                offset += 1;
            })
        }
        dv.setUint8(offset,0xEB);
        offset += 1;
        return dv;
    }

    arrayBufferByObj(obj){
        let resultBuffer = new ArrayBuffer(0);
        if(SVCCommandHeader.encodeStruct.has(pkg.commandID)){
            let encodeStroct = SVCCommandHeader.encodeStruct.get(pkg.commandID);
            let j = encodeStroct.length;
            let arr = [];
            let offset = 0;
            let i=0;
            for(;i<j;i+=2){
                let valType = encodeStroct[i+1];
                let key = encodeStroct[i];
                let preKey = i>1 ? encodeStroct[i-2] : "";
                offset = this._writeData(arr,obj,offset,key,valType,preKey);
            }
            let resultData = new DataView(new ArrayBuffer(offset));
            offset = 0;
            arr.forEach(dv=>{
                let z = 0;
                j = dv.byteLength;
                for(;i<j;){
                    resultData.setUint8(offset,dv.getUint8(z));
                    z++;
                    offset++;
                }
            })
            while(arr.length){
                arr.shift();
            }
            resultBuffer = resultData.buffer;
        }
        return resultBuffer;
    }

    _writeData(arr,obj,offset,key,valType,preKey){
        let dv = null;
        switch(valType){
            case "c":
                dv = new DataView(new ArrayBuffer(1));
                dv.setInt8(0,obj[key]);
                arr.push(dv);
                offset+=1
                break;
            case "C":
                dv = new DataView(new ArrayBuffer(1));
                dv.setUint8(0,obj[key]);
                arr.push(dv);
                offset+=1;
                break;
            case "s":
                dv = new DataView(new ArrayBuffer(2));
                dv.setInt16(0,obj[key]);
                arr.push(dv);
                offset+=2;
                break;
            case "S":
                dv = new DataView(new ArrayBuffer(2));
                dv.setUint16(0,obj[key]);
                arr.push(dv);
                offset+=2;
                break;
            case "i":
                dv = new DataView(new ArrayBuffer(4));
                dv.setInt32(0,obj[key]);
                arr.push(dv);
                offset+=4;
                break;
            case "I":
                dv = new DataView(new ArrayBuffer(4));
                dv.setUint32(0,obj[key]);
                arr.push(dv);
                offset+=4;
                break;
            case "l":
                dv = new DataView(new ArrayBuffer(8));
                let [tH,tL] = MyTool.twoUint32ByUint64Str(obj[key]);
                dv.setInt32(0,tH);
                dv.setInt32(4,tL);
                arr.push(dv);
                offset+=8;
                break;
            case "L":
                dv = new DataView(new ArrayBuffer(8));
                let [tH2,tL2] = MyTool.twoUint32ByUint64Str(obj[key]);
                dv.setUint32(0,tH2);
                dv.setUint32(4,tL2);
                arr.push(dv);
                offset+=8;
                break;
            case "str":
                let utf8Buffer = new StringView(obj[key]).buffer.buffer;
                dv = new DataView(new ArrayBuffer(4+utf8Buffer.byteLength+1))
                dv.setUint32(0,utf8Buffer.byteLength);
                let toffset = 4;
                utf8Buffer.forEach(bt => {
                    dv.setUint8(toffset,bt);
                    toffset+=1;
                })
                arr.push(dv);
                offset+=dv.byteLength
                break;
            default:
                //解析复杂结构
                if(typeof valType === "Array"){
                    let j = obj[preKey];//获取循环次数
                    if(valType.length == 1){
                        let subValType = valType[0];
                        //简单数组结构
                        for(let i=0;i<j;i++)
                        {
                            offset = this._writeData(arr,obj,offset,i,subValType,"")
                        }
                    }else{
                        //数组与字典的混合型结构
                        for(let i=0;i<j;i++)
                        {
                            //ofset = this._readData(subObj,dv,i,ofset,subValType,"")
                            let subLength = valType.length;
                            for(let z=0;z<subLength;z++){
                                let preKey = z>1?valType[z-2]:"";
                                offset = this._writeData(arr,obj,offset,valType[z],valType[z+1],preKey)
                            }
                        }
                    }
                }else{
                    throw new Error("为识别的类型")
                }
                break;
        }
        return offset;
    }
}
WebSocketEncoder.instance = new WebSocketEncoder();