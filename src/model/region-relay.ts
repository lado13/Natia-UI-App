export interface RegionRelay {
    regionName: string;
    relayInfos: {
        frequecyOrder: string;
        mer: string;
        isHaveProblem: boolean;
        isWarning: boolean;
    }[];
}