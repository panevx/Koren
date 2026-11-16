/**
 * The stall's goods (v0.22). Kept apart from rewards.ts on purpose: the hub shows the worn hat and pin, and must not pull in
 * the path (and with it the validation library) — that would put ~100 KB into the very first download.
 */
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

/**
 * Today's date on the child's own clock, as YYYY-MM-DD. NOT toISOString(): that is UTC, and a child in New York who plays
 * at 6 pm and the next day at 8 pm would land on two days with a gap between them (the row would break for nothing).
 */
export function localDay(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
