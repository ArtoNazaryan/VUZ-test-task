import { ApiProperty } from '@nestjs/swagger';

export class CharacterFiltersResponseDto {
  @ApiProperty({
    example: ['Dragon Ball Z', 'Mortal Kombat', 'Street Fighter', 'Super Smash Bros'],
  })
  universes: string[];

  @ApiProperty({ example: ['aerial', 'agile', 'alien'] })
  tags: string[];

  @ApiProperty({ example: ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'] })
  abilities: string[];
}
