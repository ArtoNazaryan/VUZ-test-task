import { vi } from 'vitest';

export const redisServiceMock = {
  ping: vi.fn<() => Promise<string>>(),
};
