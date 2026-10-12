import { LOG_LEVELS } from '@infrastructure/common/constants/logger.constants.js';
import { NodeEnv } from '@infrastructure/common/enums/node-env.enum.js';
import type { TEnv } from '@infrastructure/common/types/env.types.js';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(NodeEnv).default(NodeEnv.Development),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  REDIS_URL: z.url({ protocol: /^rediss?$/ }),
  CORS_ORIGINS: z.string().default('http://localhost:8080'),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  LOG_PRETTY: z.stringbool().default(false),
  SWAGGER_ENABLED: z.stringbool().default(true),
});

export function validateEnv(config: Record<string, unknown>): TEnv {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }

  return result.data;
}
