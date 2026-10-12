import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '@infrastructure/enums/common/error-code.enum.js';

export const HTTP_STATUS_ERROR_CODES: ReadonlyMap<number, ErrorCode> = new Map([
  [HttpStatus.BAD_REQUEST, ErrorCode.BadRequest],
  [HttpStatus.UNAUTHORIZED, ErrorCode.Unauthorized],
  [HttpStatus.FORBIDDEN, ErrorCode.Forbidden],
  [HttpStatus.NOT_FOUND, ErrorCode.NotFound],
  [HttpStatus.CONFLICT, ErrorCode.Conflict],
  [HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.UnprocessableEntity],
  [HttpStatus.TOO_MANY_REQUESTS, ErrorCode.TooManyRequests],
  [HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.ServiceUnavailable],
]);

export const INTERNAL_ERROR_MESSAGE = 'Internal server error';

export const SERVER_ERROR_STATUS_THRESHOLD: number = HttpStatus.INTERNAL_SERVER_ERROR;
