/**
 * 定义socket的当前状态
 * */
class SocketState{

}
SocketState.NOCONNECT = "SocketState_noconnect";//没有任何链接
SocketState.LBSSOCKET = "SocketState_lbs_socket";//正在使用LBS链接
SocketState.DATASOCKET = "SocketState_data_socket";//正在使用data socket链接


/**
 * webSocket管理器
 * */
class WebSocketManager extends BaseProxy{
    constructor(){
        super();
        if(!window.WebSocket){
            throw new Error("当前浏览器不支持开启websocket");
            return null;
        }
        new CryptoTool()._makeAESkey();//提前创建AESkey,不然加密或者解密包时会报错
        this.dataProxy = new SVCDataProxy();
        this.dataProxy.delegate = this;
        WebSocketDecoder.instance.delegate = this;
        WebSocketEncoder.instance.delegate = this;
        this.isFirstMsg = true;//是否为socket连接成功后传输的第一条消息. 因为第一条消息要做tostring特殊处理,其他的消息用dataProxy来处理
        //lbs连接相关
        this.svc_lbs_hosts = ["172.16.0.115"];//["svc.51talk.com","121.40.96.226"];
        this.svc_lbs_ports = ["6000","6001"];
        this.svc_lbs_urls = [];
        //acc连接相关,需要客户端接入成功后,由返回数据来填充
        this.svc_acc_hosts = [];
        this.svc_acc_ports = [];
        this.svc_acc_urls = [];
        //normal,lbs_socket,data_socket
        this.socketState = SocketState.NOCONNECT;
        this._canExecDataBody = false;//是否可以执行数据包(如果除了本类以外的业务逻辑类全都已经准备就绪,那么这个值应该为true)
        this.waitBodys = [];//待执行的数据包
        return this;
    }

    get canExecDataBody(){
        return this._canExecDataBody;
    }

    set canExecDataBody(val){
        this._canExecDataBody = val;
        if(val)
            this.execDataBody(null);
    }

    /**
     * 开始
     * */
    start(){
        if(this.socketState !== SocketState.NOCONNECT)
            return;
        //链接lbs
        this.linkLbs();
    }

    /**
     * 停止
     * */
    stop(){
        this.isFirstMsg = true;
        this.socketState = SocketState.NOCONNECT;
        this.ws.close();
        this.ws.destroy();
        this.ws = null;
    }

    /**
     * 生成url数组
     * */
    createUrls(hostArr,portArr){
        let urls = [];
        hostArr.forEach(host=>{
            portArr.forEach(port=>{
                urls.push(JSON.stringify({"host":host,"port":port}))
            })
        })
        return urls;
    }

    /**
     * 链接lbs
     * */
    linkLbs(){
        this.isFirstMsg = true;
        this.socketState = SocketState.LBSSOCKET;
        this.ws = new WebSocketHandler("ws://172.16.3.171:3000",["gateway"]);
        this.ws.addEventListener(WebSocketEvent.SOCKET_CLOSE,this.onSocketClose)
        this.ws.addEventListener(WebSocketEvent.SOCKET_DATA,this.onSocketData);
        this.ws.addEventListener(WebSocketEvent.SOCKET_ERROR,this.onSocketError)
        this.ws.addEventListener(WebSocketEvent.SOCKET_CONNECTED,this.onSocketConnected)
    }

    /**
     * 链接acc
     * */
    linkACC(){
        this.isFirstMsg = true;
        this.socketState = SocketState.DATASOCKET;
        this.ws = new WebSocketHandler("ws://172.16.3.171:3000",["gateway"]);
        this.ws.addEventListener(WebSocketEvent.SOCKET_CLOSE,this.onSocketClose)
        this.ws.addEventListener(WebSocketEvent.SOCKET_DATA,this.onSocketData);
        this.ws.addEventListener(WebSocketEvent.SOCKET_ERROR,this.onSocketError)
        this.ws.addEventListener(WebSocketEvent.SOCKET_CONNECTED,this.onSocketConnected)
    }

    /**
     * 当socket断开
     * */
    onSocketClose(e){
        console.log("socket关闭");
        if(e.code === WebSocketHandler.CustomCloseCode){
            //用户主动断开websocket连接,不予处理
        }else{
            //由于网络原因或者服务器端干掉socket,则重连
            this.dataProxy.clearData();//清空这次socket连接中冗余的数据
            if(this.ws){
                this.ws.destroy();
                this.ws = null;
            }
            if(this.socketState == SocketState.DATASOCKET){
                //重新连接acc
                this.linkACC();
            }else{
                //重新连接lbs
                this.linkLbs();
            }
        }
    }

    /**
     * 收到server端下发的数据
     * */
    onSocketData(e){
        if(this.isFirstMsg){
            //收到的第一条消息,做string特殊处理
            let str = MyTool.stringByUTF8Buffer(e.data)
            console.log(str);
        }else{
            //其他的消息,扔进数据委托类,进行处理
            this.dataProxy.appendData(e.data)
        }
        this.isFirstMsg = false;
    }

    /**
     * socket连接发生错误
     * */
    onSocketError(e){
        console.log(e)
    }

    /**
     * 当socket连接成功
     * */
    onSocketConnected(e){
        console.log(e)
        let msg = "";
        if(this.socketState === SocketState.LBSSOCKET || this.svc_acc_hosts.length === 0 || this.svc_acc_ports.length === 0)
        {
            //创建lbs连接的第一条信令
            if(0 === this.svc_lbs_urls.length){
                //如果已经没有可链接的地址,则重新创建
                this.svc_lbs_urls = this.createUrls(this.svc_lbs_hosts,this.svc_lbs_ports);
            }
            msg = this.svc_lbs_urls.shift();
        }else{
            //创建acc连接的第一条信令
            if(0 === this.svc_acc_urls.length){
                this.svc_acc_urls = this.createUrls(this.svc_acc_hosts,this.svc_acc_ports);
            }
            msg = this.svc_acc_urls.shift();
        }
        let msgBuffer = new StringView(msg).buffer;
        this.ws.sendData(msgBuffer)
    }

    /**
     * 执行数据包
     * */
    execDataBody(dataBody){
        if(dataBody){
            this.waitBodys.push(dataBody);
        }
        if(this.canExecDataBody){
            //解析数据包
            if(this.waitBodys.length > 0)
            {
                //解析数据包
                WebSocketDecoder.instance.decodePkg(this.waitBodys.shift())
                execDataBody(null);//执行下一个包
            }
        }
    }

    /**
     * 解析数据包完毕后的回调
     * */
    analysisBody(svcPack){
        switch(svcPack.commandID){
            case 0:break;
            default:break;
        }
    }

    /**
     * 清除数组中的每一个元素
     * */
    clearArr(arr,isBaseObject = false){
        if(isBaseObject){
            while(arr.length > 0){
                let item = arr.pop();
                item.destroy();
            }
        }else{
            while(arr.length > 0){
                arr.pop();
            }
        }

    }
    destroy(){
        super.destroy();
        if(this.ws)
        {
            this.ws.destroy();
            this.ws = null;
        }
        this.dataProxy.destroy();
        this.dataProxy = null;
        WebSocketDecoder.instance.delegate = null;
        WebSocketEncoder.instance.delegate = null;
        //清空各个数组
        this.clearArr(this.svc_acc_hosts);
        this.clearArr(this.svc_acc_ports);
        this.clearArr(this.svc_acc_urls);
        this.clearArr(this.svc_lbs_hosts);
        this.clearArr(this.svc_lbs_ports);
        this.clearArr(this.svc_lbs_urls);
        this.clearArr(this.waitBodys,true);
    }
}

/**
 * 单例
 * */
WebSocketManager.instance = new WebSocketManager();

