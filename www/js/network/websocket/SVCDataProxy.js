/**
 * 用于分析svc服务器返回的数据包(做拼接和切片处理)
 * Created by guominglong on 2017/4/15.
 */
class SVCDataProxy extends BaseProxy{

    constructor(){
        super();
        this.mainData = new DataView(new ArrayBuffer(0))
    }

    /**
     * 清空未处理的冗余数据
     * */
    clearData(){
        this.mainData = null;
    }

    /**
     * 追加字节流
     * */
    appendData(arrBuffer){
        //将新数据拼接到老数据尾部
        let nd = new Uint8Array(this.mainData.byteLength + arrBuffer.byteLength);
        let mainDataBuffer = new Uint8Array(this.mainData.buffer);
        let j = mainDataBuffer.length;
        let i=0
        for(;i<j;i++){
            nd[i] = mainDataBuffer[i];
        }
        let newDataBuffer = new Uint8Array(arrBuffer);
        let z = nd.length;
        for(;i<z;i++){
            nd[i] = newDataBuffer[i-j];
        }
        this.mainData = new DataView(nd.buffer);
        //尝试解析包
        tryGetPack();
    }

    tryGetPack(){
        if(this.mainData.byteLength < 41){
            return;//长度不足41个字节的不是一个包
        }
        //检索包头
        let buffoffset = 0;
        let i = 0;
        let j = this.mainData.byteLength;
        while(i < j){
            if(i<j-1)
            {
                if(this.mainData.getUint16(i) == 0xEA67){
                    //检索到了头
                    buffoffset = i;
                    break;
                }
            }else{
                //没有检索到头
                buffoffset = i;
                break;
            }
            i+=2;
        }
        if(buffoffset !== 0){
            //删除掉 '包'头以前的无用字节
            this.mainData = new DataView(this.mainData.buffer,buffoffset,j-buffoffset);
        }
        if(this.mainData.byteLength < 41){
            return;//长度不足41个字节的不是一个包
        }
        //检索包尾部
        let packSize = this.mainData.getUint32(2);
        if(this.mainData.byteLength < packSize || this.mainData.getUint8(packSize-1) != 0xEB){
            //this.mainData的可读取长度不够,或者packSize的最后一个字节不是结束符0xeb .算作无效包
            return;
        }

        //获取到了一个可用包,将结果派发给处理者
        let resultBuffer = Uint8Array(packSize);
        i = 0,j=packSize;
        for(i<j;i++){
            resultBuffer[i] = this.mainData.getUint8(i);
        }
        this.delegate.execDataBody(resultBuffer.buffer);
        //截断this.mainData防止下一次重复解析了同一个包
        this.mainData = new DataView(this.mainData.buffer,packSize,this.mainData.byteLength-packSize);
        //检查一下是否还能再从mainData中读出一个可用包
        tryGetPack();
    }
}