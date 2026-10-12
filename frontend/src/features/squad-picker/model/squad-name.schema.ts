import { SQUAD_NAME_MAX_LENGTH } from '@/entities/squad/index.ts';
import { z } from 'zod';

export const squadNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give your squad a name')
    .max(SQUAD_NAME_MAX_LENGTH, `Use at most ${SQUAD_NAME_MAX_LENGTH} characters`),
});
