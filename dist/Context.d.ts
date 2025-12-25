import { AwsCredentialIdentity } from '@aws-sdk/types';
import { Context as IContext, CognitoIdentity, ClientContext } from 'aws-lambda';
type Resolve = (response: unknown) => void;
type Reject = (err: Error) => void;
export interface ContextOptions {
    startTime: number;
    credentials?: AwsCredentialIdentity;
    functionName?: string;
    functionVersion?: string;
    memorySize?: number;
    logGroupName?: string;
    logStreamName?: string;
    timeoutInSeconds?: number;
    identity?: CognitoIdentity;
    clientContext?: ClientContext;
    handler?: string;
    nodeModulesPath?: string;
    region?: string;
    accountId?: string;
    finalize?: () => void;
}
export declare class Context implements IContext {
    private options;
    static createInvokeFunctionArn(region: string, accountId: string, functionName: string): string;
    static getAwsRequestId(): string;
    functionName: string;
    functionVersion: string;
    memoryLimitInMB: string;
    logGroupName: string;
    logStreamName: string;
    invokedFunctionArn: string;
    awsRequestId: string;
    identity?: CognitoIdentity;
    clientContext?: ClientContext;
    callbackWaitsForEmptyEventLoop: boolean;
    private _region;
    private _startTime;
    private _timeout;
    private __timeout?;
    private __finalize;
    private _finalized;
    _accountId: string;
    _resolve?: Resolve;
    _reject?: Reject;
    constructor(options: ContextOptions);
    done(err?: Error | string, messageOrObject?: unknown): void | unknown;
    fail(err: Error | string): void;
    succeed(messageOrObject: unknown): void;
    getRemainingTimeInMillis(): number;
    _clearTimeout(): void;
    _finalize(): void;
    _buildExecutionEnv(): {
        [key: string]: string;
    };
}
export {};
