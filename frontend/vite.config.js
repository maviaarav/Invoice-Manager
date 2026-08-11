import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

const indexHtml = fileURLToPath(new URL('./index.html', import.meta.url))
const landingHtml = fileURLToPath(new URL('./landingHome.html', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    rollupOptions: {
      input: {
        main: indexHtml,
        landingHome: landingHtml,
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
})