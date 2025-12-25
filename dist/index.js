"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHttpMethod = exports.httpMethods = exports.wrapLambda = void 0;
var wrapLambda_1 = require("./wrapLambda");
Object.defineProperty(exports, "wrapLambda", { enumerable: true, get: function () { return wrapLambda_1.wrapLambda; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "httpMethods", { enumerable: true, get: function () { return utils_1.httpMethods; } });
Object.defineProperty(exports, "isHttpMethod", { enumerable: true, get: function () { return utils_1.isHttpMethod; } });
