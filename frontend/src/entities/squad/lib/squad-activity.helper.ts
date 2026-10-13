import type { ISquadActivity } from '@/entities/squad/model/squad-activity.interfaces.ts';

function describeUpdate(activity: ISquadActivity): string {
  const { name, characterIds } = activity.details ?? {};

  if (name !== undefined && characterIds !== undefined) {
    return `Renamed to "${name}" and replaced the characters`;
  }

  if (name !== undefined) {
    return `Renamed to "${name}"`;
  }

  return characterIds === undefined ? 'Updated the squad' : 'Replaced the characters';
}

function describeCreation(activity: ISquadActivity): string {
  const name = activity.details?.name;
  const memberCount = activity.details?.characterIds?.length ?? 0;
  const created = name === undefined ? 'Created the squad' : `Created "${name}"`;

  return memberCount > 0 ? `${created} with ${String(memberCount)} characters` : created;
}

export function describeSquadActivity(activity: ISquadActivity): string {
  const characterName = activity.character?.name ?? 'a character';

  switch (activity.type) {
    case 'squad.created':
      return describeCreation(activity);
    case 'squad.updated':
      return describeUpdate(activity);
    case 'squad.deleted':
      return 'Deleted the squad';
    case 'squad.member-added':
      return `Added ${characterName}`;
    case 'squad.member-removed':
      return `Removed ${characterName}`;
  }
}
