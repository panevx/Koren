import { useState, type KeyboardEvent } from 'react'
import { img } from '../components/Brand'
import { PROVINCES, PROVINCE_FILL } from '../content/layers'
import type { PlateGame } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { RELIEF } from '../map/art'
import { BULGARIA_D } from '../map/geo'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { ART } from '../world'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { direction } from './Regions'

const VIEW = { x: 40, y: 45, w: 915, h: 600 }
/** Same digits and end letters for the same code, every time (the plate looks real but is made up). */
const tail = (code: string) => {
  const n = [...code].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9000, 7) + 1000
  const L = 'АВЕКМНОРСТУХ'
  return { digits: String(n), end: L[n % L.length]! + L[(n >> 3) % L.length]! }
}

/** A number plate: the blank plate picture + the code, digits and letters as text. */
function NumberPlate({ code }: { code: string }) {
  const { digits, end } = tail(code)
  return (
    // The picture is a square with the plate in the middle (860 × 320 of 1024): show only the plate.
    <div className="relative mx-auto aspect-[860/320] w-[min(18rem,76vw)] overflow-hidden" aria-hidden="true">
      <img
        src={img(ART.plate)}
        alt=""
        className="absolute top-1/2 max-w-none -translate-y-1/2 drop-shadow-md"
        style={{ width: `${(1024 / 860) * 100}%`, left: `${(-82 / 860) * 100}%` }}
      />
      <span className="absolute top-1/2 left-[6.8%] -translate-x-1/2 -translate-y-1/2 text-[length:min(0.85rem,3.4vw)] font-black text-white">BG</span>
      <span className="absolute inset-y-0 right-[3%] left-[12.5%] flex items-center justify-center gap-[0.3em] text-[length:min(1.9rem,7.6vw)] font-black tracking-wide whitespace-nowrap text-ink">
        <span className="rounded-md bg-gold/70 px-1">{code}</span>
        <span>{digits}</span>
        <span>{end}</span>
      </span>
    </div>
  )
}

/**
 * Number plates: a plate with a province code appears; the child taps that province on the map (or picks it with the
 * keyboard — every province is a button with its name). A wrong province: Raya says which way to look; the second time
 * the right one glows. Then the next plate.
 */
export function Plate({ game, onDone }: { game: PlateGame; onDone: () => void }) {
  const t = useT()
  const l = useLocalized()
  const [at, setAt] = useState(0)
  const [misses, setMisses] = useState(0)
  const [missHere, setMissHere] = useState(0)
  const [say, setSay] = useState<{ good: boolean; text: string } | undefined>()
  const done = at === game.plates.length
  const plate = game.plates[Math.min(at, game.plates.length - 1)]!
  const target = PROVINCES.find((p) => p.id === plate.region)!
  const found = new Set(game.plates.slice(0, at).map((p) => p.region))

  const pick = (id: string) => {
    if (done) return
    if (id === plate.region) {
      play('correct')
      setSay({ good: true, text: t('plate.good', { code: plate.code, name: l(target.name) }) })
      setAt((n) => n + 1)
      setMissHere(0)
      return
    }
    play('hint')
    const p = PROVINCES.find((x) => x.id === id)!
    setMisses((n) => n + 1)
    setMissHere((n) => n + 1)
    setSay({ good: false, text: t('plate.look', { name: l(p.name), dir: t(`dir.${direction(p.lx, p.ly, target.lx, target.ly)}`) }) })
  }
  const key = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(id)
    }
  }
  const glow = !done && missHere >= 2 ? plate.region : null

  return (
    <div className="flex flex-1 flex-col gap-3 side:grid side:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] side:content-start side:gap-x-4 side:[&>*]:col-start-1">
      <Prompt>{l(game.prompt)}</Prompt>
      {!done && (
        <m.div key={at} initial={{ y: -20, opacity: 0, rotate: -4 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={bouncy} className="flex flex-col items-center gap-1">
          <NumberPlate code={plate.code} />
          <p className="text-sm font-bold text-muted">{t('plate.count', { n: at + 1, total: game.plates.length })}</p>
          <p className="sr-only" aria-live="polite">{t('plate.sr', { code: plate.code })}</p>
        </m.div>
      )}
      <div className="mx-auto w-full max-w-[min(100%,calc((100dvh-20rem)*1.52))] side:col-start-2! side:row-span-4 side:row-start-1 side:max-w-[min(100%,calc((100dvh-6rem)*1.52))]">
        <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} role="group" aria-label={t('regions.map')} className="block w-full overflow-hidden rounded-[2rem] bg-[#A9DDF8] shadow-soft select-none" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
          <image href={img(RELIEF)} x={0} y={0} width={1000} height={690} preserveAspectRatio="none" opacity={0.8} />
          {PROVINCES.map((p) => {
            const got = found.has(p.id)
            const lit = glow === p.id
            return (
              <path
                key={p.id}
                d={p.d}
                fillRule="evenodd"
                role="button"
                tabIndex={0}
                aria-label={l(p.name)}
                onClick={() => pick(p.id)}
                onKeyDown={(e) => key(e, p.id)}
                fill={got ? PROVINCE_FILL[p.color % PROVINCE_FILL.length] : lit ? '#FFE9A8' : '#FFFDF6'}
                fillOpacity={got ? 0.9 : lit ? 0.95 : 0.35}
                stroke={lit ? '#E2AB1E' : '#0C6B3C'}
                strokeWidth={lit ? 4 : 1.2}
                vectorEffect="non-scaling-stroke"
                className={`cursor-pointer outline-none hover:fill-[#FFF4CF] focus-visible:[stroke-width:4] ${lit ? 'anim-glow' : ''}`}
                style={lit ? { transformBox: 'fill-box', transformOrigin: 'center' } : undefined}
              />
            )
          })}
          <path d={BULGARIA_D} fill="none" stroke="#0C6B3C" strokeWidth={2.5} vectorEffect="non-scaling-stroke" pointerEvents="none" />
        </svg>
      </div>
      <Feedback correct={done ? t('plate.done') : say?.good ? say.text : undefined} help={!done && say && !say.good ? say.text : undefined} nudge={misses} idle={t('plate.idle')} />
      {done && <DoneButton onClick={onDone} />}
    </div>
  )
}
