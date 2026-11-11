import { describe, expect, it } from 'vitest'
import { ageToLevel, clampAge } from '../src/theme/levels'

describe('ageToLevel', () => {
  it.each([
    [4, 'small'], [6, 'small'],
    [7, 'young'], [10, 'young'],
    [11, 'guard'], [14, 'guard'],
  ])('age %i → %s', (age, level) => {
    expect(ageToLevel(age)).toBe(level)
  })

  it('clamps out-of-range and junk values', () => {
    expect(clampAge(2)).toBe(4)
    expect(clampAge(99)).toBe(14)
    expect(clampAge(7.6)).toBe(8)
    expect(clampAge(Number.NaN)).toBe(8)
  })
})
