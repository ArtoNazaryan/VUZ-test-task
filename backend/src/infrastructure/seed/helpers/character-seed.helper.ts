import type { ICharacterSeedPlan } from '@infrastructure/seed/interfaces/character-seed.interfaces.js';
import { charactersJsonSchema } from '@infrastructure/seed/schemas/characters-json.schema.js';
import type { TCharactersJson } from '@infrastructure/seed/types/characters-json.types.js';
import { z } from 'zod';

export function parseCharactersJson(raw: unknown): TCharactersJson {
  const result = charactersJsonSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(`Invalid characters JSON:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}

export function buildCharacterSeedPlan(characters: TCharactersJson): ICharacterSeedPlan {
  const uniqueSorted = (names: string[]): string[] => [...new Set(names)].sort();

  return {
    universeNames: uniqueSorted(characters.map((character) => character.universe)),
    tagNames: uniqueSorted(
      characters.flatMap((character) => (character.tags ?? []).map((tag) => tag.tag_name)),
    ),
    abilityNames: uniqueSorted(
      characters.flatMap((character) => character.abilities.map((ability) => ability.abilityName)),
    ),
    characters: characters.map((character) => ({
      id: character.id,
      name: character.name,
      quote: character.quote ?? null,
      image: character.image,
      thumbnail: character.thumbnail ?? null,
      universeName: character.universe,
      tags: (character.tags ?? []).map((tag) => ({ name: tag.tag_name, slot: tag.slot })),
      abilities: character.abilities.map((ability) => ({
        name: ability.abilityName,
        score: ability.abilityScore,
      })),
    })),
  };
}

export function getRequiredId(ids: ReadonlyMap<string, number>, name: string): number {
  const id = ids.get(name);

  if (id === undefined) {
    throw new Error(`No id found for "${name}"`);
  }

  return id;
}
