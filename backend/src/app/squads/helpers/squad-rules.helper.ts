import { MAX_SQUAD_SIZE } from '@app/squads/constants/squads.constants.js';
import { SquadRuleViolation } from '@app/squads/enums/squad-rule-violation.enum.js';
import type { TSquadRuleViolation } from '@app/squads/types/squad-rules.types.js';

export function findDuplicateIds(ids: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }

    seen.add(id);
  }

  return [...duplicates];
}

export function findSquadRuleViolation(
  characterIds: number[],
  existingIds: ReadonlySet<number>,
): TSquadRuleViolation | null {
  if (characterIds.length > MAX_SQUAD_SIZE) {
    return {
      type: SquadRuleViolation.SquadFull,
      limit: MAX_SQUAD_SIZE,
      requested: characterIds.length,
    };
  }

  const duplicates = findDuplicateIds(characterIds);

  if (duplicates.length > 0) {
    return { type: SquadRuleViolation.DuplicateCharacters, characterIds: duplicates };
  }

  const unknown = [...new Set(characterIds)].filter((id) => !existingIds.has(id));

  if (unknown.length > 0) {
    return { type: SquadRuleViolation.UnknownCharacters, characterIds: unknown };
  }

  return null;
}

export function findAddMemberViolation(
  memberIds: number[],
  characterId: number,
): TSquadRuleViolation | null {
  if (memberIds.includes(characterId)) {
    return { type: SquadRuleViolation.DuplicateCharacters, characterIds: [characterId] };
  }

  if (memberIds.length >= MAX_SQUAD_SIZE) {
    return {
      type: SquadRuleViolation.SquadFull,
      limit: MAX_SQUAD_SIZE,
      requested: memberIds.length + 1,
    };
  }

  return null;
}
