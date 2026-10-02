import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The test runner configuration AC-3 names: jsdom, with the include glob
// resolving every test file under tests/**.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    css: false,
    restoreMocks: true
  }
})
