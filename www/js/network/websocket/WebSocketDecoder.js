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
        return pkg;
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
            //解析包体
            let u8Buffer = new Uint8Array(arrBuffer,40,pkg.size - 41);
            offset = pkg.size - 1;
            //解析包尾部
            packfoot = dataView.getUint8(offset);

            //解析并从数组中移除第一个数据包
            new CryptoTool(pkg.sequence).decodeAES256(u8Buffer,(callbackData)=>{
                if(callbackData.code === 0){
                    pkg.data = callbackData.data.data;
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