import type { registerFormSchema } from '@/features/register-form/model/register-form.schema.ts';
import type { z } from 'zod';

export type TRegisterFormValues = z.infer<typeof registerFormSchema>;

export type TRegisterField = keyof TRegisterFormValues;
