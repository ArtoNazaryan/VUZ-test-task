import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { IApiErrorExample } from '@infrastructure/common/interfaces/error-response.interfaces.js';

export const UNAUTHORIZED_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.Unauthorized,
  message: 'Authentication is required',
};

export const TOO_MANY_REQUESTS_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.TooManyRequests,
  message: 'Too many requests, please try again later',
};

export const VALIDATION_ERROR_EXAMPLE: IApiErrorExample = {
  error: ErrorCode.ValidationError,
  message: 'Request validation failed',
  details: [{ field: 'name', messages: ['name must be a string'] }],
};
