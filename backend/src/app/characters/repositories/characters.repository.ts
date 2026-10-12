import { CHARACTER_SELECT } from '@app/characters/constants/characters.constants.js';
import type { TCharacterRow } from '@app/characters/types/character.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CharactersRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
