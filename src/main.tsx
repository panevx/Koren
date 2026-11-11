import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
