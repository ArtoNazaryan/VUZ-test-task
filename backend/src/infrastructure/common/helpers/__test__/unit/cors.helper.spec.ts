import { parseCorsOrigins } from '@infrastructure/common/helpers/cors.helper.js';
import { describe, expect, it } from 'vitest';

describe('parseCorsOrigins', () => {
  it('splits, trims and drops empty entries', () => {
    expect(parseCorsOrigins(' http://a.test , ,http://b.test ')).toEqual([
      'http://a.test',
      'http://b.test',
    ]);
  });
});
