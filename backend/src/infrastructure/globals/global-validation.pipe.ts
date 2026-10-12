import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { flattenValidationErrors } from '@infrastructure/common/helpers/validation-error.helper.js';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

export function buildGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]): AppException =>
      new AppException(
        ErrorCode.ValidationError,
        'Request validation failed',
        HttpStatus.BAD_REQUEST,
        flattenValidationErrors(errors),
      ),
  });
}
