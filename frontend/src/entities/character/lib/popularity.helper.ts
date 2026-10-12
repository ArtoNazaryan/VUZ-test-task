import type { IPopularitySnapshot } from '@/entities/character/model/popularity.interfaces.ts';
import { isRecord } from '@/shared/lib/helpers/object.helper.ts';

function isPopularCharacter(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.pickCount === 'number' &&
    isRecord(value.character) &&
    typeof value.character.id === 'number' &&
    typeof value.character.name === 'string'
  );
}

export function isPopularitySnapshot(value: unknown): value is IPopularitySnapshot {
  return (
    isRecord(value) &&
    typeof value.updatedAt === 'string' &&
    Array.isArray(value.items) &&
    value.items.every(isPopularCharacter)
  );
}
