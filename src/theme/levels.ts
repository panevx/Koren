export type Level = 'small' | 'young' | 'guard'

export const MIN_AGE = 4
export const MAX_AGE = 14
export const DEFAULT_AGE = 8

export const LEVELS: readonly Level[] = ['small', 'young', 'guard']

/** Age a level card selects when the current age is outside that level. */
export const LEVEL_DEFAULT_AGE: Record<Level, number> = { small: 5, young: 8, guard: 12 }

export function clampAge(age: number): number {
  if (!Number.isFinite(age)) return DEFAULT_AGE
  return Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(age)))
}

export function ageToLevel(age: number): Level {
  const a = clampAge(age)
  if (a <= 6) return 'small'
  if (a <= 10) return 'young'
  return 'guard'
}
