import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { CHARACTERS_CACHE_NAMESPACE } from '@infrastructure/common/constants/cache.constants.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import type { TPrismaTransaction } from '@infrastructure/prisma/types/prisma.types.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { SEED_TRANSACTION_TIMEOUT_MS } from '@infrastructure/seed/constants/seed.constants.js';
import {
  buildCharacterSeedPlan,
  getRequiredId,
  parseCharactersJson,
} from '@infrastructure/seed/helpers/character-seed.helper.js';
import type {
  ICharacterSeedPlan,
  ICharacterSeedSummary,
} from '@infrastructure/seed/interfaces/character-seed.interfaces.js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

@Injectable()
export class CharacterSeedService {
  private readonly logger = new Logger(CharacterSeedService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<TEnv, true>,
    private readonly cacheService: CacheService,
  ) {}

  async seed(): Promise<ICharacterSeedSummary> {
    const filePath = resolve(this.configService.get('CHARACTERS_JSON_PATH', { infer: true }));
    const raw: unknown = JSON.parse(await readFile(filePath, 'utf8'));
    const plan = buildCharacterSeedPlan(parseCharactersJson(raw));

    await this.prismaService.$transaction((transaction) => this.writePlan(transaction, plan), {
      timeout: SEED_TRANSACTION_TIMEOUT_MS,
    });

    const cacheVersion = await this.cacheService.bumpVersion(CHARACTERS_CACHE_NAMESPACE);
    const summary = await this.countRows();

    this.logger.log(
      { filePath, cacheVersion, ...summary },
      '[CharacterSeedService] Character catalogue seeded',
    );

    return summary;
  }

  private async writePlan(
    transaction: TPrismaTransaction,
    plan: ICharacterSeedPlan,
  ): Promise<void> {
    await transaction.universe.createMany({
      data: plan.universeNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
    await transaction.tag.createMany({
      data: plan.tagNames.map((name) => ({ name })),
      skipDuplicates: true,
    });
    await transaction.ability.createMany({
      data: plan.abilityNames.map((name) => ({ name })),
      skipDuplicates: true,
    });

    const universeIds = await this.loadIdsByName(transaction.universe.findMany());
    const tagIds = await this.loadIdsByName(transaction.tag.findMany());
    const abilityIds = await this.loadIdsByName(transaction.ability.findMany());

    for (const character of plan.characters) {
      const data = {
        name: character.name,
        quote: character.quote,
        image: character.image,
        thumbnail: character.thumbnail,
        universeId: getRequiredId(universeIds, character.universeName),
      };

      await transaction.character.upsert({
        where: { id: character.id },
        create: { id: character.id, ...data },
        update: data,
      });
    }

    const characterIds = plan.characters.map((character) => character.id);

    await transaction.characterTag.deleteMany({ where: { characterId: { in: characterIds } } });
    await transaction.characterAbility.deleteMany({ where: { characterId: { in: characterIds } } });
    await transaction.characterTag.createMany({
      data: plan.characters.flatMap((character) =>
        character.tags.map((tag) => ({
          characterId: character.id,
          tagId: getRequiredId(tagIds, tag.name),
          slot: tag.slot,
        })),
      ),
    });
    await transaction.characterAbility.createMany({
      data: plan.characters.flatMap((character) =>
        character.abilities.map((ability) => ({
          characterId: character.id,
          abilityId: getRequiredId(abilityIds, ability.name),
          score: ability.score,
        })),
      ),
    });
  }

  private async loadIdsByName(
    rows: Promise<{ id: number; name: string }[]>,
  ): Promise<Map<string, number>> {
    return new Map((await rows).map((row) => [row.name, row.id]));
  }

  private async countRows(): Promise<ICharacterSeedSummary> {
    const [universes, tags, abilities, characters, characterTags, characterAbilities] =
      await Promise.all([
        this.prismaService.universe.count(),
        this.prismaService.tag.count(),
        this.prismaService.ability.count(),
        this.prismaService.character.count(),
        this.prismaService.characterTag.count(),
        this.prismaService.characterAbility.count(),
      ]);

    return { universes, tags, abilities, characters, characterTags, characterAbilities };
  }
}
