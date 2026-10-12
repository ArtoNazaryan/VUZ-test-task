import type { ISquadSummary } from '@/entities/squad/model/squad.interfaces.ts';

const STORAGE_KEY_PREFIX = 'squad-of-champions:active-squad';

export function buildActiveSquadStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function resolveActiveSquadId(
  squads: ISquadSummary[],
  preferredId: string | null,
): string | null {
  return squads.find((squad) => squad.id === preferredId)?.id ?? squads[0]?.id ?? null;
}
