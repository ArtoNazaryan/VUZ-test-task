import { API_PREFIX, REQUEST_ID_HEADER } from '@infrastructure/constants/common/api.constants.js';
import type { TConfigService } from '@infrastructure/types/common/env.types.js';
import type { Params } from 'nestjs-pino';
import type { LevelWithSilent } from 'pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const MAX_REQUEST_ID_LENGTH = 128;

function resolveRequestId(request: IncomingMessage, response: ServerResponse): string {
  const incoming = request.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof incoming === 'string' && incoming.length > 0 && incoming.length <= MAX_REQUEST_ID_LENGTH
      ? incoming
      : randomUUID();

  response.setHeader(REQUEST_ID_HEADER, requestId);

  return requestId;
}

export function buildPinoConfig(config: TConfigService): Params {
  return {
    pinoHttp: {
      level: config.get('LOG_LEVEL', { infer: true }),
      transport: config.get('LOG_PRETTY', { infer: true })
        ? { target: 'pino-pretty', options: { singleLine: true, translateTime: 'SYS:HH:MM:ss.l' } }
        : undefined,
      genReqId: resolveRequestId,
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      customLogLevel: (_request, response, error): LevelWithSilent => {
        if (error || response.statusCode >= 500) {
          return 'error';
        }

        return response.statusCode >= 400 ? 'warn' : 'info';
      },
      autoLogging: {
        ignore: (request) => request.url?.startsWith(`/${API_PREFIX}/health`) ?? false,
      },
    },
  };
}
