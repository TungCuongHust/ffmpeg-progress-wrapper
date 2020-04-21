"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FFMpegError extends Error {
    constructor() {
        super(...arguments);
        this.name = "FFMpegError";
    }
}
exports.FFMpegError = FFMpegError;
class FFMpegOutOfMemoryError extends FFMpegError {
    constructor() {
        super(...arguments);
        this.name = 'FFMpegOutOfMemoryError';
    }
}
exports.FFMpegOutOfMemoryError = FFMpegOutOfMemoryError;
//# sourceMappingURL=error.js.map