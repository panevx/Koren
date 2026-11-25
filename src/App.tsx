import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { AgeSelect } from './screens/AgeSelect'
import { Home } from './screens/Home'
import { SignSelect } from './screens/SignSelect'
import { Welcome } from './screens/Welcome'
import { MotionRoot } from './motion'
import { Screen, useTitle } from './components/ui'
import { useT } from './i18n/useT'
import { appPages, canonicalPage } from './routes'
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
const Fame = lazy(() => import('./screens/Fame').then((m) => ({ default: m.Fame })))
const Shop = lazy(() => import('./screens/Shop').then((m) => ({ default: m.Shop })))
const Adventure = lazy(() => import('./screens/Adventure').then((m) => ({ default: m.Adventure })))
const Practice = lazy(() => import('./screens/Practice').then((m) => ({ default: m.Practice })))
const MissionList = lazy(() => import('./screens/MissionList').then((m) => ({ default: m.MissionList })))

/** Doherty threshold: a fast screen shows nothing in between; a slow one shows three bouncing dots after 300 ms. */
function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream" aria-busy="true">
      <span className="loading-dots" aria-hidden="true"><i /><i /><i /></span>
    </div>
  )
}

/** While the child looks at the first screen, fetch the code of the screens a tap away (they open in < 400 ms then). */
function prefetchScreens() {
  const load = () => {
    for (const screen of [() => import('./screens/MapScreen'), () => import('./screens/Adventure'), () => import('./screens/Mission'), () => import('./screens/Passport')]) void screen().catch(() => {})
  }
  const idle = (window as { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500))
  if (document.readyState === 'complete') idle(load)
  else addEventListener('load', () => idle(load), { once: true })
}
if (typeof window !== 'undefined' && !import.meta.env.VITEST) prefetchScreens()

/** Returning visitors skip the start screens and land on the hub. */
function FirstVisitOnly({ children }: { children: ReactNode }) {
  const onboarded = useSettings((s) => s.onboarded)
  return onboarded ? <Navigate to="/home" replace /> : children
}

function NotFound() {
  const t = useT()
  useTitle(t('route.notFound'))
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-black">{t('route.notFound')}</h1>
        <Link to="/" className="tap font-bold underline">{t('route.home')}</Link>
      </div>
    </Screen>
  )
}

export function AppRoutes() {
  const { pathname, search, hash } = useLocation()
  const canonical = canonicalPage(pathname)
  if (canonical) return <Navigate to={{ pathname: canonical, search, hash }} replace />
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<FirstVisitOnly><Welcome /></FirstVisitOnly>} />
        <Route path={appPages.age} element={<AgeSelect />} />
        <Route path={appPages.home} element={<Home />} />
        <Route path={appPages.sign} element={<SignSelect />} />
        <Route path={appPages.who} element={<WhoPlays />} />
        <Route path={appPages.parents} element={<Parents />} />
        <Route path={appPages.settings} element={<Navigate to="/parents" replace />} />
        <Route path={appPages.map} element={<MapScreen />} />
        <Route path={appPages.timeline} element={<Timeline />} />
        <Route path={appPages.missions} element={<Adventure />} />
        <Route path="/mission/:id" element={<Mission />} />
        <Route path={appPages.collection} element={<Passport />} />
        <Route path={appPages.fame} element={<Fame />} />
        <Route path={appPages.shop} element={<Shop />} />
        <Route path={appPages.practice} element={<Practice />} />
        <Route path="/topic/:id" element={<MissionList topic />} />
        <Route path="*" element={<NotFound />} />
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
