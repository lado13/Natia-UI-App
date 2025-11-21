import { Program } from './program';

export interface SystemStreamInfo {
    ip: string;
    port: number;
    durationSeconds: number;
    startedAtUtc: string;
    endedAtUtc: string;
    totalPackets: number;
    bitrateKbps: number;
    bitrateMbps: number;
    programs: Program[];
}
