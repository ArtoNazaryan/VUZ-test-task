import { SERVER_ERROR_STATUS_THRESHOLD } from '@infrastructure/common/constants/http-error-codes.constants.js';
import { toErrorResponse } from '@infrastructure/common/helpers/error-response.helper.js';
import { type ArgumentsHost, Catch, type ExceptionFilter, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const body = toErrorResponse(exception);
    const requestId = typeof request.id === 'string' ? request.id : undefined;

    if (body.statusCode >= SERVER_ERROR_STATUS_THRESHOLD) {
      this.logger.error(
        { err: exception, method: request.method, path: request.originalUrl },
        '[GlobalExceptionFilter] Request failed with a server error',
      );
    }

    response.status(body.statusCode).json(requestId ? { ...body, requestId } : body);
  }
}
