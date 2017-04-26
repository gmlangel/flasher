/**
 * Created by guominglong on 2017/4/25.
 */
class SVCCommandHeader{

}
//命令ID定义部分------------------------------------------------------------------------------------------------
//LBS接入,用于获取dataSocket的url地址
SVCCommandHeader.LBSIn_C2S = 0x00100011
SVCCommandHeader.LBSIn_S2C = 0x00100011
//回应性客户端心跳
SVCCommandHeader.HeartBeat_C2S_Supper = 0x00110001
SVCCommandHeader.HeartBeat_S2C_Supper = 0x00110001
//不回应性客户端心跳
SVCCommandHeader.HeartBeat_C2S = 0x00110010
//获取心跳配置
SVCCommandHeader.GetHeartBeatConfig_C2S = 0x0011000E
SVCCommandHeader.GetHeartBeatConfig_S2C = 0x0011000E
//获取心跳配置,得到的通知
SVCCommandHeader.GetHeartBeatConfigNotify_S2C = 0x0011000F
//客户端接入
SVCCommandHeader.ClientIn_C2S = 0x00110011
SVCCommandHeader.ClientIn_S2C = 0x00110011
//用户登录
SVCCommandHeader.ClientLogin_C2S = 0x00110012
SVCCommandHeader.ClientLogin_S2C = 0x00110012
//用户登出
SVCCommandHeader.ClientLogout_C2S = 0x00110013
//服务器强制用户下线
SVCCommandHeader.ForceLogout_S2C = 0x00110014
//进入教室
SVCCommandHeader.JoinRoom_C2S = 0x00130113
SVCCommandHeader.JoinRoom_S2C = 0x00130110

//结构定义部分---------------------------------------------------------------------------------
//this.decodeObjStruct = ['c','C','s','S','i','I','l','L','str'];
SVCCommandHeader.encodeStruct = new Map();
SVCCommandHeader.decodeStruct = new Map();

SVCCommandHeader.encodeStruct.set(
    SVCCommandHeader.LBSIn_C2S,
    [
        "FailedServerNum","I",
        "ServerIP",["I"],
        "IsManualSetting","C",
        "ISPIdx","C",
        "LocationCode","L"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.LBSIn_S2C,
    [
        "RspCode","I",
        "ServerIPNum","I",
        "ServerArr",[
            "ServerIP","I",
            "PortNum","I",
            "PortArr",["S"]
        ]
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.GetHeartBeatConfig_S2C,
    [
        "Interval","S",
        "C2STimeout","S",
        "S2CSwitch","C",
        "S2CTimeout","S"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.GetHeartBeatConfigNotify_S2C,
    [
        "Interval","S",
        "S2CSwitch","C",
        "S2CTimeout","S"
    ]
)

SVCCommandHeader.encodeStruct.set(
    SVCCommandHeader.ClientIn_C2S,
    [
        "ClientType","I",
        "ClientVer","str",
        "ClientFlag","str",
        "ClientOSFlag","C"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.ClientIn_S2C,
    [
        "RspCode","I",
        "SessionKeyLength","I",
        "SessionKey",["C"],
        "UpgradeInfo","str",
        "ClientInternetIP","I",
        "ClientPilotTips","str",
        "NetworkCommitInterval","I"
    ]
)

SVCCommandHeader.encodeStruct.set(
    SVCCommandHeader.ClientLogin_C2S,
    [
        "AccountType","C",
        "Account","str",
        "AuthTicketLength","I",
        "AuthTicket",["C"],
        "DefaultStatus","C",
        "ExternPassword","str"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.ClientLogin_S2C,
    [
        "RspCode","I",
        "UID","L",
        "UserName","str",
        "ServerTime","L",
        "LastLoginTime","L",
        "UserRight","L",
        "DefaultStatus","C"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.ForceLogout_S2C,
    [
        "reasion","I"
    ]
)

SVCCommandHeader.encodeStruct.set(
    SVCCommandHeader.JoinRoom_C2S,
    [
        "SID","L",
        "CID","L",
        "CourseID","I",
        "UserRole","C",
        "UserIdentity","C",
        "UserRight","C",
        "reserved_3","C",
        "UserSwitchFlag","I",
        "UserName","str",
        "AVSDKNum","I",
        "AVSDK",["C"],
        "UserCusData","str"
    ]
)

SVCCommandHeader.decodeStruct.set(
    SVCCommandHeader.ClientLogin_S2C,
    [
        "RspCode","I",
        "SID","L",
        "CID","L",
        "CourseID","L",
        "SchoolName","str",
        "ClassName","str",
        "StartTime","I",
        "Status",["C"],
        "MsgMode",["C"],
        "SwitchFlag","L",
        "OperatonFlag","L",
        "OwnerID","L",
        "OwnerIn","C",
        "OwnerName","str",
        "TeacherID","L",
        "TeacherIn","C",
        "TeacherName","str",
        "AssistantNum","I",
        "AssistantArr",[
            "AssistID","L",
            "UserName","str",
            "Identity","C",
            "UserRight","C",
            "UserSwitchFlag","C",
            "ClientType","C",
            "UserRole","C"
        ],
        "StudentNum","I",
        "StudentArr",[
            "StudentID","L",
            "UserName","str",
            "Identity","C",
            "UserRight","C",
            "UserSwitchFlag","C",
            "ClientType","C",
            "UserRole","C"
        ],
        "StuMediaNum","I",
        "StudentMediaIDArr",["I"],
        "StuCustomDataNum","I",
        "StuCustomDataArr",["str"]
    ]
)