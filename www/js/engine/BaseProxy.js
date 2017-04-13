/**
 * 所有委托的基类
 * Created by guominglong on 2017/4/7.
 */
class BaseProxy extends BaseEventDispatcher{
    constructor(){
        super();
        this.delegate = null;
    }

    destroy(){
        super.destroy();
        this.delegate = null;
    }
}