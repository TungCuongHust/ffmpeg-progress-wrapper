/// <reference types="node" />
import { EventEmitter } from 'events';
import { ChildProcess } from "child_process";
import ProcessEnv = NodeJS.ProcessEnv;
export * from "./error";
export interface FFMpegProgressOptions {
    cmd?: string;
    cwd?: string;
    env?: ProcessEnv;
    duration?: number;
    hideFFConfig?: boolean;
    maxMemory?: number;
}
export interface IFFMpegFileDetails {
    duration?: number;
    bitrate?: number;
    start?: number;
    resolution?: {
        width: number;
        height: number;
    };
    fps?: number;
}
export interface IFFMpegProgressData {
    speed?: number;
    eta?: number;
    time?: number;
    progress?: number;
    drop?: number;
    dup?: number;
    fps?: number;
    frame?: number;
    q?: number;
    size?: number;
    bitrate?: string;
    [s: string]: string | number | undefined;
}
export interface IFFMpegProgress {
    on(event: 'end', listener: (code: number | undefined, signal: string | undefined) => void): this;
    on(event: 'details', listener: (file: IFFMpegFileDetails) => void): this;
    on(event: 'progress', listener: (p: IFFMpegProgressData) => void): this;
    on(event: 'raw', listener: (text: string) => void): this;
}
export declare class FFMpegProgress extends EventEmitter implements IFFMpegProgress {
    private _args;
    private _process;
    private _details;
    private _metadataDuration;
    private _output;
    private _stderr;
    private _stdout;
    private _isKilledByUser;
    private _outOfMemory;
    private _vitalsTimer;
    private _vitalsMemory;
    readonly options: FFMpegProgressOptions;
    constructor(args: string[], options?: FFMpegProgressOptions);
    private _checkVitals;
    kill(signal?: string): void;
    stop(): void;
    get details(): IFFMpegFileDetails;
    get output(): string;
    get stderrOutput(): string;
    get stdoutOutput(): string;
    get process(): ChildProcess;
    get args(): string[];
    onDone(): Promise<string>;
    onDetails(): Promise<IFFMpegFileDetails>;
    processMetadataDuration(humanDuration: string): void;
    processInitialOutput(text: string): void;
    processProgress(text: string): void;
    processOutput: (buffer: Buffer) => void;
}
