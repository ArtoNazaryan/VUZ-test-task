import {
  decodeActivityCursor,
  encodeActivityCursor,
} from '@app/activity/helpers/activity-cursor.helper.js';
import { describe, expect, it } from 'vitest';

describe('activity cursor', () => {
  const cursor = { occurredAt: '2026-10-13T10:00:00.000Z', id: '6710f3c2a1b2c3d4e5f60718' };

  it('decodes what it encoded', () => {
    expect(decodeActivityCursor(encodeActivityCursor(cursor))).toEqual(cursor);
  });

  it('rejects garbage, a bad date and a bad id', () => {
    expect(decodeActivityCursor('not-a-cursor')).toBeNull();
    expect(
      decodeActivityCursor(encodeActivityCursor({ ...cursor, occurredAt: 'yesterday' })),
    ).toBeNull();
    expect(decodeActivityCursor(encodeActivityCursor({ ...cursor, id: 'abc' }))).toBeNull();
  });
});
