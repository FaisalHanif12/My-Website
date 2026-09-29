import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'tests/visual/out/**',
    'tests/perf/out/**',
  ]),
  // Last, so it turns off every stylistic rule that Prettier owns.
  prettier,
]);

export default eslintConfig;
