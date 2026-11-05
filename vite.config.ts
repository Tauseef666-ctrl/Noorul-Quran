import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Vercel (and most hosts) serve at root '/'. For GitHub Pages subpath
  // https://tauseef666-ctrl.github.io/Noorul-Quran/ set DEPLOY_BASE=/Noorul-Quran/
  // in the build environment. Dev keeps '/'.
  base: command === 'build' ? process.env.DEPLOY_BASE || '/' : '/',
}))
