import { useSyncExternalStore } from 'react'

/** The same query as the `wide:` variant in index.css (tablet sideways, computer). */
const WIDE = '(min-width: 1024px) and (min-height: 600px)'

const query = () => (typeof window !== 'undefined' ? window.matchMedia?.(WIDE) : undefined)

/**
 * True when the `wide:` layout is on. For the rare piece that must move to ANOTHER PLACE in the tree (not just restyle):
 * rendering it twice and hiding one copy with CSS would put two identical links in front of screen readers.
 */
export function useWide(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const q = query()
      q?.addEventListener('change', onChange)
      return () => q?.removeEventListener('change', onChange)
    },
    () => query()?.matches ?? false,
    () => false,
  )
}
