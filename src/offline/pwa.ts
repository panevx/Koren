import { create } from 'zustand'

/** Install and update state shared by the app (filled in by main.tsx). */
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

type PwaState = {
  /** A new version is waiting. Shown as "New missions!" — never a reload in the middle of a game. */
  needRefresh: boolean
  /** The app is fully stored and works offline. */
  offlineReady: boolean
  update: () => void
  /** Chrome/Android: the browser's install prompt, kept until the parent taps "Install". */
  installEvent: BeforeInstallPromptEvent | null
  installed: boolean
}

export const usePwa = create<PwaState>()(() => ({
  needRefresh: false,
  offlineReady: false,
  update: () => window.location.reload(),
  installEvent: null,
  installed: typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches === true,
}))

export function listenForInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    usePwa.setState({ installEvent: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => usePwa.setState({ installed: true, installEvent: null }))
}

export async function promptInstall() {
  const e = usePwa.getState().installEvent
  if (!e) return
  await e.prompt()
  const { outcome } = await e.userChoice
  usePwa.setState({ installEvent: null, installed: outcome === 'accepted' })
}

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
