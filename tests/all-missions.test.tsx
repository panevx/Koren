import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { MISSIONS } from '../src/content/missions'
import { placeById } from '../src/content/places'
import type { Game, Question } from '../src/content/schema'
import { shuffledIndexes } from '../src/games/shuffle'
import { activeProfile, useProfiles } from '../src/store/profiles'
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

const finish = async () => fireEvent.click(await screen.findByRole('button', { name: 'Готово' }, { timeout: 3000 }))

async function solveGame(game: Game) {
  switch (game.type) {
    case 'quiz':
      return solveQuestions(game.questions)
    case 'map':
      fireEvent.click(screen.getByRole('button', { name: `Точка ${game.choices.indexOf(game.target) + 1}` }))
      return next()
    case 'match':
      for (const pair of game.pairs) {
        fireEvent.click(within(screen.getByRole('group', { name: 'Първа колона' })).getByRole('button', { name: pair.a.bg }))
        fireEvent.click(within(screen.getByRole('group', { name: 'Втора колона' })).getByRole('button', { name: pair.b.bg }))
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
    case 'find':
      game.items.forEach((item, i) => {
        if (!item.target) return
        if (item.under) fireEvent.click(screen.getByRole('button', { name: `Надникни отдолу (${i + 1})` }))
        fireEvent.click(screen.getByRole('button', { name: item.bg }))
      })
      return next()
    case 'sort':
      for (const item of game.items) {
        fireEvent.click(within(screen.getByRole('list', { name: 'Неща за подреждане' })).getByRole('button', { name: item.bg }))
        fireEvent.click(screen.getByRole('button', { name: `Сложи в кутия ${game.bins[item.bin]!.bg}` }))
      }
      return next()
    case 'memory': {
      const cards = shuffledIndexes(game.pairs.length * 2, game.prompt.bg)
      for (let pair = 0; pair < game.pairs.length; pair++) {
        const [x, y] = cards.flatMap((k, pos) => (Math.floor(k / 2) === pair ? [pos] : []))
        fireEvent.click(screen.getByRole('button', { name: `Карта ${x! + 1}` }))
        fireEvent.click(screen.getByRole('button', { name: `Карта ${y! + 1}` }))
      }
      return next()
    }
    case 'chest':
      for (const item of game.items) if (item.belongs) fireEvent.click(screen.getByRole('button', { name: item.bg }))
      return finish()
    case 'build': {
      const spots = [...game.pieces.map((p) => p.place), ...game.decoys]
      const order = shuffledIndexes(spots.length, `${game.prompt.bg}-spots`)
      for (const piece of game.pieces) {
        const name = placeById(piece.place)!.name.bg
        fireEvent.click(within(screen.getByRole('list', { name: 'Забележителности' })).getByRole('button', { name }))
        const n = order.findIndex((k) => spots[k] === piece.place)
        fireEvent.click(screen.getByRole('button', { name: game.labels ? `Празно място: ${name}` : `Празно място ${n + 1}` }))
      }
      return next()
    }
    case 'guess':
      fireEvent.click(screen.getByRole('button', { name: `Точка ${game.choices.indexOf(game.target) + 1}` }))
      return next()
  }
}

/** Every mission is reachable in the test: its prerequisites count as done. */
function unlockAllBut(id: string) {
  const done = Object.fromEntries(MISSIONS.filter((m) => m.id !== id).map((m) => [m.id, { level: 'young' as const, at: '2026-01-01' }]))
  const badges = MISSIONS.filter((m) => m.id !== id).map((m) => m.badge.id)
  useProfiles.setState((s) => ({ profiles: s.profiles.map((p) => ({ ...p, done, badges })) }))
}

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().reset()
})
afterEach(cleanup)

describe('every mission can be finished on every level', () => {
  for (const m of MISSIONS) {
    for (const level of Object.keys(m.levels) as Level[]) {
      it(`${m.id} · ${level}`, async () => {
        useProfiles.getState().setAge(LEVEL_DEFAULT_AGE[level])
        unlockAllBut(m.id)
        render(
          <MemoryRouter initialEntries={[`/mission/${m.id}`]}>
            <AppRoutes />
          </MemoryRouter>,
        )
        const content = m.levels[level]!
        await screen.findByText(content.story[0]!.bg)
        for (let i = 0; i < content.story.length; i++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
        await solveGame(content.game)
        if (content.check.length) solveQuestions(content.check)
        expect(screen.getByRole('heading', { name: 'Спечели значка!' })).toBeInTheDocument()
        expect(activeProfile(useProfiles.getState()).done[m.id]?.level).toBe(level)
      })
    }
  }
})

describe('a break after 3 missions in a row', () => {
  it('Koren and Raya suggest a pause on the 3rd badge — and it is only a suggestion', async () => {
    useProfiles.getState().setAge(8)
    const three = MISSIONS.slice(0, 3)
    for (const [i, m] of three.entries()) {
      cleanup()
      render(
        <MemoryRouter initialEntries={[`/mission/${m.id}`]}>
          <AppRoutes />
        </MemoryRouter>,
      )
      const content = m.levels.young!
      await screen.findByText(content.story[0]!.bg)
      for (let k = 0; k < content.story.length; k++) fireEvent.click(screen.getByRole('button', { name: /Напред/ }))
      await solveGame(content.game)
      if (content.check.length) solveQuestions(content.check)
      const pause = screen.queryByRole('heading', { name: 'Време за почивка!' })
      if (i < 2) expect(pause).not.toBeInTheDocument()
      else expect(pause).toBeInTheDocument()
    }
    // "One more" is allowed — and starts a new count.
    fireEvent.click(screen.getByRole('button', { name: 'Още една мисия' }))
    expect(useProfiles.getState().streak).toBe(0)
  })
})

describe('there is at least one mission per subject and all 11 templates are used', () => {
  it('subjects', () => {
    expect(new Set(MISSIONS.map((m) => m.subject))).toEqual(new Set(['history', 'culture', 'language', 'geography']))
  })
  it('templates', () => {
    const used = new Set(MISSIONS.flatMap((m) => Object.values(m.levels).map((l) => l!.game.type)))
    expect(used).toEqual(new Set(['quiz', 'map', 'match', 'order', 'puzzle', 'find', 'sort', 'memory', 'chest', 'build', 'guess']))
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
