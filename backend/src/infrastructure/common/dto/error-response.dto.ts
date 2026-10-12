import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { TErrorDetails } from '@infrastructure/common/types/error-details.types.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ enum: ErrorCode, enumName: 'ErrorCode', example: ErrorCode.SquadFull })
  error: ErrorCode;

  @ApiProperty({ example: 'A squad cannot have more than 6 characters' })
  message: string;

  @ApiPropertyOptional({
    description:
      'Extra data about the error: a list of { field, messages } for validation errors, or an object such as { characterIds } or { limit, requested }',
    oneOf: [{ type: 'array', items: { type: 'object' } }, { type: 'object' }],
    example: { limit: 6, requested: 7 },
  })
  details?: TErrorDetails;

  @ApiProperty({
    example: '3eedd63b-a5be-47c4-a33e-2bb01d41eafc',
    description: 'Also sent as the x-request-id header; use it to find the request in the logs',
  })
  requestId: string;
}
