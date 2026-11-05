import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // The production site is served from the GitHub Pages subpath
  // https://tauseef666-ctrl.github.io/Noorul-Quran/ — dev keeps '/'.
  base: command === 'build' ? process.env.DEPLOY_BASE || '/Noorul-Quran/' : '/',
}))
