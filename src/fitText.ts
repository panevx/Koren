/**
 * Smaller letters instead of a broken word.
 *
 * A heading or label split inside a word („Пътешествени-к“, „прик-лючения“) is hard for a child to read. fitWords() sizes
 * most titles in advance, but a phone's own text scaling (Android: Settings → Accessibility → Font size) enlarges the
 * letters after CSS has decided — so here the REAL layout is measured: every word of every heading and label is checked,
 * and the text that still has a word over two lines gets smaller, step by step, down to MIN of its size.
 *
 * Only headings and labels (TARGETS) — body text may keep its normal hyphen for a 12+ letter word (index.css).
 * The size goes in `--fit-px` + `data-fit` (index.css: `[data-fit] { font-size: var(--fit-px) !important }`), never in
 * React's own `style`. Each run first undoes the old fitting, so a new screen never keeps tiny letters.
 */
const TARGETS = 'h1, h2, h3, [data-fit-label], .text-display, .text-title, .text-headline, .text-heading'
const MIN = 0.62
const STEP = 0.06
const FLOOR = 10

/** True when one word of the element's own text lies on more than one line. */
function hasBrokenWord(el: HTMLElement, range: Range): boolean {
  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const text = node.textContent ?? ''
    for (const match of text.matchAll(/\S{2,}/g)) {
      range.setStart(node, match.index)
      range.setEnd(node, match.index + match[0].length)
      const rects = range.getClientRects()
      if (rects.length < 2) continue
      const top = Math.round(rects[0]!.top)
      for (const r of rects) if (r.width > 0 && Math.abs(Math.round(r.top) - top) > 2) return true
    }
  }
  return false
}

/** The elements that hold the text of a heading or label (the heading itself, or the spans inside it). */
function textHolders(root: HTMLElement): HTMLElement[] {
  const out = new Set<HTMLElement>()
  for (const target of root.querySelectorAll<HTMLElement>(TARGETS)) {
    if (target.closest('svg, [aria-hidden="true"]')) continue
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if ((n.textContent ?? '').trim().length >= 2 && n.parentElement) out.add(n.parentElement)
    }
  }
  return [...out]
}

export function startFitText() {
  if (typeof Range === 'undefined' || !('getClientRects' in Range.prototype)) return
  const root = document.getElementById('root')
  if (!root) return
  const range = document.createRange()
  let observer: MutationObserver | undefined

  const fit = () => {
    observer?.disconnect()
    for (const el of root.querySelectorAll<HTMLElement>('[data-fit]')) {
      el.removeAttribute('data-fit')
      el.style.removeProperty('--fit-px')
    }
    let todo = textHolders(root).filter((el) => hasBrokenWord(el, range))
    const base = new Map(todo.map((el) => [el, parseFloat(getComputedStyle(el).fontSize)]))
    for (let scale = 1 - STEP; todo.length && scale >= MIN - 0.001; scale -= STEP) {
      // never below FLOOR px: at that size a hyphen reads better than even tinier letters
      todo = todo.filter((el) => base.get(el)! * scale >= FLOOR)
      for (const el of todo) {
        el.dataset.fit = ''
        el.style.setProperty('--fit-px', `${(base.get(el)! * scale).toFixed(2)}px`)
      }
      todo = todo.filter((el) => hasBrokenWord(el, range))
    }
    observer?.observe(root, OPTIONS)
  }

  let queued = 0
  const schedule = () => {
    if (queued) return
    queued = requestAnimationFrame(() => {
      queued = 0
      fit()
    })
  }
  const OPTIONS: MutationObserverInit = { childList: true, characterData: true, subtree: true }
  observer = new MutationObserver(schedule)
  observer.observe(root, OPTIONS)
  addEventListener('resize', schedule)
  void document.fonts?.ready.then(schedule)
  schedule()
}
