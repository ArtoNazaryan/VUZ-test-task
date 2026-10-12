import type { ErrorCode } from '@infrastructure/enums/common/error-code.enum.js';
import type { TErrorDetails } from '@infrastructure/types/common/error-details.types.js';
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
