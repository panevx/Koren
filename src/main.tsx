import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { upgradeImageCache } from './offline/imageCache'
import { listenForInstall, usePwa } from './offline/pwa'
import { syncDocumentWithSettings } from './theme/applyTheme'
import './index.css'

declare global {
  interface Window {
    __korenStarted?: boolean
  }
}

// Tells the boot script in index.html not to show its "could not load" message.
window.__korenStarted = true

syncDocumentWithSettings()
listenForInstall()

// Offline support.
// - A new version found right after opening the app (nothing started yet, not inside a mission) is applied at once,
//   so a simple reload shows the latest version.
// - Later it is only offered on the hub ("New missions!") — never forced in the middle of a game.
// - Coming back to the tab checks for a new version again.
const openedAt = Date.now()
const JUST_OPENED_MS = 10_000
const updateSW = registerSW({
  onNeedRefresh: () => {
    const fresh = Date.now() - openedAt < JUST_OPENED_MS && !/\/mission\//.test(window.location.pathname)
    if (fresh) void updateSW(true)
    else usePwa.setState({ needRefresh: true })
  },
  onOfflineReady: () => usePwa.setState({ offlineReady: true }),
  onRegisteredSW: (_url, registration) => {
    if (!registration) return
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void registration.update().catch(() => {})
    })
  },
})
usePwa.setState({ update: () => void updateSW(true) })

// Pictures replaced under the same name (the old 2D heroes): carry the rest of the stored pictures over to the new cache.
void upgradeImageCache().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
