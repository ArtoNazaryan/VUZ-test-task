import type { CharacterFiltersResponseDto } from '@app/characters/dto/character-filters-response.dto.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { CharactersService } from '@app/characters/services/characters.service.js';
import {
  ApiGetCharacter,
  ApiGetCharacterFilters,
} from '@app/characters/swagger/characters.swagger.js';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

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
