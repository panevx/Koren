/**
 * Habits (v0.27) — a reason to come back tomorrow, never a punishment for not coming:
 *  - the day's adventure: one mission or one practice makes the day "yours";
 *  - the week's stamp: 3 of the 7 days (Monday–Sunday) — a missed day breaks nothing, the week only needs three;
 *  - practice from mistakes: a question answered wrong comes back after 1, 3 and 7 days (Leitner boxes).
 * Everything is CALCULATED from the profile (dates and boxes), so nothing can be counted twice.
 * No dependencies besides shop.ts: the hub imports this, and the first download must stay small.
 */
import { localDay } from './shop'

/** Days in a week needed for the week's stamp. */
export const WEEK_GOAL = 3
/** Coins for each week with its stamp (on top of the coins of each day). */
export const COINS_PER_WEEK = 10
/** Days until a question comes back: after a mistake 1, then after each right answer in practice 3 and 7; then it is learned. */
export const REVIEW_DAYS = [1, 3, 7] as const
/** Questions in one practice. */
export const PRACTICE_SIZE = 5

const parse = (day: string) => {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}
export const addDays = (day: string, n: number) => {
  const d = parse(day)
  return localDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n))
}
/** The Monday of the week of `day` (weeks start on Monday, as in Bulgarian calendars). */
export const mondayOf = (day: string) => addDays(day, -((parse(day).getDay() + 6) % 7))

/** This week, Monday to Sunday: which days had an adventure. */
export function thisWeek(days: readonly string[], today = localDay()) {
  const set = new Set(days)
  const monday = mondayOf(today)
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(monday, i)
    return { day, done: set.has(day), today: day === today, future: day > today }
  })
  const count = week.filter((d) => d.done).length
  return { week, count, stamped: count >= WEEK_GOAL, doneToday: set.has(today) }
}

/** Weeks (of all time) that earned their stamp: 3 or more days with an adventure. */
export function stampedWeeks(days: readonly string[]) {
  const perWeek = new Map<string, number>()
  for (const day of new Set(days)) perWeek.set(mondayOf(day), (perWeek.get(mondayOf(day)) ?? 0) + 1)
  return [...perWeek.values()].filter((n) => n >= WEEK_GOAL).length
}

/** A question to repeat: its box (0 = just missed) and the day it comes back. */
export type Review = { box: number; due: string }

/** The key of a question: mission, level, where in the mission and which question. */
export const reviewKey = (mission: string, level: string, where: 'game' | 'extra' | 'check', index: number) =>
  `${mission}|${level}|${where}|${index}`

/**
 * One answer to a question, the first try only. In a mission: a mistake puts it in box 0 (back tomorrow); a right answer
 * changes nothing. In practice: right → the next box (3, then 7 days), after the last box it is learned and leaves;
 * wrong → back to box 0. Returns the new list (the same object when nothing changed).
 */
export function answer(review: Record<string, Review>, key: string, right: boolean, practice: boolean, today = localDay()) {
  const had = review[key]
  if (!right) {
    if (had && had.box === 0 && had.due === addDays(today, REVIEW_DAYS[0])) return review
    return { ...review, [key]: { box: 0, due: addDays(today, REVIEW_DAYS[0]) } }
  }
  if (!practice || !had) return review
  const box = had.box + 1
  const next = { ...review }
  if (box >= REVIEW_DAYS.length) delete next[key]
  else next[key] = { box, due: addDays(today, REVIEW_DAYS[box]!) }
  return next
}

/** Questions waiting today (the oldest first). */
export const dueToday = (review: Record<string, Review>, today = localDay()) =>
  Object.entries(review)
    .filter(([, r]) => r.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[0].localeCompare(b[0]))
    .map(([key]) => key)
