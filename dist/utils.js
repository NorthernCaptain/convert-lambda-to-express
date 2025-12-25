"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpMethods = exports.TimeoutError = void 0;
exports.generateRandomHex = generateRandomHex;
exports.isHttpMethod = isHttpMethod;
const hexChars = '0123456789abcdef'.split('');
function generateRandomHex(length) {
    let hexVal = '';
    for (let i = 0; i < length; i++) {
        hexVal += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return hexVal;
}
class TimeoutError extends Error {
    constructor(m) {
        super(m);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
exports.httpMethods = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
function isHttpMethod(value) {
    return typeof value === 'string' && exports.httpMethods.includes(value.toUpperCase());
}
