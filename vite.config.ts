/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app from /<repo>/ and has no SPA fallback, but it does answer
// "/home" with "home.html". So every known address gets its own copy of index.html → HTTP 200
// (no 404 in the console, indexable). 404.html still catches anything unknown.
function spaRoutes(): Plugin {
  return {
    name: 'koren-spa-routes',
    apply: 'build',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      const index = resolve(out, 'index.html')
      const missions = readdirSync(resolve(__dirname, 'content/missions'))
        .filter((f) => f.endsWith('.json'))
        .map((f) => `mission/${f.replace(/\.json$/, '')}`)
      const routes = ['home', 'age', 'sign', 'who', 'parents', 'settings', 'map', 'missions', 'collection', ...['history', 'culture', 'language'].map((t) => `topic/${t}`), ...missions]
      copyFileSync(index, resolve(out, '404.html'))
      for (const r of routes) {
        mkdirSync(dirname(resolve(out, `${r}.html`)), { recursive: true })
        copyFileSync(index, resolve(out, `${r}.html`))
      }
    },
  }
}

export default defineConfig({
  // BASE_PATH is set by the GitHub Pages workflow ("/Koren/"); locally the app lives at "/".
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    spaRoutes(),
    VitePWA({
      // "prompt": a new version waits until the child is on the hub — never a reload mid-mission.
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'KOREN — Далеч от България. Близо до корените си.',
        short_name: 'KOREN',
        description: 'Мисии за деца 4–14 г. за историята, културата, езика и природата на България.',
        lang: 'bg',
        theme_color: '#0B6B3E',
        background_color: '#FBF7F0',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'img/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'img/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'img/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Stored at first visit: the whole app (all code, all missions) + what the first screens show.
        globPatterns: [
          '**/*.{js,css,woff2}',
          'index.html',
          'favicon.svg',
          'img/logo/*.svg',
          'img/icons/*.png',
          'img/ornaments/*.png',
          'img/heroes/koren-raya-512.webp',
          'img/heroes/*-joy.webp',
          'img/scenes/header-520.webp',
          'img/scenes/header-720.webp',
          'img/tiles/*.webp',
          'img/levels/*.webp',
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Mission pictures: stored the first time they are shown, or all at once with "Download all".
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/'),
            handler: 'CacheFirst',
            options: { cacheName: 'koren-img', expiration: { maxEntries: 400 } },
          },
        ],
      },
    }),
  ],
  // Older phones (iOS 14, Chrome 87) must still parse the bundle; a syntax error there is a blank screen.
  build: { target: ['es2020', 'safari14', 'chrome87', 'firefox78'] },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
