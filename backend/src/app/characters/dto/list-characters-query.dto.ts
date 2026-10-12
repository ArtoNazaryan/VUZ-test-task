import {
  DEFAULT_CHARACTERS_PAGE_SIZE,
  MAX_CHARACTERS_PAGE_SIZE,
  MAX_SEARCH_LENGTH,
} from '@app/characters/constants/characters.constants.js';
import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import {
  toStringList,
  toTrimmedString,
} from '@infrastructure/common/helpers/query-transform.helper.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListCharactersQueryDto {
  @ApiPropertyOptional({
    description: 'Matches the character name or any of its tag names',
    example: 'sub',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toTrimmedString(value))
  @IsString()
  @MaxLength(MAX_SEARCH_LENGTH)
  search?: string;

  @ApiPropertyOptional({
    description: 'Comma separated tag names; matches characters with any of them',
    type: String,
    example: 'ninja,robot',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toStringList(value))
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(MAX_CHARACTERS_PAGE_SIZE)
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Comma separated universe names; matches characters from any of them',
    type: String,
    example: 'Mortal Kombat',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toStringList(value))
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(MAX_CHARACTERS_PAGE_SIZE)
  universes?: string[];

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_CHARACTERS_PAGE_SIZE,
    default: DEFAULT_CHARACTERS_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_CHARACTERS_PAGE_SIZE)
  limit: number = DEFAULT_CHARACTERS_PAGE_SIZE;

  @ApiPropertyOptional({ description: 'The nextCursor value from the previous page' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ enum: CharacterSort, default: CharacterSort.NameAsc })
  @IsOptional()
  @IsEnum(CharacterSort)
  sort: CharacterSort = CharacterSort.NameAsc;
}
