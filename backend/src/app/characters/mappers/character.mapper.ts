import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import { compareAbilityNames } from '@app/characters/helpers/ability-order.helper.js';
import type { TCharacterRow } from '@app/characters/types/character.types.js';

export function toCharacterResponse(row: TCharacterRow): CharacterResponseDto {
  return {
    id: row.id,
    name: row.name,
    quote: row.quote,
    image: row.image,
    thumbnail: row.thumbnail,
    universe: row.universe.name,
    tags: row.tags.map((characterTag) => ({
      name: characterTag.tag.name,
      slot: characterTag.slot,
    })),
    abilities: row.abilities
      .map((characterAbility) => ({
        name: characterAbility.ability.name,
        score: characterAbility.score,
      }))
      .sort((left, right) => compareAbilityNames(left.name, right.name)),
  };
}
