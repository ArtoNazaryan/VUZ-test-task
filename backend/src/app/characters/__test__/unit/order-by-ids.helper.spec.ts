import { orderByIds } from '@app/characters/helpers/order-by-ids.helper.js';
import { describe, expect, it } from 'vitest';

describe('orderByIds', () => {
  it('returns the items in the order of the given ids', () => {
    expect(orderByIds([{ id: 1 }, { id: 2 }, { id: 3 }], [3, 1, 2])).toEqual([
      { id: 3 },
      { id: 1 },
      { id: 2 },
    ]);
  });

  it('skips ids that have no matching item', () => {
    expect(orderByIds([{ id: 1 }], [9, 1])).toEqual([{ id: 1 }]);
  });
});
