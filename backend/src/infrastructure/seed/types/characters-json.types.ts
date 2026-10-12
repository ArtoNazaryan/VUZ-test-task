import type { charactersJsonSchema } from '@infrastructure/seed/schemas/characters-json.schema.js';
import type { z } from 'zod';

export type TCharactersJson = z.infer<typeof charactersJsonSchema>;
