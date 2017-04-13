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
        return this;
    }

    /**
     * 开始
     * */
    start(){

    }

    /**
     * 停止
     * */
    stop(){

    }

    destroy(){
        super.destroy();
    }
}

/**
 * 单例
 * */
WebSocketManager.instance = new WebSocketManager();