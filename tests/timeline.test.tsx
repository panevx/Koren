import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AppRoutes } from '../src/App'
import { PLACES } from '../src/content/places'
import { EPOCHS, TIMELINE, hasState, type Epoch } from '../src/content/timeline'
import { BG_TODAY_OUTLINE } from '../src/map/balkans'
import { insidePolygon } from '../src/map/projection'
import { WIDE_BOUNDS, projectWide, smoothClosedPath } from '../src/map/wide'
import { useProfiles } from '../src/store/profiles'
import { useSettings } from '../src/store/settings'

const ring = (r: [number, number][]) => r.map(([lat, lon]) => projectWide(lat, lon))
const inRing = (lat: number, lon: number, r: [number, number][]) => {
  const [x, y] = projectWide(lat, lon)
  return insidePolygon(x, y, ring(r))
}
/** Is the point inside Bulgaria's territory in this epoch? (same rule as the map: base + add − remove) */
function inTerritory(e: Epoch, lat: number, lon: number): boolean {
  const [x, y] = projectWide(lat, lon)
  const base = Boolean(e.shape.base) && insidePolygon(x, y, BG_TODAY_OUTLINE)
  const added = (e.shape.add ?? []).some((r) => inRing(lat, lon, r))
  const removed = (e.shape.remove ?? []).some((r) => inRing(lat, lon, r))
  return (base || added) && !removed
}
const epoch = (id: string) => EPOCHS.find((e) => e.id === id)!
const CITY = { sofia: [42.697, 23.322], plovdiv: [42.143, 24.749], varna: [43.214, 27.915], thessaloniki: [40.64, 22.94], constantinople: [41.01, 28.98], dobrich: [43.57, 27.83], blagoevgrad: [42.02, 23.1], ohrid: [41.12, 20.8] } as const
const at = (e: Epoch, c: keyof typeof CITY) => inTerritory(e, CITY[c][0], CITY[c][1])

describe('content/timeline/epochs.json', () => {
  it('is a draft until a teacher has checked it', () => {
    expect(TIMELINE.review === null ? TIMELINE.draft : true).toBe(true)
  })

  it('ids are unique and the years go forward', () => {
    expect(new Set(EPOCHS.map((e) => e.id)).size).toBe(EPOCHS.length)
    for (let i = 1; i < EPOCHS.length; i++) expect(EPOCHS[i]!.year, EPOCHS[i]!.id).toBeGreaterThan(EPOCHS[i - 1]!.year)
  })

  it('starts in 681 and ends with exactly today\'s borders', () => {
    expect(EPOCHS[0]!.year).toBe(681)
    expect(EPOCHS.at(-1)!.shape).toEqual({ base: 'today' })
  })

  it('every border point is inside the map view', () => {
    for (const e of EPOCHS)
      for (const r of [...(e.shape.add ?? []), ...(e.shape.remove ?? []), ...(e.shape.planned ?? [])])
        for (const [lat, lon] of r) {
          expect(lat, e.id).toBeGreaterThan(WIDE_BOUNDS.latMin)
          expect(lat, e.id).toBeLessThan(WIDE_BOUNDS.latMax)
          expect(lon, e.id).toBeGreaterThan(WIDE_BOUNDS.lonMin)
          expect(lon, e.id).toBeLessThan(WIDE_BOUNDS.lonMax)
        }
  })

  it('the capital exists on the map and lies inside the territory; no state → no capital', () => {
    for (const e of EPOCHS) {
      if (!hasState(e)) {
        expect(e.capital, e.id).toBeUndefined()
        continue
      }
      const place = PLACES.find((p) => p.id === e.capital)
      expect(place, `${e.id}: capital ${e.capital}`).toBeDefined()
      expect(inTerritory(e, place!.lat, place!.lon), `${e.id}: ${e.capital} inside`).toBe(true)
    }
  })

  it('Thessaloniki and Constantinople are never inside Bulgaria (not even in the planned borders)', () => {
    for (const e of EPOCHS) {
      expect(at(e, 'thessaloniki'), e.id).toBe(false)
      expect(at(e, 'constantinople'), e.id).toBe(false)
      for (const r of e.shape.planned ?? []) {
        expect(inRing(...CITY.thessaloniki, r), e.id).toBe(false)
        expect(inRing(...CITY.constantinople, r), e.id).toBe(false)
      }
    }
  })

  it('the shapes agree with what the texts say', () => {
    expect(at(epoch('681'), 'sofia')).toBe(false) // Serdica is taken only in 809
    expect(at(epoch('814'), 'sofia')).toBe(true)
    expect(at(epoch('927'), 'ohrid')).toBe(true)
    expect(at(epoch('1185'), 'plovdiv')).toBe(false) // only between the Danube and the Balkan Mountains
    expect(at(epoch('1230'), 'ohrid')).toBe(true)
    // 1878: the Principality has Sofia and Varna, but not Plovdiv (Eastern Rumelia) — San Stefano would have had both
    expect([at(epoch('1878'), 'sofia'), at(epoch('1878'), 'varna'), at(epoch('1878'), 'plovdiv')]).toEqual([true, true, false])
    expect(inRing(...CITY.plovdiv, epoch('1878').shape.planned![0]!)).toBe(true)
    expect(inRing(...CITY.ohrid, epoch('1878').shape.planned![0]!)).toBe(true)
    // 1885: the Unification brings Plovdiv; Pirin Macedonia comes in 1913
    expect([at(epoch('1885'), 'plovdiv'), at(epoch('1885'), 'blagoevgrad')]).toEqual([true, false])
    expect(at(epoch('1913'), 'blagoevgrad')).toBe(true)
    // Southern Dobruja: in until 1913, out 1913–1940, back in 1940
    expect(['1885', '1913', '1919', '1940'].map((id) => at(epoch(id), 'dobrich'))).toEqual([true, false, false, true])
  })

  it('texts for 4–6 year olds are one short sentence', () => {
    for (const e of EPOCHS) {
      expect(e.text.small.bg.length, e.id).toBeLessThanOrEqual(60)
      expect(e.text.small.en.length, e.id).toBeLessThanOrEqual(60)
    }
  })

  it('smooth path closes and has one curve per point', () => {
    const d = smoothClosedPath([[0, 0], [10, 0], [10, 10], [0, 10]])
    expect(d.startsWith('M0 0C')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d.match(/C/g)).toHaveLength(4)
  })
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useSettings.getState().reset()
  useProfiles.getState().reset()
  useProfiles.getState().setAge(12)
})
afterEach(cleanup)

describe('timeline screen', () => {
  it('moves through the years with the slider and the buttons', async () => {
    renderAt('/timeline')
    expect(await screen.findByRole('heading', { name: 'Линия на времето' })).toBeInTheDocument()
    expect(screen.getByText('681 г.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Раждането на България' })).toBeInTheDocument()
    expect(screen.getByText('Столица: Плиска')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'По-рано' })).toBeDisabled()

    const slider = screen.getByRole('slider', { name: 'Година' })
    expect(slider).toHaveAttribute('aria-valuetext', '681 г. – Раждането на България')
    fireEvent.change(slider, { target: { value: '3' } })
    expect(screen.getByText('1018 г.')).toBeInTheDocument()
    expect(screen.getByText('Няма българска държава')).toBeInTheDocument()
    expect(screen.queryByText(/Столица:/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'По-късно' }))
    expect(screen.getByText('1185 г.')).toBeInTheDocument()
    expect(screen.queryByText('Няма българска държава')).not.toBeInTheDocument()

    fireEvent.change(slider, { target: { value: String(EPOCHS.length - 1) } })
    expect(screen.getByText('1940 г.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'По-късно' })).toBeDisabled()
  })

  it('explains the dotted line only where there is one (1878)', async () => {
    renderAt('/timeline')
    const slider = await screen.findByRole('slider', { name: 'Година' })
    expect(screen.queryByText('Неосъществен договор')).not.toBeInTheDocument()
    fireEvent.change(slider, { target: { value: String(EPOCHS.findIndex((e) => e.id === '1878')) } })
    expect(screen.getByText('Неосъществен договор')).toBeInTheDocument()
  })

  it('tells it in words for the child\'s age', async () => {
    useProfiles.getState().setAge(5)
    renderAt('/timeline')
    expect(await screen.findByText(epoch('681').text.small.bg)).toBeInTheDocument()
    cleanup()
    useProfiles.getState().setAge(13)
    renderAt('/timeline')
    expect(await screen.findByText(epoch('681').text.guard.bg)).toBeInTheDocument()
  })

  it('is in English when the app is', async () => {
    useSettings.getState().setLang('en')
    renderAt('/timeline')
    expect(await screen.findByRole('heading', { name: 'Timeline' })).toBeInTheDocument()
    expect(screen.getByText('Capital: Pliska')).toBeInTheDocument()
    expect(screen.getByText(/Schematic map/)).toBeInTheDocument()
  })

  it('opens from the History list and from the map, not from other topics', async () => {
    renderAt('/topic/history')
    expect(await screen.findByRole('link', { name: /Линия на времето/ })).toHaveAttribute('href', '/timeline')
    cleanup()
    renderAt('/map')
    expect(await screen.findByRole('link', { name: /Линия на времето/ })).toHaveAttribute('href', '/timeline')
    cleanup()
    renderAt('/topic/culture')
    await screen.findByRole('heading', { name: 'Култура и традиции' })
    expect(screen.queryByRole('link', { name: /Линия на времето/ })).not.toBeInTheDocument()
  })
})
