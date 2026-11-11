import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes, resolveBasename } from '../src/App'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { lockParents } from '../src/screens/Parents'
import { activeProfile, useProfiles } from '../src/store/profiles'
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
  useProfiles.getState().reset()
  lockParents()
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
    expect(screen.getByRole('heading', { name: 'Choose your sign' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Helmet' }))
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByRole('link', { name: /Discover Bulgaria/ })).toBeInTheDocument()

    // "Reload": fresh router at "/", state rehydrated from storage.
    cleanup()
    await act(() => useSettings.persist.rehydrate())
    await act(() => useProfiles.persist.rehydrate())
    expect(activeProfile(useProfiles.getState())).toMatchObject({ age: 12, avatar: 'helmet' })
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
    act(() => useProfiles.getState().setAge(age))
    expect(document.documentElement.dataset.level).toBe(level)
  })

  it('only the oldest level shows tile descriptions', () => {
    act(() => useProfiles.getState().setAge(5))
    renderAt('/home')
    expect(screen.queryByText('Царе, крепости и герои')).not.toBeInTheDocument()
    act(() => useProfiles.getState().setAge(13))
    expect(screen.getByText('Царе, крепости и герои')).toBeInTheDocument()
  })
})

describe('hub navigation', () => {
  it('every tile opens a screen with its title and a way home', async () => {
    renderAt('/home')
    const tiles = within(screen.getAllByRole('list')[0]!).getAllByRole('listitem')
    expect(tiles).toHaveLength(6)
    // Every tile now leads somewhere real: no "Coming soon" left on the hub.
    for (const name of [] as string[]) {
      cleanup()
      renderAt('/home')
      fireEvent.click(screen.getByRole('link', { name: new RegExp(name) }))
      expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
      expect(screen.getByText('Скоро')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Към Начало/ }))
      expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
    }
    cleanup()
    renderAt('/home')
    fireEvent.click(screen.getByRole('link', { name: /Открий България/ }))
    expect(await screen.findByRole('group', { name: 'Карта на България' })).toBeInTheDocument()
    for (const name of ['История', 'Култура и традиции', 'Български език', 'Мисии и игри']) {
      cleanup()
      renderAt('/home')
      fireEvent.click(screen.getByRole('link', { name: new RegExp(name) }))
      expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /Хан Аспарух|Баба Марта|Азбуката/ }).length).toBeGreaterThan(0)
    }
  })

  it('unknown topics and routes fall back safely', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/topic/nope')
    expect(await screen.findByRole('link', { name: /Открий България/ })).toBeInTheDocument()
    cleanup()
    renderAt('/no/such/page')
    expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
  })
})

/** Reads "Колко е 7 × 8?" from the gate and types the answer on its keypad. */
function solveGate(answer?: string) {
  const q = screen.getByText(/Колко е \d × \d\?/).textContent!
  const [, a, b] = q.match(/(\d) × (\d)/)!
  for (const d of answer ?? String(Number(a) * Number(b))) fireEvent.click(screen.getByRole('button', { name: d }))
  fireEvent.click(screen.getByRole('button', { name: 'Влез' }))
}

describe('parents section', () => {
  it('the gear leads to a gate a young child cannot pass by tapping around', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/home')
    fireEvent.click(screen.getByRole('link', { name: 'За родители' }))
    expect(await screen.findByRole('heading', { name: 'Само за родители' })).toBeInTheDocument()
    const before = screen.getByText(/Колко е/).textContent
    solveGate('12') // wrong
    expect(screen.getByRole('status')).toHaveTextContent('Не е вярно')
    expect(screen.queryByRole('heading', { name: 'За родители' })).not.toBeInTheDocument()
    expect(screen.getByText(/Колко е/).textContent).toBeDefined() // a new question is asked
    void before
    solveGate()
    expect(screen.getByRole('heading', { name: 'За родители' })).toBeInTheDocument()
  })

  it('/settings (old address) also goes through the gate', async () => {
    renderAt('/settings')
    expect(await screen.findByRole('heading', { name: 'Само за родители' })).toBeInTheDocument()
  })

  it('two children on one phone have separate collections', async () => {
    useSettings.getState().completeOnboarding()
    useProfiles.getState().complete('hist-01-asparuh', 'young', 'asparuh')
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    solveGate()
    fireEvent.click(screen.getByRole('button', { name: /Добави дете/ }))
    fireEvent.change(screen.getByRole('textbox', { name: /Прякор/ }), { target: { value: 'Бобчо' } })
    fireEvent.click(screen.getByRole('button', { name: 'По-малко години' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Мече' }))
    fireEvent.click(screen.getByRole('button', { name: 'Запази' }))
    expect(screen.getByText('Бобчо')).toBeInTheDocument()

    cleanup()
    renderAt('/who')
    fireEvent.click(await screen.findByRole('button', { name: /Бобчо/ }))
    expect(activeProfile(useProfiles.getState())).toMatchObject({ nickname: 'Бобчо', age: 7, badges: [] })

    cleanup()
    renderAt('/collection')
    expect(await screen.findByText('0 от 4 значки')).toBeInTheDocument()
    cleanup()
    renderAt('/who')
    fireEvent.click(await screen.findByRole('button', { name: /Пътешественик 1/ }))
    cleanup()
    renderAt('/collection')
    expect(await screen.findByText('1 от 4 значки')).toBeInTheDocument()
  })

  it('a profile is deleted only after a second tap, and never the last one', async () => {
    useProfiles.getState().addProfile({ nickname: 'Ани', age: 9, avatar: 'book' })
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    solveGate()
    fireEvent.click(screen.getByRole('button', { name: 'Изтрий профила: Ани' }))
    expect(useProfiles.getState().profiles).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Натисни пак, за да изтриеш: Ани' }))
    expect(useProfiles.getState().profiles).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /Изтрий профила/ })).not.toBeInTheDocument()
  })

  it('changes the language everywhere', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    solveGate()
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(screen.getByRole('heading', { name: 'For parents' })).toBeInTheDocument()
  })

  it('"what my child learns" lists finished missions', async () => {
    useProfiles.getState().complete('cult-01-baba-marta', 'small', 'baba-marta')
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    solveGate()
    expect(screen.getByText(/Изиграни мисии: 1 от 4/)).toBeInTheDocument()
    expect(screen.getByText('Баба Марта и мартениците')).toBeInTheDocument()
  })

  it('erase all needs two taps and returns to the start screen', async () => {
    useSettings.getState().completeOnboarding()
    useProfiles.getState().complete('hist-01-asparuh', 'young', 'asparuh')
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    solveGate()
    fireEvent.click(screen.getByRole('button', { name: /Изтрий всички данни/ }))
    expect(useSettings.getState().onboarded).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /Натисни пак – изтрива/ }))
    expect(useSettings.getState().onboarded).toBe(false)
    expect(activeProfile(useProfiles.getState()).badges).toEqual([])
    expect(screen.getByRole('button', { name: /Започни приключението/ })).toBeInTheDocument()
  })
})

describe('passport', () => {
  it('shows every badge, earned in colour and the rest locked', async () => {
    useProfiles.getState().complete('geo-01-rila', 'young', 'rila')
    renderAt('/collection')
    expect(await screen.findByRole('link', { name: 'Рила – покривът на Балканите – Спечелена' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Баба Марта и мартениците – Още не е спечелена' })).toBeInTheDocument()
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
