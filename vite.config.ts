import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1', port: 4310, strictPort: true },
  preview: { host: '127.0.0.1', port: 4311, strictPort: true },
  build: { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 800 },
})
