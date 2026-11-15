import { describe, expect, it } from 'vitest'
import { earnedCount } from '../src/content/badges'
import { MISSIONS } from '../src/content/missions'

describe('badge counter', () => {
  it('counts only badges of missions that exist, never more than the total', () => {
    const real = MISSIONS.slice(0, 2).map((m) => m.badge.id)
    expect(earnedCount([...real, 'renamed-or-removed', 'old-draft'], MISSIONS)).toBe(2)
    expect(earnedCount([...MISSIONS.map((m) => m.badge.id), 'extra'], MISSIONS)).toBe(MISSIONS.length)
  })
})
