import type { PickStatsResponseDto } from '@app/activity/dto/pick-stats-response.dto.js';
import type { SquadActivityDto } from '@app/activity/dto/squad-history-response.dto.js';
import type { IActivityRow } from '@app/activity/interfaces/activity.interfaces.js';
import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { IPickCount } from '@app/squads/interfaces/squad-rules.interfaces.js';

export function toSquadActivityResponse(
  row: IActivityRow,
  charactersById: Map<number, CharacterResponseDto>,
): SquadActivityDto {
  const character = row.characterId === undefined ? undefined : charactersById.get(row.characterId);

  return {
    id: row._id.toHexString(),
    type: row.type,
    ...(character ? { character } : {}),
    ...(row.details ? { details: row.details } : {}),
    occurredAt: row.occurredAt,
  };
}

export function toPickStatsResponse(
  days: number,
  since: Date,
  pickCounts: IPickCount[],
  characters: CharacterResponseDto[],
): PickStatsResponseDto {
  const charactersById = new Map(characters.map((character) => [character.id, character]));

  return {
    days,
    since: since.toISOString(),
    items: pickCounts.flatMap((pick) => {
      const character = charactersById.get(pick.characterId);

      return character ? [{ character, pickCount: pick.pickCount }] : [];
    }),
  };
}
