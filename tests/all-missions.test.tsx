import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { MISSIONS } from '../src/content/missions'
import type { Game, Question } from '../src/content/schema'
import { shuffledIndexes } from '../src/games/shuffle'
import { useProgress } from '../src/store/progress'
import { useSettings } from '../src/store/settings'
import { LEVEL_DEFAULT_AGE, type Level } from '../src/theme/levels'

/**
 * Plays EVERY level of EVERY mission to the badge, solving each game from its JSON.
 * If a content change makes a mission impossible to finish, this fails.
 */

const next = () => fireEvent.click(screen.getByRole('button', { name: /Следващ въпрос|Готово/ }))

function solveQuestions(questions: Question[]) {
  for (const q of questions) {
    fireEvent.click(screen.getByRole('button', { name: q.options[q.answer]!.bg }))
    next()
  }
}

function solveGame(game: Game) {
  switch (game.type) {
    case 'quiz':
      return solveQuestions(game.questions)
    case 'map':
      fireEvent.click(screen.getByRole('button', { name: `Точка ${game.choices.indexOf(game.target) + 1}` }))
      return next()
    case 'match':
      for (const pair of game.pairs) {
        fireEvent.click(screen.getByRole('button', { name: pair.a.bg }))
        fireEvent.click(screen.getByRole('button', { name: pair.b.bg }))
      }
      return next()
    case 'order':
      for (const item of game.items) fireEvent.click(screen.getByRole('button', { name: item.bg }))
      return next()
    case 'puzzle': {
      const order = shuffledIndexes(game.pieces, game.img)
      for (let pos = 0; pos < order.length; pos++) {
        if (order[pos] === pos) continue
        const from = order.indexOf(pos)
        fireEvent.click(screen.getByRole('button', { name: `Парче ${pos + 1}` }))
        fireEvent.click(screen.getByRole('button', { name: `Парче ${from + 1}` }))
        ;[order[pos], order[from]] = [order[from]!, order[pos]!]
      }
      return next()
    }
  }
}

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProgress.getState().reset()
})
afterEach(cleanup)

describe('every mission can be finished on every level', () => {
  for (const m of MISSIONS) {
    for (const level of Object.keys(m.levels) as Level[]) {
      it(`${m.id} · ${level}`, async () => {
        useSettings.getState().setAge(LEVEL_DEFAULT_AGE[level])
        render(
          <MemoryRouter initialEntries={[`/mission/${m.id}`]}>
            <AppRoutes />
          </MemoryRouter>,
        )
        const content = m.levels[level]!
        await screen.findByText(content.story[0]!.bg)
        for (let i = 0; i < content.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
        solveGame(content.game)
        if (content.check.length) solveQuestions(content.check)
        expect(screen.getByRole('heading', { name: 'Спечели значка!' })).toBeInTheDocument()
        expect(useProgress.getState().done[m.id]?.level).toBe(level)
      })
    }
  }
})

describe('there is at least one mission per subject and all 5 templates are used', () => {
  it('subjects', () => {
    expect(new Set(MISSIONS.map((m) => m.subject))).toEqual(new Set(['history', 'culture', 'language', 'geography']))
  })
  it('templates', () => {
    const used = new Set(MISSIONS.flatMap((m) => Object.values(m.levels).map((l) => l!.game.type)))
    expect(used).toEqual(new Set(['quiz', 'map', 'match', 'order', 'puzzle']))
  })
})

describe('shuffle', () => {
  it('never starts already solved and is stable', () => {
    for (let n = 2; n <= 9; n++) {
      for (const seed of ['a', 'b', 'Подреди', 'puzzles/martenitsa.webp']) {
        const s = shuffledIndexes(n, seed)
        expect(s.some((v, i) => v !== i), `${n} ${seed}`).toBe(true)
        expect([...s].sort((a, b) => a - b)).toEqual([...Array(n).keys()])
        expect(shuffledIndexes(n, seed)).toEqual(s)
      }
    }
  })
})
