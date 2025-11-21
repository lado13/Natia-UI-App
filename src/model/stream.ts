export interface Stream {
    pid: number;
    type: string;                // e.g. "MPEG-2 Video", "MPEG-2 Audio"
    codec?: string | null;
    payloadSample?: string | null;
    lastPTS?: string | null;
    packetCount?: number;
    continuityErrors?: number;
    errorRate?: number;
    errorDetails?: any[];
    isVideo?: boolean;
    isAudio?: boolean;
    language?: string | null;
}
