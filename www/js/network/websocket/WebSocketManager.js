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
        this.svc_lbs_hosts = ["svc.51talk.com","121.40.96.226"];
        this.svc_lbs_ports = ["6000","6001"];
        this.svc_lbs_urls = this.createUrls(this.svc_lbs_hosts,this.svc_lbs_ports)
        //normal,lbs_socket,data_socket
        this.socketState = SocketState.NOCONNECT;
        return this;
    }

    /**
     * 开始
     * */
    start(){
        if(this.socketState !== SocketState.NOCONNECT)
            return;
        this.socketState = SocketState.LBSSOCKET;
        //链接lbs
        this.linkLbs();
    }

    /**
     * 停止
     * */
    stop(){
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
                urls.push(`${host}:${port}`)
            })
        })
        return urls;
    }

    linkLbs(){
        this.ws = new WebSocketHandler()
    }

    destroy(){
        super.destroy();
        if(this.ws)
        {
            this.ws.destroy();
            this.ws = null;
        }
    }
}

/**
 * 单例
 * */
WebSocketManager.instance = new WebSocketManager();

