import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class PickedCharacterDto {
  @ApiProperty({ type: CharacterResponseDto })
  character: CharacterResponseDto;

  @ApiProperty({ example: 14, description: 'How many times it was added to a squad' })
  pickCount: number;
}

export class PickStatsResponseDto {
  @ApiProperty({ example: 7 })
  days: number;

  @ApiProperty({ example: '2026-10-06T10:00:00.000Z', description: 'Start of the counted window' })
  since: string;

  @ApiProperty({ type: [PickedCharacterDto], description: 'Most added first, at most 10' })
  items: PickedCharacterDto[];
}
