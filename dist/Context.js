"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const utils_1 = require("./utils");
class Context {
    static createInvokeFunctionArn(region, accountId, functionName) {
        return ['arn', 'aws', 'lambda', region, accountId, 'function', functionName].join(':');
    }
    static getAwsRequestId() {
        /*
         * create random invokeid.
         * Assuming that invokeid follows the format:
         * 8hex-4hex-4hex-4hex-12hex
         */
        return [
            (0, utils_1.generateRandomHex)(8),
            (0, utils_1.generateRandomHex)(4),
            (0, utils_1.generateRandomHex)(4),
            (0, utils_1.generateRandomHex)(4),
            (0, utils_1.generateRandomHex)(12)
        ].join('-');
    }
    constructor(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.options = options;
        this._finalized = false;
        // setup time management
        this._startTime = options.startTime;
        this._timeout = (options === null || options === void 0 ? void 0 : options.timeoutInSeconds) ? options.timeoutInSeconds * 1000 : 3000; // default lambda timeout
        this.__timeout = setTimeout(() => {
            this.fail(new utils_1.TimeoutError('Task timed out after ' + (this._timeout / 1000).toFixed(0) + ' second(s)'));
        }, this._timeout);
        // setup Context internals
        this._region = (_a = this.options.region) !== null && _a !== void 0 ? _a : 'us-east-1';
        this._accountId = (_b = this.options.accountId) !== null && _b !== void 0 ? _b : '123456789012';
        this.__finalize = (_c = options.finalize) !== null && _c !== void 0 ? _c : function () { }; // eslint-disable-line @typescript-eslint/no-empty-function
        // setup properties of IContext
        this.callbackWaitsForEmptyEventLoop = false; // not supported by this package
        this.functionName = (_d = options.functionName) !== null && _d !== void 0 ? _d : 'convert-lambda-to-express';
        this.functionVersion = (_e = options.functionVersion) !== null && _e !== void 0 ? _e : '$LATEST';
        this.memoryLimitInMB = `${(_f = options.memorySize) !== null && _f !== void 0 ? _f : 128}`;
        this.logGroupName = (_g = options.logGroupName) !== null && _g !== void 0 ? _g : `/aws/lambda/${this.functionName}`;
        this.logStreamName = (_h = options.logStreamName) !== null && _h !== void 0 ? _h : 'aws-log-stream';
        this.identity = options.identity;
        this.clientContext = options.clientContext;
        this.invokedFunctionArn = Context.createInvokeFunctionArn(this._region, this._accountId, this.functionName);
        this.awsRequestId = Context.getAwsRequestId();
        for (const [key, value] of Object.entries(this._buildExecutionEnv())) {
            process.env[key] = value;
        }
    }
    done(err, messageOrObject) {
        let error;
        if (typeof err === 'string') {
            error = new Error(err);
        }
        else if (err) {
            error = err;
        }
        if (error) {
            if (this._reject) {
                return this._reject(error);
            }
            throw error;
        }
        return this._resolve ? this._resolve(messageOrObject) : messageOrObject;
    }
    fail(err) {
        this.done(err);
    }
    succeed(messageOrObject) {
        this.done(undefined, messageOrObject);
    }
    getRemainingTimeInMillis() {
        const now = new Date().getTime();
        return this._timeout + this._startTime - now;
    }
    _clearTimeout() {
        if (this.__timeout) {
            clearTimeout(this.__timeout);
            this.__timeout = undefined;
        }
    }
    _finalize() {
        if (!this._finalized) {
            this.__finalize();
            this._finalized = true;
        }
    }
    _buildExecutionEnv() {
        var _a, _b, _c, _d;
        const env = {};
        const pwd = process.cwd();
        /**
         *  Example env from lambda.
         *
         *  // provided by code below
         *  AWS_LAMBDA_FUNCTION_NAME: 'testing',
         *  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: '128',
         *  AWS_LAMBDA_FUNCTION_VERSION: '$LATEST',
         *  AWS_LAMBDA_INITIALIZATION_TYPE: 'on-demand',
         *  TZ: ':UTC',
         *  AWS_LAMBDA_LOG_GROUP_NAME: '/aws/lambda/testing',
         *  AWS_LAMBDA_LOG_STREAM_NAME: '2021/11/22/[$LATEST]de828bd7f9c24c7eb7785595c8986d57',
         *  AWS_REGION: 'us-east-1',
         *  AWS_DEFAULT_REGION: 'us-east-1',
         *  AWS_ACCESS_KEY_ID: 'EXAMPLE_ACCESS_KEY_ID',
         *  AWS_SECRET_ACCESS_KEY: 'EXAMPLE_SECRET_ACCESS_KEY',
         *  AWS_SESSION_TOKEN: 'EXAMPLE_SESSION_TOKEN',
         *  AWS_EXECUTION_ENV: 'AWS_Lambda_nodejs14.x',
         *  AWS_LAMBDA_RUNTIME_API: '127.0.0.1:9001',
         *  _HANDLER: 'index.handler',
         *  PWD: '/var/task',
         *  LAMBDA_TASK_ROOT: '/var/task',
         *  LAMBDA_RUNTIME_DIR: '/var/runtime',
         *  NODE_PATH: '/opt/nodejs/node14/node_modules:/opt/nodejs/node_modules:/var/runtime/node_modules:/var/runtime:/var/task',
         *
         *  // provided by node env
         *  LANG: 'en_US.UTF-8',
         *  PATH: '/var/lang/bin:/usr/local/bin:/usr/bin/:/bin:/opt/bin',
         *  SHLVL: '0',
         *
         *  // no provided
         *  NODE_EXTRA_CA_CERTS: '/etc/pki/tls/certs/ca-bundle.crt',
         *  LD_LIBRARY_PATH: '/var/lang/lib:/lib64:/usr/lib64:/var/runtime:/var/runtime/lib:/var/task:/var/task/lib:/opt/lib',
         *  AWS_XRAY_DAEMON_ADDRESS: '169.254.79.129:2000',
         *  _AWS_XRAY_DAEMON_ADDRESS: '169.254.79.129',
         *  _AWS_XRAY_DAEMON_PORT: '2000',
         *  AWS_XRAY_CONTEXT_MISSING: 'LOG_ERROR',
         *  _X_AMZN_TRACE_ID: 'Root=1-619c0415-0114f3884674422b7ee957a1;Parent=4a9245f561fc8965;Sampled=0'
         */
        // base configuration
        env.AWS_LAMBDA_FUNCTION_NAME = this.functionName;
        env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = Math.floor(os_1.default.freemem() / 1048576).toString();
        env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST';
        env.AWS_LAMBDA_INITIALIZATION_TYPE = 'on-demand';
        env.TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // logging information
        env.AWS_LAMBDA_LOG_GROUP_NAME = this.logGroupName;
        env.AWS_LAMBDA_LOG_STREAM_NAME = this.logStreamName;
        // information so aws-sdk can run as it would normally
        env.AWS_REGION = this._region;
        env.AWS_DEFAULT_REGION = this._region;
        if ((_a = this.options.credentials) === null || _a === void 0 ? void 0 : _a.accessKeyId) {
            env.AWS_ACCESS_KEY_ID = this.options.credentials.accessKeyId;
        }
        if ((_b = this.options.credentials) === null || _b === void 0 ? void 0 : _b.secretAccessKey) {
            env.AWS_SECRET_ACCESS_KEY = this.options.credentials.secretAccessKey;
        }
        if ((_c = this.options.credentials) === null || _c === void 0 ? void 0 : _c.sessionToken) {
            env.AWS_SESSION_TOKEN = this.options.credentials.sessionToken;
        }
        // runtime information
        env.AWS_EXECUTION_ENV = `AWS_Lambda_nodejs${process.version.split('.')[0]}.x`;
        env.AWS_LAMBDA_RUNTIME_API = '127.0.0.1:9001';
        env._HANDLER = (_d = this.options.handler) !== null && _d !== void 0 ? _d : 'index.handler';
        env.PWD = pwd;
        env.LAMBDA_TASK_ROOT = pwd;
        env.LAMBDA_RUNTIME_DIR = process.execPath;
        env.NODE_PATH = this.options.nodeModulesPath
            ? this.options.nodeModulesPath
            : (0, path_1.resolve)(require.resolve('express'), '..', '..');
        return env;
    }
}
exports.Context = Context;
