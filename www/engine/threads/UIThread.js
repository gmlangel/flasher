/**
 * 用于UI界面数据处理的线程
 * Created by guominglong on 2017/3/3.
 */
function UIThread(){
    var selfInstance = this;
    var wk = null;
    var dispatcherObj = document.createElement("div");

    /**
     * 用户自定义数据
     * */
    this.data = null;

    this.dispatchEvent = function(e){
        dispatcherObj.dispatchEvent(e);
    }

    this.addEventListener = function(ename,func){
        dispatcherObj.addEventListener(ename,func);
    }

    this.removeEventListener = function(ename,func){
        dispatcherObj.removeEventListener(ename,func);
    }

    /**
     * 开启线程
     * */
    this.start = function(){
        if(wk == null){
            wk = new Worker('./engine/threads/UIWorker.js')
            wk.onmessage = function(e){
                selfInstance.data = e.data;
                selfInstance.dispatchEvent(new Event(e.data.type))
            }
        }
    }

    /**
     * 结束线程
     * */
    this.stop = function(){
        if(wk != null){
            wk.terminate();
        }
    }


    /**
     * 向线程提交任务
     * @param execCmd 要执行的命令ID
     * @param execArg 执行命令所需的参数
     * */
    this.exec = function(execCmd,execArg){
        if(wk == null){
            this.start();//开启线程
        }
        wk.postMessage({'cmd':execCmd,'args':execArg});
    }
}

UIThread.instance = new UIThread();

