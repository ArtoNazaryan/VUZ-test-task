import { toPublicHealthDetails } from '@app/health/helpers/health-result.helper.js';
import { describe, expect, it } from 'vitest';

describe('toPublicHealthDetails', () => {
  it('keeps only the status of each dependency', () => {
    const response = {
      status: 'error',
      details: {
        database: { status: 'up', responseTime: 3 },
        redis: { status: 'down', message: 'connect ECONNREFUSED', responseTime: 0 },
      },
    };

    expect(toPublicHealthDetails(response)).toEqual({
      database: { status: 'up' },
      redis: { status: 'down' },
    });
  });

  it('marks a dependency without a status as unknown', () => {
    expect(toPublicHealthDetails({ details: { redis: 'broken' } })).toEqual({
      redis: { status: 'unknown' },
    });
  });

  it('returns an empty object for an unexpected response shape', () => {
    expect(toPublicHealthDetails('Service Unavailable')).toEqual({});
  });
});
