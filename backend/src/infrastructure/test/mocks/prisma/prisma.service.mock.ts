import { vi } from 'vitest';

export const prismaServiceMock = {
  $queryRaw: vi.fn<(query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>>(),
};
