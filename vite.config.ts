/// <reference types="vitest/config" />
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import assetManifest from './content/assets/manifest.json'
import { Mission } from './src/content/schema'
import { compareMissionOrder, summarizeMission } from './src/content/missionSummary'
import { ART } from './src/world'
import { IMAGE_CACHE } from './src/offline/imageCache'
import { staticPages } from './src/routes'

const missionDir = resolve(__dirname, 'content/missions')

function missionFiles(family: boolean) {
  return readdirSync(missionDir).filter((file) => {
    if (!file.endsWith('.json')) return false
    if (!family) return true
    const mission = JSON.parse(readFileSync(resolve(missionDir, file), 'utf8'))
    return !mission.draft && Boolean(mission.review)
  })
}

function reviewedMissionsOnly(): Plugin {
  return {
    name: 'koren-reviewed-missions',
    enforce: 'pre',
    apply: 'build',
    transform(source, id) {
      if (!id.endsWith('/src/content/missions.ts')) return
      const paths = missionFiles(true).map((file) => `../../content/missions/${file}`)
      const pattern = "'../../content/missions/*.json'"
      if (!source.includes(pattern)) throw new Error('Cannot locate the mission catalog for the family build')
      return source.replace(pattern, JSON.stringify(paths))
    },
  }
}

function hubMissionIndex(showDrafts: boolean): Plugin {
  return {
    name: 'koren-hub-missions',
    enforce: 'pre',
    apply: 'build',
    transform(_source, id) {
      if (!id.endsWith('/src/content/hubMissions.ts')) return
      const missions = missionFiles(false)
        .map((file) => {
          const data = JSON.parse(readFileSync(resolve(missionDir, file), 'utf8'))
          const result = Mission.safeParse(data)
          if (!result.success) this.error(`Invalid mission ${file}: ${result.error.message}`)
          return result.data
        })
        .filter((mission) => showDrafts || !mission.draft)
        .sort(compareMissionOrder)
      return `export const HUB_MISSIONS = ${JSON.stringify(missions.map(summarizeMission))}`
    },
  }
}

// GitHub Pages serves the app from /<repo>/ and has no SPA fallback, but it does answer
// "/home" with "home.html". So every known address gets its own copy of index.html → HTTP 200
// (no 404 in the console, indexable). 404.html still catches anything unknown.
function spaRoutes(family: boolean): Plugin {
  let out = resolve(__dirname, 'dist')
  return {
    name: 'koren-spa-routes',
    apply: 'build',
    // the real output folder (`vite build --outDir …` must not write the pages into dist/)
    configResolved(config) {
      out = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      // Keep the source catalog available locally, but ship future art only when it is used.
      for (const asset of assetManifest.assets) {
        if (asset.status === 'ready' && asset.path) rmSync(resolve(out, 'img', asset.path), { force: true })
      }
      const index = resolve(out, 'index.html')
      const missions = missionFiles(family).map((file) => `mission/${file.replace(/\.json$/, '')}`)
      const routes = [...staticPages.map((path) => path.slice(1)), ...missions]
      copyFileSync(index, resolve(out, '404.html'))
      for (const r of routes) {
        mkdirSync(dirname(resolve(out, `${r}.html`)), { recursive: true })
        copyFileSync(index, resolve(out, `${r}.html`))
      }
      // The hub is where returning children land: Koren and Raya (the biggest pictures there) are
      // named in the HTML itself, so the browser fetches them with the very first bytes.
      const base = process.env.BASE_PATH ?? '/'
      const preload = ['raya', 'koren']
        .map((h) => `<link rel="preload" as="image" fetchpriority="high" href="${base}img/heroes/${h}-wave.webp" />`)
        .join('\n    ')
      const home = resolve(out, 'home.html')
      writeFileSync(home, readFileSync(home, 'utf8').replace('<title>', `${preload}\n    <title>`))
    },
  }
}

export default defineConfig(({ mode }) => ({
  // BASE_PATH is set by the GitHub Pages workflow ("/Koren/"); locally the app lives at "/".
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'family' ? [reviewedMissionsOnly()] : []),
    hubMissionIndex(mode !== 'family' && loadEnv(mode, process.cwd()).VITE_SHOW_DRAFTS === '1'),
    spaRoutes(mode === 'family'),
    VitePWA({
      // "prompt": a new version waits until the child is on the hub — never a reload mid-mission.
      registerType: 'prompt',
      // The icons are already in globPatterns — without this they are stored twice.
      includeManifestIcons: false,
      injectRegister: false,
      manifest: {
        name: 'KOREN — Далеч от България. Близо до корените си.',
        short_name: 'KOREN',
        description: 'Мисии за деца 4–14 г. за историята, културата, езика и природата на България.',
        lang: 'bg',
        theme_color: '#138B50',
        background_color: '#F8F5ED',
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
          'img/heroes/*-wave.webp',
          'img/heroes/*-joy.webp',
          'img/tiles/*.webp',
          'img/levels/*.webp',
          `img/${ART.hills}`,
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        // Mission pictures: stored the first time they are shown, or all at once with "Download all".
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/'),
            // Shown from the cache at once, refreshed in the background when online — a replaced picture with the same name still arrives.
            handler: 'StaleWhileRevalidate',
            options: { cacheName: IMAGE_CACHE, expiration: { maxEntries: 400 } },
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
}))
