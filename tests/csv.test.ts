import { describe, expect, it } from 'vitest'
import { csvToMissions, missionsToCsv, parseCsv, toCsv } from '../src/content/csv'
import { MISSIONS } from '../src/content/missions'

describe('missions ⇄ spreadsheet', () => {
  it('every mission survives JSON → CSV → JSON unchanged (all templates, all levels)', () => {
    const { missions, errors } = csvToMissions(missionsToCsv([...MISSIONS]))
    expect(errors).toEqual([])
    expect(missions).toEqual([...MISSIONS])
  })

  it('handles commas, quotes and new lines inside cells', () => {
    const rows = [['a', 'b'], ['Здравей, свят', 'Тя каза "да"\nи тръгна']]
    expect(parseCsv(toCsv(rows))).toEqual(rows)
  })

  it('accepts the BOM and Windows line endings Excel writes', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']])
  })

  it('explains mistakes with row numbers, in Bulgarian, and writes nothing', () => {
    const csv = missionsToCsv([MISSIONS[0]!])
      .replace(/,question,(.*?),(\d),/, ',question,$1,9,') // answer out of range in the first question
    const lines = csv.split('\n')
    lines.splice(3, 0, 'hist-01-asparuh,young,game,dance,,,,,,,,,') // unknown game kind
    const { errors } = csvToMissions(lines.join('\n'))
    expect(errors.join('\n')).toMatch(/ред \d+ \(hist-01-asparuh\): непознат вид игра „dance“/)
  })

  it('reports a wrong answer number', () => {
    const csv = [
      'mission,level,block,kind,bg,en,img,opt_bg,opt_en,opt_img,answer,hint_bg,hint_en',
      'x-01-y,young,check,question,Въпрос?,Question?,,А | Б,A | B,,5,,',
    ].join('\n')
    expect(csvToMissions(csv).errors[0]).toBe('ред 2 (x-01-y): „answer“ трябва да е номер на верния отговор (1–2)')
  })

  it('reports missing columns', () => {
    expect(csvToMissions('mission,level\n').errors[0]).toMatch(/Липсват колони/)
  })
})
