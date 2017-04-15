/**
 * svc数据包解码器
 * */
class WebSocketDecoder extends BaseObject{
    constructor(){
        super();
    }

    /**
     * 解码
     * */
    decodePkg(arrBuffer){
        let pkg = new SvcPack();
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


        return pkg;
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
    }
}