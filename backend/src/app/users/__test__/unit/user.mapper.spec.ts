import { toUserResponse } from '@app/users/mappers/user.mapper.js';
import { describe, expect, it } from 'vitest';

describe('toUserResponse', () => {
  it('returns the public user fields without the password hash', () => {
    const createdAt = new Date('2026-10-12T00:00:00.000Z');

    expect(
      toUserResponse({ id: 'user-1', email: 'ryu@example.com', passwordHash: 'secret', createdAt }),
    ).toEqual({ id: 'user-1', email: 'ryu@example.com', createdAt });
  });
});
