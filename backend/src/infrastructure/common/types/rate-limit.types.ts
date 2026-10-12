import type { ThrottlerStorage } from '@nestjs/throttler';

export type TThrottlerRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>;
