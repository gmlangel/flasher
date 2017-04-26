/**
 * Created by guominglong on 2017/4/17.
 */

class CryptoTool{

    constructor(_id = 0){
        this.id = _id;//唯一标识
        this.data = null;//加密或者解密后的数据
    }

    makeKey(){
        let strkey = "{971E1D3A-042B-41da-8E97-181F8073D8E2}";
        //用于aes加密的key
        let aeskey = new Uint8Array(32);
        for(let i = 0;i<32;i++){
            aeskey[i] = strkey.charCodeAt(i);
        }
        return aeskey;
    }


    /**
     * aes256解密
     * @param arrBuffer ArrayBuffer 要解密的字节流
     * @param compCallBack 解密后的回调函数
     * */
    decodeAES256(arrBuffer,compCallBack){
        if(!compCallBack){
            throw new Error("[decodeAES256]compCallBack不能为空")
        }
        if(null == CryptoTool.aeskey){
            compCallBack({"code":1,"msg":"CryptoTool.aeskey无效"})
            return;//无效的key不能加密
        }
        let selfIns = this;
        crypto.subtle.decrypt(
            CryptoTool.aesiv,
            CryptoTool.aeskey, //from generateKey or importKey above
            arrBuffer //ArrayBuffer of the data
        ).then(function(decrypted){
                //returns an ArrayBuffer containing the decrypted data
            selfIns.data = decrypted
            selfIns.consoleBuffer(selfIns.data,"解密后")
            compCallBack({"code":0,"data":selfIns})
        }).catch(function(err){
            console.error(err);
            compCallBack({"code":2,"msg":`解密失败,错误原因${err}`})
        });
    }

    /**
     * aes256加密
     * @param arrBuffer ArrayBuffer 要加密的字节流
     * @param compCallBack 加密后的回调函数
     * */
    encodeAES256(arrBuffer,compCallBack){
        if(!compCallBack){
            throw new Error("[encodeAES256]compCallBack不能为空")
        }
        if(null == CryptoTool.aeskey){
            compCallBack({"code":1,"msg":"CryptoTool.aeskey无效"})
            return;//无效的key不能加密
        }
        let selfIns = this;
        crypto.subtle.encrypt(
            CryptoTool.aesiv,
            CryptoTool.aeskey, //from generateKey or importKey above
            arrBuffer //ArrayBuffer of data you want to encrypt
        ).then(function(encrypted){
            //returns an ArrayBuffer containing the encrypted data
            selfIns.data = encrypted
            selfIns.consoleBuffer(selfIns.data,"加密后")
            compCallBack({"code":0,"data":selfIns})
        }).catch(function(err){
            //console.error(err);
            compCallBack({"code":2,"msg":`加密失败,错误原因${err}`})
        });
    }

    /**
     * 创建AESkey,不需要多次创建
     * */
    _makeAESkey(){
        crypto.subtle.importKey(
            "raw", //can be "jwk" or "raw"
            new CryptoTool().makeKey(),
            {   //this is the algorithm options
                name: "AES-CBC",
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["encrypt", "decrypt"] //can be "encrypt", "decrypt", "wrapKey", or "unwrapKey"
            )
            .then(function(key){
                //returns the symmetric key
                //console.log(key);
                CryptoTool.aeskey = key;//aesKey生成成功
            })
            .catch(function(err){
                //console.error(err);
                CryptoTool.aeskey = null;//aesKey生成失败
            });
    }

    /**
     * 打印输出
     * @param buff 要打印的字节流
     * @param qianzui 一个字符串前缀,没有什么实际意义
     * */
    consoleBuffer(buff,qianzui = ""){
        let dcData = buff;
        let resultStr = "";
        for(var ti=0;ti<dcData.length;ti++){
            resultStr += dcData[ti] < 16 ? "0x0" + dcData[ti].toString(16):"0x" + dcData[ti].toString(16)
            resultStr +=",";
        }
        console.log("id=" + this.id +qianzui,resultStr);
    }
}

//静态变量定义部分-----------------------------------------------------
//aes 256Key
CryptoTool.aeskey = null;
//aes iv向量
CryptoTool.aesiv = {
    name: "AES-CBC",
    //Don't re-use initialization vectors!
    //Always generate a new iv every time your encrypt!
    iv: new Uint8Array(new Array(16).fill(0)),
}
