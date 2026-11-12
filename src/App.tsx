import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AgeSelect } from './screens/AgeSelect'
import { Home } from './screens/Home'
import { SignSelect } from './screens/SignSelect'
import { Welcome } from './screens/Welcome'
import { MotionRoot } from './motion'
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

// Missions (and the content schema they validate against) load only when a child opens them,
// so the start screens stay small.
const Mission = lazy(() => import('./screens/Mission').then((m) => ({ default: m.Mission })))
const MapScreen = lazy(() => import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })))
const WhoPlays = lazy(() => import('./screens/WhoPlays').then((m) => ({ default: m.WhoPlays })))
const Parents = lazy(() => import('./screens/Parents').then((m) => ({ default: m.Parents })))
const Passport = lazy(() => import('./screens/Passport').then((m) => ({ default: m.Passport })))
const Timeline = lazy(() => import('./screens/Timeline').then((m) => ({ default: m.Timeline })))
const MissionList = lazy(() => import('./screens/MissionList').then((m) => ({ default: m.MissionList })))

function Loading() {
  return <div className="min-h-dvh bg-cream" aria-busy="true" />
}

/** Returning visitors skip the start screens and land on the hub. */
function FirstVisitOnly({ children }: { children: ReactNode }) {
  const onboarded = useSettings((s) => s.onboarded)
  return onboarded ? <Navigate to="/home" replace /> : children
}

export function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<FirstVisitOnly><Welcome /></FirstVisitOnly>} />
        <Route path="/age" element={<AgeSelect />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sign" element={<SignSelect />} />
        <Route path="/who" element={<WhoPlays />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/settings" element={<Navigate to="/parents" replace />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/missions" element={<MissionList />} />
        <Route path="/mission/:id" element={<Mission />} />
        <Route path="/collection" element={<Passport />} />
        <Route path="/topic/:id" element={<MissionList topic />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export function App() {
  return (
    <MotionRoot>
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    </MotionRoot>
  )
}
