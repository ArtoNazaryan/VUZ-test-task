import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: './',
    include: ['src/**/__test__/integration/**/*.int-spec.ts'],
    globalSetup: ['src/infrastructure/test/utils/vitest.global-setup.ts'],
    setupFiles: ['src/infrastructure/test/utils/vitest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
