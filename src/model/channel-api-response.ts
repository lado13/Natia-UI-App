import { Satellite } from "./satellite";
import { TemperatureInfo } from "./temperature-info";
import { TVChannel } from "./tvchannel";

export interface ChannelApiResponse {
    ChanellInfo: TVChannel[]; 
    SatelliteView: Satellite[];
    TemperatureInfo: TemperatureInfo;
}
