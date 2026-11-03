import { defineConfig } from 'vitest/config';

// Each test synthesizes the full app (including Lambda bundling), which is slower than unit tests.
export default defineConfig({
  test: { testTimeout: 60_000, exclude: ['cdk.out/**', 'node_modules/**'] },
});
