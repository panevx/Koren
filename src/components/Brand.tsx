import { useT } from '../i18n/useT'

/** KOREN wordmark: green mountains, red embroidery star, red swoosh. */
export function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const t = useT()
  const big = size === 'lg'
  return (
    <div className="flex flex-col items-center leading-none select-none">
      <svg
        viewBox="0 0 120 34"
        className={big ? 'w-40' : 'w-20'}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M14 34 44 4l14 14L72 2l34 32Z" fill="#0B6B3E" />
        <path d="m44 4-8 9 8-3 6 4Zm28-2-7 9 7-3 6 3Z" fill="#fff" />
        <g fill="#C62828" transform="translate(12 8)">
          <path d="M0-7 2-2H-2Z M0 7l-2-5h4Z M-7 0l5-2v4Z M7 0 2 2v-4Z" />
          <rect x="-2" y="-2" width="4" height="4" transform="rotate(45)" />
        </g>
      </svg>
      <span
        className={`font-black tracking-tight text-green ${big ? 'text-5xl -mt-1' : 'text-xl'}`}
      >
        {t('app.name')}
      </span>
      <svg viewBox="0 0 120 8" className={big ? 'w-44 -mt-1' : 'w-20'} aria-hidden="true" focusable="false">
        <path d="M4 6C40 0 80 0 116 4" stroke="#C62828" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/** Sky, Balkan mountains, a fortress and green hills — the KOREN backdrop. */
export function Landscape({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFE8FB" />
          <stop offset="1" stopColor="#FBF7F0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" />
      <path d="M0 140 60 80l40 30 60-60 50 45 40-30 70 55 80-40v140H0Z" fill="#A9C7B0" />
      <path d="m160 50 18 18-10-3-8 8-6-9-10 3Z" fill="#fff" opacity=".9" />
      <path d="M0 160c60-30 120-30 180-10s120 10 220-30v100H0Z" fill="#7CB342" />
      <g fill="#C9B79C">
        <path d="M284 128v-34h-4v-8h6v4h4v-4h5v4h4v-4h6v8h-4v34Z" />
        <path d="M306 128v-48h-5v-9h6v5h4v-5h5v5h4v-5h6v9h-5v48Z" />
        <path d="M262 132v-18h52v18Z" />
      </g>
      <path d="M0 190c80-30 160-20 240 0s120 0 160-15v45H0Z" fill="#0B6B3E" />
    </svg>
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

export function Heroes({ className = '' }: { className?: string }) {
  const t = useT()
  // Placeholder cropped from the design board until the ChatGPT character sheet exists.
  return (
    <img
      src={`${import.meta.env.BASE_URL}img/heroes/koren-raya-placeholder.webp`}
      alt={t('hero.alt')}
      width={400}
      height={238}
      className={className}
      decoding="async"
    />
  )
}
