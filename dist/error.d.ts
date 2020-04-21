export declare class FFMpegError extends Error {
    code: number;
    signal: string;
    args: string[];
    killedByUser: boolean;
    name: string;
}
export declare class FFMpegOutOfMemoryError extends FFMpegError {
    allocated: number;
    wasUsing: number;
    name: string;
}
