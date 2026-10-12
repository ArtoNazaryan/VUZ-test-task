import { ErrorResponseDto } from '@infrastructure/common/dto/error-response.dto.js';
import type { IApiErrorExample } from '@infrastructure/common/interfaces/error-response.interfaces.js';
import { applyDecorators, type HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

const EXAMPLE_REQUEST_ID = '3eedd63b-a5be-47c4-a33e-2bb01d41eafc';

export function ApiErrorResponse(
  status: HttpStatus,
  description: string,
  ...examples: IApiErrorExample[]
): ReturnType<typeof applyDecorators> {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      type: ErrorResponseDto,
      examples: Object.fromEntries(
        examples.map((example) => [
          example.error,
          {
            summary: example.error,
            value: {
              statusCode: status,
              error: example.error,
              message: example.message,
              ...(example.details ? { details: example.details } : {}),
              requestId: EXAMPLE_REQUEST_ID,
            },
          },
        ]),
      ),
    }),
  );
}
