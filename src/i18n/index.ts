import bg from '../../content/i18n/bg.json'
import en from '../../content/i18n/en.json'

export type Lang = 'bg' | 'en'
export type TKey = keyof typeof bg

// Typing en against bg's keys makes a missing English string a compile error.
const dictionaries: Record<Lang, Record<TKey, string>> = { bg, en }

export const LANGS: readonly Lang[] = ['bg', 'en']

export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  const text = dictionaries[lang][key] ?? dictionaries.bg[key] ?? key
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

export { dictionaries }
