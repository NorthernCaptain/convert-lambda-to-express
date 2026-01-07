"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setResponseHeaders = setResponseHeaders;
exports.coerceBody = coerceBody;
exports.convertResponseFactory = convertResponseFactory;
function isObject(response) {
    return typeof response === 'object' && response !== null && !Array.isArray(response) && !Buffer.isBuffer(response);
}
function setResponseHeaders({ res, response, options }) {
    if (options === null || options === void 0 ? void 0 : options.defaultResponseHeaders) {
        for (const [name, value] of Object.entries(options === null || options === void 0 ? void 0 : options.defaultResponseHeaders)) {
            res.header(name, value);
        }
    }
    if (isObject(response)) {
        if (isObject(response.headers)) {
            for (const [name, value] of Object.entries(response.headers)) {
                res.header(name, `${value}`);
            }
        }
        if (isObject(response.multiValueHeaders)) {
            for (const [name, value] of Object.entries(response.multiValueHeaders)) {
                res.header(name, Array.isArray(value) ? value.map(val => `${val}`).join(', ') : `${value}`);
            }
        }
    }
}
function coerceBody(body) {
    if (typeof body === 'string' || typeof body === 'number' || typeof body === 'boolean' || typeof body === 'bigint') {
        return `${body}`;
    }
    if (Buffer.isBuffer(body)) {
        return body.toString();
    }
    if (
    // cases of Object or Array
    typeof body === 'object' &&
        body !== null &&
        !Buffer.isBuffer(body)) {
        return JSON.stringify(body);
    }
    if (body) {
        // possible function/ArrayBuffer/symbol/etc attempt toString()
        try {
            return body.toString(); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
        catch (_a) {
            // everything failed
        }
    }
    return '';
}
function convertResponseFactory({ res, logger, options }) {
    function sendError({ message, name, stack }) {
        const errorOutput = {
            errorMessage: message,
            errorType: name,
            trace: stack === null || stack === void 0 ? void 0 : stack.split('\n')
        };
        logger.error('End - Error:');
        logger.error(errorOutput);
        return res.status(500).json(errorOutput);
    }
    return function convertResponse(err, response) {
        setResponseHeaders({ res, options, response });
        if (err) {
            return sendError(err);
        }
        try {
            const coerced = isObject(response) && 'body' in response ? coerceBody(response.body) : coerceBody(response);
            logger.info('End - Result:');
            logger.info(coerced);
            const statusCode = isObject(response) && !!response.statusCode ? parseInt(`${response.statusCode}`) : 200;
            return res.status(statusCode).send(coerced);
        }
        catch (error) {
            return sendError(error);
        }
    };
}
