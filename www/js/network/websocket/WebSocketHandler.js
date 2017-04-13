/**
 * 一个websocket实例
 * */
class WebSocketHandler extends BaseEventDispatcher{

    /**
     * 初始化
     * @param url  websocket的地址如'ws://html5rocks.websocket.org/echo'
     * @param protocols 可选值,用于约束websocket的子协议如:soap,xmpp等等
     * */
    constructor(url,...protocols){
        super();
        if(url){
            //根据不同参数,创建不同的webSocket对象
            if(protocols.length > 0)
                this.ws = new WebSocket(url,protocols)
            else
                this.ws = new WebSocket(url);

            this.ws.onclose = this.ongClose;
            this.ws.onopen = this.ongOpen;
            this.ws.onmessage = this.ongmessage;
            this.ws.onerror = this.ongError;
            this.ws.delegate = this;
        }else{
            throw new Error("websocket的链接地址不能为空")
        }
        this.isOpen = false;//socket是否链接成功
    }

    ongClose(evt){
        //这个地方不用this,是因为this指代websocket.这个问题很奇怪
        evt.currentTarget.delegate.isOpen = false;
        evt.currentTarget.delegate.dispatchEvent(new WebSocketEvent(WebSocketEvent.SOCKET_CLOSE))
    }

    ongOpen(evt){
        //这个地方不用this,是因为this指代websocket.这个问题很奇怪
        evt.currentTarget.delegate.isOpen = true;
        evt.currentTarget.delegate.dispatchEvent(new WebSocketEvent(WebSocketEvent.SOCKET_CONNECTED))
    }

    ongmessage(evt){
        //这个地方不用this,是因为this指代websocket.这个问题很奇怪
        evt.currentTarget.delegate.dispatchEvent(new WebSocketEvent(WebSocketEvent.SOCKET_DATA,evt.data))
    }

    ongError(evt){
        //这个地方不用this,是因为this指代websocket.这个问题很奇怪
        evt.currentTarget.delegate.dispatchEvent(new WebSocketEvent(WebSocketEvent.SOCKET_ERROR))
    }

    /**
     * 向服务器发送数据
     * @param data 可以为String,ArrayBuffer,ArrayBufferView,Blob
     * */
    sendData(data){
        if(this.isOpen)
            this.ws.send(data);
    }

    destroy(){
        super.destroy()
        this.ws.delegate = null;
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.onmessage = null;
        this.ws.onopen = null;
    }
}

/**
 * 自定义的websocket相关事件
 * */
class WebSocketEvent extends BaseEvent{

}
//当socket关闭
WebSocketEvent.SOCKET_CLOSE = "WebSocketEvent.socket.close";
//当socket发生错误
WebSocketEvent.SOCKET_ERROR = "WebSocketEvent.socket.error";
//当socket有数据过来
WebSocketEvent.SOCKET_DATA = "WebSocketEvent.socket.data";
//当socket链接成功
WebSocketEvent.SOCKET_CONNECTED = "WebSocketEvent.socket.connected";

