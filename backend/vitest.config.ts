import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    env: { NODE_ENV: 'test' },
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/server.ts'],
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 70,
        lines: 80,
      },
    },
  },
});
