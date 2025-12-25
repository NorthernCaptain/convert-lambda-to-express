"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwrittenKeys = exports.watchPaths = exports.handlerDefinitions = void 0;
exports.watchCodePath = watchCodePath;
exports.addToDevServer = addToDevServer;
exports.loadEnvironment = loadEnvironment;
exports.getHandler = getHandler;
exports.convertToExpressPath = convertToExpressPath;
exports.getDevServer = getDevServer;
exports.startDevServer = startDevServer;
/* eslint-disable no-console */
// import { watch } from 'fs';
const path_1 = require("path");
const http_1 = require("http");
const chokidar_1 = require("chokidar");
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const convert_lambda_to_express_1 = require("convert-lambda-to-express");
if (!globalThis.CLTE_HANDLER_DEFINITIONS) {
    globalThis.CLTE_HANDLER_DEFINITIONS = [];
}
exports.handlerDefinitions = globalThis.CLTE_HANDLER_DEFINITIONS;
exports.watchPaths = [];
function watchCodePath(path) {
    let pathIsShorter = false;
    for (let index = 0; index < exports.watchPaths.length; index++) {
        const watched = exports.watchPaths[index];
        if (watched.startsWith(path)) {
            if (!pathIsShorter) {
                // path is shorter root path so replace with root
                exports.watchPaths[index] = path;
                pathIsShorter = true;
                continue;
            }
            // already watching root, remove entry
            exports.watchPaths.splice(index, 1);
        }
        else if (path.startsWith(watched)) {
            // already watching root
            return;
        }
    }
    if (!pathIsShorter) {
        // if path is not shorter and not already watched yet then path is not part of the same file tree
        exports.watchPaths.push(path);
    }
}
function addToDevServer(config) {
    exports.handlerDefinitions.push(config);
}
exports.overwrittenKeys = new Set();
const outputKeys = new Set();
function loadEnvironment({ verbose, environment }) {
    if (!environment) {
        return;
    }
    for (const [key, value] of Object.entries(environment)) {
        if (key in process.env) {
            exports.overwrittenKeys.add(key);
        }
        if (verbose) {
            if (!outputKeys.has(key)) {
                outputKeys.add(key);
                console.log(`loading env: key ${key} with value ${value}`);
            }
        }
        process.env[key] = value;
    }
}
function getHandler({ codeDirectory, handler }) {
    var _a;
    watchCodePath(codeDirectory);
    const handlerPathSegments = handler.split('/');
    const filenameAndExport = (_a = handlerPathSegments.pop()) === null || _a === void 0 ? void 0 : _a.split('.');
    if (!Array.isArray(filenameAndExport) || filenameAndExport.length !== 2) {
        throw new Error(`handler ${handler} is not valid`);
    }
    const [filename, exportName] = filenameAndExport;
    const filePath = (0, path_1.resolve)(codeDirectory, ...handlerPathSegments, filename);
    const resolved = require.resolve(filePath);
    if (require.cache[resolved]) {
        delete require.cache[resolved]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    }
    return {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        handlerFunction: require(resolved)[exportName],
        filePath: resolved,
        exportName
    };
}
function convertToExpressPath(resourcePath) {
    return resourcePath.replace(/\{/g, ':').replace(/\}/g, '');
}
let showedJsWarning = false;
function buildDevServer({ verbose, prod, morganSetting, corsOptions, helmetOptions, middleware, codeDirectory: globalCodeDirectory, environment: serverEnvironment = {} } = {}) {
    var _a;
    const devServer = (0, express_1.default)();
    devServer.use((0, morgan_1.default)((morganSetting !== null && morganSetting !== void 0 ? morganSetting : prod) ? 'combined' : 'dev'));
    devServer.use((0, cors_1.default)(corsOptions !== null && corsOptions !== void 0 ? corsOptions : {
        origin: '*',
        methods: '*',
        allowedHeaders: '*'
    }));
    devServer.use((0, helmet_1.default)(helmetOptions));
    if (middleware) {
        for (const middlewareHandler of middleware) {
            devServer.use(middlewareHandler);
        }
    }
    for (const handlerConfig of exports.handlerDefinitions) {
        handlerConfig.environment = { ...serverEnvironment, ...((_a = handlerConfig.environment) !== null && _a !== void 0 ? _a : {}) };
        const { environment, method, resourcePath, handler } = handlerConfig;
        const path = convertToExpressPath(resourcePath);
        const _method = method.toLowerCase();
        /**
         * load environment from definition provided in template to lambda
         * will attempt to give correct values during parse phase of require below.
         * if process.env.KEY is used in the body of the handler, instead of proxied
         * at the head like `const tableName = process.env.TABLE_NAME` as the head
         * the value may be incorrect at runtime.
         */
        loadEnvironment({ verbose, environment });
        const codeDirectory = globalCodeDirectory !== null && globalCodeDirectory !== void 0 ? globalCodeDirectory : handlerConfig.codeDirectory;
        if (!codeDirectory) {
            throw new Error(`codeDirectory is required for ${handlerConfig.handler}`);
        }
        const { exportName, filePath, handlerFunction } = getHandler({
            codeDirectory,
            handler
        });
        if (!showedJsWarning && filePath.endsWith('.js')) {
            showedJsWarning = true;
            console.warn('using .js files with the dev server is not recommended. us/watch the .ts source files instead');
        }
        const wrappedHandler = (0, convert_lambda_to_express_1.wrapLambda)(handlerFunction, handlerConfig);
        devServer[_method](path, wrappedHandler);
        if (verbose) {
            console.log({
                method: _method,
                path,
                exportName,
                filePath
            });
        }
    }
    if (!!exports.overwrittenKeys.size && verbose) {
        console.log(`The following process.env.KEYS were overwritten. The
same key was loaded in multiple handler files and there may be
undesired effects.

The values should be correct if you proxied the values to separate
variables at the head of each file, however if you use process.env.KEY
during runtime, and not just during the parse phase, there will be problems
as the values for the keys listed below may be different than anticipated.

The following are the keys that may have been overwritten:
>
${Array.from(exports.overwrittenKeys)
            .map(key => `> process.env.${key}`)
            .join('\n')}
>`);
    }
    return devServer;
}
function getDevServer(config) {
    if (!exports.handlerDefinitions.length) {
        throw new Error('no handlers added to server');
    }
    return buildDevServer(config);
}
function startDevServer(config = {}) {
    var _a, _b;
    if (config.prod) {
        process.env.NODE_ENV = 'production';
    }
    else if (process.env.NODE_ENV === 'production') {
        config.prod = true;
    }
    const port = (_a = config.port) !== null && _a !== void 0 ? _a : 3001;
    const hotReload = (_b = config.hotReload) !== null && _b !== void 0 ? _b : true;
    function startServer(app) {
        const server = (0, http_1.createServer)(app);
        server.listen(port, () => {
            if (config.verbose) {
                console.log(`listening on port: ${port}`);
            }
            else {
                console.log(`loaded ${exports.handlerDefinitions.length} handlers on port: ${port}`);
            }
        });
        return server;
    }
    let app = getDevServer(config);
    let server = startServer(app);
    function restart() {
        app = getDevServer(config);
        server.close(err => {
            if (err) {
                throw err;
            }
            server = startServer(app);
        });
    }
    if (hotReload) {
        if (config.verbose) {
            console.log(`>>>\n>>> watching code paths\n>\n${(exports.watchPaths.length ? exports.watchPaths : ['none']).map(path => `> ${path}`)}\n>\n>>>`);
        }
        for (const path of exports.watchPaths) {
            let debounce;
            const timeoutHandler = () => {
                if (debounce) {
                    clearTimeout(debounce);
                }
                debounce = undefined;
            };
            setTimeout(timeoutHandler, 2000);
            const watcher = (0, chokidar_1.watch)(path, {});
            watcher.on('change', filePath => {
                if (debounce) {
                    return;
                }
                if (config.verbose) {
                    console.log(`>>> file changed: ${filePath}`);
                }
                debounce = setTimeout(timeoutHandler, typeof hotReload === 'number' ? hotReload : 1000);
                restart();
            });
        }
    }
    return { restart, app, server };
}
