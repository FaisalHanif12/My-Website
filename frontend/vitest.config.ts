import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * These tests compare the code with the design reference, which is kept out of the repo
 * (.gitignore). They run when the file is there and are skipped on a clean clone.
 */
const hasReference = existsSync(
  fileURLToPath(new URL('../reference-design/faisalhanif-redesign.html', import.meta.url)),
);
const needReference = hasReference
  ? []
  : [
      'src/content/{contact,works,profile,about}-content.test.ts',
      'src/content/site.test.ts',
      'src/styles/css-port.test.ts',
      'src/components/layout/shell.test.tsx',
      'src/components/providers/modal-toast.test.tsx',
    ];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/*.spec.ts', ...needReference],
  },
});
