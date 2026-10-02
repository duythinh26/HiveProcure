import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    hookTimeout: 600_000,
    testTimeout: 600_000,
  },
})
