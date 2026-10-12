import { z } from 'zod';

const abilitySchema = z.object({
  abilityName: z.string().min(1),
  abilityScore: z.number().int().min(1).max(10),
});

const tagSchema = z.object({
  slot: z.number().int().positive(),
  tag_name: z.string().min(1),
});

const characterSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  quote: z.string().optional(),
  image: z.string().min(1),
  thumbnail: z.string().optional(),
  universe: z.string().min(1),
  abilities: z.array(abilitySchema),
  tags: z.array(tagSchema).optional(),
});

export const charactersJsonSchema = z
  .array(characterSchema)
  .refine(
    (characters) => new Set(characters.map((character) => character.id)).size === characters.length,
    {
      message: 'Character ids must be unique',
    },
  );
