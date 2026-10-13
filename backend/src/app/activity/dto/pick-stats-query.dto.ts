import {
  DEFAULT_PICK_STATS_DAYS,
  MAX_PICK_STATS_DAYS,
} from '@app/activity/constants/activity.constants.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PickStatsQueryDto {
  @ApiPropertyOptional({
    description: 'How many days back to count',
    minimum: 1,
    maximum: MAX_PICK_STATS_DAYS,
    default: DEFAULT_PICK_STATS_DAYS,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PICK_STATS_DAYS)
  days: number = DEFAULT_PICK_STATS_DAYS;
}
