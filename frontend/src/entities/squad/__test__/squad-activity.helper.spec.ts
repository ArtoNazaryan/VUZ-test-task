import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { describeSquadActivity, type ISquadActivity } from '@/entities/squad/index.ts';

function activity(overrides: Partial<ISquadActivity>): ISquadActivity {
  return {
    id: 'activity-1',
    type: 'squad.updated',
    occurredAt: '2026-10-13T12:00:00.000Z',
    ...overrides,
  };
}

describe('describeSquadActivity', () => {
  it('describes added and removed characters by name', () => {
    const character = makeCharacter({ name: 'Scorpion' });

    expect(describeSquadActivity(activity({ type: 'squad.member-added', character }))).toBe(
      'Added Scorpion',
    );
    expect(describeSquadActivity(activity({ type: 'squad.member-removed', character }))).toBe(
      'Removed Scorpion',
    );
    expect(describeSquadActivity(activity({ type: 'squad.member-added' }))).toBe(
      'Added a character',
    );
  });

  it('describes a creation with its name and starting characters', () => {
    expect(
      describeSquadActivity(
        activity({ type: 'squad.created', details: { name: 'Earthrealm', characterIds: [] } }),
      ),
    ).toBe('Created "Earthrealm"');
    expect(
      describeSquadActivity(
        activity({ type: 'squad.created', details: { name: 'Outworld', characterIds: [1, 2] } }),
      ),
    ).toBe('Created "Outworld" with 2 characters');
  });

  it('describes renames and replaced characters', () => {
    expect(describeSquadActivity(activity({ details: { name: 'Outworld' } }))).toBe(
      'Renamed to "Outworld"',
    );
    expect(describeSquadActivity(activity({ details: { characterIds: [3] } }))).toBe(
      'Replaced the characters',
    );
    expect(
      describeSquadActivity(activity({ details: { name: 'Edenia', characterIds: [3] } })),
    ).toBe('Renamed to "Edenia" and replaced the characters');
    expect(describeSquadActivity(activity({}))).toBe('Updated the squad');
    expect(describeSquadActivity(activity({ type: 'squad.deleted' }))).toBe('Deleted the squad');
  });
});
