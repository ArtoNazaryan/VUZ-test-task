import type { CHARACTER_SELECT } from '@app/characters/constants/characters.constants.js';
import type { CharacterGetPayload } from '@infrastructure/prisma/generated/models.js';

export type TCharacterRow = CharacterGetPayload<{ select: typeof CHARACTER_SELECT }>;
