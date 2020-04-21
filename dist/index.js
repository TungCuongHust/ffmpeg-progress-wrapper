"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const child_process_1 = require("child_process");
const error_1 = require("./error");
const helper_1 = require("./helper");
__export(require("./error"));
class FFMpegProgress extends events_1.EventEmitter {
    constructor(args, options = {}) {
        super();
        this._details = {};
        this._metadataDuration = null;
        this._output = '';
        this._stderr = '';
        this._stdout = '';
        this._isKilledByUser = false;
        this._outOfMemory = false;
        this.processOutput = (buffer) => {
            const text = buffer.toString();
            this.emit('raw', text);
            this._output += text;
            // parsing duration from metadata
            const isMetadataDuration = text.toLowerCase().match(/duration\s*:\s*((\d+:?){1,3}.\d+)/);
            if (isMetadataDuration) {
                this.processMetadataDuration(isMetadataDuration[1]);
            }
            // await for duration details
            if (!this._details.file &&
                ~this._output.toLowerCase().search(/duration.*\n/i) &&
                ~this._output.toLowerCase().search(/(\d+\.?\d*?) fps/i)) {
                this.processInitialOutput(this._output);
            }
            // size=    4103kB time=00:02:34.31 bitrate= 217.8kbits/s speed=62.7x
            const isFrame = text.match(/(frame|time)=.*/);
            if (isFrame) {
                this.processProgress(isFrame[0]);
            }
        };
        this.options = {
            cmd: options.cmd || 'ffmpeg',
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            hideFFConfig: options.hideFFConfig || false,
            maxMemory: Math.max(0, options.maxMemory) || Infinity,
            duration: options.duration
        };
        const extra_args = [];
        if (this.options.hideFFConfig) {
            extra_args.push(`-hide_banner`);
        }
        this._args = args.slice();
        this._process = child_process_1.spawn(this.options.cmd, extra_args.concat(args), {
            cwd: this.options.cwd,
            env: this.options.env
        });
        this._process.stdout.on('data', this.processOutput);
        this._process.stderr.on('data', this.processOutput);
        this._process.stdout.on('data', (d) => this._stdout += d.toString());
        this._process.stderr.on('data', (d) => this._stderr += d.toString());
        this._process.once('close', (code, signal) => {
            this.emit('end', code, signal);
            clearInterval(this._vitalsTimer);
        });
        this._vitalsTimer = setInterval(this._checkVitals.bind(this), 500);
    }
    async _checkVitals() {
        try {
            const vitals = await helper_1.pidToResourceUsage(this._process.pid);
            this._vitalsMemory = vitals.memory;
            if (vitals.memory > this.options.maxMemory) {
                this._outOfMemory = true;
                this.kill();
            }
        }
        catch (e) {
            if (!e.stack) {
                Error.captureStackTrace(e);
            }
            console.error(`Vitals check for PID:${this._process.pid} resulted in: ${e.stack}`);
        }
    }
    kill(signal = 'SIGKILL') {
        this._isKilledByUser = signal;
        this._process.kill(signal);
    }
    stop() {
        return this.kill('SIGINT');
    }
    get details() {
        return this._details.file;
    }
    get output() {
        return this._output;
    }
    get stderrOutput() {
        return this._stderr;
    }
    get stdoutOutput() {
        return this._stdout;
    }
    get process() {
        return this._process;
    }
    get args() {
        return this._args.slice();
    }
    async onDone() {
        const stack = (new Error()).stack.split('\n').slice(1).join('\n');
        const { code, signal } = await new Promise((res) => {
            this.once('end', (code, signal) => {
                return res({ code, signal });
            });
        });
        if (code || signal) {
            let FFmpegErrClass = error_1.FFMpegError;
            if (this._outOfMemory) {
                FFmpegErrClass = error_1.FFMpegOutOfMemoryError;
            }
            const err = new FFmpegErrClass(this._stderr);
            err.code = code;
            err.signal = signal;
            err.args = this._args.slice();
            err.killedByUser = signal === this._isKilledByUser;
            err.stack += '\n' + stack;
            if (this._outOfMemory) {
                err.allocated = this.options.maxMemory;
                err.wasUsing = this._vitalsMemory;
            }
            throw err;
        }
        return this._output;
    }
    async onDetails() {
        if (this._details.file) {
            return Promise.resolve(this._details.file);
        }
        return new Promise(_ => this.once('details', _));
    }
    processMetadataDuration(humanDuration) {
        this._metadataDuration = Math.max(this._metadataDuration, helper_1.humanTimeToMS(humanDuration));
    }
    processInitialOutput(text) {
        Object.assign(this._details, {
            file: {
                duration: helper_1.Parse.getDuration(text),
                bitrate: helper_1.Parse.getBitrate(text),
                start: helper_1.Parse.getStart(text),
                resolution: helper_1.Parse.getRes(text),
                fps: helper_1.Parse.getFPS(text)
            }
        });
        this.emit('details', Object.assign({}, this._details.file));
    }
    processProgress(text) {
        const duration = this.options.duration || (this._details.file && this._details.file.duration) || this._metadataDuration || null;
        const data = text
            .trim()
            .replace(/=\ */g, '=')
            .split(' ')
            .map(keyVal => {
            const split = keyVal.split('=');
            return [
                split[0].trim(),
                split[1].trim()
            ];
        })
            .reduce((obj, kv) => {
            obj[kv[0]] = !isNaN(Number(kv[1])) ? parseFloat(kv[1]) : kv[1];
            return obj;
        }, {});
        data.time = helper_1.humanTimeToMS(data.time.toString());
        data.speed = parseFloat(data.speed.toString().replace('x', ''));
        if (duration !== null) {
            // compute progress
            data.progress = data.time / duration;
            // compute ETA
            data.eta = ((duration - data.time) / data.speed) | 0;
        }
        else {
            data.progress = data.eta = null;
        }
        this.emit('progress', data);
    }
}
exports.FFMpegProgress = FFMpegProgress;
//# sourceMappingURL=index.js.map