import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: [
    '@angular/common',
    '@angular/core',
    '@trpc/client',
    '@trpc/server',
    'rxjs',
  ],
});
