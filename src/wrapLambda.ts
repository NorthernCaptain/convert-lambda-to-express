import { APIGatewayProxyWithCognitoAuthorizerHandler } from 'aws-lambda';
import { Handler } from 'express';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { readFileSync } from 'fs';
import { Logger } from './logger';
import { Context, ContextOptions } from './Context';
import { Event, EventOptions } from './Event';
import { convertResponseFactory, ConvertResponseOptions } from './convertResponse';
import { runHandler } from './runHandler';

export interface WrapperOptions
  extends Omit<ContextOptions, 'startTime' | 'credentials'>,
    Pick<EventOptions, 'isBase64EncodedReq' | 'resourcePath' | 'stage' | 'stageVariables'>,
    ConvertResponseOptions {
  credentialsFilename?: string;
  profile?: string;
  logger?: Logger;
}

function parseCredentialsFile(filename: string, profile = 'default'): AwsCredentialIdentity | undefined {
  try {
    const content = readFileSync(filename, 'utf-8');
    const lines = content.split('\n');
    let currentProfile = '';
    const credentials: {
      accessKeyId?: string;
      secretAccessKey?: string;
      sessionToken?: string;
    } = {};

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for profile header
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        currentProfile = trimmedLine.slice(1, -1);
        continue;
      }

      // Parse key-value pairs for the target profile
      if (currentProfile === profile && trimmedLine.includes('=')) {
        const equalIndex = trimmedLine.indexOf('=');
        const key = trimmedLine.slice(0, equalIndex).trim();
        const value = trimmedLine.slice(equalIndex + 1).trim();

        if (key === 'aws_access_key_id') {
          credentials.accessKeyId = value;
        } else if (key === 'aws_secret_access_key') {
          credentials.secretAccessKey = value;
        } else if (key === 'aws_session_token') {
          credentials.sessionToken = value;
        }
      }
    }

    if (credentials.accessKeyId && credentials.secretAccessKey) {
      return credentials as AwsCredentialIdentity;
    }
  } catch {
    // If file reading fails, return undefined
  }

  return undefined;
}

export async function getCredentials(
  filename?: string,
  profile?: string
): Promise<AwsCredentialIdentity | undefined> {
  // First try custom credentials file if specified
  if (filename) {
    const credentials = parseCredentialsFile(filename, profile);
    if (credentials) {
      return credentials;
    }
  }

  // Fall back to AWS SDK Node.js credential provider chain
  // This checks in order: env vars, shared credentials, ECS/EKS, EC2 instance metadata
  try {
    const credentialProvider = fromNodeProviderChain({ profile });
    return await credentialProvider();
  } catch {
    // If all credential sources fail, return undefined
    return undefined;
  }
}

export function wrapLambda(
  handler: APIGatewayProxyWithCognitoAuthorizerHandler,
  options: WrapperOptions = {}
): Handler {
  const logger = options.logger ?? console;

  return async (req, res, next) => {
    try {
      const credentials = await getCredentials(
        options.credentialsFilename ?? '~/.aws/credentials',
        options.profile
      );
      const startTime = Date.now();
      const context = new Context({
        ...options,
        startTime,
        credentials
      });
      const event = new Event({
        ...options,
        req,
        startTime,
        awsRequestId: context.awsRequestId,
        accountId: context._accountId
      });
      const convertResponse = convertResponseFactory({ res, logger, options });
      await runHandler({
        logger,
        handler,
        event,
        context,
        callback: convertResponse
      });
    } catch (err) {
      // if server error building Event, Context or convertResponse
      return next(err);
    }
  };
}
