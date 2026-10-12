import {
  HTTP_STATUS_ERROR_CODES,
  INTERNAL_ERROR_MESSAGE,
  SERVER_ERROR_STATUS_THRESHOLD,
} from '@infrastructure/common/constants/http-error-codes.constants.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { isHttpExceptionBody } from '@infrastructure/common/helpers/http-exception-body.helper.js';
import type { IErrorResponse } from '@infrastructure/common/interfaces/error-response.interfaces.js';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const body = this.toErrorResponse(exception);
    const requestId = typeof request.id === 'string' ? request.id : undefined;

    if (body.statusCode >= SERVER_ERROR_STATUS_THRESHOLD) {
      this.logger.error(
        { err: exception, method: request.method, path: request.originalUrl },
        '[GlobalExceptionFilter] Request failed with a server error',
      );
    }

    response.status(body.statusCode).json(requestId ? { ...body, requestId } : body);
  }

  private toErrorResponse(exception: unknown): IErrorResponse {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        error: exception.code,
        message: exception.message,
        ...(exception.details ? { details: exception.details } : {}),
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();

      return {
        statusCode,
        error: this.resolveErrorCode(statusCode),
        message: this.extractMessage(exception),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ErrorCode.InternalError,
      message: INTERNAL_ERROR_MESSAGE,
    };
  }

  private resolveErrorCode(statusCode: number): ErrorCode {
    const mapped = HTTP_STATUS_ERROR_CODES.get(statusCode);

    if (mapped) {
      return mapped;
    }

    return statusCode >= SERVER_ERROR_STATUS_THRESHOLD
      ? ErrorCode.InternalError
      : ErrorCode.BadRequest;
  }

  private extractMessage(exception: HttpException): string {
    if (exception.getStatus() >= SERVER_ERROR_STATUS_THRESHOLD) {
      return INTERNAL_ERROR_MESSAGE;
    }

    const body = exception.getResponse();

    if (isHttpExceptionBody(body)) {
      return Array.isArray(body.message) ? body.message.join('; ') : body.message;
    }

    return typeof body === 'string' ? body : exception.message;
  }
}
