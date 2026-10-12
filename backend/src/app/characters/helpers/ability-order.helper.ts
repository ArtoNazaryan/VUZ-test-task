import { ABILITY_DISPLAY_ORDER } from '@app/characters/constants/characters.constants.js';

function displayRank(name: string): number {
  const index = ABILITY_DISPLAY_ORDER.indexOf(name);

  return index === -1 ? ABILITY_DISPLAY_ORDER.length : index;
}

export function compareAbilityNames(left: string, right: string): number {
  return displayRank(left) - displayRank(right) || left.localeCompare(right);
}
