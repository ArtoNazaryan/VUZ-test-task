import type { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { TErrorDetails } from '@infrastructure/common/types/error-details.types.js';
import { HttpException, type HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    status: HttpStatus,
    readonly details?: TErrorDetails,
  ) {
    super(message, status);
  }
}
