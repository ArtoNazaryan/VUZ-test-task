import { isRecord } from '@/shared/lib/helpers/object.helper.ts';
import type { IAuthSessionPayload } from '@/shared/api/types/api.interfaces.ts';

export function readAccessToken(state: unknown): string | null {
  if (!isRecord(state) || !isRecord(state.session)) {
    return null;
  }

  return typeof state.session.accessToken === 'string' ? state.session.accessToken : null;
}

export function isAuthSessionPayload(value: unknown): value is IAuthSessionPayload {
  return (
    isRecord(value) &&
    typeof value.accessToken === 'string' &&
    isRecord(value.user) &&
    typeof value.user.id === 'string' &&
    typeof value.user.email === 'string'
  );
}
