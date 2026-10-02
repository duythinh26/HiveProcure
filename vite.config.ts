import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HiveProcure is a flat single-bundle SPA: one entry point, one stylesheet,
// no UI component framework. See docs/design/HP-001 (option 1).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  }
})
