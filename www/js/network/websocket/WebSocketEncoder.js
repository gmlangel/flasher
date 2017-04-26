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
                this._tempFunc1(pkg,null);
                WebSocketEncoder.instance.delegate.sendData(dv.buffer);
                WebSocketEncoder.instance._encode();
            }else{
                new CryptoTool(pkg.sequence).encodeAES256(pkg.data,(callbackData)=>{
                    if(callbackData.code === 0){
                    这里有问题
                        pkg.data = WebSocketDecoder.instance.dataObjByArrayBuff(pkg.commandID,callbackData.data.data);
                    }else{
                        console.log(callbackData.msg);
                    }
                    WebSocketDecoder.instance.delegate.analysisBody(pkg);
                    //decode下一个包
                    WebSocketDecoder.instance._decode();
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
}
WebSocketEncoder.instance = new WebSocketEncoder();