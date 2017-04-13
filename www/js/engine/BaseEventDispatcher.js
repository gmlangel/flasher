/**
 * 重载Event
 * */
class BaseEvent extends Event{
    constructor(type,data=null,...eventInitDict){
        super(type,eventInitDict);
        this.data = data;
        this.gCurrentTarget = null;
    }
}

/**
 * 基础事件派发者
 * Created by guominglong on 2017/4/7.
 */
class BaseEventDispatcher extends BaseObject{
    constructor(){
        super();
        this.eventNode = document.createElement("div");
        this.events = new Map();
    }

    /**
     * 派发事件
     * @param evt 是一个BaseEvent
     * */
    dispatchEvent(evt){
        if(!evt){
            return;
        }
        evt.gCurrentTarget = this;
        this.eventNode.dispatchEvent(evt);
    }

    /**
     * 添加一个事件监听
     * @param evtType 自定义的事件类型(也可以是系统的事件类型)
     * @param execFunc 事件的处理函数
     * @param useCapture 是否在捕获阶段执行,默认为false(在目标阶段和冒泡阶段执行)
     * */
    addEventListener(evtType,execFunc,useCapture = false){
        if(!evtType){
            return;
        }
        if(this.events.has(evtType)){
            //如果添加过监听,就追加
            this.events.get(evtType).add(execFunc)
        }else{
            //如果没有添加过监听,就新建监听集合
            this.events.set(evtType,new Set([execFunc]));
        }
        this.eventNode.addEventListener(evtType,execFunc,useCapture);
    }

    /**
     * 添加一个事件监听
     * @param evtType 自定义的事件类型(也可以是系统的事件类型)
     * @param execFunc 事件的处理函数
     * @param useCapture 是否在捕获阶段执行,默认为false(在目标阶段和冒泡阶段执行)
     * */
    removeEventListener(evtType,execFunc,useCapture = false){
        if(!evtType){
            return;
        }
        if(this.events.has(evtType)){
            //如果添加过监听,就追加
            let evtSet = this.events.get(evtType);
            evtSet.forEach((value,key) => {
                if(value == execFunc)evtSet.delete(value)
            })
            //如果监听函数数组的长度为0,代表不再需要用map来维护,直接删除
            if(evtSet.size == 0){
                this.events.delete(evtType)
            }
        }
        this.eventNode.removeEventListener(evtType,execFunc,useCapture)
    }

    /**
     * 移除所有的监听事件
     * */
    removeAllEventListener(){
        //遍历map
        let mySelf = this;
        this.events.forEach((value,key)=>{
            //遍历每一个监听类型对应的set函数数组
            let funcSet = value;
            funcSet.forEach((func,idx)=>{
                //移除指定的监听事件
                mySelf.eventNode.removeEventListener(key,func);
            })
            //清空函数数组
            funcSet.clear();
        })
        //清空map
        this.events.clear();
    }

    destroy(){
        super.destroy();
        this.removeAllEventListener();
    }
}
