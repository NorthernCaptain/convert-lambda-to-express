import type { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda';
import helmet from 'helmet';
import { CorsOptions } from 'cors';
import { Handler } from 'express';
import { HttpMethod, WrapperOptions } from 'convert-lambda-to-express';
type MorganOption = 'combined' | 'common' | 'dev' | 'short' | 'tiny';
type HandlerEnvironment = {
    [key: string]: string;
};
export interface HandlerConfig extends WrapperOptions {
    method: HttpMethod;
    resourcePath: string;
    handler: string;
    codeDirectory?: string;
    environment?: HandlerEnvironment;
}
export interface DevServerConfig {
    port?: number;
    hotReload?: boolean | number;
    restartDelay?: number;
    prod?: boolean;
    morganSetting?: MorganOption;
    corsOptions?: CorsOptions;
    helmetOptions?: Parameters<typeof helmet>[0];
    middleware?: Handler[];
    verbose?: boolean;
    codeDirectory?: string;
    environment?: HandlerEnvironment;
}
export declare const handlerDefinitions: HandlerConfig[];
export declare const watchPaths: string[];
export declare function watchCodePath(path: string): void;
export declare function addToDevServer(config: HandlerConfig): void;
export declare const overwrittenKeys: Set<string>;
export declare function loadEnvironment({ verbose, environment }: {
    verbose?: boolean;
    environment?: HandlerEnvironment;
}): void;
interface GetHandlerConfig {
    handler: string;
    codeDirectory: string;
}
export declare function getHandler({ codeDirectory, handler }: GetHandlerConfig): {
    handlerFunction: APIGatewayProxyWithCognitoAuthorizerHandler;
    filePath: string;
    exportName: string;
};
export declare function convertToExpressPath(resourcePath: string): string;
export declare function getDevServer(config?: DevServerConfig): import("express-serve-static-core").Express;
export declare function startDevServer(config?: DevServerConfig): {
    restart: () => void;
    app: import("express-serve-static-core").Express;
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
};
export {};
