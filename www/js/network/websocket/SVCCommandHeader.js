/**
 * Created by guominglong on 2017/4/25.
 */
class SVCCommandHeader{

}
//客户端接入
SVCCommandHeader.ClientIn_C2S = 0x00100011
SVCCommandHeader.ClientIn_S2C = 0x00100011
//回应性客户端心跳
SVCCommandHeader.HeartBeat_C2S_Supper = 0x00110001
SVCCommandHeader.HeartBeat_S2C_Supper = 0x00110001
//不回应性客户端心跳
SVCCommandHeader.HeartBeat_C2S = 0x00110010
//获取心跳配置
SVCCommandHeader.GetHeartBeatConfig_C2S = 0x0011000E
SVCCommandHeader.GetHeartBeatConfig_S2C = 0x0011000E
//获取心跳配置,得到的通知
SVCCommandHeader.GetHeartBeatConfig_S2C = 0x0011000F