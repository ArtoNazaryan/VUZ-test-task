import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: './',
    include: ['src/**/__test__/unit/**/*.spec.ts'],
    setupFiles: ['src/infrastructure/test/utils/vitest.setup.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
