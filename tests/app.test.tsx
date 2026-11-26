import { webcrypto } from 'node:crypto'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes, resolveBasename } from '../src/App'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { MISSIONS } from '../src/content/missions'
import { forLevel } from '../src/content/forLevel'

/** Children 7+ do not see the missions made only for 4–6 year olds. */
const FOR_OLDER = forLevel(MISSIONS, 'young').length
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
    expect(await screen.findByRole('heading', { name: 'How old are you?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /11 – 14 years/ }))
    expect(document.documentElement.dataset.level).toBe('guard')

    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(await screen.findByRole('heading', { name: 'Choose an avatar' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(21)
    fireEvent.click(screen.getByRole('radio', { name: 'Lynx' }))
    fireEvent.click(screen.getByRole('button', { name: /Next/ }))
    expect(screen.getByRole('link', { name: /Discover Bulgaria/ })).toBeInTheDocument()

    // "Reload": fresh router at "/", state rehydrated from storage.
    cleanup()
    await act(() => useSettings.persist.rehydrate())
    await act(() => useProfiles.persist.rehydrate())
    expect(activeProfile(useProfiles.getState())).toMatchObject({ age: 12, avatar: 'lynx' })
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
    // v0.13: the hub shows four worlds; the path and the passport are in the navigation and the adventure card.
    const worlds = within(screen.getByRole('region', { name: 'Светове за откриване' })).getAllByRole('listitem')
    expect(worlds).toHaveLength(4)
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
    for (const name of ['История', 'Култура и традиции', 'Български език']) {
      cleanup()
      renderAt('/home')
      fireEvent.click(screen.getByRole('link', { name: new RegExp(name) }))
      expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /Хан Аспарух|Баба Марта|Глаголица/ }).length).toBeGreaterThan(0)
    }
    // The path link under the adventure card opens the adventure path: every mission is a stop on it.
    cleanup()
    renderAt('/home')
    fireEvent.click(await screen.findByRole('link', { name: /Пътят на приключенията/ }))
    expect(await screen.findByRole('heading', { name: 'Пътят на приключенията' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Хан Аспарух|Баба Марта|Глаголица/ }).length).toBeGreaterThan(0)
  })

  it('unknown topics and routes fall back safely', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/topic/nope')
    expect(await screen.findByRole('link', { name: /Открий България/ })).toBeInTheDocument()
    cleanup()
    renderAt('/no/such/page')
    expect(screen.getByRole('heading', { name: 'Страницата не е намерена' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Към началото' }))
    expect(screen.getByRole('link', { name: /Открий България/ })).toBeInTheDocument()
  })

  it('canonicalizes a static Pages file to the matching route', async () => {
    renderAt('/map.html?source=bookmark#map')
    expect(await screen.findByRole('heading', { name: 'Открий България' })).toBeInTheDocument()
  })
})

function enterCode(code: string) {
  fireEvent.change(screen.getByLabelText(/ПИН/), { target: { value: code } })
  fireEvent.keyDown(screen.getByLabelText(/ПИН/), { key: 'Enter' })
}

async function openParentGate() {
  if (screen.queryByLabelText(/избери 6-цифрен/)) enterCode('012345')
  enterCode('012345')
  await screen.findByRole('heading', { name: 'За родители' })
}

describe('parents section', () => {
  beforeEach(() => { vi.stubGlobal('crypto', webcrypto) })
  afterEach(() => { vi.unstubAllGlobals() })

  it('confirms a new PIN and requires it again after reopening', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/home')
    fireEvent.click(screen.getByRole('link', { name: 'За родители' }))
    await screen.findByRole('heading', { name: 'Само за родители' })
    enterCode('012345')
    enterCode('654321')
    expect(screen.getByRole('status')).toHaveTextContent('Двата кода се различават')
    await openParentGate()
    cleanup()
    renderAt('/parents')
    await screen.findByLabelText('Въведи своя родителски ПИН.')
    enterCode('654321')
    await screen.findByText('Невалиден ПИН. Опитай отново.')
    expect(screen.queryByRole('heading', { name: 'За родители' })).not.toBeInTheDocument()
    await openParentGate()
  })

  it('locks the parent area on leaving and returning', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    expect(screen.getByRole('heading', { name: 'За родители' })).toBeInTheDocument()
    cleanup()
    renderAt('/parents')
    expect(await screen.findByRole('heading', { name: 'Само за родители' })).toBeInTheDocument()
  })

  it('restores progress only after the parent confirms the selected backup', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    const original = activeProfile(useProfiles.getState())
    const data = { format: 'koren-profiles-v1', activeId: original.id,
      profiles: [{ ...original, nickname: 'Рая', badges: ['asparuh'] }] }
    fireEvent.change(screen.getByLabelText('Избери файл за възстановяване'), {
      target: { files: [{ name: 'family.json', size: 500, text: async () => JSON.stringify(data) }] },
    })
    const apply = await screen.findByRole('button', { name: 'Замени текущите профили с тези от копието' })
    expect(screen.getByText(/Избран файл: family\.json/)).toBeInTheDocument()
    expect(activeProfile(useProfiles.getState())).toEqual(original)
    fireEvent.click(apply)
    expect(activeProfile(useProfiles.getState())).toMatchObject({ nickname: 'Рая', badges: ['asparuh'] })
  })

  it('locks the parent area when the session expires while it is open', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    const now = Date.now()
    await openParentGate()
    vi.spyOn(Date, 'now').mockReturnValue(now + 11 * 60 * 1000)
    try {
      expect(screen.getByRole('heading', { name: 'За родители' })).toBeInTheDocument()
      act(() => document.dispatchEvent(new Event('visibilitychange')))
      expect(screen.getByRole('heading', { name: 'Само за родители' })).toBeInTheDocument()
    } finally {
      vi.restoreAllMocks()
    }
  })

  it('testers (demo build): the code opens demo tools without opening the parent area', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    enterCode('6812008') // a long wrong number is just wrong
    expect(screen.getByRole('status')).toHaveTextContent('Невалиден ПИН')
    expect(screen.queryByRole('heading', { name: 'Режим за тестване' })).not.toBeInTheDocument()
    enterCode('6812007')
    expect(screen.queryByRole('heading', { name: 'За родители' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Изтрий всички данни/ })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Режим за тестване' })).toBeInTheDocument()
    // a locked mission (it needs another one first) opens without playing anything
    const locked = forLevel(MISSIONS, 'young').find((m) => m.unlock?.after)!
    fireEvent.click(screen.getByRole('switch', { name: 'Отключи всички мисии' }))
    expect(useSettings.getState().unlockAll).toBe(true)
    cleanup()
    renderAt(`/mission/${locked.id}`)
    expect(await screen.findByRole('button', { name: /^Напред/ })).toBeInTheDocument()
    expect(screen.queryByText(/Заключена мисия/)).not.toBeInTheDocument()
    // nothing is recorded as played
    expect(activeProfile(useProfiles.getState()).done).toEqual({})
    // the hub says the switch is on
    cleanup()
    renderAt('/home')
    expect(await screen.findByRole('link', { name: 'Тест: всички мисии са отворени' })).toBeInTheDocument()
  })

  it('the parents\' section has no testing part when opened with the PIN', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    expect(screen.getByRole('heading', { name: 'За родители' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Режим за тестване' })).not.toBeInTheDocument()
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
    await openParentGate()
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
    expect(await screen.findByText(`0 от ${FOR_OLDER} значки`)).toBeInTheDocument()
    cleanup()
    renderAt('/who')
    fireEvent.click(await screen.findByRole('button', { name: /Пътешественик 1/ }))
    cleanup()
    renderAt('/collection')
    expect(await screen.findByText(`1 от ${FOR_OLDER} значки`)).toBeInTheDocument()
  })

  it('a profile is deleted only after a second tap, and never the last one', async () => {
    useProfiles.getState().addProfile({ nickname: 'Ани', age: 9, avatar: 'book' })
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    fireEvent.click(screen.getByRole('button', { name: 'Изтрий профила: Ани' }))
    expect(useProfiles.getState().profiles).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Натисни пак, за да изтриеш: Ани' }))
    expect(useProfiles.getState().profiles).toHaveLength(1)
    expect(screen.queryByRole('button', { name: /Изтрий профила/ })).not.toBeInTheDocument()
  })

  it('changes the language everywhere', async () => {
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    fireEvent.click(screen.getByRole('radio', { name: /English/ }))
    expect(screen.getByRole('heading', { name: 'For parents' })).toBeInTheDocument()
  })

  it('"what my child learns" lists finished missions', async () => {
    useProfiles.getState().complete('cult-01-baba-marta', 'small', 'baba-marta')
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
    expect(screen.getByText(`Пътешественик 1 — Изиграни мисии: 1 от ${FOR_OLDER}`)).toBeInTheDocument()
    expect(screen.getByText('Баба Марта и мартениците')).toBeInTheDocument()
  })

  it('erase all needs two taps and returns to the start screen', async () => {
    useSettings.getState().completeOnboarding()
    useProfiles.getState().complete('hist-01-asparuh', 'young', 'asparuh')
    renderAt('/parents')
    await screen.findByRole('heading', { name: 'Само за родители' })
    await openParentGate()
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
    expect(await screen.findByRole('link', { name: /^Рила – покривът на Балканите\s*Спечелена$/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Баба Марта и мартениците\s*Още не е спечелена$/ })).toBeInTheDocument()
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

describe('hub', () => {
  it('offers the next unplayed mission, then the passport when all are done', async () => {
    useSettings.getState().completeOnboarding()
    renderAt('/home')
    const first = MISSIONS[0]!
    expect(await screen.findByRole('link', { name: new RegExp(`Следваща мисия.*${first.title.bg}`) })).toHaveAttribute('href', `/mission/${first.id}`)

    cleanup()
    for (const mission of MISSIONS) useProfiles.getState().complete(mission.id, 'young', mission.badge.id)
    renderAt('/home')
    expect(await screen.findByRole('link', { name: /Браво!.*Изигра всички мисии/ })).toHaveAttribute('href', '/collection')
  })

  it('shows how many missions and badges the child has', async () => {
    useSettings.getState().completeOnboarding()
    useProfiles.getState().complete('hist-01-asparuh', 'young', 'asparuh')
    renderAt('/home')
    expect(await screen.findByText(`1 от ${FOR_OLDER} изиграни`)).toBeInTheDocument()
    expect(screen.getByText(`1 от ${FOR_OLDER} значки`)).toBeInTheDocument()
  })

  it('has the floating navigation with the current tab marked', () => {
    useSettings.getState().completeOnboarding()
    renderAt('/home')
    const nav = screen.getByRole('navigation', { name: 'Основна навигация' })
    expect(within(nav).getByRole('link', { name: 'Начало' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getAllByRole('link')).toHaveLength(4)
  })
})
