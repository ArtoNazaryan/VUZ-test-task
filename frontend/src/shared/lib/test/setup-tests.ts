import { mswServer } from '@/shared/lib/test/msw-server.ts';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  mswServer.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
