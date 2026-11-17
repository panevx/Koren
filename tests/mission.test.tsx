import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useNavigate, type InitialEntry } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { missionById } from '../src/content/missions'
import { PROFILES_KEY, activeProfile, useProfiles } from '../src/store/profiles'
import { useSettings } from '../src/store/settings'

const ID = 'hist-01-asparuh'
const mission = missionById(ID)!
const young = mission.levels.young!

/** The phone's "back" gesture, as the router sees it. */
let goBack: () => void = () => {}
function BackGesture() {
  const navigate = useNavigate()
  goBack = () => void navigate(-1)
  return null
}

function renderAt(path: InitialEntry, entries: InitialEntry[] = []) {
  return render(
    <MemoryRouter initialEntries={[...entries, path]}>
      <AppRoutes />
      <BackGesture />
    </MemoryRouter>,
  )
}

/** Answers every question of a quiz: first one wrong option (if any), then the right one. */
function answerAll(questions: typeof young.check, tryWrongFirst: boolean) {
  for (const q of questions) {
    if (tryWrongFirst) {
      const wrong = q.options.findIndex((_, i) => i !== q.answer)
      fireEvent.click(screen.getByRole('button', { name: q.options[wrong]!.bg }))
      // Hint appears, no way forward yet.
      expect(screen.getByRole('status')).toHaveTextContent(q.hint?.bg ?? 'Почти! Опитай пак.')
      expect(screen.queryByRole('button', { name: /Следващ въпрос|Готово/ })).not.toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: q.options[q.answer]!.bg }))
    expect(screen.getByRole('status')).toHaveTextContent('Браво!')
    fireEvent.click(screen.getByRole('button', { name: /Следващ въпрос|Готово/ }))
  }
}

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().setAge(8)
  useProfiles.getState().reset()
})
afterEach(cleanup)

describe('mission Хан Аспарух (young)', () => {
  it('plays story → game → challenge → check → badge and records the badge', async () => {
    renderAt(`/mission/${ID}`)
    await screen.findByText(young.story[0]!.bg)

    // Story: one line per screen.
    for (const line of young.story) {
      expect(screen.getByText(line.bg)).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
    }

    // Game: find Pliska on the map. Two wrong taps → Raya's hint; never a dead end.
    const game = young.game
    if (game.type !== 'map') throw new Error('young level should play the map game')
    const pointOf = (id: string) => `Точка ${game.choices.indexOf(id) + 1}`
    const wrong = game.choices.filter((c) => c !== game.target)
    fireEvent.click(screen.getByRole('button', { name: pointOf(wrong[0]!) }))
    expect(screen.getByRole('status')).toHaveTextContent('Не е тук. Опитай пак!')
    fireEvent.click(screen.getByRole('button', { name: pointOf(wrong[1]!) }))
    expect(screen.getByRole('status')).toHaveTextContent(game.hint.bg)
    expect(screen.queryByRole('button', { name: /Готово/ })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: pointOf(game.target) }))
    expect(screen.getByRole('status')).toHaveTextContent('Браво! Това е Плиска!')
    fireEvent.click(screen.getByRole('button', { name: /Готово/ }))

    // v0.24: the second round – true or not true. A wrong answer is never a dead end: Raya explains why.
    const extra = young.extra
    if (extra?.type !== 'truefalse') throw new Error('young level should have a true/false challenge')
    extra.items.forEach((it, i) => {
      fireEvent.click(screen.getByRole('button', { name: it.answer ? 'Не е вярно' : 'Вярно' }))
      expect(document.body).toHaveTextContent(it.why.bg)
      if (i < extra.items.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Нататък' }))
    })
    fireEvent.click(screen.getByRole('button', { name: /Готово/ }))

    // Check.
    expect(screen.getByRole('heading', { name: 'Провери какво научи' })).toBeInTheDocument()
    answerAll(young.check, false)

    // Badge.
    expect(screen.getByRole('heading', { name: 'Спечели значка!' })).toBeInTheDocument()
    expect(activeProfile(useProfiles.getState()).done[ID]?.level).toBe('young')
    expect(activeProfile(useProfiles.getState()).badges).toEqual(['asparuh'])
    expect(JSON.parse(localStorage.getItem(PROFILES_KEY)!).state.profiles[0].badges).toEqual(['asparuh'])

    fireEvent.click(screen.getByRole('button', { name: 'Още мисии' }))
    expect(await screen.findByRole('button', { name: /Хан Аспарух.*Изиграна/ })).toBeInTheDocument()
  })

  it('a reload or return to the same badge does not count it again', async () => {
    const badgeEntry = {
      pathname: `/mission/${ID}`,
      key: 'completed-run',
      state: { profileId: useProfiles.getState().activeId, level: 'young', phase: 'badge' },
    }
    renderAt(badgeEntry)
    await screen.findByRole('heading', { name: 'Спечели значка!' })
    expect(useProfiles.getState().streak).toBe(1)
    cleanup()

    renderAt(badgeEntry)
    await screen.findByRole('heading', { name: 'Спечели значка!' })
    expect(useProfiles.getState().streak).toBe(1)
    cleanup()

    renderAt({ ...badgeEntry, key: 'new-run' })
    await screen.findByRole('heading', { name: 'Спечели значка!' })
    expect(useProfiles.getState().streak).toBe(2)
  })

  it('a saved phase is not resumed for a different age variant', async () => {
    useProfiles.getState().setAge(13)
    renderAt({
      pathname: `/mission/${ID}`,
      state: { profileId: useProfiles.getState().activeId, level: 'young', phase: 'check', q: 2 },
    })
    expect(await screen.findByText(mission.levels.guard!.story[0]!.bg)).toBeInTheDocument()
  })

  it('the Exit button is visible in every phase and leaves without a badge', async () => {
    renderAt(`/mission/${ID}`)
    expect(await screen.findByRole('button', { name: /Изход/ })).toBeInTheDocument()
    for (let i = 0; i < young.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
    expect(screen.getByRole('button', { name: /Изход/ })).toBeInTheDocument()
    // In the middle of the game, one tap only asks — a second tap leaves.
    fireEvent.click(screen.getByRole('button', { name: /Изход/ }))
    fireEvent.click(await screen.findByRole('button', { name: /Докосни пак/ }))
    expect(await screen.findByRole('heading', { name: 'Пътят на приключенията' })).toBeInTheDocument()
    expect(activeProfile(useProfiles.getState()).badges).toEqual([])
  })

  it('"back" during the game returns to the story, not out of the mission', async () => {
    renderAt(`/mission/${ID}`, ['/missions'])
    await screen.findByRole('button', { name: /Изход/ })
    for (let i = 0; i < young.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
    expect(screen.queryByText(young.story[0]!.bg)).not.toBeInTheDocument()
    act(() => goBack())
    expect(await screen.findByText(young.story[0]!.bg)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Изход/ })).toBeInTheDocument()
  })

  it('the page title names the mission', async () => {
    renderAt(`/mission/${ID}`)
    await screen.findByRole('button', { name: /Изход/ })
    expect(document.title).toBe(`${mission.title.bg} – KOREN`)
  })

  it('is played in English when the app is in English', async () => {
    useSettings.getState().setLang('en')
    renderAt(`/mission/${ID}`)
    expect(await screen.findByText(young.story[0]!.en)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Exit/ })).toBeInTheDocument()
  })

  it.each([
    [5, 'small'],
    [9, 'young'],
    [13, 'guard'],
  ] as const)('age %i plays the %s version', async (age, level) => {
    useProfiles.getState().setAge(age)
    renderAt(`/mission/${ID}`)
    const content = mission.levels[level]!
    expect(await screen.findByText(content.story[0]!.bg)).toBeInTheDocument()
    for (let i = 0; i < content.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
    if (content.game.type !== 'map') throw new Error('expected a map game')
    // Each level has a different number of places to choose from.
    expect(screen.getAllByRole('button', { name: /^Точка \d$/ })).toHaveLength(content.game.choices.length)
  })

  it('the three versions really differ: story length, choices, pictures, check', () => {
    const { small, young: y, guard } = mission.levels
    expect([small!.story.length, y!.story.length, guard!.story.length]).toEqual([3, 4, 5])
    const g = (l: typeof small) => (l!.game.type === 'map' ? l!.game : null)!
    expect([g(small).choices.length, g(y).choices.length, g(guard).choices.length]).toEqual([3, 4, 6])
    expect(g(small).showIcons).toBe(true)
    expect(g(guard).showIcons).toBe(false)
    expect(small!.check).toHaveLength(0) // 4–6: nothing to read in the check phase
  })

  it('an unknown mission id explains the problem and links back to the list', async () => {
    renderAt('/mission/nope-99-x')
    expect(await screen.findByRole('heading', { name: 'Тази мисия не е налична' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Към пътя на приключенията' }))
    expect((await screen.findAllByRole('button', { name: /Хан Аспарух/ }))[0]).toBeInTheDocument()
  })

  it('a direct link cannot bypass the mission age group', async () => {
    renderAt('/mission/mini-02-boar')
    expect(await screen.findByRole('heading', { name: 'Тази мисия е за друга възрастова група' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Напред/ })).not.toBeInTheDocument()
  })

  it('a locked mission explains how it opens and links to the mission before it', async () => {
    renderAt('/mission/hist-02-simeon')
    expect(await screen.findByText('Заключена мисия')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Хан Аспарух/ })).toHaveAttribute('href', `/mission/${ID}`)
    expect(screen.queryByRole('button', { name: /Напред/ })).not.toBeInTheDocument()
  })

  it('the History topic lists its missions', async () => {
    renderAt('/topic/history')
    expect(await screen.findByRole('link', { name: /Хан Аспарух/ })).toBeInTheDocument()
  })

  it('progress is not saved when "Remember" is off', () => {
    useSettings.getState().setRemember(false)
    useProfiles.getState().complete(ID, 'young', 'asparuh')
    expect(localStorage.getItem(PROFILES_KEY)).toBeNull()
  })
})

describe('map screen', () => {
  it('shows every place and opens the mission at Pliska', async () => {
    renderAt('/map')
    fireEvent.click(await screen.findByRole('button', { name: 'Плиска' }))
    expect(screen.getByRole('heading', { name: 'Плиска' })).toBeInTheDocument()
    // v0.18: Pliska has two missions now (Asparuh; Krum and Omurtag)
    // Krum is still locked: it says so and links to what opens it (Asparuh) — so Asparuh's link appears twice.
    for (const a of screen.getAllByRole('link', { name: /^Хан Аспарух и новата държава/ })) expect(a).toHaveAttribute('href', `/mission/${ID}`)
    expect(screen.getByText('Хан Крум и хан Омуртаг')).toBeInTheDocument()
    // v0.15: cities have their own mode; a place without a mission says so and shows its fact.
    fireEvent.click(screen.getByRole('button', { name: /Градове/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Габрово' }))
    expect(screen.getByText('Скоро тук ще има мисия.')).toBeInTheDocument()
    expect(screen.getByText(/Градът на хумора и сатирата/)).toBeInTheDocument()
  })

  it('map modes: provinces (with a keyboard list), mountains, rivers, neighbours, tourism', async () => {
    renderAt('/map')
    fireEvent.click(await screen.findByRole('button', { name: /Области/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Пловдив' }))
    expect(screen.getByRole('heading', { name: 'Пловдив' })).toBeInTheDocument()
    expect(screen.getByText('Областен център: Пловдив')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Планини/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Мусала, 2925 м надморска височина' }))
    expect(screen.getByText('Планина: Рила')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Реки и езера/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Дунав' }))
    expect(screen.getByText('Влива се в Черно море.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Съседи/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Гърция' }))
    expect(screen.getByText('Столица: Атина')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Туризъм/ }))
    expect(screen.getByRole('button', { name: 'Боровец' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Деветашката пещера' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Плиска' })).not.toBeInTheDocument()
  })

  it('a place with a finished mission turns gold', async () => {
    useProfiles.getState().complete(ID, 'young', 'asparuh')
    renderAt('/map')
    const pliska = await screen.findByRole('button', { name: 'Плиска' })
    expect(pliska.firstElementChild).toHaveAttribute('data-state', 'done')
    expect(screen.getByRole('button', { name: 'София' }).firstElementChild).not.toHaveAttribute('data-state', 'done')
    // Simeon's Preslav is locked until Asparuh is played — and Asparuh is played now, so it is open.
    expect(screen.getByRole('button', { name: 'Велики Преслав' }).firstElementChild).toHaveAttribute('data-state', 'open')
  })
})

describe('Hall of Fame (v0.21)', () => {
  it('a card is a link to its mission until it is played; then it lights up and tells its story', async () => {
    renderAt('/fame')
    expect(await screen.findByRole('heading', { name: 'Космос' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Георги Иванов/ })[0]).toHaveAttribute('href', '/mission/ach-04-space')
    cleanup()
    useProfiles.getState().complete('ach-04-space', 'young', 'space')
    renderAt('/fame')
    fireEvent.click(await screen.findByRole('button', { name: /Георги Иванов/ }))
    expect(screen.getByText(/Първият български космонавт/)).toBeInTheDocument()
  })
})

describe('Fair stall (v0.22) — game coins only', () => {
  it('buying takes two taps; a bought thing is worn and can be taken off; the sign wears it', async () => {
    const s = useProfiles.getState()
    s.complete('hist-01-asparuh', 'young', 'asparuh')
    s.complete('geo-01-rila', 'young', 'rila')
    s.complete('cult-01-baba-marta', 'young', 'baba-marta') // 3 missions + 1 day = 35 coins
    renderAt('/shop')
    expect(await screen.findByText('35')).toBeInTheDocument()
    expect(screen.getByText('Още 15 жълтици')).toBeInTheDocument() // the vest costs 50: says what is missing, never "no"
    fireEvent.click(screen.getByRole('button', { name: /Купи за 20/ }))
    fireEvent.click(screen.getByRole('button', { name: /Сигурен ли си/ }))
    expect(activeProfile(useProfiles.getState()).outfit.pin).toBe('martenitsa')
    expect(screen.getByText('15')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Свали: Мартеница' }))
    expect(activeProfile(useProfiles.getState()).outfit.pin).toBeUndefined()
    expect(screen.getByText(/само в играта/)).toBeInTheDocument()
  })
})
