import type { IActivityCursor } from '@app/activity/interfaces/activity.interfaces.js';
import { z } from 'zod';

const cursorSchema = z.object({
  occurredAt: z.iso.datetime(),
  id: z.string().regex(/^[a-f\d]{24}$/),
});

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function encodeActivityCursor(cursor: IActivityCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

export function decodeActivityCursor(token: string): IActivityCursor | null {
  const result = cursorSchema.safeParse(
    parseJson(Buffer.from(token, 'base64url').toString('utf8')),
  );

  return result.success ? result.data : null;
}
