import { AuthResponseDto } from '@app/auth/dto/auth-response.dto.js';
import { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiRegister(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Create an account and receive an access token' }),
    ApiCreatedResponse({ type: AuthResponseDto }),
    ApiBadRequestResponse({ description: 'Invalid email or password shorter than 8 characters' }),
    ApiConflictResponse({ description: 'EMAIL_TAKEN: an account with this email exists' }),
  );
}

export function ApiLogin(): MethodDecorator {
  return applyDecorators(
    ApiOperation({ summary: 'Log in and receive an access token' }),
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
