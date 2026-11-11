/**
 * Missions ⇄ spreadsheet (CSV). The content team writes in a shared sheet — one row per thing —
 * and `npm run import-content` turns it into content/missions/*.json. See content/sheet/README.md.
 *
 * Columns:  mission | level | block | kind | bg | en | img | opt_bg | opt_en | opt_img | answer | hint_bg | hint_en
 * Lists inside a cell (options, place ids, images) are separated by " | ".
 */
import { Mission, type Game, type LevelContent, type Question } from './schema.ts'

export const COLUMNS = ['mission', 'level', 'block', 'kind', 'bg', 'en', 'img', 'opt_bg', 'opt_en', 'opt_img', 'answer', 'hint_bg', 'hint_en'] as const
type Col = (typeof COLUMNS)[number]
export type Row = Record<Col, string> & { line: number }

const SEP = ' | '
const split = (s: string) => (s.trim() ? s.split('|').map((x) => x.trim()) : [])
const LEVEL_KEYS = ['small', 'young', 'guard'] as const

// ── CSV text ⇄ rows ──────────────────────────────────────────────────
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  const src = text.replace(/^﻿/, '')
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') (cell += '"'), i++
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') row.push(cell), (cell = '')
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell || row.length) row.push(cell), rows.push(row)
  return rows
}

const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
export const toCsv = (rows: string[][]) => rows.map((r) => r.map(esc).join(',')).join('\n') + '\n'

// ── Missions → rows ─────────────────────────────────────────────────
export function missionsToCsv(missions: Mission[]): string {
  const out: string[][] = [[...COLUMNS]]
  const add = (r: Partial<Record<Col, string>>) => out.push(COLUMNS.map((c) => r[c] ?? ''))
  const question = (mission: string, level: string, block: string, q: Question) =>
    add({
      mission, level, block, kind: 'question', bg: q.q.bg, en: q.q.en,
      opt_bg: q.options.map((o) => o.bg).join(SEP),
      opt_en: q.options.map((o) => o.en).join(SEP),
      opt_img: q.options.some((o) => o.img) ? q.options.map((o) => o.img ?? '').join(SEP) : '',
      answer: String(q.answer + 1),
      hint_bg: q.hint?.bg ?? '', hint_en: q.hint?.en ?? '',
    })

  for (const m of missions) {
    const id = m.id
    add({ mission: id, block: 'title', bg: m.title.bg, en: m.title.en })
    add({ mission: id, block: 'meta', kind: 'subject', bg: m.subject })
    add({ mission: id, block: 'meta', kind: 'order', bg: String(m.order) })
    add({ mission: id, block: 'meta', kind: 'free', bg: String(m.free) })
    if (m.place) add({ mission: id, block: 'meta', kind: 'place', bg: m.place })
    add({ mission: id, block: 'meta', kind: 'badge', bg: m.badge.id, img: m.badge.icon })
    add({ mission: id, block: 'meta', kind: 'draft', bg: String(m.draft) })
    for (const s of m.sources) add({ mission: id, block: 'source', bg: s })
    if (m.review) add({ mission: id, block: 'review', bg: m.review.by, en: m.review.date })

    for (const level of LEVEL_KEYS) {
      const c = m.levels[level]
      if (!c) continue
      for (const s of c.story) add({ mission: id, level, block: 'story', kind: `${s.hero}:${s.pose}`, bg: s.bg, en: s.en, img: s.img ?? '' })
      const g = c.game
      const head = (kind: string, extra: Partial<Record<Col, string>> = {}) =>
        add({ mission: id, level, block: 'game', kind, ...extra })
      switch (g.type) {
        case 'quiz':
          head('quiz')
          for (const q of g.questions) question(id, level, 'game', q)
          break
        case 'map':
          head(g.showIcons ? 'map:icons' : 'map', {
            bg: g.prompt.bg, en: g.prompt.en, opt_bg: g.choices.join(SEP), answer: g.target, hint_bg: g.hint.bg, hint_en: g.hint.en,
          })
          break
        case 'match':
          head('match', { bg: g.prompt.bg, en: g.prompt.en, hint_bg: g.hint?.bg ?? '', hint_en: g.hint?.en ?? '' })
          for (const p of g.pairs)
            add({ mission: id, level, block: 'game', kind: 'pair', bg: p.a.bg, en: p.a.en, img: p.a.img ?? '', opt_bg: p.b.bg, opt_en: p.b.en, opt_img: p.b.img ?? '' })
          break
        case 'order':
          head('order', { bg: g.prompt.bg, en: g.prompt.en, hint_bg: g.hint?.bg ?? '', hint_en: g.hint?.en ?? '' })
          for (const it of g.items) add({ mission: id, level, block: 'game', kind: 'item', bg: it.bg, en: it.en, img: it.img ?? '' })
          break
        case 'puzzle':
          head('puzzle', { bg: g.prompt.bg, en: g.prompt.en, img: g.img, answer: String(g.pieces) })
          break
      }
      for (const q of c.check) question(id, level, 'check', q)
    }
  }
  return toCsv(out)
}

// ── Rows → missions ─────────────────────────────────────────────────
export type ImportResult = { missions: Mission[]; errors: string[] }

export function csvToMissions(text: string): ImportResult {
  const table = parseCsv(text).filter((r) => r.some((c) => c.trim()))
  const errors: string[] = []
  if (!table.length) return { missions: [], errors: ['Таблицата е празна.'] }
  const header = table[0]!.map((h) => h.trim().toLowerCase())
  const missing = COLUMNS.filter((c) => !header.includes(c))
  if (missing.length) return { missions: [], errors: [`Липсват колони: ${missing.join(', ')}`] }
  const rows: Row[] = table.slice(1).map((cells, i) => {
    const r = { line: i + 2 } as Row
    for (const c of COLUMNS) r[c] = (cells[header.indexOf(c)] ?? '').trim()
    return r
  })

  const ids = [...new Set(rows.map((r) => r.mission).filter(Boolean))]
  const missions: Mission[] = []
  for (const id of ids) {
    const mine = rows.filter((r) => r.mission === id)
    const at = (r: Row) => `ред ${r.line} (${id})`
    const draft: Record<string, unknown> = { id, sources: [], review: null, levels: {} }
    const levels: Record<string, { story: unknown[]; game?: Record<string, unknown>; check: unknown[] }> = {}
    const toQuestion = (r: Row) => {
      const bg = split(r.opt_bg)
      const en = split(r.opt_en)
      const imgs = split(r.opt_img)
      if (bg.length !== en.length) errors.push(`${at(r)}: различен брой отговори на български (${bg.length}) и английски (${en.length})`)
      const answer = Number(r.answer)
      if (!Number.isInteger(answer) || answer < 1 || answer > bg.length) errors.push(`${at(r)}: „answer“ трябва да е номер на верния отговор (1–${bg.length})`)
      return {
        q: { bg: r.bg, en: r.en },
        options: bg.map((b, i) => ({ bg: b, en: en[i] ?? '', ...(imgs[i] ? { img: imgs[i] } : {}) })),
        answer: answer - 1,
        ...(r.hint_bg || r.hint_en ? { hint: { bg: r.hint_bg, en: r.hint_en } } : {}),
      }
    }

    for (const r of mine) {
      const block = r.block.toLowerCase()
      if (!r.level) {
        if (block === 'title') draft.title = { bg: r.bg, en: r.en }
        else if (block === 'source') (draft.sources as string[]).push(r.bg)
        else if (block === 'review') draft.review = r.bg ? { by: r.bg, date: r.en } : null
        else if (block === 'meta') {
          const v = r.bg
          switch (r.kind) {
            case 'subject': draft.subject = v; break
            case 'order': draft.order = Number(v); break
            case 'free': draft.free = v === 'true'; break
            case 'draft': draft.draft = v === 'true'; break
            case 'place': draft.place = v; break
            case 'badge': draft.badge = { id: v, icon: r.img }; break
            default: errors.push(`${at(r)}: непознато meta „${r.kind}“`)
          }
        } else errors.push(`${at(r)}: ред без „level“ трябва да е title, meta, source или review`)
        continue
      }
      if (!LEVEL_KEYS.includes(r.level as (typeof LEVEL_KEYS)[number])) {
        errors.push(`${at(r)}: „level“ трябва да е small, young или guard`)
        continue
      }
      const L = (levels[r.level] ??= { story: [], check: [] })
      if (block === 'story') {
        const [hero, pose] = r.kind.split(':')
        L.story.push({ hero, pose: pose || 'point', bg: r.bg, en: r.en, ...(r.img ? { img: r.img } : {}) })
      } else if (block === 'check') L.check.push(toQuestion(r))
      else if (block === 'game') {
        const g = L.game
        switch (r.kind) {
          case 'quiz': L.game = { type: 'quiz', questions: [] }; break
          case 'question':
            if (g?.type !== 'quiz') errors.push(`${at(r)}: „question“ без ред „quiz“ над него`)
            else (g.questions as unknown[]).push(toQuestion(r))
            break
          case 'map':
          case 'map:icons':
            L.game = { type: 'map', target: r.answer, choices: split(r.opt_bg), prompt: { bg: r.bg, en: r.en }, hint: { bg: r.hint_bg, en: r.hint_en }, showIcons: r.kind === 'map:icons' }
            break
          case 'match':
          case 'order':
            L.game = { type: r.kind, prompt: { bg: r.bg, en: r.en }, [r.kind === 'match' ? 'pairs' : 'items']: [], ...(r.hint_bg || r.hint_en ? { hint: { bg: r.hint_bg, en: r.hint_en } } : {}) }
            break
          case 'pair':
            if (g?.type !== 'match') errors.push(`${at(r)}: „pair“ без ред „match“ над него`)
            else (g.pairs as unknown[]).push({ a: { bg: r.bg, en: r.en, ...(r.img ? { img: r.img } : {}) }, b: { bg: r.opt_bg, en: r.opt_en, ...(r.opt_img ? { img: r.opt_img } : {}) } })
            break
          case 'item':
            if (g?.type !== 'order') errors.push(`${at(r)}: „item“ без ред „order“ над него`)
            else (g.items as unknown[]).push({ bg: r.bg, en: r.en, ...(r.img ? { img: r.img } : {}) })
            break
          case 'puzzle':
            L.game = { type: 'puzzle', prompt: { bg: r.bg, en: r.en }, img: r.img, pieces: Number(r.answer) }
            break
          default:
            errors.push(`${at(r)}: непознат вид игра „${r.kind}“ (quiz, question, map, map:icons, match, pair, order, item, puzzle)`)
        }
      } else errors.push(`${at(r)}: „block“ трябва да е story, game или check`)
    }
    draft.levels = Object.fromEntries(Object.entries(levels).map(([k, v]) => [k, v as unknown as LevelContent | { game: Game }]))

    const parsed = Mission.safeParse(draft)
    if (parsed.success) missions.push(parsed.data)
    else for (const issue of parsed.error.issues) errors.push(`${id}: ${issue.path.join('.') || '(мисия)'} – ${issue.message}`)
  }
  return { missions, errors }
}
