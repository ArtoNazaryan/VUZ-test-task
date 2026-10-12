import { ApiProperty } from '@nestjs/swagger';

export class CharacterTagDto {
  @ApiProperty({ example: 'human' })
  name: string;

  @ApiProperty({ example: 1 })
  slot: number;
}

export class CharacterAbilityDto {
  @ApiProperty({ example: 'Power' })
  name: string;

  @ApiProperty({ example: 7, minimum: 1, maximum: 10 })
  score: number;
}

export class CharacterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Cassie Cage' })
  name: string;

  @ApiProperty({ type: String, nullable: true, example: "Who's a good girl?" })
  quote: string | null;

  @ApiProperty({ example: 'https://cdn.dashfight.com/cassie-cage.png' })
  image: string;

  @ApiProperty({ type: String, nullable: true, example: 'https://media.eventhubs.com/cassie.png' })
  thumbnail: string | null;

  @ApiProperty({ example: 'Mortal Kombat' })
  universe: string;

  @ApiProperty({ type: [CharacterTagDto] })
  tags: CharacterTagDto[];

  @ApiProperty({ type: [CharacterAbilityDto] })
  abilities: CharacterAbilityDto[];
}
