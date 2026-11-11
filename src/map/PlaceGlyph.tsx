import type { PlaceIcon } from '../content/schema'

/** Simple pictograms for places — let 4–6-year-olds match a picture instead of reading a name. */
const GLYPHS: Record<PlaceIcon, string> = {
  fortress: 'M4 21V9h2.5V6.5H9V9h2V6.5h2V9h2V6.5h2.5V9H20v12h-5.5v-4.5a2.5 2.5 0 0 0-5 0V21Z',
  city: 'M3 21V11l5-3v13Zm6 0V4h7v17Zm8 0V9h4v12ZM11 7h1.5v1.5H11Zm2.5 0H15v1.5h-1.5ZM11 11h1.5v1.5H11Zm2.5 0H15v1.5h-1.5Z',
  sea: 'M2 9c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5 0v3c-1.5-1.5-3.5-1.5-5 0s-5 2-7.5 0-5-2-7.5 0Zm0 7c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5 0v3c-1.5-1.5-3.5-1.5-5 0s-5 2-7.5 0-5-2-7.5 0Z',
  monastery: 'M11 2h2v2h2v2h-2v2.2a4 4 0 0 1 3.5 3.8H19v9h-4.5v-4a2.5 2.5 0 0 0-5 0v4H5v-9h2.5A4 4 0 0 1 11 8.2V6H9V4h2Z',
  mountain: 'M1 21 9 7l4 6.5L16 9l7 12Zm8-14-2 3.5 2-.8 1.8 1Z',
  rose: 'M12 3a5 5 0 0 1 5 5c0 3-2.2 5-5 5s-5-2-5-5a5 5 0 0 1 5-5Zm-1 10h2v8h-2Zm2 3c1.5-2 4-2.5 6-1.5-1 2-3.5 3-6 3Zm-2 0c-1.5-2-4-2.5-6-1.5 1 2 3.5 3 6 3Z',
  house: 'M2.5 11.5 12 3.5l9.5 8-1.3 1.5-1.2-1V21h-5.5v-5.5h-3V21H5v-9l-1.2 1Z',
  rock: 'M3 21 6 9l3 2 2-7 4 4 2-2 4 15Z',
}

export function PlaceGlyph({ icon, className = 'size-6' }: { icon: PlaceIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d={GLYPHS[icon]} fillRule="evenodd" />
    </svg>
  )
}
