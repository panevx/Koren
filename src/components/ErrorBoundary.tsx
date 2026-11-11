import { Component, type ErrorInfo, type ReactNode } from 'react'
import { translate } from '../i18n'
import { STORAGE_KEY, useSettings } from '../store/settings'

type State = { failed: boolean }

/**
 * Last line of defence: any render error shows a friendly screen with a way out
 * instead of unmounting the app into a blank page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('KOREN crashed:', error, info.componentStack)
  }

  private restart = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    window.location.assign(import.meta.env.BASE_URL)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const lang = useSettings.getState().lang
    const t = (key: Parameters<typeof translate>[1]) => translate(lang, key)
    return (
      <div role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
        <p className="text-4xl font-black text-green-dark">{t('app.name')}</p>
        <p className="max-w-xs text-lg font-bold">{t('error.title')}</p>
        <p className="max-w-xs text-muted">{t('error.text')}</p>
        <button
          type="button"
          onClick={this.restart}
          className="tap press puck rounded-full bg-green px-8 text-xl font-extrabold text-white [--edge:var(--color-green-deep)]"
        >
          {t('error.restart')}
        </button>
      </div>
    )
  }
}
