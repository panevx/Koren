/** Adjust the size of compact card labels when a single word exceeds the card. */
export function startFitText() {
  if (typeof Range === 'undefined' || !('getClientRects' in Range.prototype)) return
  const root = document.getElementById('root')
  if (!root) return
  const range = document.createRange()
  const fit = () => {
    const labels = root.querySelectorAll<HTMLElement>('[data-fit-label]')
    for (const label of labels) {
      label.removeAttribute('data-fit')
      label.style.removeProperty('--fit-px')
    }
    const adjustments = []
    for (const label of labels) {
      if (!label.textContent?.trim()) continue
      range.selectNodeContents(label)
      const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)))
      if (lines.size <= label.textContent.trim().split(/\s+/).length) continue
      const fontSize = parseFloat(getComputedStyle(label).fontSize)
      // Never shrink below 1rem. Long labels can wrap normally at the floor.
      if (fontSize > 16) adjustments.push([label, Math.max(16, fontSize * 0.9)] as const)
    }
    for (const [label, size] of adjustments) {
      label.dataset.fit = ''
      label.style.setProperty('--fit-px', `${size}px`)
    }
  }

  let queued = 0
  const schedule = () => {
    if (queued) return
    queued = requestAnimationFrame(() => {
      queued = 0
      fit()
    })
  }
  new MutationObserver(schedule).observe(root, { childList: true, characterData: true, subtree: true })
  addEventListener('resize', schedule)
  void document.fonts?.ready.then(schedule)
  schedule()
}
