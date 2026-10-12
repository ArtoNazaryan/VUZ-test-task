import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class SquadResponseDto {
  @ApiProperty({ example: '0199d6a4-6f4e-7c2a-9b1d-3f6a2c8e4b10' })
  id: string;

  @ApiProperty({ example: 'Earthrealm defenders' })
  name: string;

  @ApiProperty({
    type: [CharacterResponseDto],
    description: 'Members in the order they were added',
  })
  characters: CharacterResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
