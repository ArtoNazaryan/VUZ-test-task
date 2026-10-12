import { isAuthSessionPayload } from '@/shared/api/helpers/session-state.helper.ts';
import type { IAuthSessionPayload } from '@/shared/api/types/api.interfaces.ts';
import { API_URL } from '@/shared/config/index.ts';

let inFlightRefresh: Promise<IAuthSessionPayload | null> | null = null;

async function requestRefresh(): Promise<IAuthSessionPayload | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json();

    return isAuthSessionPayload(body) ? body : null;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<IAuthSessionPayload | null> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = requestRefresh();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}
