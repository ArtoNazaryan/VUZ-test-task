import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import {
  decodeCharacterCursor,
  encodeCharacterCursor,
} from '@app/characters/helpers/cursor.helper.js';
import { describe, expect, it } from 'vitest';

const encodeRaw = (value: unknown): string =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

describe('character cursor', () => {
  it('decodes what it encodes', () => {
    const cursor = { name: 'Sub-Zero', id: 12, sort: CharacterSort.NameDesc };

    expect(decodeCharacterCursor(encodeCharacterCursor(cursor), CharacterSort.NameDesc)).toEqual(
      cursor,
    );
  });

  it('produces a URL safe token', () => {
    const token = encodeCharacterCursor({
      name: 'Zero Suit Samus??>>',
      id: 1,
      sort: CharacterSort.NameAsc,
    });

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('returns null for a token that is not JSON', () => {
    expect(decodeCharacterCursor('not-a-cursor', CharacterSort.NameAsc)).toBeNull();
  });

  it('returns null for JSON with the wrong shape', () => {
    const token = encodeRaw({ name: 'Ryu', id: 'one', sort: 'name' });

    expect(decodeCharacterCursor(token, CharacterSort.NameAsc)).toBeNull();
  });

  it('returns null for an unknown sort value', () => {
    const token = encodeRaw({ name: 'Ryu', id: 1, sort: 'power' });

    expect(decodeCharacterCursor(token, CharacterSort.NameAsc)).toBeNull();
  });

  it('returns null for a cursor created for a different sort order', () => {
    const token = encodeCharacterCursor({ name: 'Ryu', id: 1, sort: CharacterSort.NameDesc });

    expect(decodeCharacterCursor(token, CharacterSort.NameAsc)).toBeNull();
  });
});
