import type { ReactNode } from 'react'
import { useT } from '../i18n/useT'

/** Official KOREN logo (design/logo, vector). `lg` = main lockup, `sm` = compact for headers. */
export function Logo({ size = 'lg', className = '' }: { size?: 'sm' | 'lg'; className?: string }) {
  const t = useT()
  return size === 'lg' ? (
    <img src={img('logo/koren.svg')} alt={t('app.name')} width={632} height={336} className={`h-auto w-44 select-none ${className}`} />
  ) : (
    <img src={img('logo/koren-compact.svg')} alt={t('app.name')} width={389} height={330} className={`h-10 w-auto select-none ${className}`} />
  )
}

/**
 * Toy-like backdrop: sky, a sun, drifting clouds, rounded hills and a small fortress.
 * Pure vector in the KOREN palette — sharp on every screen and costs no download.
 */
export function Scenery({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-hidden bg-gradient-to-b from-sky to-sky-soft ${className}`} aria-hidden="true">
      {/* sun with a soft halo */}
      <div className="absolute top-[9%] right-[9%] aspect-square w-[16%] min-w-12 rounded-full bg-gold shadow-[0_0_0_10px_rgb(255_211_90/0.35),0_0_0_22px_rgb(255_211_90/0.18)]" />
      {/* clouds */}
      <svg viewBox="0 0 400 120" className="anim-drift absolute top-[6%] left-0 w-full" focusable="false">
        <g fill="#fff">
          <path d="M36 54a14 14 0 0 1 14-14 18 18 0 0 1 34-4 15 15 0 0 1 22 13 12 12 0 0 1-2 24H44a12 12 0 0 1-8-19Z" opacity=".95" />
          <path d="M216 86a10 10 0 0 1 10-10 13 13 0 0 1 25-3 11 11 0 0 1 16 10 9 9 0 0 1-2 17h-42a9 9 0 0 1-7-14Z" opacity=".8" />
        </g>
      </svg>
      {/* hills + fortress */}
      <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[58%] w-full" focusable="false">
        <ellipse cx="320" cy="150" rx="210" ry="96" fill="#8ED4A6" />
        <g transform="translate(286 34)">
          <path d="M0 40V14h7v6h8v-6h8v6h8v-6h7v26Z" fill="#FFF7E3" />
          <path d="M12 40V28a7 7 0 0 1 14 0v12Z" fill="#E2AB1E" />
          <path d="M19 14V-6" stroke="#4A1410" strokeWidth="2" strokeLinecap="round" />
          <path d="M19-6h14l-4 5 4 5H19Z" fill="#FF655C" />
        </g>
        <ellipse cx="70" cy="158" rx="230" ry="92" fill="#3DAE74" />
        <ellipse cx="250" cy="176" rx="280" ry="84" fill="#138B50" />
      </svg>
    </div>
  )
}

/** Корен or Рая, full body, waving (design/characters/v2/*_wave.png, 240 px wide). */
export function HeroFigure({ hero, className = '' }: { hero: Hero; className?: string }) {
  return (
    <img
      src={img(`heroes/${hero}-wave.webp`)}
      alt=""
      width={240}
      height={hero === 'koren' ? 522 : 535}
      className={`pop-3d w-auto select-none ${className}`}
      fetchPriority="high"
      draggable={false}
    />
  )
}

export function Flag({ lang, className = 'w-7 h-5' }: { lang: 'bg' | 'en'; className?: string }) {
  if (lang === 'bg') {
    return (
      <svg viewBox="0 0 30 18" className={`${className} rounded-[3px] shadow-sm`} aria-hidden="true" focusable="false">
        <rect width="30" height="6" fill="#fff" />
        <rect y="6" width="30" height="6" fill="#00966E" />
        <rect y="12" width="30" height="6" fill="#D62612" />
        <rect width="30" height="18" fill="none" stroke="#0002" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 60 36" className={`${className} rounded-[3px] shadow-sm`} aria-hidden="true" focusable="false">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0l60 36M60 0 0 36" stroke="#fff" strokeWidth="7" />
      <path d="M0 0l60 36M60 0 0 36" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="11" />
      <path d="M30 0v36M0 18h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

/** URL of a file in public/img, respecting the GitHub Pages base path. */
export const img = (path: string) => `${import.meta.env.BASE_URL}img/${path}`

export type Hero = 'koren' | 'raya'
export type Mood = 'joy' | 'thoughtful' | 'surprise' | 'determination' | 'laughter'

/** Round portrait of a hero. Decorative: the speech text next to it carries the meaning. */
export function Avatar({ hero, mood, className = 'size-14' }: { hero: Hero; mood: Mood; className?: string }) {
  return (
    <img
      src={img(`heroes/${hero}-${mood}.webp`)}
      alt=""
      width={192}
      height={192}
      className={`shrink-0 rounded-full bg-white object-cover shadow-soft ring-[3px] ring-white ${className}`}
      decoding="async"
    />
  )
}

/** Embroidery ornaments (design/characters/42, 43) around a line of text. */
export function Ornamented({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <img src={img('ornaments/left.png')} alt="" width={56} height={57} className="size-5 shrink-0" />
      {children}
      <img src={img('ornaments/right.png')} alt="" width={56} height={56} className="size-5 shrink-0" />
    </div>
  )
}
