import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes, resolveBasename } from '../src/App'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { useSettings } from '../src/store/settings'
import { syncDocumentWithSettings } from '../src/theme/applyTheme'

let unsync: () => void

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  unsync = syncDocumentWithSettings()
})
afterEach(() => {
  unsync()
  cleanup()
})

describe('first visit → hub → reload', () => {
  it('walks the onboarding in English and remembers it', async () => {
    renderAt('/')
    expect(screen.getByRole('button', { name: /Започни приключението/ })).toBeInTheDocument()

    // Switching language translates the whole screen.
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(screen.getByRole('button', { name: /Start the adventure/ })).toBeInTheDocument()
    expect(screen.queryByText(/Започни/)).not.toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: /Start the adventure/ }))
    expect(screen.getByRole('heading', { name: 'How old are you?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /11 – 14 years/ }))
    expect(document.documentElement.dataset.level).toBe('guard')

    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByRole('link', { name: /Discover Bulgaria/ })).toBeInTheDocument()

    // "Reload": fresh router at "/", state rehydrated from storage.
    cleanup()
    await act(() => useSettings.persist.rehydrate())
    renderAt('/')
    expect(screen.getByRole('link', { name: /Discover Bulgaria/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Start the adventure/ })).not.toBeInTheDocument()
  })
})

describe('age levels change the interface', () => {
  it.each([
    [5, 'small'],
    [8, 'young'],
    [13, 'guard'],
  ])('age %i sets data-level=%s', (age, level) => {
    act(() => useSettings.getState().setAge(age))
    expect(document.documentElement.dataset.level).toBe(level)
  })

  it('only the oldest level shows tile descriptions', () => {
    act(() => useSettings.getState().setAge(5))
    renderAt('/home')
    expect(screen.queryByText('Царе, крепости и герои')).not.toBeInTheDocument()
    act(() => useSettings.getState().setAge(13))
    expect(screen.getByText('Царе, крепости и герои')).toBeInTheDocument()
  })
})

describe('hub navigation', () => {
  it('every tile opens a screen with its title and a way home', () => {
    renderAt('/home')
    const tiles = within(screen.getAllByRole('list')[0]!).getAllByRole('listitem')
    expect(tiles).toHaveLength(6)
    for (const name of ['Открий България', 'История', 'Култура и традиции', 'Български език', 'Мисии и игри', 'Значки и колекции']) {
      cleanup()
      renderAt('/home')
      fireEvent.click(screen.getByRole('link', { name: new RegExp(name) }))
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
      expect(screen.getByText('Скоро')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Към Начало/ }))
      expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
    }
  })

  it('unknown topics and routes fall back safely', () => {
    useSettings.getState().completeOnboarding()
    renderAt('/topic/nope')
    expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
    cleanup()
    renderAt('/no/such/page')
    expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
  })
})

describe('settings screen', () => {
  it('changes language everywhere and confirms the save', () => {
    renderAt('/settings')
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Settings saved!')
  })

  it('reset needs two taps and returns to the start screen', () => {
    useSettings.getState().completeOnboarding()
    renderAt('/settings')
    const reset = screen.getByRole('button', { name: /Започни отначало/ })
    fireEvent.click(reset)
    expect(useSettings.getState().onboarded).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Натисни пак/ }))
    expect(useSettings.getState().onboarded).toBe(false)
    expect(screen.getByRole('button', { name: /Започни приключението/ })).toBeInTheDocument()
  })
})

describe('resolveBasename', () => {
  it.each([
    ['/Koren/', '/Koren/home', '/Koren'],
    ['/Koren/', '/koren/home', '/koren'],
    ['/Koren/', '/KOREN', '/KOREN'],
    ['/Koren/', '/Korenx/home', '/Koren'],
    ['/', '/home', '/'],
  ])('base %s at %s → %s', (base, path, expected) => {
    expect(resolveBasename(base, path)).toBe(expected)
  })
})

describe('error boundary', () => {
  it('shows a way out instead of a blank page', () => {
    const Boom = () => {
      throw new Error('boom')
    }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Опа! Нещо се обърка.')
    expect(screen.getByRole('button', { name: 'Започни отначало' })).toBeInTheDocument()
    spy.mockRestore()
  })
})
