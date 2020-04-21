"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pidusage = require("pidusage");
function humanTimeToMS(text) {
  const parts = text.split(':').map(p => parseInt(p));
  let time = 0;
  time += Math.floor(parts.pop() * 1000); //s
  time += parts.pop() * 1000 * 60; //m
  time += parts.pop() * 1000 * 60 * 60; //h
  return time;
}
exports.humanTimeToMS = humanTimeToMS;
async function pidToResourceUsage(pid) {
  return await pidusage(pid);
}
exports.pidToResourceUsage = pidToResourceUsage;
var Parse;
(function (Parse) {
  function getDuration(text) {
    const humanDuration = /duration: ((\d+:?){1,3}.\d+)/i.exec(text);
    if (!humanDuration || !humanDuration[1]) {
      return null;
    }
    return humanTimeToMS(humanDuration[1]);
  }
  Parse.getDuration = getDuration;
  function getStart(text) {
    return (parseFloat((/start: (-?\d+\.\d+)/i.exec(text) || [])[1]) * 1000);
  }
  Parse.getStart = getStart;
  function getRes(text) {
    const searchResult = /([1-9][0-9]*)x([1-9][0-9]*)/i.exec(text);
    if (searchResult) {
      return {
        width: parseInt(searchResult[1]),
        height: parseInt(searchResult[2])
      };
    }
  }
  Parse.getRes = getRes;
  function getFPS(text) {
    return (parseFloat((/(\d+\.?\d*?) fps/i.exec(text) || [])[1]));
  }
  Parse.getFPS = getFPS;
  function getBitrate(text) {
    const bitrateRaw = /bitrate: (\d+)(\ ?(k|m|g|t)?b\/s)?/i.exec(text);
    if (!bitrateRaw) {
      return null;
    }
    let value = parseInt(bitrateRaw[1]);
    // fallthrough on purpose
    // noinspection FallThroughInSwitchStatementJS
    switch (bitrateRaw[3]) {
      case 't':
        value *= 1024;
      case 'g':
        value *= 1024;
      case 'm':
        value *= 1024;
      case 'k':
        value *= 1024;
        break;
    }
    return value / 1024;
  }
  Parse.getBitrate = getBitrate;
})(Parse = exports.Parse || (exports.Parse = {}));
//# sourceMappingURL=helper.js.map