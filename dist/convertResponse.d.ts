import { IncomingHttpHeaders } from 'http';
import { Response } from 'express';
import { Logger } from './logger';
type DefaultHeaders = {
    [key in keyof IncomingHttpHeaders]: Parameters<Response['header']>[1];
};
export interface ConvertResponseOptions {
    defaultResponseHeaders?: DefaultHeaders;
}
export declare function setResponseHeaders({ res, response, options }: {
    res: Response;
    response?: unknown;
    options?: ConvertResponseOptions;
}): void;
export declare function coerceBody(body: unknown): string;
export declare function convertResponseFactory({ res, logger, options }: {
    res: Response;
    logger: Logger | Console;
    options?: ConvertResponseOptions;
}): (err?: Error, response?: unknown) => Response<any, Record<string, any>>;
export {};
