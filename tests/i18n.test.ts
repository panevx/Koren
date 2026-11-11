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
