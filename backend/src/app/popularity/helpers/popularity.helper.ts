import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { PopularityResponseDto } from '@app/popularity/dto/popularity-response.dto.js';
import type { IPickCount } from '@app/squads/interfaces/squad-rules.interfaces.js';

export function buildPopularitySnapshot(
  pickCounts: IPickCount[],
  characters: CharacterResponseDto[],
  updatedAt: Date,
): PopularityResponseDto {
  const charactersById = new Map(characters.map((character) => [character.id, character]));

  return {
    items: pickCounts.flatMap((pick) => {
      const character = charactersById.get(pick.characterId);

      return character ? [{ character, pickCount: pick.pickCount }] : [];
    }),
    updatedAt: updatedAt.toISOString(),
  };
}
