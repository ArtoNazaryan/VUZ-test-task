import { FakeIntersectionObserver } from '@/shared/lib/test/intersection-observer.mock.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { resetCreatedSockets } from '@/shared/lib/test/socket-io.mock.ts';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

vi.mock('socket.io-client', async () => {
  const { createFakeSocket } = await import('@/shared/lib/test/socket-io.mock.ts');

  return { io: createFakeSocket };
});

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  mswServer.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  mswServer.resetHandlers();
  resetCreatedSockets();
});

afterAll(() => {
  mswServer.close();
});
