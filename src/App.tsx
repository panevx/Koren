import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AgeSelect } from './screens/AgeSelect'
import { ComingSoon } from './screens/ComingSoon'
import { Home } from './screens/Home'
import { Settings } from './screens/Settings'
import { Welcome } from './screens/Welcome'
import { useSettings } from './store/settings'

/**
 * BASE_URL is "/Koren/" on GitHub Pages and "/" locally. GitHub also answers
 * "/koren/…" (via 404.html); a case mismatch would make the router render
 * nothing, so the basename is taken from the real URL when it matches loosely.
 */
export function resolveBasename(base: string, pathname: string): string {
  const wanted = base.replace(/\/$/, '')
  if (!wanted) return '/'
  const actual = pathname.slice(0, wanted.length)
  const boundary = pathname.charAt(wanted.length)
  const matches = actual.toLowerCase() === wanted.toLowerCase() && (boundary === '' || boundary === '/')
  return matches ? actual : wanted
}

const basename = resolveBasename(import.meta.env.BASE_URL, window.location.pathname)

/** Returning visitors skip the start screens and land on the hub. */
function FirstVisitOnly({ children }: { children: ReactNode }) {
  const onboarded = useSettings((s) => s.onboarded)
  return onboarded ? <Navigate to="/home" replace /> : children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FirstVisitOnly><Welcome /></FirstVisitOnly>} />
      <Route path="/age" element={<AgeSelect />} />
      <Route path="/home" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/map" element={<ComingSoon section="discover" />} />
      <Route path="/missions" element={<ComingSoon section="missions" />} />
      <Route path="/collection" element={<ComingSoon section="collection" />} />
      <Route path="/topic/:id" element={<ComingSoon />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  )
}
