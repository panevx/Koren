/// <reference types="vitest/config" />
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the app from /<repo>/ and has no SPA fallback.
// Copying index.html to 404.html makes deep links (e.g. /Koren/settings) load the app.
function spaFallback(): Plugin {
  return {
    name: 'koren-spa-fallback',
    apply: 'build',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
    },
  }
}

export default defineConfig({
  // BASE_PATH is set by the GitHub Pages workflow ("/Koren/"); locally the app lives at "/".
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), spaFallback()],
  // Older phones (iOS 14, Chrome 87) must still parse the bundle; a syntax error there is a blank screen.
  build: { target: ['es2020', 'safari14', 'chrome87', 'firefox78'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
