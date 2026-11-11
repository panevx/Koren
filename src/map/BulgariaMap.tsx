import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { useT } from '../i18n/useT'
import { BULGARIA_D, DANUBE_D, MAP_H, MAP_W, NEIGHBOURS_D } from './geo'

export type MapMarker = {
  id: string
  x: number
  y: number
  /** Accessible name. Must not give away the answer in a game (e.g. "Point 3"). */
  label: string
  content: ReactNode
  className?: string
  disabled?: boolean
}

type Props = {
  markers: MapMarker[]
  onSelect: (id: string) => void
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
export function BulgariaMap({ markers, onSelect, highlight, label }: Props) {
  const t = useT()
  const box = useRef<HTMLDivElement>(null)
  const markerRefs = useRef(new Map<string, HTMLElement>())
  const [view, setView] = useState<View>({ s: 1, tx: 0, ty: 0 })
  const viewRef = useRef(view)
  viewRef.current = view

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
        className="rounded-level relative w-full touch-none overflow-hidden border-2 border-sand bg-[#BFE8FB] select-none"
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
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 size-full" aria-hidden="true">
            <path d={NEIGHBOURS_D} fill="#EFE3D3" stroke="#D8C6AE" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            <path d={BULGARIA_D} fill="#9CCC65" stroke="#0B6B3E" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
            <path d={DANUBE_D} fill="none" stroke="#4FC3F7" strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {highlight && (
              <circle
                cx={highlight.x}
                cy={highlight.y}
                r={highlight.r}
                fill="#F4B400"
                fillOpacity={0.3}
                stroke="#F4B400"
                strokeWidth={3}
                strokeDasharray="10 8"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
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
              style={{ left: pct(m.x, MAP_W), top: pct(m.y, MAP_H), scale: `${1 / view.s}` }}
            >
              {m.content}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-left lies over Greece / North Macedonia, where no place marker can be — controls never hide a target. */}
      <div className="absolute bottom-2 left-2 flex gap-2" data-map-control>
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
      className="grid size-12 place-items-center rounded-full bg-white/95 text-2xl font-black text-green shadow-md disabled:opacity-40"
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
