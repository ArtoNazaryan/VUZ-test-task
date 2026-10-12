import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class PopularCharacterDto {
  @ApiProperty({ type: CharacterResponseDto })
  character: CharacterResponseDto;

  @ApiProperty({ example: 12, description: 'How many squads currently contain this character' })
  pickCount: number;
}

export class PopularityResponseDto {
  @ApiProperty({ type: [PopularCharacterDto], description: 'Most picked first, at most 10' })
  items: PopularCharacterDto[];

  @ApiProperty({ example: '2026-10-12T20:00:00.000Z' })
  updatedAt: string;
}
