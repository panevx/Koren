import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { img } from '../components/Brand'
import { RELIEF } from './art'
import { useT } from '../i18n/useT'
import { BULGARIA_D, DANUBE_D, MAP_H, MAP_W, NEIGHBOURS_D } from './geo'

export type MapMarker = {
  /** false: the marker is a name, not an exact spot — no line to its true position when it moves aside. */
  leader?: boolean
  id: string
  x: number
  y: number
  /** Accessible name. Must not give away the answer in a game (e.g. "Point 3"). */
  label: string
  content: ReactNode
  className?: string
  disabled?: boolean
}

/** A text on the map that is not a button (a range, a sea, a country): keeps its size at every zoom. */
export type MapLabel = { id: string; x: number; y: number; text: string; className?: string }

type Props = {
  markers: MapMarker[]
  onSelect: (id: string) => void
  /** v0.15: shaded relief from real elevation data under the borders (the Discover map). Games keep the flat map. */
  relief?: boolean
  /** Extra SVG drawn in map units above the land (provinces, rivers, lakes). */
  layer?: ReactNode
  /** Texts that are not buttons. */
  labels?: MapLabel[]
  /** A tap where no marker is: the point in map units (e.g. "which province is here?"). */
  onMapTap?: (x: number, y: number) => void
  /** Optional circle (map units) drawn under the markers, e.g. the hint area. */
  highlight?: { x: number; y: number; r: number }
  /** Accessible description of the map. */
  label: string
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const TAP_SLOP = 8 // px a finger may move and still count as a tap
const HIT_RADIUS = 34 // px around a marker that still selects it

type View = { s: number; tx: number; ty: number }
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * Map of Bulgaria with pinch-zoom, drag, wheel zoom and +/− buttons.
 * Markers keep the same size on screen at every zoom level. A tap selects the
 * nearest marker within HIT_RADIUS, so close places stay tappable when zoomed in.
 * Every marker is also a real <button> for keyboard and screen-reader users.
 */
export function BulgariaMap({ markers, onSelect, highlight, label, relief = false, layer, labels = [], onMapTap }: Props) {
  const t = useT()
  const box = useRef<HTMLDivElement>(null)
  const markerRefs = useRef(new Map<string, HTMLElement>())
  const labelRefs = useRef(new Map<string, HTMLElement>())
  const [view, setView] = useState<View>({ s: 1, tx: 0, ty: 0 })
  const viewRef = useRef(view)
  viewRef.current = view

  // ── declutter: markers that would cover each other move apart (with a line to the true spot) ──
  const [frameW, setFrameW] = useState(0)
  const [sizes, setSizes] = useState<Record<string, Box>>({})
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      setFrameW(el.getBoundingClientRect().width)
      const next: Record<string, Box> = {}
      markerRefs.current.forEach((m, id) => (next[id] = m.offsetWidth === m.offsetHeight ? m.offsetWidth : { w: m.offsetWidth, h: m.offsetHeight }))
      // Labels take part too (as their real box), so a name never hides under a marker.
      labelRefs.current.forEach((m, id) => (next[`label:${id}`] = { w: m.offsetWidth, h: m.offsetHeight }))
      const same = (x: Box | undefined, y: Box) => JSON.stringify(x) === JSON.stringify(y)
      setSizes((old) => (Object.keys(next).length === Object.keys(old).length && Object.entries(next).every(([k, v]) => same(old[k], v)) ? old : next))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [markers, labels])
  const shrink = markerShrink(frameW)
  const placed = useMemo(
    () =>
      declutter(
        [...markers, ...labels.map((l) => ({ id: `label:${l.id}`, x: l.x, y: l.y }))],
        Object.fromEntries(
          Object.entries(sizes).map(([k, v]) => [k, k.startsWith('label:') ? v : typeof v === 'number' ? v * shrink : { w: v.w * shrink, h: v.h * shrink }]),
        ),
        frameW > 0 ? (frameW * view.s) / MAP_W : 0,
      ),
    [markers, labels, sizes, frameW, view.s, shrink],
  )

  const size = () => {
    const r = box.current?.getBoundingClientRect()
    return { w: r?.width ?? 0, h: r?.height ?? 0, left: r?.left ?? 0, top: r?.top ?? 0 }
  }

  /** Keep the map covering the frame: no panning into empty space. */
  const constrain = useCallback((v: View): View => {
    const { w, h } = size()
    const s = clamp(v.s, MIN_SCALE, MAX_SCALE)
    return { s, tx: clamp(v.tx, w - w * s, 0), ty: clamp(v.ty, h - h * s, 0) }
  }, [])

  /** Zoom to scale `s` keeping the screen point (px, py) — relative to the frame — fixed. */
  const zoomAt = useCallback(
    (s: number, px: number, py: number, from: View = viewRef.current) => {
      const ns = clamp(s, MIN_SCALE, MAX_SCALE)
      const cx = (px - from.tx) / from.s
      const cy = (py - from.ty) / from.s
      setView(constrain({ s: ns, tx: px - cx * ns, ty: py - cy * ns }))
    },
    [constrain],
  )

  // ── pointer gestures ────────────────────────────────────────────────
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ start: View; x: number; y: number; dist: number; moved: boolean; multi: boolean } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-map-control]')) return
    try {
      // Keeps receiving moves when the finger leaves the frame. Can throw if the pointer is already gone.
      box.current?.setPointerCapture?.(e.pointerId)
    } catch {
      /* the gesture still works without capture */
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    const mid = midpoint(pts)
    gesture.current = {
      start: viewRef.current,
      x: mid.x,
      y: mid.y,
      dist: pts.length > 1 ? distance(pts[0]!, pts[1]!) : 0,
      moved: gesture.current?.moved ?? false,
      multi: pts.length > 1 || (gesture.current?.multi ?? false),
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    const mid = midpoint(pts)
    if (!g.moved && Math.hypot(mid.x - g.x, mid.y - g.y) < TAP_SLOP && pts.length === 1) return
    g.moved = true
    const { left, top } = size()
    if (pts.length > 1 && g.dist > 0) {
      const scale = g.start.s * (distance(pts[0]!, pts[1]!) / g.dist)
      // Anchor: the map point that was under the starting midpoint follows the fingers.
      const cx = (g.x - left - g.start.tx) / g.start.s
      const cy = (g.y - top - g.start.ty) / g.start.s
      const ns = clamp(scale, MIN_SCALE, MAX_SCALE)
      setView(constrain({ s: ns, tx: mid.x - left - cx * ns, ty: mid.y - top - cy * ns }))
    } else {
      setView(constrain({ s: g.start.s, tx: g.start.tx + (mid.x - g.x), ty: g.start.ty + (mid.y - g.y) }))
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) {
      // One finger lifted during a pinch: restart from the remaining finger.
      const rest = [...pointers.current.values()][0]!
      gesture.current = { start: viewRef.current, x: rest.x, y: rest.y, dist: 0, moved: true, multi: true }
      return
    }
    gesture.current = null
    if (g && !g.moved && !g.multi) selectNearest(e.clientX, e.clientY)
  }

  const selectNearest = (x: number, y: number) => {
    let best: { id: string; d: number } | null = null
    for (const m of markers) {
      if (m.disabled) continue
      const el = markerRefs.current.get(m.id)
      if (!el) continue
      const r = el.getBoundingClientRect()
      const d = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y)
      if (d <= HIT_RADIUS && (!best || d < best.d)) best = { id: m.id, d }
    }
    if (best) onSelect(best.id)
    else if (onMapTap) {
      const { w, left, top } = size()
      const v = viewRef.current
      onMapTap((((x - left - v.tx) / v.s) * MAP_W) / w, (((y - top - v.ty) / v.s) * MAP_W) / w)
    }
  }

  // Wheel zoom (desktop). Non-passive so the page does not scroll.
  useEffect(() => {
    const el = box.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const { left, top } = size()
      zoomAt(viewRef.current.s * (e.deltaY < 0 ? 1.25 : 0.8), e.clientX - left, e.clientY - top)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const zoomButton = (factor: number) => {
    const { w, h } = size()
    zoomAt(viewRef.current.s * factor, w / 2, h / 2)
  }

  const pct = (v: number, of: number) => `${(v / of) * 100}%`

  return (
    <div className="relative">
      <div
        ref={box}
        role="group"
        aria-label={label}
        className="relative w-full touch-none overflow-hidden rounded-[2rem] bg-[#A9DDF8] [box-shadow:var(--elev-3)] select-none"
        style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute inset-0 origin-top-left"
          style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.s})` }}
        >
          {/* Real relief (scripts/build-relief.py): the land is painted by the picture, the SVG keeps only the lines. */}
          {relief && <img src={img(RELIEF)} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full" />}
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 size-full" aria-hidden="true">
            <path d={NEIGHBOURS_D} fill={relief ? 'none' : '#F4EEE0'} stroke="#DDD3BE" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <path d={BULGARIA_D} fill={relief ? 'none' : '#8ED4A6'} stroke="#0C6B3C" strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <path d={DANUBE_D} fill="none" stroke="#3D9FD1" strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {/* where a marker had to move aside: a thin line and a dot at the real place */}
            {markers.map((m) => {
              const q = placed[m.id]
              if (!q || m.leader === false || Math.hypot(q.x - m.x, q.y - m.y) < 2) return null
              return (
                <g key={`leader-${m.id}`}>
                  <line x1={m.x} y1={m.y} x2={q.x} y2={q.y} stroke="#0C6B3C" strokeWidth={2} strokeOpacity={0.7} vectorEffect="non-scaling-stroke" />
                  <circle cx={m.x} cy={m.y} r={5 / view.s} fill="#0C6B3C" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                </g>
              )
            })}
            {highlight && (
              <circle
                cx={highlight.x}
                cy={highlight.y}
                r={highlight.r}
                fill="#FFD35A"
                fillOpacity={0.3}
                stroke="#E2AB1E"
                strokeWidth={3}
                strokeDasharray="10 8"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {layer}
          </svg>
          {labels.map((l) => (
            <span
              key={l.id}
              ref={(el) => {
                if (el) labelRefs.current.set(l.id, el)
                else labelRefs.current.delete(l.id)
              }}
              aria-hidden="true"
              className={`pointer-events-none absolute w-max -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${l.className ?? ''}`}
              style={{ left: pct(placed[`label:${l.id}`]?.x ?? l.x, MAP_W), top: pct(placed[`label:${l.id}`]?.y ?? l.y, MAP_H), scale: `${1 / view.s}` }}
            >
              {l.text}
            </span>
          ))}
          {markers.map((m) => (
            <button
              key={m.id}
              ref={(el) => {
                if (el) markerRefs.current.set(m.id, el)
                else markerRefs.current.delete(m.id)
              }}
              type="button"
              aria-label={m.label}
              disabled={m.disabled}
              // Pointer taps are resolved by selectNearest(); this handles keyboard and assistive tech.
              onClick={(e) => {
                if (e.detail === 0) onSelect(m.id)
              }}
              className={`absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center ${m.className ?? ''}`}
              style={{ left: pct(placed[m.id]?.x ?? m.x, MAP_W), top: pct(placed[m.id]?.y ?? m.y, MAP_H), scale: `${shrink / view.s}` }}
            >
              {m.content}
            </button>
          ))}
        </div>
        {/* v0.26: the map lies under glass — a rim of light and a faint top-left reflection, drawn OVER the map (never
            catches taps), so the board reads as a physical table like the hub's diorama. */}
        <span className="rim-over pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden="true" />
      </div>

      {/* Under the map (not on it): the controls can never hide a place, a spot or a hint. */}
      <div className="mt-2 flex justify-end gap-2" data-map-control>
        <MapButton label={t('map.zoomIn')} onClick={() => zoomButton(1.6)} disabled={view.s >= MAX_SCALE}>
          +
        </MapButton>
        <MapButton label={t('map.zoomOut')} onClick={() => zoomButton(1 / 1.6)} disabled={view.s <= MIN_SCALE}>
          −
        </MapButton>
        {view.s > 1 && (
          <MapButton label={t('map.reset')} onClick={() => setView({ s: 1, tx: 0, ty: 0 })}>
            <Icon name="refresh" width="0.9em" height="0.9em" />
          </MapButton>
        )}
      </div>
    </div>
  )
}

function MapButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="lift mat-paper edge-light grid size-12 place-items-center rounded-full text-2xl font-black text-green-dark disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function midpoint(pts: { x: number; y: number }[]) {
  const n = pts.length || 1
  return { x: pts.reduce((a, p) => a + p.x, 0) / n, y: pts.reduce((a, p) => a + p.y, 0) / n }
}
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** On a narrow map the landmarks are drawn a little smaller (down to 62 %), so they have room. Taps still reach them (HIT_RADIUS). */
export function markerShrink(frameW: number) {
  return frameW > 0 ? Math.min(1, Math.max(0.62, frameW / 460)) : 1
}

/** Size of a marker or label on screen: a number = a square (round markers), or the real box of a name. */
export type Box = number | { w: number; h: number }

/**
 * Moves markers apart so none covers another on screen. Works in screen pixels (markers keep their size
 * at every zoom): `ppu` = screen px per map unit. Round markers (a number) are circles; names are their real box
 * (width × height) — a name is pushed away along the axis where it overlaps least. Little at a time,
 * with a soft pull back to the true spot, so an item moves only as far as needed. The frame edge is a wall.
 * Returns positions in map units. Without a measured frame (tests, first paint) nothing moves.
 */
export function declutter(markers: readonly { id: string; x: number; y: number }[], sizes: Record<string, Box>, ppu: number) {
  const out: Record<string, { x: number; y: number }> = {}
  for (const m of markers) out[m.id] = { x: m.x, y: m.y }
  if (!ppu) return out
  const box = (id: string) => {
    const b = sizes[id] ?? 0
    return typeof b === 'number' ? { w: b, h: b } : b
  }
  const pts = markers.map((m) => ({ id: m.id, ox: m.x * ppu, oy: m.y * ppu, x: m.x * ppu, y: m.y * ppu, ...box(m.id) }))
  const GAP = 4
  const W = MAP_W * ppu, H = MAP_H * ppu
  const inside = (p: (typeof pts)[number]) => {
    p.x = Math.min(W - p.w / 2, Math.max(p.w / 2, p.x))
    p.y = Math.min(H - p.h / 2, Math.max(p.h / 2, p.y))
  }
  // 80 rounds of "push apart + pull home", then up to 400 of pushing only, so the end result never overlaps.
  for (let it = 0; it < 480; it++) {
    let moved = false
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!, b = pts[j]!
        if (!a.w || !b.w) continue
        let dx = b.x - a.x
        let dy = b.y - a.y
        if (a.w === a.h && b.w === b.h) {
          // two round markers: circles (they pack best, and the frame corners stay usable)
          let d = Math.hypot(dx, dy)
          const need = (a.w + b.w) / 2 + GAP
          if (d >= need) continue
          if (d < 0.01) {
            dx = 1
            dy = 0.35
            d = Math.hypot(dx, dy)
          }
          const push = (need - d) / 2 + 0.01
          a.x -= (dx / d) * push
          a.y -= (dy / d) * push
          b.x += (dx / d) * push
          b.y += (dy / d) * push
          moved = true
          continue
        }
        const ox = (a.w + b.w) / 2 + GAP - Math.abs(dx)
        const oy = (a.h + b.h) / 2 + GAP - Math.abs(dy)
        if (ox <= 0 || oy <= 0) continue
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          dx = 1 // same spot: separate in a fixed direction (deterministic)
          dy = 0.35
        }
        if (ox < oy) {
          const push = ox / 2 + 0.01
          a.x -= Math.sign(dx) * push
          b.x += Math.sign(dx) * push
        } else {
          const push = oy / 2 + 0.01
          a.y -= Math.sign(dy || 1) * push
          b.y += Math.sign(dy || 1) * push
        }
        moved = true
      }
    // the frame edge is a wall: a marker pushed against it makes its neighbour move instead
    for (const p of pts) inside(p)
    if (it < 80)
      for (const p of pts) {
        p.x += (p.ox - p.x) * 0.04
        p.y += (p.oy - p.y) * 0.04
      }
    else if (!moved) break
  }
  for (const p of pts) {
    inside(p)
    out[p.id] = { x: p.x / ppu, y: p.y / ppu }
  }
  return out
}
