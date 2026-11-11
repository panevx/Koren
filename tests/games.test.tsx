import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { MatchGame, OrderGame, PuzzleGame } from '../src/content/schema'
import { Match } from '../src/games/Match'
import { Order } from '../src/games/Order'
import { Puzzle } from '../src/games/Puzzle'
import { shuffledIndexes } from '../src/games/shuffle'
import { useSettings } from '../src/store/settings'

const T = (bg: string) => ({ bg, en: bg })
beforeEach(() => useSettings.getState().reset())
afterEach(cleanup)

describe('match', () => {
  const game: MatchGame = {
    type: 'match',
    prompt: T('Свържи'),
    pairs: [
      { a: T('А'), b: T('а') },
      { a: T('Б'), b: T('б') },
      { a: T('Д'), b: T('д') },
    ],
    hint: T('Малката прилича на голямата.'),
  }

  it('a wrong pair → "try again", the second → the hint; nothing is locked by mistake', () => {
    const done = vi.fn()
    render(<Match game={game} onDone={done} />)
    fireEvent.click(screen.getByRole('button', { name: 'А' }))
    fireEvent.click(screen.getByRole('button', { name: 'б' }))
    expect(screen.getByRole('status')).toHaveTextContent('Почти! Опитай пак.')
    expect(screen.getByRole('button', { name: 'А' })).not.toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Б' }))
    fireEvent.click(screen.getByRole('button', { name: 'д' }))
    expect(screen.getByRole('status')).toHaveTextContent('Малката прилича на голямата.')
  })

  it('works from either side and finishes', () => {
    const done = vi.fn()
    render(<Match game={game} onDone={done} />)
    fireEvent.click(screen.getByRole('button', { name: 'А' }))
    fireEvent.click(screen.getByRole('button', { name: 'д' })) // a miss…
    expect(screen.getByRole('status')).toHaveTextContent('Опитай пак')
    fireEvent.click(screen.getByRole('button', { name: 'а' })) // …then right column first
    fireEvent.click(screen.getByRole('button', { name: 'А' }))
    expect(screen.getByRole('button', { name: 'А' })).toBeDisabled()
    expect(screen.getByRole('status')).toBeEmptyDOMElement() // a correct pair clears Raya's message
    for (const [a, b] of [['Б', 'б'], ['Д', 'д']]) {
      fireEvent.click(screen.getByRole('button', { name: a }))
      fireEvent.click(screen.getByRole('button', { name: b }))
    }
    fireEvent.click(screen.getByRole('button', { name: /Готово/ }))
    expect(done).toHaveBeenCalledOnce()
  })
})

describe('order', () => {
  const game: OrderGame = { type: 'order', prompt: T('Подреди'), items: [T('А'), T('Б'), T('В'), T('Г')], hint: T('Започни с А.') }

  it('locks the right places, returns the wrong ones and helps', () => {
    render(<Order game={game} onDone={() => {}} />)
    // Place А, Б correctly, then Г, В in the wrong order.
    for (const name of ['А', 'Б', 'Г', 'В']) fireEvent.click(within(screen.getByRole('group')).getByRole('button', { name }))
    const slots = screen.getByRole('list', { name: 'Места за подреждане' })
    expect(within(slots).getByRole('button', { name: '1. А' })).toBeDisabled()
    expect(within(slots).getByRole('button', { name: '2. Б' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Зелените са на място')
    // Г and В are back among the cards.
    expect(within(screen.getByRole('group')).getAllByRole('button').map((b) => b.textContent)).toEqual(expect.arrayContaining(['В', 'Г']))
    for (const name of ['Г', 'В']) fireEvent.click(within(screen.getByRole('group')).getByRole('button', { name }))
    expect(screen.getByRole('status')).toHaveTextContent('Започни с А.') // second miss → the hint
  })

  it('a placed card can be taken back before checking', () => {
    render(<Order game={game} onDone={() => {}} />)
    fireEvent.click(within(screen.getByRole('group')).getByRole('button', { name: 'В' }))
    fireEvent.click(screen.getByRole('button', { name: '1. В' }))
    expect(screen.queryByRole('button', { name: '1. В' })).not.toBeInTheDocument()
  })
})

describe('puzzle', () => {
  const game: PuzzleGame = { type: 'puzzle', prompt: T('Нареди'), img: 'puzzles/martenitsa.webp', pieces: 4 }

  it('starts mixed, pieces in place lock, solving shows Done', () => {
    const done = vi.fn()
    render(<Puzzle game={game} onDone={done} />)
    const order = shuffledIndexes(4, game.img)
    expect(order.some((p, i) => p !== i)).toBe(true)
    // Before any move: pieces already in place are locked, the others are not.
    for (let pos = 0; pos < 4; pos++) {
      const btn = screen.getByRole('button', { name: `Парче ${pos + 1}` })
      if (order[pos] === pos) expect(btn).toBeDisabled()
      else expect(btn).not.toBeDisabled()
    }
    for (let pos = 0; pos < 4; pos++) {
      if (order[pos] === pos) continue
      const from = order.indexOf(pos)
      fireEvent.click(screen.getByRole('button', { name: `Парче ${pos + 1}` }))
      fireEvent.click(screen.getByRole('button', { name: `Парче ${from + 1}` }))
      ;[order[pos], order[from]] = [order[from]!, order[pos]!]
    }
    expect(screen.getByRole('status')).toHaveTextContent('Картинката е цяла')
    fireEvent.click(screen.getByRole('button', { name: /Готово/ }))
    expect(done).toHaveBeenCalledOnce()
  })
})

describe('sound setting', () => {
  it('is on by default and can be turned off', () => {
    expect(useSettings.getState().sound).toBe(true)
    useSettings.getState().setSound(false)
    expect(useSettings.getState().sound).toBe(false)
  })
})
