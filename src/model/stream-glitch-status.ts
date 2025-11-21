export interface StreamGlitchStatus {
    programId: number;
    errors: string[];
    warnings: string[];
    isGlitchy: boolean;
}
