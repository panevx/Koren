import type { ReactNode } from 'react'
import type { SceneId } from '../content/schema'

/**
 * Soft, rounded backdrops for the interactive scenes, drawn in code (0 KB, sharp at any size).
 * The 3D objects from public/img/world stand on top of them. Each backdrop has a sky, a far layer
 * and a ground, so objects placed low look "on the ground" and objects placed high look "far away".
 */
const LOOK: Record<SceneId, { sky: [string, string]; far: string; mid: string; ground: [string, string]; extra?: ReactNode }> = {
  forest: {
    sky: ['#BFE7FB', '#E8F6EC'],
    far: '#7FC79A',
    mid: '#3FA56A',
    ground: ['#5DB97B', '#2E8B57'],
    extra: (
      <g opacity="0.5" fill="#1E7A48">
        <path d="M30 175 l18 -55 l18 55 z M70 180 l22 -70 l22 70 z M300 178 l20 -62 l20 62 z M345 182 l16 -48 l16 48 z" />
      </g>
    ),
  },
  mountain: {
    sky: ['#A8DCF7', '#EAF6FD'],
    far: '#A9B8C7',
    mid: '#7E93A8',
    ground: ['#8BC79A', '#4F9F6B'],
    extra: <path d="M150 92 l28 -42 l28 42 q-14 8 -28 0 q-14 8 -28 0 z" fill="#fff" opacity="0.9" />,
  },
  sea: {
    sky: ['#9FDBFA', '#E3F5FD'],
    far: '#5CB8E6',
    mid: '#3A9FD4',
    ground: ['#F6E2B3', '#EBC98A'],
    extra: (
      <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <path d="M40 150 q10 -6 20 0 t20 0 M220 140 q10 -6 20 0 t20 0 M300 162 q10 -6 20 0 t20 0" />
      </g>
    ),
  },
  village: {
    sky: ['#BCE6FA', '#FFF4DC'],
    far: '#9CD3A6',
    mid: '#6DBB82',
    ground: ['#8FD08F', '#5FAE6A'],
    extra: <path d="M170 300 q20 -60 50 -90 q20 -20 10 -40" stroke="#F3DDA8" strokeWidth="26" fill="none" strokeLinecap="round" />,
  },
  castle: {
    sky: ['#FFD9A0', '#FFF1D6'],
    far: '#D9B98A',
    mid: '#B9956A',
    ground: ['#9CCB7E', '#5E9F55'],
  },
  meadow: {
    sky: ['#B5E3FA', '#F0F9EE'],
    far: '#A6DCA0',
    mid: '#7CC77C',
    ground: ['#9BDB8B', '#62B465'],
    extra: (
      <g>
        {[
          [40, 250, '#FF8FA3'],
          [90, 270, '#FFD35A'],
          [330, 255, '#FF8FA3'],
          [280, 280, '#fff'],
          [150, 285, '#FFD35A'],
        ].map(([x, y, c]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill={c as string} />
        ))}
      </g>
    ),
  },
}

/** `quiet`: no sun and no extra details — for small framed worlds where a cropped sun or snow cap would look cut off. */
export function SceneBackdrop({ scene, className = '', quiet = false }: { scene: SceneId; className?: string; quiet?: boolean }) {
  const look = LOOK[scene]
  const id = `scene-${scene}`
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.sky[0]} />
          <stop offset="1" stopColor={look.sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.ground[0]} />
          <stop offset="1" stopColor={look.ground[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-sky)`} />
      {!quiet && <circle cx="340" cy="52" r="26" fill="#FFE27A" opacity="0.9" />}
      <path d="M0 150 Q60 95 120 135 T250 120 T400 135 V300 H0 Z" fill={look.far} />
      <path d="M0 185 Q90 140 190 172 T400 165 V300 H0 Z" fill={look.mid} />
      {!quiet && look.extra}
      <path d="M0 215 Q110 190 210 210 T400 205 V300 H0 Z" fill={`url(#${id}-ground)`} />
    </svg>
  )
}
