import type { IAuthSessionPayload } from '@/shared/api/index.ts';

export function makeAuthSession(accessToken = 'access-token-1'): IAuthSessionPayload {
  return {
    accessToken,
    user: { id: 'user-1', email: 'ryu@example.com', createdAt: '2026-10-12T10:00:00.000Z' },
  };
}
