import type { Profile } from '../store/profiles'
import { localDay, shopItem, type ShopItem } from './shop'
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


/** Chapters of the path where every mission this child can see is played. */
export function finishedChapters(profile: Pick<Profile, 'done'>, missions: readonly Mission[]) {
  return pathChapters(missions).filter((c) => c.missions.length > 0 && c.missions.every((m) => profile.done[m.id])).length
}

export function wallet(profile: Pick<Profile, 'done' | 'days' | 'owned'>, missions: readonly Mission[]) {
  const ids = new Set(missions.map((m) => m.id))
  const played = Object.keys(profile.done).filter((id) => ids.has(id)).length
  const earnedCoins = played * COINS_PER_MISSION + profile.days.length * COINS_PER_DAY
  const earnedPendars = finishedChapters(profile, missions)
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
