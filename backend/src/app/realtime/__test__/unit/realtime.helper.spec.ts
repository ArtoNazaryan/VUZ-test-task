import {
  buildUserRoom,
  readHandshakeToken,
  toSquadChangedMessage,
} from '@app/realtime/helpers/realtime.helper.js';
import { describe, expect, it } from 'vitest';

const occurredAt = new Date('2026-10-12T10:00:00.000Z');

describe('buildUserRoom', () => {
  it('names one room per user', () => {
    expect(buildUserRoom('user-1')).toBe('user:user-1');
  });
});

describe('readHandshakeToken', () => {
  it('reads the token sent in the handshake auth', () => {
    expect(readHandshakeToken({ token: 'abc' })).toBe('abc');
  });

  it('returns null when the token is missing, empty or not a string', () => {
    expect(readHandshakeToken({})).toBeNull();
    expect(readHandshakeToken({ token: '' })).toBeNull();
    expect(readHandshakeToken({ token: 42 })).toBeNull();
    expect(readHandshakeToken(undefined)).toBeNull();
  });
});

describe('toSquadChangedMessage', () => {
  it('describes a squad change without a character', () => {
    expect(
      toSquadChangedMessage({ squadId: 'squad-1', userId: 'user-1', occurredAt }, 'deleted'),
    ).toEqual({ squadId: 'squad-1', change: 'deleted', occurredAt: '2026-10-12T10:00:00.000Z' });
  });

  it('includes the character for member changes and never the user id', () => {
    const message = toSquadChangedMessage(
      { squadId: 'squad-1', userId: 'user-1', characterId: 25, occurredAt },
      'member-added',
    );

    expect(message).toEqual({
      squadId: 'squad-1',
      change: 'member-added',
      characterId: 25,
      occurredAt: '2026-10-12T10:00:00.000Z',
    });
    expect(message).not.toHaveProperty('userId');
  });
});
