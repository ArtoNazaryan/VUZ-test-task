import {
  REFRESH_TOKEN_COOKIE,
  SESSION_EXPIRED_EXAMPLE,
} from '@app/auth/constants/auth.constants.js';
import { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import {
  TOO_MANY_REQUESTS_EXAMPLE,
  UNAUTHORIZED_EXAMPLE,
} from '@infrastructure/common/constants/api-error-examples.constants.js';
import { ApiErrorResponse } from '@infrastructure/common/decorators/api-error-response.decorator.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

export function ApiAuthController(): ClassDecorator {
  return applyDecorators(
    ApiTags('Auth'),
    ApiErrorResponse(
      HttpStatus.TOO_MANY_REQUESTS,
      'Rate limit exceeded (register, login and refresh allow 10 requests per minute)',
      TOO_MANY_REQUESTS_EXAMPLE,
    ),
  );
}

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create an account and receive an access token',
      description: 'Also sets the httpOnly refresh_token cookie.',
    }),
    ApiCreatedResponse({ type: AuthResponseDto }),
    ApiErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Invalid email or password shorter than 8 characters',
      {
        error: ErrorCode.ValidationError,
        message: 'Request validation failed',
        details: [
          {
            field: 'password',
            messages: ['password must be longer than or equal to 8 characters'],
          },
        ],
      },
    ),
    ApiErrorResponse(HttpStatus.CONFLICT, 'An account with this email already exists', {
      error: ErrorCode.EmailTaken,
      message: 'An account with this email already exists',
    }),
  );
}

export function ApiLogin(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Log in and receive an access token',
      description: 'Also sets the httpOnly refresh_token cookie.',
    }),
    ApiOkResponse({ type: AuthResponseDto }),
    ApiErrorResponse(HttpStatus.UNAUTHORIZED, 'Wrong email or password', {
      error: ErrorCode.InvalidCredentials,
      message: 'Email or password is incorrect',
    }),
  );
}

export function ApiRefresh(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Exchange the refresh token cookie for a new access token',
      description:
        'Rotates the refresh token: the cookie is replaced and the old token stops working. Reusing an old token logs out every session of the user.',
    }),
    ApiCookieAuth(REFRESH_TOKEN_COOKIE),
    ApiOkResponse({ type: AuthResponseDto }),
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Missing, expired, revoked or reused refresh token',
      SESSION_EXPIRED_EXAMPLE,
    ),
  );
}

export function ApiLogout(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke the refresh token and clear its cookie' }),
    ApiCookieAuth(REFRESH_TOKEN_COOKIE),
    ApiNoContentResponse({ description: 'Logged out' }),
  );
}

export function ApiGetProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get the profile of the logged in user' }),
    ApiBearerAuth(),
    ApiOkResponse({ type: UserResponseDto }),
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Missing, invalid or expired access token',
      UNAUTHORIZED_EXAMPLE,
    ),
  );
}
