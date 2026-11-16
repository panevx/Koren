import type { Profile } from '../store/profiles'
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

export const SLOTS = ['head', 'body', 'waist', 'bag', 'feet', 'pin'] as const
export type Slot = (typeof SLOTS)[number]
export type ShopItem = { id: string; slot: Slot; img: string; price: number; currency: 'coin' | 'pendar'; name: { bg: string; en: string } }

/** The fair stall: folk costume pieces and explorer gear (public/img/avatar). */
export const SHOP: readonly ShopItem[] = [
  { id: 'martenitsa', slot: 'pin', img: 'avatar/martenitsa-accessory.webp', price: 20, currency: 'coin', name: { bg: 'Мартеница', en: 'Martenitsa' } },
  { id: 'explorer-hat', slot: 'head', img: 'avatar/explorer-hat.webp', price: 30, currency: 'coin', name: { bg: 'Шапка на изследовател', en: "Explorer's hat" } },
  { id: 'folk-bag', slot: 'bag', img: 'avatar/folk-bag.webp', price: 30, currency: 'coin', name: { bg: 'Торба с шевица', en: 'Embroidered bag' } },
  { id: 'belt', slot: 'waist', img: 'avatar/traditional-belt.webp', price: 30, currency: 'coin', name: { bg: 'Тъкан пояс', en: 'Woven sash' } },
  { id: 'kalpak', slot: 'head', img: 'avatar/folk-hat.webp', price: 40, currency: 'coin', name: { bg: 'Калпак', en: 'Kalpak (fur hat)' } },
  { id: 'backpack', slot: 'bag', img: 'avatar/explorer-backpack.webp', price: 40, currency: 'coin', name: { bg: 'Раница', en: 'Backpack' } },
  { id: 'boots', slot: 'feet', img: 'avatar/leather-boots.webp', price: 40, currency: 'coin', name: { bg: 'Кожени ботуши', en: 'Leather boots' } },
  { id: 'vest', slot: 'body', img: 'avatar/embroidered-vest.webp', price: 50, currency: 'coin', name: { bg: 'Везан елек', en: 'Embroidered vest' } },
  { id: 'flower-crown', slot: 'head', img: 'avatar/flower-crown.webp', price: 1, currency: 'pendar', name: { bg: 'Венец от цветя', en: 'Flower crown' } },
  { id: 'rose', slot: 'pin', img: 'avatar/rose-accessory.webp', price: 1, currency: 'pendar', name: { bg: 'Розичка', en: 'Little rose' } },
]
export const shopItem = (id: string) => SHOP.find((i) => i.id === id)

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

const dayMs = 86_400_000
/**
 * Days with an adventure — told only in a positive way: how many days in all, and (if 2 or more) how many in a row up to
 * today or yesterday. A missed day is never shown as a loss: the row simply is not mentioned.
 */
export function adventureDays(days: readonly string[], today = new Date().toISOString().slice(0, 10)) {
  const set = new Set(days)
  let row = 0
  let d = Date.parse(today)
  if (!set.has(today)) d -= dayMs // yesterday still counts — the row is not "lost" before the day is over
  while (set.has(new Date(d).toISOString().slice(0, 10))) {
    row++
    d -= dayMs
  }
  return { total: set.size, row }
}
