import { CHARACTER_SELECT } from '@app/characters/constants/characters.constants.js';
import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import { buildCharacterWhere } from '@app/characters/helpers/character-where.helper.js';
import type { ICharacterListFilters } from '@app/characters/interfaces/character-list.interfaces.js';
import type { TCharacterRow } from '@app/characters/types/character.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CharactersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findPage(filters: ICharacterListFilters, take: number): Promise<TCharacterRow[]> {
    const direction = filters.sort === CharacterSort.NameDesc ? 'desc' : 'asc';

    return this.prismaService.character.findMany({
      where: buildCharacterWhere(filters),
      orderBy: [{ name: direction }, { id: direction }],
      take,
      select: CHARACTER_SELECT,
    });
  }

  findManyByIds(ids: number[]): Promise<TCharacterRow[]> {
    return this.prismaService.character.findMany({
      where: { id: { in: ids } },
      select: CHARACTER_SELECT,
    });
  }

  findById(id: number): Promise<TCharacterRow | null> {
    return this.prismaService.character.findUnique({ where: { id }, select: CHARACTER_SELECT });
  }

  async findUniverseNames(): Promise<string[]> {
    const universes = await this.prismaService.universe.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return universes.map((universe) => universe.name);
  }

  async findTagNames(): Promise<string[]> {
    const tags = await this.prismaService.tag.findMany({
      select: { name: true },
      orderBy: { name: 'asc' },
    });

    return tags.map((tag) => tag.name);
  }

  async findAbilityNames(): Promise<string[]> {
    const abilities = await this.prismaService.ability.findMany({ select: { name: true } });

    return abilities.map((ability) => ability.name);
  }
}
