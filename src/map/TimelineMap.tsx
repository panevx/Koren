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
    <div className="relative overflow-hidden rounded-[2rem] bg-[#A9DDF8] shadow-soft" style={{ aspectRatio: `${WIDE_W} / ${WIDE_H}` }}>
      <svg viewBox={`0 0 ${WIDE_W} ${WIDE_H}`} className="absolute inset-0 size-full" role="img" aria-label={label}>
        <defs>
          <clipPath id="tl-land">
            <path d={LAND_D} />
          </clipPath>
        </defs>
        <path d={LAND_D} fill="#F4EEE0" />

        <m.g key={epoch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
          <defs>
            <mask id={mask} maskUnits="userSpaceOnUse" x={0} y={0} width={WIDE_W} height={WIDE_H}>
              <rect width={WIDE_W} height={WIDE_H} fill="#000" />
              {shape.base && <path d={BG_TODAY_D} fill="#fff" />}
              {shape.add?.map((ring, i) => <path key={`a${i}`} d={ringPath(ring)} fill="#fff" />)}
              {shape.remove?.map((ring, i) => <path key={`r${i}`} d={ringPath(ring)} fill="#000" />)}
            </mask>
          </defs>
          {state && <rect width={WIDE_W} height={WIDE_H} fill="#FF655C" fillOpacity={0.82} mask={`url(#${mask})`} clipPath="url(#tl-land)" />}
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
            <circle cx={cap[0]} cy={cap[1]} r={17} fill="#FFD35A" stroke="#1C2B23" strokeWidth={4} />
            <circle cx={cap[0]} cy={cap[1]} r={5} fill="#1C2B23" />
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

      {!state && (
        <m.p
          key={`${epoch.id}-none`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-center font-extrabold shadow-float"
        >
          {t('timeline.noState')}
        </m.p>
      )}
    </div>
  )
}
