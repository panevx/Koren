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

    // Game: a wrong answer gives a hint and never ends the mission.
    expect(young.game.type).toBe('quiz')
    if (young.game.type === 'quiz') answerAll(young.game.questions, true)

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

  it('a 5-year-old gets the closest available level instead of nothing', async () => {
    useSettings.getState().setAge(5)
    renderAt(`/mission/${ID}`)
    expect(await screen.findByText(young.story[0]!.bg)).toBeInTheDocument()
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
