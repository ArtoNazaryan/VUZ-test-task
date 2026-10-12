import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { isPopularitySnapshot } from '@/entities/character/index.ts';

describe('isPopularitySnapshot', () => {
  it('accepts a snapshot of characters with pick counts', () => {
    expect(
      isPopularitySnapshot({
        items: [{ character: makeCharacter({ id: 1 }), pickCount: 2 }],
        updatedAt: '2026-10-13T10:00:00.000Z',
      }),
    ).toBe(true);
    expect(isPopularitySnapshot({ items: [], updatedAt: '2026-10-13T10:00:00.000Z' })).toBe(true);
  });

  it('rejects snapshots with malformed items', () => {
    expect(isPopularitySnapshot({ items: [{ pickCount: 2 }], updatedAt: 'now' })).toBe(false);
    expect(isPopularitySnapshot({ items: [] })).toBe(false);
    expect(isPopularitySnapshot(null)).toBe(false);
  });
});
