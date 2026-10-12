import { FakeIntersectionObserver } from '@/shared/lib/test/intersection-observer.mock.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  mswServer.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
