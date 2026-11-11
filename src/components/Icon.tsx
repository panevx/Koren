import type { SVGProps } from 'react'

/** Line icons for UI chrome (nav, buttons). Decorative: hidden from screen readers. */
const paths = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h5v-6h3v6h5V10',
  map: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  flag: 'M5 21V4m0 0h11l-2 4 2 4H5',
  star: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z',
  gear: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.4-3.2-.1-1.2 2-1.6-2-3.4-2.4.9a7.6 7.6 0 0 0-2-1.2L14.5 3h-5l-.4 2.5a7.6 7.6 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.6a7.7 7.7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-.9c.6.5 1.3.9 2 1.2l.4 2.5h5l.4-2.5c.7-.3 1.4-.7 2-1.2l2.4.9 2-3.4-2-1.6.1-1.2Z',
  back: 'M15 5l-7 7 7 7',
  chevron: 'M9 5l7 7-7 7',
  play: 'M8 5.5v13l10.5-6.5Z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.3 2.7-6 6-6s6 2.7 6 6m1-9.2a3 3 0 1 0-1-5.8M17 14c2.4.4 4 2.6 4 5',
  sound: 'M4 9.5v5h3.5L12 19V5L7.5 9.5Zm12-.5a4.5 4.5 0 0 1 0 6m2.5-8.5a8 8 0 0 1 0 11',
  save: 'M5 4h11l3 3v13H5Zm3 0v5h7V4M8 20v-6h8v6',
  refresh: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4m4 4a8 8 0 0 1-14 5.3M4 20v-4h4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const filled = name === 'play'
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.5em"
      height="1.5em"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
