import { STRICT_RATE_LIMIT_KEY } from '@infrastructure/rate-limit/constants/rate-limit.constants.js';
import { SetMetadata } from '@nestjs/common';

export const StrictRateLimit = (): MethodDecorator => SetMetadata(STRICT_RATE_LIMIT_KEY, true);
