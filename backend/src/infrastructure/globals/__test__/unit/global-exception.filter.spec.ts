import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { GlobalExceptionFilter } from '@infrastructure/globals/global-exception.filter.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import {
  createHttpArgumentsHost,
  createResponseMock,
  type IResponseMock,
} from '@infrastructure/test/mocks/http/http-context.mock.js';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

describe('GlobalExceptionFilter', () => {
  const request = { id: 'req-1', method: 'GET', originalUrl: '/api/v1/test' };
  let filter: GlobalExceptionFilter;
  let response: IResponseMock;
  let loggerError: MockInstance<Logger['error']>;

  beforeEach(() => {
    loggerError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    filter = new GlobalExceptionFilter();
    response = createResponseMock();
  });

  function handle(exception: unknown): void {
    filter.catch(exception, createHttpArgumentsHost(request, response));
  }

  it('renders an AppException with its code, message and details', () => {
    handle(
      new AppException(
        ErrorCode.SquadFull,
        'A squad cannot have more than 6 characters',
        HttpStatus.UNPROCESSABLE_ENTITY,
        { limit: 6 },
      ),
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 422,
      error: ErrorCode.SquadFull,
      message: 'A squad cannot have more than 6 characters',
      details: { limit: 6 },
      requestId: 'req-1',
    });
  });

  it('maps a framework NotFoundException to NOT_FOUND', () => {
    handle(new NotFoundException('Cannot GET /api/v1/missing'));

    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: ErrorCode.NotFound,
      message: 'Cannot GET /api/v1/missing',
      requestId: 'req-1',
    });
  });

  it('joins array messages from a framework exception body', () => {
    handle(new BadRequestException(['first problem', 'second problem']));

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: ErrorCode.BadRequest,
        message: 'first problem; second problem',
      }),
    );
  });

  it('falls back to BAD_REQUEST for an unmapped client error status', () => {
    handle(new HttpException('I am a teapot', HttpStatus.I_AM_A_TEAPOT));

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 418, error: ErrorCode.BadRequest }),
    );
  });

  it('hides the message of a framework server error', () => {
    handle(new InternalServerErrorException('database password leaked'));

    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500, message: 'Internal server error' }),
    );
  });

  it('returns a generic 500 and logs the cause for an unknown error', () => {
    const cause = new Error('boom');

    handle(cause);

    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: ErrorCode.InternalError,
      message: 'Internal server error',
      requestId: 'req-1',
    });
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ err: cause, path: '/api/v1/test' }),
      expect.stringContaining('[GlobalExceptionFilter]'),
    );
  });

  it('does not log client errors', () => {
    handle(new NotFoundException());

    expect(loggerError).not.toHaveBeenCalled();
  });
});
