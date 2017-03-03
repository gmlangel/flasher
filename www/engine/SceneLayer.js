/**
 * 背景层
 * Created by guominglong on 2017/3/3.
 */

/**
 * 背景图层
 * @param w 图层宽度
 * @param h 图层高度
 * @param res 二维图像资源数组
 * */
function SceneLayer(w,h,res){
    /**
     * 宽度
     * */
    this.width = w;

    /**
     * 高度
     * */
    this.height = h;

    /**
     * 二维图像资源数组
     * */
    this.resArr = res;

    /**
     * 画布节点
     * */
    this.canvasNode = null;

    /**
     * 画布容器节点
     * */
    this.divNode = null;

    /**
     * 帧频,默认为每秒24帧
     * */
    this.getFrameRate = function(){
        return _frameRate;
    }
    this.setFrameRate = function(framerate){
        _frameRate = parseFloat(framerate);
        updateStepTime = _frameRate <= 0 ? 0 : 1/_frameRate;
    }

    var _frameRate = 24.0;//帧频
    var updateStepTime = 1/_frameRate;//时间计时器间隔
    var isInited = false;//是否初始化完毕
    var intervalId = -1;//时间计时器的句柄
    var selfInstance = this;

    /**
     * 开启渲染
     * */
    this.startRender = function(){
        if(isInited == false){
            this.init();
        }
        intervalId = setInterval(selfInstance.update,updateStepTime);
    }

    /**
     * 更新当前场景
     * */
    this.update = function(){
        clearTimeout(intervalId);
        //用于更新的代码区域--------begin------
        if(selfInstance.canvasNode == null)
        {
            return;
        }
        var canvas = selfInstance.canvasNode.getContext('2d');
        canvas.restore();
        canvas.fillStyle = (Math.random() * 10) > 5 ? 'red':'blue';
        canvas.fillRect(0,0,selfInstance.canvasNode.width,selfInstance.canvasNode.height)
        canvas.save();
        //用于更新的代码区域---------end-----
        intervalId = setTimeout(selfInstance.update,updateStepTime);
    }

    /**
     * 停止渲染
     * */
    this.stopRender = function(){
        if(intervalId != -1)
        {
            clearTimeout(intervalId);
        }
    }

    this.init = function(){
        if(isInited == true){
            return;
        }
        this.divNode = document.createElement('div');
        this.divNode.style.width = this.width;// + "px";
        this.divNode.style.height = this.height;// + "px";
        this.canvasNode = document.createElement('canvas');
        this.canvasNode.width = this.width
        this.canvasNode.height = this.height
        this.divNode.appendChild(this.canvasNode);
        document.body.appendChild(this.divNode);
        isInited = true;
    }
}