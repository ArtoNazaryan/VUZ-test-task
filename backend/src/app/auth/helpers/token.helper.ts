import type { IAccessTokenPayload } from '@app/auth/interfaces/auth.interfaces.js';

const BEARER_PREFIX = 'Bearer ';

export function extractBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith(BEARER_PREFIX)) {
    return null;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();

  return token.length > 0 ? token : null;
}

export function isAccessTokenPayload(value: unknown): value is IAccessTokenPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    'email' in value &&
    typeof value.sub === 'string' &&
    typeof value.email === 'string'
  );
}
