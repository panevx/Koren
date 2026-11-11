import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { missionById } from '../src/content/missions'
import { PROGRESS_KEY, useProgress } from '../src/store/progress'
import { useSettings } from '../src/store/settings'

const ID = 'hist-01-asparuh'
const mission = missionById(ID)!
const young = mission.levels.young!

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
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
  useSettings.getState().setAge(8)
  useProgress.getState().reset()
})
afterEach(cleanup)

describe('mission Хан Аспарух (young)', () => {
  it('plays story → game → check → badge and records the badge', async () => {
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

    // Check.
    expect(screen.getByRole('heading', { name: 'Провери какво научи' })).toBeInTheDocument()
    answerAll(young.check, false)

    // Badge.
    expect(screen.getByRole('heading', { name: 'Спечели значка!' })).toBeInTheDocument()
    expect(useProgress.getState().done[ID]?.level).toBe('young')
    expect(useProgress.getState().badges).toEqual(['asparuh'])
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!).state.badges).toEqual(['asparuh'])

    fireEvent.click(screen.getByRole('button', { name: 'Още мисии' }))
    expect(await screen.findByText('Изиграна')).toBeInTheDocument()
  })

  it('the Exit button is visible in every phase and leaves without a badge', async () => {
    renderAt(`/mission/${ID}`)
    expect(await screen.findByRole('button', { name: /Изход/ })).toBeInTheDocument()
    for (let i = 0; i < young.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
    expect(screen.getByRole('button', { name: /Изход/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Изход/ }))
    expect(await screen.findByRole('link', { name: /Хан Аспарух/ })).toBeInTheDocument()
    expect(useProgress.getState().badges).toEqual([])
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
    useSettings.getState().setAge(age)
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

  it('an unknown mission id goes back to the list', async () => {
    renderAt('/mission/nope-99-x')
    expect(await screen.findByRole('link', { name: /Хан Аспарух/ })).toBeInTheDocument()
  })

  it('the History topic lists its missions', async () => {
    renderAt('/topic/history')
    expect(await screen.findByRole('link', { name: /Хан Аспарух/ })).toBeInTheDocument()
  })

  it('progress is not saved when "Remember" is off', () => {
    useSettings.getState().setRemember(false)
    useProgress.getState().complete(ID, 'young', 'asparuh')
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull()
  })
})

describe('map screen', () => {
  it('shows every place and opens the mission at Pliska', async () => {
    renderAt('/map')
    fireEvent.click(await screen.findByRole('button', { name: 'Плиска' }))
    expect(screen.getByRole('heading', { name: 'Плиска' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Хан Аспарух/ })).toHaveAttribute('href', `/mission/${ID}`)
    fireEvent.click(screen.getByRole('button', { name: 'Белоградчишки скали' }))
    expect(screen.getByText('Скоро тук ще има мисия.')).toBeInTheDocument()
  })

  it('a place with a finished mission turns gold', async () => {
    useProgress.getState().complete(ID, 'young', 'asparuh')
    renderAt('/map')
    const pliska = await screen.findByRole('button', { name: 'Плиска' })
    expect(pliska.firstElementChild).toHaveClass('bg-gold')
    expect(screen.getByRole('button', { name: 'София' }).firstElementChild).not.toHaveClass('bg-gold')
  })
})
