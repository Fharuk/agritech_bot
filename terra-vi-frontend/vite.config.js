import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Backend URL resolution:
  //   - Local dev:     http://localhost:8000  (default)
  //   - Codespaces:    set VITE_API_URL in .env.local to the port-8000 forwarded URL
  //   - Production:    set VITE_API_URL to your deployed backend URL
  const apiTarget = env.VITE_API_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      // Let Vite pick any available port — don't hardcode 5173
      // If 5173 is busy it will use 5174, 5175, etc. automatically
      strictPort: false,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
        '/health': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/info': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
