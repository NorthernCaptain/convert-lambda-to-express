import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda';
import { Handler } from 'express';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { Logger } from './logger';
import { ContextOptions } from './Context';
import { EventOptions } from './Event';
import { ConvertResponseOptions } from './convertResponse';
export interface WrapperOptions extends Omit<ContextOptions, 'startTime' | 'credentials'>, Pick<EventOptions, 'isBase64EncodedReq' | 'resourcePath' | 'stage' | 'stageVariables'>, ConvertResponseOptions {
    credentialsFilename?: string;
    profile?: string;
    logger?: Logger;
}
export declare function getCredentials(filename?: string, profile?: string): Promise<AwsCredentialIdentity | undefined>;
export declare function wrapLambda(handler: APIGatewayProxyWithCognitoAuthorizerHandler, options?: WrapperOptions): Handler;
