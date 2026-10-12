import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import type { ICharacterCursor } from '@app/characters/interfaces/character-list.interfaces.js';
import { z } from 'zod';

const cursorSchema = z.object({
  name: z.string(),
  id: z.number().int().positive(),
  sort: z.enum(CharacterSort),
});

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function encodeCharacterCursor(cursor: ICharacterCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeCharacterCursor(token: string, sort: CharacterSort): ICharacterCursor | null {
  const result = cursorSchema.safeParse(
    parseJson(Buffer.from(token, 'base64url').toString('utf8')),
  );

  return result.success && result.data.sort === sort ? result.data : null;
}
