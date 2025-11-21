import { Stream } from './stream';
import { StreamGlitchStatus } from './stream-glitch-status';

export interface Program {
    programId: number;
    pmtPid: number;
    streams?: Stream[];
    missingStreams?: Stream[];
    streamGlitchStatus?: StreamGlitchStatus;
    hasVideo?: boolean;
    hasAudio?: boolean;
    isProblematic?: boolean;
    issues?: string[];
}
