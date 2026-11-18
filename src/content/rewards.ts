import type { Profile } from '../store/profiles'
import { localDay, shopItem, type ShopItem } from './shop'
import { LEVELS } from '../theme/levels'
import { forLevel } from './forLevel'
import { pathChapters } from './path'
import type { Mission } from './schema'

/**
 * Coins (v0.22) — a game currency only: no real money, nothing to buy with money, nothing taken away.
 * The wallet is CALCULATED from what the child has done (so it can never be counted twice and old profiles get their coins
 * at once): жълтици (gold coins) for every mission played and for every day with an adventure; пендари (big gold
 * pendants) for every finished chapter of the path. What was bought is subtracted.
 */
export const COINS_PER_MISSION = 10
export const COINS_PER_DAY = 5

export { SHOP, SLOTS, shopItem, type ShopItem, type Slot } from './shop'


/**
 * Chapters of the path the child has finished — at ANY age: a chapter counts when every mission of it that a child of
 * some level sees is played. So the pendant of a chapter finished at 6 is kept at 7 (the little ones' missions are then
 * hidden, but they were played).
 */
export function finishedChapters(profile: Pick<Profile, 'done'>, all: readonly Mission[]) {
  const finished = new Set<string>()
  for (const level of LEVELS) {
    pathChapters(forLevel(all, level)).forEach((c) => {
      if (c.missions.length > 0 && c.missions.every((m) => profile.done[m.id])) finished.add(c.title.en)
    })
  }
  return finished.size
}

/**
 * The purse. `all` = EVERY mission of this build, not only the ones the child's age shows: what was earned is never taken
 * away (a child who turns 7 keeps the coins of the little ones' missions; a parent who changes the age by mistake too).
 */
export function wallet(profile: Pick<Profile, 'done' | 'days' | 'owned'>, all: readonly Mission[]) {
  const played = Object.keys(profile.done).length
  const earnedCoins = played * COINS_PER_MISSION + profile.days.length * COINS_PER_DAY
  const earnedPendars = finishedChapters(profile, all)
  const spent = (c: ShopItem['currency']) => profile.owned.map(shopItem).reduce((sum, i) => sum + (i && i.currency === c ? i.price : 0), 0)
  return { coins: Math.max(0, earnedCoins - spent('coin')), pendars: Math.max(0, earnedPendars - spent('pendar')), earnedCoins, earnedPendars }
}

/**
 * Days with an adventure — told only in a positive way: how many days in all, and (if 2 or more) how many in a row up to
 * today or yesterday. A missed day is never shown as a loss: the row simply is not mentioned.
 * Days are local calendar dates (see localDay); stepping back uses the calendar, so a summer-time change does not break a row.
 */
export function adventureDays(days: readonly string[], today = localDay()) {
  const set = new Set(days)
  const [y, m, d] = today.split('-').map(Number) as [number, number, number]
  let back = set.has(today) ? 0 : 1 // yesterday still counts — the row is not "lost" before the day is over
  let row = 0
  while (set.has(localDay(new Date(y, m - 1, d - back)))) {
    row++
    back++
  }
  return { total: set.size, row }
}
