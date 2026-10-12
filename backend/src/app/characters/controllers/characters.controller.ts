import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterListResponseDto } from '@app/characters/dto/character-list-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import {
  ApiCharactersController,
  ApiGetCharacter,
  ApiGetCharacterFilters,
  ApiListCharacters,
} from '@app/characters/swagger/characters.swagger.js';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

@ApiCharactersController()
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiListCharacters()
  list(@Query() query: ListCharactersQueryDto): Promise<CharacterListResponseDto> {
    return this.charactersService.list(query);
  }

  @Get('filters')
  @ApiGetCharacterFilters()
  getFilters(): Promise<CharacterFiltersResponseDto> {
    return this.charactersService.getFilters();
  }

  @Get(':id')
  @ApiGetCharacter()
  getById(@Param('id', ParseIntPipe) id: number): Promise<CharacterResponseDto> {
    return this.charactersService.getById(id);
  }
}
