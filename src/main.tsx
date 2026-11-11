import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
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

// Offline support. A waiting update is offered on the hub ("New missions!"), never forced.
const updateSW = registerSW({
  onNeedRefresh: () => usePwa.setState({ needRefresh: true }),
  onOfflineReady: () => usePwa.setState({ offlineReady: true }),
})
usePwa.setState({ update: () => void updateSW(true) })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
