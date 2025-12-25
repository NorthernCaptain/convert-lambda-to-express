"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentials = getCredentials;
exports.wrapLambda = wrapLambda;
const credential_providers_1 = require("@aws-sdk/credential-providers");
const fs_1 = require("fs");
const Context_1 = require("./Context");
const Event_1 = require("./Event");
const convertResponse_1 = require("./convertResponse");
const runHandler_1 = require("./runHandler");
function parseCredentialsFile(filename, profile = 'default') {
    try {
        const content = (0, fs_1.readFileSync)(filename, 'utf-8');
        const lines = content.split('\n');
        let currentProfile = '';
        const credentials = {};
        for (const line of lines) {
            const trimmedLine = line.trim();
            // Check for profile header
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                currentProfile = trimmedLine.slice(1, -1);
                continue;
            }
            // Parse key-value pairs for the target profile
            if (currentProfile === profile && trimmedLine.includes('=')) {
                const equalIndex = trimmedLine.indexOf('=');
                const key = trimmedLine.slice(0, equalIndex).trim();
                const value = trimmedLine.slice(equalIndex + 1).trim();
                if (key === 'aws_access_key_id') {
                    credentials.accessKeyId = value;
                }
                else if (key === 'aws_secret_access_key') {
                    credentials.secretAccessKey = value;
                }
                else if (key === 'aws_session_token') {
                    credentials.sessionToken = value;
                }
            }
        }
        if (credentials.accessKeyId && credentials.secretAccessKey) {
            return credentials;
        }
    }
    catch (_a) {
        // If file reading fails, return undefined
    }
    return undefined;
}
async function getCredentials(filename, profile) {
    // First try custom credentials file if specified
    if (filename) {
        const credentials = parseCredentialsFile(filename, profile);
        if (credentials) {
            return credentials;
        }
    }
    // Fall back to AWS SDK Node.js credential provider chain
    // This checks in order: env vars, shared credentials, ECS/EKS, EC2 instance metadata
    try {
        const credentialProvider = (0, credential_providers_1.fromNodeProviderChain)({ profile });
        return await credentialProvider();
    }
    catch (_a) {
        // If all credential sources fail, return undefined
        return undefined;
    }
}
function wrapLambda(handler, options = {}) {
    var _a;
    const logger = (_a = options.logger) !== null && _a !== void 0 ? _a : console;
    return async (req, res, next) => {
        var _a;
        try {
            const credentials = await getCredentials((_a = options.credentialsFilename) !== null && _a !== void 0 ? _a : '~/.aws/credentials', options.profile);
            const startTime = Date.now();
            const context = new Context_1.Context({
                ...options,
                startTime,
                credentials
            });
            const event = new Event_1.Event({
                ...options,
                req,
                startTime,
                awsRequestId: context.awsRequestId,
                accountId: context._accountId
            });
            const convertResponse = (0, convertResponse_1.convertResponseFactory)({ res, logger, options });
            await (0, runHandler_1.runHandler)({
                logger,
                handler,
                event,
                context,
                callback: convertResponse
            });
        }
        catch (err) {
            // if server error building Event, Context or convertResponse
            return next(err);
        }
    };
}
