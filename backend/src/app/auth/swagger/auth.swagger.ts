import { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import { REFRESH_TOKEN_COOKIE } from '@app/auth/constants/auth.constants.js';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Create an account and receive an access token',
      description: 'Also sets the httpOnly refresh_token cookie.',
    }),
    ApiCreatedResponse({ type: AuthResponseDto }),
    ApiBadRequestResponse({ description: 'Invalid email or password shorter than 8 characters' }),
    ApiConflictResponse({ description: 'EMAIL_TAKEN: an account with this email exists' }),
  );
}

export function ApiLogin(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Log in and receive an access token',
      description: 'Also sets the httpOnly refresh_token cookie.',
    }),
    ApiOkResponse({ type: AuthResponseDto }),
    ApiUnauthorizedResponse({ description: 'INVALID_CREDENTIALS: wrong email or password' }),
  );
}

export function ApiGetProfile(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Get the profile of the logged in user' }),
    ApiBearerAuth(),
    ApiOkResponse({ type: UserResponseDto }),
    ApiUnauthorizedResponse({ description: 'Missing, invalid or expired access token' }),
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
    ApiUnauthorizedResponse({ description: 'Missing, expired, revoked or reused refresh token' }),
  );
}

export function ApiLogout(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Revoke the refresh token and clear its cookie' }),
    ApiCookieAuth(REFRESH_TOKEN_COOKIE),
    ApiNoContentResponse({ description: 'Logged out' }),
  );
}
