export declare function generateRandomHex(length: number): string;
export declare class TimeoutError extends Error {
    constructor(m: string);
}
export declare const httpMethods: readonly ["GET", "PUT", "POST", "PATCH", "DELETE", "HEAD", "OPTIONS"];
export type HttpMethod = (typeof httpMethods)[number];
export declare function isHttpMethod(value: unknown): value is HttpMethod;
