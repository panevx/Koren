export const appPages = {
  home: '/home',
  age: '/age',
  sign: '/sign',
  who: '/who',
  parents: '/parents',
  settings: '/settings',
  map: '/map',
  timeline: '/timeline',
  missions: '/missions',
  collection: '/collection',
  fame: '/fame',
  shop: '/shop',
} as const

const topics = ['history', 'culture', 'language']
export const staticPages = [...Object.values(appPages), ...topics.map((topic) => `/topic/${topic}`)]
const knownPages = new Set<string>(staticPages)

export function canonicalPage(pathname: string): string | undefined {
  if (/^\/index\.html$/i.test(pathname)) return '/'
  const path = pathname.replace(/\.html$/i, '')
  if (path === pathname) return
  if (knownPages.has(path.toLowerCase())) return path.toLowerCase()
  if (/^\/mission\/[a-z0-9-]+$/i.test(path)) return path.toLowerCase()
}
