import { Status } from "pidusage";
export declare function humanTimeToMS(text: string): number;
export declare function pidToResourceUsage(pid: number): Promise<Status>;
export declare namespace Parse {
    function getDuration(text: string): null | number;
    function getStart(text: string): number;
    function getRes(text: string): {
        width: number;
        height: number;
    };
    function getFPS(text: string): number;
    function getBitrate(text: string): number | null;
}
