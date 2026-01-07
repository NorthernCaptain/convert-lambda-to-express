"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const utils_1 = require("./utils");
const DEFAULT_RESOURCE_PATH = '/{proxy+}';
class Event {
    static buildRequestTime(startTime) {
        var _a, _b, _c, _d, _e, _f;
        const formatter = new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'UTC'
        });
        const formatted = formatter.formatToParts(new Date(startTime));
        const day = (_a = formatted[2]) === null || _a === void 0 ? void 0 : _a.value;
        const month = (_b = formatted[0]) === null || _b === void 0 ? void 0 : _b.value;
        const year = (_c = formatted[4]) === null || _c === void 0 ? void 0 : _c.value;
        const hour = (_d = formatted[6]) === null || _d === void 0 ? void 0 : _d.value;
        const minute = (_e = formatted[8]) === null || _e === void 0 ? void 0 : _e.value;
        const second = (_f = formatted[10]) === null || _f === void 0 ? void 0 : _f.value;
        return `${day}/${month}/${year}:${hour}:${minute}:${second} +0000`;
    }
    static buildRequestMultiValueHeaders(_headers) {
        const headers = {};
        for (const [name, value] of Object.entries(_headers)) {
            headers[name] = Array.isArray(value) ? value : value ? value.split(',') : undefined;
        }
        return headers;
    }
    static buildRequestHeaders(_headers) {
        const headers = {};
        for (const [name, value] of Object.entries(_headers)) {
            headers[name] = Array.isArray(value) ? value.join(',') : value;
        }
        return headers;
    }
    static buildMultiValueQueryString(query) {
        const flattened = {};
        const queryParams = typeof query === 'object' ? Object.entries(query) : [];
        if (!queryParams.length) {
            return null;
        }
        for (const [key, value] of queryParams) {
            if (!value) {
                continue;
            }
            else if (typeof value === 'string') {
                flattened[key] = [value];
            }
            else if (Array.isArray(value)) {
                const flattenedKey = [];
                value.forEach(val => {
                    if (typeof val === 'string') {
                        flattenedKey.push(val);
                    }
                });
                flattened[key] = flattenedKey;
            }
        }
        return flattened;
    }
    static buildQueryString(_query) {
        if (!_query) {
            return null;
        }
        const query = {};
        for (const [key, value] of Object.entries(_query)) {
            if (!value) {
                continue;
            }
            query[key] = value.pop();
        }
        return query;
    }
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.options = options;
        const { req } = this.options;
        const resourcePath = (_a = this.options.resourcePath) !== null && _a !== void 0 ? _a : DEFAULT_RESOURCE_PATH;
        const path = req.path;
        const method = req.method;
        this.body = !req.body ? null : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        this.path = path;
        this.httpMethod = method;
        this.pathParameters = (_b = req.params) !== null && _b !== void 0 ? _b : null;
        this.stageVariables = (_c = this.options.stageVariables) !== null && _c !== void 0 ? _c : null;
        this.resource = resourcePath;
        this.isBase64Encoded = (_d = this.options.isBase64EncodedReq) !== null && _d !== void 0 ? _d : false;
        this.headers = Event.buildRequestHeaders((_e = req.headers) !== null && _e !== void 0 ? _e : {});
        this.multiValueHeaders = Event.buildRequestMultiValueHeaders((_f = req.headers) !== null && _f !== void 0 ? _f : {});
        this.multiValueQueryStringParameters = Event.buildMultiValueQueryString((_g = req.query) !== null && _g !== void 0 ? _g : {});
        this.queryStringParameters = Event.buildQueryString(this.multiValueQueryStringParameters);
        const startTime = this.options.startTime;
        this.requestContext = {
            accountId: this.options.accountId,
            apiId: 'express',
            protocol: (_h = req.protocol) !== null && _h !== void 0 ? _h : 'https',
            httpMethod: method,
            path: path,
            stage: (_j = options.stage) !== null && _j !== void 0 ? _j : 'dev',
            requestId: this.options.awsRequestId,
            requestTimeEpoch: startTime,
            requestTime: Event.buildRequestTime(startTime),
            resourcePath,
            resourceId: (0, utils_1.generateRandomHex)(6),
            // TODO: implement
            authorizer: {
                claims: {}
            },
            // TODO: implement
            identity: {
                accessKey: null,
                accountId: null,
                caller: null,
                cognitoIdentityPoolId: null,
                cognitoIdentityId: null,
                sourceIp: '127.0.0.1',
                cognitoAuthenticationType: null,
                cognitoAuthenticationProvider: null,
                userArn: null,
                userAgent: 'Custom User Agent String',
                user: null,
                apiKey: null,
                apiKeyId: null,
                principalOrgId: null,
                clientCert: null
            }
        };
    }
}
exports.Event = Event;
