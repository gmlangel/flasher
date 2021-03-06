/**
 * Created by guominglong on 2017/4/14.
 */

class MyTool{


}

/**
 * 将utf16编码的arrayBuffer转string
 * */
MyTool.stringByUTF16Buffer = arrayBuffer => {
    let out="";
    let u16a = new Uint16Array(arrayBuffer);
    let single ;
    for(let i=0 ; i < u16a.length;i++){
        single = u16a[i].toString(16)
        while(single.length<4) single = "0".concat(single);
        out+="\\u"+single;
    }
    return eval("'"+out+ "'");
}

/**
 * 将string转utf6编码的arrayBuffer
 * */
MyTool.utf16bufferByString = str => {
    let out = new ArrayBuffer(str.length*2);
    let u16a= new Uint16Array(out);
    let strs = str.split("");
    for(let i =0 ; i<strs.length;i++){
        u16a[i]=strs[i].charCodeAt();
    }
    return out;
}

/**
 * 将utf8编码的arrayBuffer转string
 * */
MyTool.stringByUTF8Buffer = arrayBuffer => {
    let array = new Uint8Array(arrayBuffer);
    let out, i, len, c;
    let char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
        c = array[i++];
        switch(c >> 4)
        {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
            case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

/**
 * 将两个uint32的值合成一个uint64的字符串
 * */
MyTool.mergeUint32ToUint64Str = (u1,u2) => {
    if(!Number.isInteger(u1) || !Number.isInteger(u2))
        return "";
    let str = u1.toString(16);
    let str2 = u1.toString(16);
    str = "0".repeat(8 - str.length) + str;
    str2 = "0".repeat(8 - str2.length) + str2;
    return `0x${str}${str2}`;
}

MyTool.twoUint32ByUint64Str = (u64) => {
    let str = u64.substr(2,8);
    let str2 = u64.substr(10,8);
    return [Number("0x"+str),Number("0x"+str2)];
}