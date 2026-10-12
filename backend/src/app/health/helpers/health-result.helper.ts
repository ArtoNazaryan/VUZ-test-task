import type { IPublicHealthStatus } from '@app/health/interfaces/health.interfaces.js';
import { isPlainObject } from '@infrastructure/common/helpers/object.helper.js';

export function toPublicHealthDetails(response: unknown): Record<string, IPublicHealthStatus> {
  if (!isPlainObject(response) || !isPlainObject(response.details)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(response.details).map(([dependency, indicator]) => [
      dependency,
      {
        status:
          isPlainObject(indicator) && typeof indicator.status === 'string'
            ? indicator.status
            : 'unknown',
      },
    ]),
  );
}
