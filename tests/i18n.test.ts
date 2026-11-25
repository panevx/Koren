import { describe, expect, it } from 'vitest'
import { dictionaries, translate } from '../src/i18n'

describe('i18n dictionaries', () => {
  const bgKeys = Object.keys(dictionaries.bg).sort()
  const enKeys = Object.keys(dictionaries.en).sort()

  it('bg and en have exactly the same keys', () => {
    expect(enKeys).toEqual(bgKeys)
  })

  it('no empty strings', () => {
    for (const lang of ['bg', 'en'] as const) {
      for (const [key, value] of Object.entries(dictionaries[lang])) {
        expect(value.trim(), `${lang}:${key}`).not.toBe('')
      }
    }
  })

  it('placeholders match between languages', () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
    for (const key of bgKeys as (keyof typeof dictionaries.bg)[]) {
      expect(vars(dictionaries.en[key]), key).toEqual(vars(dictionaries.bg[key]))
    }
  })

  it('interpolates variables', () => {
    expect(translate('bg', 'age.years', { n: 9 })).toBe('9 години')
    expect(translate('en', 'age.years', { n: 9 })).toBe('9 years')
  })
})

describe('no long dashes in what people read (v0.27.3)', () => {
  it('texts, missions, places, timeline and the Hall of Fame use „–“, never „—“', async () => {
    const { readFileSync, readdirSync } = await import('node:fs')
    const files = [
      'content/i18n/bg.json', 'content/i18n/en.json', 'content/fame.json', 'content/path.json',
      'content/map/places.json', 'content/map/peaks.json', 'content/timeline/epochs.json',
      ...readdirSync('content/missions').map((f) => `content/missions/${f}`),
    ]
    for (const f of files) expect(readFileSync(f, 'utf8').includes('—'), f).toBe(false)
  })
})
