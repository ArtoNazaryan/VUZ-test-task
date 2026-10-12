import { isRecord } from '@/shared/lib/helpers/object.helper.ts';

export function readRedirectPath(locationState: unknown): string | null {
  if (!isRecord(locationState) || typeof locationState.from !== 'string') {
    return null;
  }

  const path = locationState.from;

  return path.startsWith('/') && !path.startsWith('//') ? path : null;
}
