/**
 * Created by guominglong on 2017/3/3.
 */
var aaa = 13;
onmessage = function (e){
    jiexiData(e.data);
}

function jiexiData(data){
    var cmdName = data["cmd"] || ""
    //如果是一个可执行函数,则执行该函数
    if(cmdName != "" && self[cmdName] != undefined && self[cmdName] != null && typeof(self[cmdName]) == "function"){
        self[cmdName](data["args"]);
    }
}

//注册处理函数
self["testFun"] = function(args){
    //回调主线程
    self.postMessage({"type":"okle","data":args});
}
