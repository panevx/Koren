import { useRef, type PointerEvent, type MouseEvent } from 'react'

/**
 * Drag & drop for the games, with the same rules everywhere:
 * - Drag a thing with a finger or the mouse onto any element marked `data-drop="<id>"`.
 * - A plain tap is NOT a drag: it reaches the element's own onClick (tap-to-select, then tap a target),
 *   so every game also works with one finger, a keyboard or a screen reader.
 * Only `transform` is changed while dragging (smooth on phones). The drop target under the finger gets
 * `data-over="true"` so it can light up. `onDrop` also gets the screen point where the finger let go
 * (the provinces puzzle forgives a drop just next to a tiny province).
 */
/** Small targets (spots on a map) marked `data-drop-reach` also take a drop that lands just next to them. */
export const DROP_REACH_PX = 30
function nearTarget(x: number, y: number) {
  let best: { el: Element; d: number } | null = null
  for (const el of document.querySelectorAll('[data-drop][data-drop-reach]')) {
    const r = el.getBoundingClientRect()
    const d = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom))
    if (d <= DROP_REACH_PX && (!best || d < best.d)) best = { el, d }
  }
  return best?.el ?? null
}

export function useDrag(onDrop: (id: string, target: string, at: { x: number; y: number }) => void) {
  const state = useRef<{ id: string; el: HTMLElement; x: number; y: number; dragging: boolean; over: Element | null } | null>(null)
  const justDragged = useRef(false)

  const targetAt = (x: number, y: number) => document.elementFromPoint(x, y)?.closest('[data-drop]') ?? nearTarget(x, y)

  const end = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const s = state.current
    state.current = null
    if (!s) return
    s.over?.removeAttribute('data-over')
    if (!s.dragging) return
    const target = cancelled ? null : targetAt(e.clientX, e.clientY)
    s.el.style.transition = 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    s.el.style.transform = ''
    s.el.style.zIndex = ''
    s.el.style.pointerEvents = ''
    delete s.el.dataset.dragging
    justDragged.current = true
    setTimeout(() => (justDragged.current = false), 0)
    const id = target?.getAttribute('data-drop')
    if (id) onDrop(s.id, id, { x: e.clientX, y: e.clientY })
  }

  return (id: string, enabled = true) =>
    enabled
      ? {
          onPointerDown: (e: PointerEvent<HTMLElement>) => {
            if (e.button !== 0) return
            state.current = { id, el: e.currentTarget, x: e.clientX, y: e.clientY, dragging: false, over: null }
          },
          onPointerMove: (e: PointerEvent<HTMLElement>) => {
            const s = state.current
            if (!s) return
            const dx = e.clientX - s.x
            const dy = e.clientY - s.y
            if (!s.dragging) {
              if (Math.hypot(dx, dy) < 8) return
              s.dragging = true
              try {
                s.el.setPointerCapture(e.pointerId)
              } catch {
                /* old browsers: dragging still works while the finger stays on the element */
              }
              s.el.style.transition = 'none'
              s.el.style.zIndex = '40'
              s.el.style.pointerEvents = 'none' // so the drop target under the finger can be found
              s.el.dataset.dragging = 'true' // lifted: a long shadow (index.css)
            }
            s.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.12) rotate(-3deg)`
            const over = targetAt(e.clientX, e.clientY)
            if (over !== s.over) {
              s.over?.removeAttribute('data-over')
              over?.setAttribute('data-over', 'true')
              s.over = over
            }
          },
          onPointerUp: (e: PointerEvent<HTMLElement>) => end(e, false),
          onPointerCancel: (e: PointerEvent<HTMLElement>) => end(e, true),
          // A drag that ends on the element itself must not also count as a tap.
          onClickCapture: (e: MouseEvent<HTMLElement>) => {
            if (justDragged.current) {
              e.preventDefault()
              e.stopPropagation()
            }
          },
          style: { touchAction: 'none' as const },
        }
      : {}
}
