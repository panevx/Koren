/**
 * Small colourful SVG illustrations in the KOREN palette.
 * Vector on purpose: sharp on every screen and recoloured from one place.
 * All are decorative (aria-hidden); the visible label carries the meaning.
 */
import type { ReactElement } from 'react'

type ArtProps = { className?: string }

const svg = (children: ReactElement, className?: string) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
)

export function MapArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M6 18 22 12l20 6 16-6v34l-16 6-20-6-16 6Z" fill="#7CB342" />
      <path d="M22 12v34m20-28v34" stroke="#0B6B3E" strokeWidth="2" opacity=".5" />
      <path d="M10 34c6-6 12 2 18-4s14 2 22-6" stroke="#4FC3F7" strokeWidth="3" fill="none" />
      <path d="M32 40s-9-8.5-9-15a9 9 0 0 1 18 0c0 6.5-9 15-9 15Z" fill="#C62828" />
      <circle cx="32" cy="25" r="3.5" fill="#fff" />
    </g>,
    className,
  )
}

export function CastleArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M8 56h48" stroke="#7CB342" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 56V26h-3v-8h5v4h3v-4h4v4h3v-4h5v8h-3v30Z" fill="#C9B79C" />
      <path d="M30 56V14h-3V6h5v4h3V6h4v4h3V6h5v8h-3v42Z" fill="#B59F80" />
      <path d="M36 56v-9a3 3 0 0 1 6 0v9Z" fill="#6B4F2E" />
      <path d="M18 34h4v6h-4z" fill="#6B4F2E" />
      <path d="M39 2v6" stroke="#6B4F2E" strokeWidth="1.5" />
      <path d="M39.5 2h7v2.2h-7z" fill="#fff" />
      <path d="M39.5 4.2h7v2.2h-7z" fill="#0B6B3E" />
      <path d="M39.5 6.4h7v2.2h-7z" fill="#C62828" />
    </g>,
    className,
  )
}

export function ShevitsaArt({ className }: ArtProps) {
  // Eight-point rose motif from Bulgarian embroidery.
  return svg(
    <g>
      <g fill="#C62828">
        <path d="M32 4 38 18H26Z" />
        <path d="M32 60 26 46h12Z" />
        <path d="M4 32 18 26v12Z" />
        <path d="M60 32 46 38V26Z" />
        <path d="m12 12 14 6-8 8Z" />
        <path d="m52 52-14-6 8-8Z" />
        <path d="m52 12-6 14-8-8Z" />
        <path d="m12 52 6-14 8 8Z" />
      </g>
      <rect x="22" y="22" width="20" height="20" transform="rotate(45 32 32)" fill="#0B6B3E" />
      <rect x="27" y="27" width="10" height="10" transform="rotate(45 32 32)" fill="#F4B400" />
    </g>,
    className,
  )
}

export function BookArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M6 14c9-3 18-2 26 3v38c-8-5-17-6-26-3Z" fill="#fff" stroke="#0B6B3E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 14c-9-3-18-2-26 3v38c8-5 17-6 26-3Z" fill="#fff" stroke="#0B6B3E" strokeWidth="3" strokeLinejoin="round" />
      <rect x="10" y="7" width="44" height="10" rx="2" fill="#C62828" />
      <text x="32" y="15" textAnchor="middle" fontSize="8" fontWeight="900" fill="#fff" fontFamily="inherit">
        АБВ
      </text>
      <path d="M12 26h14M12 32h14M12 38h10M38 26h14M38 32h14M38 38h10" stroke="#7CB342" strokeWidth="2.5" strokeLinecap="round" />
    </g>,
    className,
  )
}

export function GamepadArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M18 20h28c7 0 11 6 12 16 1 9-2 14-7 14-4 0-6-4-9-7H22c-3 3-5 7-9 7-5 0-8-5-7-14 1-10 5-16 12-16Z" fill="#0B6B3E" />
      <path d="M17 29v10m-5-5h10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="44" cy="30" r="3" fill="#F4B400" />
      <circle cx="50" cy="36" r="3" fill="#C62828" />
      <circle cx="38" cy="36" r="3" fill="#4FC3F7" />
      <circle cx="44" cy="42" r="3" fill="#7CB342" />
    </g>,
    className,
  )
}

export function TrophyArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M18 8h28v14a14 14 0 0 1-28 0Z" fill="#F4B400" />
      <path d="M18 12H8c0 9 4 14 11 15M46 12h10c0 9-4 14-11 15" stroke="#F4B400" strokeWidth="4" fill="none" />
      <path d="M28 36h8v8h-8z" fill="#D49A00" />
      <path d="M20 44h24v8H20z" fill="#C62828" />
      <path d="M16 52h32v5H16z" fill="#8E1D1D" />
      <path d="m32 13 2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7Z" fill="#fff" />
    </g>,
    className,
  )
}

export function BearArt({ className }: ArtProps) {
  return svg(
    <g>
      <circle cx="16" cy="16" r="8" fill="#B07A44" />
      <circle cx="48" cy="16" r="8" fill="#B07A44" />
      <circle cx="32" cy="32" r="20" fill="#C68B52" />
      <ellipse cx="32" cy="40" rx="9" ry="7" fill="#EAD9C4" />
      <circle cx="25" cy="29" r="2.6" fill="#1F2A24" />
      <circle cx="39" cy="29" r="2.6" fill="#1F2A24" />
      <ellipse cx="32" cy="37" rx="3" ry="2.2" fill="#1F2A24" />
      <path d="M29 42q3 2.5 6 0" stroke="#1F2A24" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>,
    className,
  )
}

export function CompassArt({ className }: ArtProps) {
  return svg(
    <g>
      <circle cx="32" cy="34" r="24" fill="#F4B400" />
      <circle cx="32" cy="34" r="19" fill="#fff" />
      <rect x="28" y="4" width="8" height="7" rx="2" fill="#D49A00" />
      <path d="m32 18 5 16h-10Z" fill="#C62828" />
      <path d="m32 50-5-16h10Z" fill="#0B6B3E" />
      <circle cx="32" cy="34" r="2.5" fill="#1F2A24" />
    </g>,
    className,
  )
}

export function HelmetArt({ className }: ArtProps) {
  return svg(
    <g>
      <path d="M12 40c0-16 9-28 20-28s20 12 20 28v10H40V38H24v12H12Z" fill="#8A97A0" />
      <path d="M30 12h4v40h-4z" fill="#6B7780" />
      <path d="M12 40h12v12H12zM40 40h12v12H40z" fill="#6B7780" />
      <path d="M32 4c4 0 6 3 6 8h-12c0-5 2-8 6-8Z" fill="#C62828" />
      <path d="M18 30c3-8 8-12 14-13" stroke="#C7D0D6" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>,
    className,
  )
}
