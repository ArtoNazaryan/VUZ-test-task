import type { CharacterSelect } from '@infrastructure/prisma/generated/models.js';

export const ABILITY_DISPLAY_ORDER: readonly string[] = [
  'Power',
  'Mobility',
  'Technique',
  'Survivability',
  'Energy',
];

export const CHARACTER_SELECT = {
  id: true,
  name: true,
  quote: true,
  image: true,
  thumbnail: true,
  universe: { select: { name: true } },
  tags: { select: { slot: true, tag: { select: { name: true } } }, orderBy: { slot: 'asc' } },
  abilities: { select: { score: true, ability: { select: { name: true } } } },
} satisfies CharacterSelect;
