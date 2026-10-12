import { compareAbilityNames } from '@app/characters/helpers/ability-order.helper.js';
import { describe, expect, it } from 'vitest';

describe('compareAbilityNames', () => {
  it('sorts abilities in the design column order', () => {
    const names = ['Energy', 'Mobility', 'Power', 'Survivability', 'Technique'];

    expect([...names].sort(compareAbilityNames)).toEqual([
      'Power',
      'Mobility',
      'Technique',
      'Survivability',
      'Energy',
    ]);
  });

  it('places unknown abilities last in alphabetical order', () => {
    expect(['Speed', 'Agility', 'Power'].sort(compareAbilityNames)).toEqual([
      'Power',
      'Agility',
      'Speed',
    ]);
  });
});
