import type { loginFormSchema } from '@/features/login-form/model/login-form.schema.ts';
import type { z } from 'zod';

export type TLoginFormValues = z.infer<typeof loginFormSchema>;

export type TLoginField = keyof TLoginFormValues;
