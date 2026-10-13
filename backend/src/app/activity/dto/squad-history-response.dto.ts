import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SquadActivityDetailsDto {
  @ApiPropertyOptional({ example: 'Outworld', description: 'The new name' })
  name?: string;

  @ApiPropertyOptional({
    type: [Number],
    example: [25, 1],
    description: 'The full list of characters after the change',
  })
  characterIds?: number[];
}

export class SquadActivityDto {
  @ApiProperty({ example: '6710f3c2a1b2c3d4e5f60718' })
  id: string;

  @ApiProperty({ enum: SquadEvent, example: SquadEvent.MemberAdded })
  type: SquadEvent;

  @ApiPropertyOptional({
    type: CharacterResponseDto,
    description: 'The character that was added or removed',
  })
  character?: CharacterResponseDto;

  @ApiPropertyOptional({
    type: SquadActivityDetailsDto,
    description: 'Set for created and updated events',
  })
  details?: SquadActivityDetailsDto;

  @ApiProperty({ example: '2026-10-13T10:00:00.000Z' })
  occurredAt: Date;
}

export class SquadHistoryResponseDto {
  @ApiProperty({ type: [SquadActivityDto], description: 'Newest first' })
  items: SquadActivityDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Pass as cursor to get the next page; null on the last page',
  })
  nextCursor: string | null;
}
