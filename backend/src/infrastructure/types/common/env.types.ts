import type { envSchema } from '@infrastructure/config/env.validation.js';
import type { ConfigService } from '@nestjs/config';
import type { z } from 'zod';

export type TEnv = z.infer<typeof envSchema>;

export type TConfigService = ConfigService<TEnv, true>;
