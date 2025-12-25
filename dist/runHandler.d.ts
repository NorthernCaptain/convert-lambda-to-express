import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda';
import { Logger } from './logger';
import { Event } from './Event';
import { Context } from './Context';
/**
 * @description handler function can return results via three methods. need to
 * normalize and catch them all.
 *
 * 1) handler uses the deprecated methods and calls context.done(), context.fail(),
 * or context.succeed(). Context was built so that context.done calls the
 * resolve/reject and context.succeed and context.fail call context.done. need to
 * pass resolve/reject to context object so they are available to the done function.
 *
 * 2) handler uses the call back function. pass in a callback function that
 * uses resolve/reject from within the callback that we pass into the handler.
 *
 * 3) handler is an async function that returns a promise. then/catch the promise
 *
 */
export declare function runHandler({ event, context, logger, handler, callback }: {
    event: Event;
    context: Context;
    logger: Logger | Console;
    handler: APIGatewayProxyWithCognitoAuthorizerHandler;
    callback: (err?: Error, result?: unknown) => void;
}): Promise<void>;
