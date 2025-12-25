import { Request } from 'express';
import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyCognitoAuthorizer, APIGatewayProxyEventHeaders, APIGatewayProxyEventMultiValueHeaders, APIGatewayProxyEventMultiValueQueryStringParameters, APIGatewayProxyEventPathParameters, APIGatewayProxyEventQueryStringParameters, APIGatewayProxyEventStageVariables, APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
export interface EventOptions {
    awsRequestId: string;
    accountId: string;
    startTime: number;
    req: Request;
    isBase64EncodedReq?: boolean;
    resourcePath?: string;
    stage?: string;
    stageVariables?: APIGatewayProxyEventStageVariables;
}
export declare class Event implements APIGatewayProxyWithCognitoAuthorizerEvent {
    private options;
    static buildRequestTime(startTime: number): string;
    static buildRequestMultiValueHeaders(_headers: Request['headers']): APIGatewayProxyEventMultiValueHeaders;
    static buildRequestHeaders(_headers: Request['headers']): APIGatewayProxyEventHeaders;
    private static buildMultiValueQueryString;
    static buildQueryString(_query: APIGatewayProxyEventMultiValueQueryStringParameters | null): APIGatewayProxyEventQueryStringParameters | null;
    body: string | null;
    path: string;
    httpMethod: string;
    pathParameters: APIGatewayProxyEventPathParameters | null;
    headers: APIGatewayProxyEventHeaders;
    multiValueHeaders: APIGatewayProxyEventMultiValueHeaders;
    queryStringParameters: APIGatewayProxyEventQueryStringParameters | null;
    multiValueQueryStringParameters: APIGatewayProxyEventMultiValueQueryStringParameters | null;
    resource: string;
    isBase64Encoded: boolean;
    stageVariables: APIGatewayProxyEventStageVariables | null;
    requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayProxyCognitoAuthorizer>;
    constructor(options: EventOptions);
}
