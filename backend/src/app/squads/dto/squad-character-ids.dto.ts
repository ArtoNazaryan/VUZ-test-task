import { MAX_CHARACTER_IDS_PER_REQUEST } from '@app/squads/constants/squads.constants.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsInt, IsOptional, Min } from 'class-validator';

export class SquadCharacterIdsDto {
  @ApiPropertyOptional({
    type: [Number],
    example: [1, 25, 42],
    description: 'Up to 6 unique character ids, in the order they should appear',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_CHARACTER_IDS_PER_REQUEST)
  @IsInt({ each: true })
  @Min(1, { each: true })
  characterIds?: number[];
}
