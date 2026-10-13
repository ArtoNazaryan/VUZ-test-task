import {
  AUTHENTICATION_REQUIRED_MESSAGE,
  INVALID_REFRESH_TOKEN_MESSAGE,
} from '@app/auth/constants/auth.constants.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { AppException } from '@infrastructure/common/helpers/app.exception.js';
import { HttpStatus } from '@nestjs/common';

export function authenticationRequiredError(): AppException {
  return new AppException(
    ErrorCode.Unauthorized,
    AUTHENTICATION_REQUIRED_MESSAGE,
    HttpStatus.UNAUTHORIZED,
  );
}

export function invalidRefreshTokenError(): AppException {
  return new AppException(
    ErrorCode.Unauthorized,
    INVALID_REFRESH_TOKEN_MESSAGE,
    HttpStatus.UNAUTHORIZED,
  );
}
