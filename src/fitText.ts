/**
 * Smaller letters instead of a broken word (v0.23.4).
 *
 * A word split over two lines („Аспару-х“, „Сер-гия“) is hard for a child to read. It happens only when a column is narrower
 * than the word — a tablet in the two-column layout with a big system font, a long word in a narrow card. Then the text
 * gets smaller, step by step, down to MIN of its size; everywhere else nothing changes (most screens: 0 broken words).
 *
 * How: every text node whose line count is larger than its word count holds a broken word. Its element gets `data-fit` and
 * `--fit-px` (index.css: `[data-fit] { font-size: var(--fit-px) !important }`) — never React's own `style`, so a re-render
 * does not undo it and undoing it does not touch React's values. Runs after each DOM change (new screen, next question),
 * on resize and when the font arrives; each run first undoes the old fitting, so a longer screen never keeps tiny letters.
 * Words of 12+ letters may still get a hyphen at MIN — that is the hyphenation rule in index.css.
 */
const MIN = 0.72
const STEP = 0.07

function brokenText(): Set<HTMLElement> {
  const out = new Set<HTMLElement>()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.textContent?.trim() ?? ''
    const el = n.parentElement
    if (text.length < 4 || !el || el.closest('svg, script, style, [aria-hidden="true"]')) continue
    range.selectNodeContents(n)
    const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)))
    if (tops.size > text.split(/\s+/).length) out.add(el)
  }
  return out
}

function fit() {
  for (const el of document.querySelectorAll<HTMLElement>('[data-fit]')) {
    el.removeAttribute('data-fit')
    el.style.removeProperty('--fit-px')
  }
  const base = new Map<HTMLElement, number>()
  for (let pass = 0; pass < Math.ceil((1 - MIN) / STEP); pass++) {
    const broken = brokenText()
    if (!broken.size) return
    for (const el of broken) {
      if (!base.has(el)) base.set(el, parseFloat(getComputedStyle(el).fontSize))
      const scale = Math.max(MIN, Number(el.dataset.fit ?? 1) - STEP)
      el.dataset.fit = scale.toFixed(2)
      el.style.setProperty('--fit-px', `${(base.get(el)! * scale).toFixed(2)}px`)
    }
  }
}

/** Starts watching (main.tsx). Not in tests: jsdom has no layout. */
export function startFitText() {
  if (typeof document === 'undefined' || typeof Range === 'undefined' || !('getClientRects' in Range.prototype)) return
  let queued = 0
  const later = () => {
    if (queued) return
    queued = requestAnimationFrame(() => {
      queued = 0
      observer.disconnect()
      fit()
      observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true })
    })
  }
  const observer = new MutationObserver(later)
  observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true })
  addEventListener('resize', later)
  void document.fonts?.ready.then(later)
  later()
}
