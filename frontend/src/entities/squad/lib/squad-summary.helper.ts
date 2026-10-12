import type { ISquad, ISquadSummary } from '@/entities/squad/model/squad.interfaces.ts';

export function toSquadSummary(squad: ISquad): ISquadSummary {
  return {
    id: squad.id,
    name: squad.name,
    memberCount: squad.characters.length,
    createdAt: squad.createdAt,
    updatedAt: squad.updatedAt,
  };
}

export function upsertSquadSummary(summaries: ISquadSummary[], squad: ISquad): ISquadSummary[] {
  const summary = toSquadSummary(squad);

  return summaries.some((item) => item.id === squad.id)
    ? summaries.map((item) => (item.id === squad.id ? summary : item))
    : [...summaries, summary];
}
