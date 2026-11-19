import { hasState, type Epoch } from '../content/timeline'
import { placeById } from '../content/places'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { BG_TODAY_D, DANUBE_WIDE_D, LAND_D, WIDE_H, WIDE_W } from './balkans'
import { projectWide, smoothClosedPath } from './wide'

const ringPath = (ring: [number, number][]) => smoothClosedPath(ring.map(([lat, lon]) => projectWide(lat, lon)))

/**
 * The Balkans with Bulgaria's territory in one epoch.
 * The territory is a mask: (today's borders, if `base`) + `add` − `remove`, clipped to the real coastline.
 * Epochs cross-fade (opacity only). Today's border is always drawn as a dashed line for comparison.
 */
export function TimelineMap({ epoch, label }: { epoch: Epoch; label: string }) {
  const t = useT()
  const l = useLocalized()
  const { shape } = epoch
  const capital = placeById(epoch.capital)
  const cap = capital ? projectWide(capital.lat, capital.lon) : null
  const state = hasState(epoch)
  const mask = `tl-mask-${epoch.id}`
  // The label goes to the left of the star when the capital is near the right edge.
  const labelLeft = cap ? cap[0] > WIDE_W * 0.62 : false

  return (
    // v0.26: an old map on a table — parchment land on a calm sea, under glass; the territory of the epoch is a raised
    // plate (a darker copy 7 units lower is its side), so it reads as a 2.5D piece laid on the map.
    <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(170deg,#c3e6f6,#a3d4ee)] [box-shadow:var(--elev-3)]" style={{ aspectRatio: `${WIDE_W} / ${WIDE_H}` }}>
      <svg viewBox={`0 0 ${WIDE_W} ${WIDE_H}`} className="absolute inset-0 size-full" role="img" aria-label={label}>
        <defs>
          <clipPath id="tl-land">
            <path d={LAND_D} />
          </clipPath>
          <radialGradient id="tl-parchment" cx="0.25" cy="0.1" r="1.1">
            <stop offset="0" stopColor="#FBF5E6" />
            <stop offset="1" stopColor="#EADDBE" />
          </radialGradient>
          <linearGradient id="tl-plate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF8A80" />
            <stop offset="1" stopColor="#F45E55" />
          </linearGradient>
        </defs>
        {/* the coast catches a little light: a pale rim under the parchment */}
        <path d={LAND_D} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={6} strokeLinejoin="round" />
        <path d={LAND_D} fill="url(#tl-parchment)" />

        <m.g key={epoch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <defs>
            <mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={WIDE_W} height={WIDE_H}>
              <rect width={WIDE_W} height={WIDE_H} fill="#000" />
              {shape.base && <path d={BG_TODAY_D} fill="#fff" />}
              {shape.add?.map((ring, i) => <path key={`a${i}`} d={ringPath(ring)} fill="#fff" />)}
              {shape.remove?.map((ring, i) => <path key={`r${i}`} d={ringPath(ring)} fill="#000" />)}
            </mask>
          </defs>
          {state && (
            <>
              {/* soft shadow, the plate's side, its lit top */}
              <g transform="translate(0 13)" opacity={0.16}>
                <rect width={WIDE_W} height={WIDE_H} fill="#342C18" mask={`url(#${mask})`} clipPath="url(#tl-land)" />
              </g>
              <g transform="translate(0 7)">
                <rect width={WIDE_W} height={WIDE_H} fill="#B8382F" mask={`url(#${mask})`} clipPath="url(#tl-land)" />
              </g>
              <rect width={WIDE_W} height={WIDE_H} fill="url(#tl-plate)" fillOpacity={0.94} mask={`url(#${mask})`} clipPath="url(#tl-land)" />
            </>
          )}
          {shape.planned?.map((ring, i) => (
            <path
              key={`p${i}`}
              d={ringPath(ring)}
              fill="#FF655C"
              fillOpacity={0.16}
              stroke="#C4352D"
              strokeWidth={5}
              strokeDasharray="4 12"
              strokeLinecap="round"
              clipPath="url(#tl-land)"
            />
          ))}
        </m.g>

        <path d={DANUBE_WIDE_D} fill="none" stroke="#3D9FD1" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        <path d={BG_TODAY_D} fill="none" stroke="#0A5230" strokeWidth={3.5} strokeDasharray="12 9" strokeLinejoin="round" />

        {cap && capital && (
          <m.g key={`${epoch.id}-capital`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            {/* the capital: a gold pin standing on the plate, with its own small shadow */}
            <ellipse cx={cap[0] + 3} cy={cap[1] + 15} rx={15} ry={6} fill="#342C18" opacity={0.22} />
            <circle cx={cap[0]} cy={cap[1]} r={18} fill="#E2AB1E" />
            <circle cx={cap[0]} cy={cap[1] - 2} r={16} fill="#FFD35A" stroke="#fff" strokeWidth={3} />
            <circle cx={cap[0] - 5} cy={cap[1] - 8} r={5} fill="#fff" opacity={0.55} />
            <circle cx={cap[0]} cy={cap[1] - 2} r={5} fill="#1C2B23" />
            <text
              x={cap[0] + (labelLeft ? -26 : 26)}
              y={cap[1] + 12}
              textAnchor={labelLeft ? 'end' : 'start'}
              fontSize={36}
              fontWeight={900}
              fill="#1C2B23"
              stroke="#fff"
              strokeWidth={8}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {l(capital.name)}
            </text>
          </m.g>
        )}
      </svg>
      <span className="rim-over pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden="true" />

      {!state && (
        <m.p
          key={`${epoch.id}-none`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mat-glass absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full px-4 py-2 text-center font-extrabold"
        >
          {t('timeline.noState')}
        </m.p>
      )}
    </div>
  )
}
