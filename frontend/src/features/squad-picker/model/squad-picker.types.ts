import type { squadNameSchema } from '@/features/squad-picker/model/squad-name.schema.ts';
import type { IApiError } from '@/shared/api/index.ts';
import type { z } from 'zod';

export type TSquadNameValues = z.infer<typeof squadNameSchema>;

export type TSubmitSquadName = (name: string) => Promise<IApiError | null>;

export type TOpenDialog = 'create' | 'rename' | 'delete' | null;
