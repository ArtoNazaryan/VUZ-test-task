import {
  DEFAULT_HISTORY_PAGE_SIZE,
  MAX_HISTORY_PAGE_SIZE,
} from '@app/activity/constants/activity.constants.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SquadHistoryQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_HISTORY_PAGE_SIZE,
    default: DEFAULT_HISTORY_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_HISTORY_PAGE_SIZE)
  limit: number = DEFAULT_HISTORY_PAGE_SIZE;

  @ApiPropertyOptional({ description: 'The nextCursor value from the previous page' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
