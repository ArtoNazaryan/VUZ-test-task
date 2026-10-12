import { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { ApiProperty } from '@nestjs/swagger';

export class CharacterListResponseDto {
  @ApiProperty({ type: [CharacterResponseDto] })
  items: CharacterResponseDto[];

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Pass as cursor to get the next page; null on the last page',
  })
  nextCursor: string | null;
}
