/**
 * 头文件桥接文件(管理所有头文件,必须要window.onload之前添加头文件)
 * 注意:在使用gimport的时候是有继承顺序的,加入B继承A,那么一定要在gimport("A")下面再gimport("B")
 * Created by guominglong on 2017/4/12.
 */

/**
 * 定义js导入函数
 * @param jsPath js的地址
 * @param jsType js的类型,默认为text/javascript
 * @param args 是一个参数数组
 * */
gimport = (jsPath,jsType="text/javascript",...args) => {

    if(null == jsPath || typeof jsPath == 'undefined')
    {
        return 1;
    }
    let jsNode = document.createElement("script");
    jsNode.type = jsType;
    jsNode.src = jsPath;
    document.head.appendChild(jsNode);
    return 0;
}

//导入用户想要导入的js
gimport("./js/engine/Mix.js")
gimport("./js/engine/BaseObject.js")
gimport("./js/engine/BaseEventDispatcher.js")
gimport("./js/engine/BaseProxy.js")
gimport("./js/engine/BaseThread.js")
gimport("./js/engine/BaseView.js")
gimport("./js/engine/BaseWorker.js")
gimport("./js/AppDelegate.js")//http://172.16.3.178/crit/AppDelegate.js亲测可用,没有跨域问题
gimport("./js/network/websocket/WebSocketManager.js")
gimport("./js/network/websocket/WebSocketHandler.js")
