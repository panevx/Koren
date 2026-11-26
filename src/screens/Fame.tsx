import { useState } from 'react'
import { Link } from 'react-router'
import { img } from '../components/Brand'
import { Screen, TopBar } from '../components/ui'
import { FAME, FIELDS } from '../content/fame'
import { useChildMissions } from '../content/useChildMissions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { activeProfile, useProfiles } from '../store/profiles'

/**
 * Hall of Fame: scientists, cosmonauts and athletes. A card lights up (and tells its story when tapped) once the child
 * has played its mission; until then it is a soft silhouette with a link to that mission. Only people whose mission
 * this child can see are shown (drafts are hidden in the family build).
 */
export function Fame() {
  const t = useT()
  const l = useLocalized()
  const missions = useChildMissions()
  const done = useProfiles(activeProfile).done
  const [open, setOpen] = useState<string | null>(null)
  const people = FAME.filter((p) => missions.some((x) => x.id === p.mission))
  const lit = people.filter((p) => done[p.mission]).length

  return (
    <Screen nav wide>
      <TopBar title={t('fame.title')} />
      <div className="flex flex-col gap-5 px-4 pb-3 short:pb-8 wide:pb-10">
        <p className="fill-satin tint-gold edge-light rounded-[var(--radius-card)] px-4 py-3 text-center font-bold">{people.length ? t('fame.intro', { n: lit, total: people.length }) : t('empty.text')}</p>
        {FIELDS.map((field) => {
          const list = people.filter((p) => p.field === field)
          if (!list.length) return null
          return (
            <section key={field} aria-labelledby={`fame-${field}`} className="flex flex-col gap-3">
              <h2 id={`fame-${field}`} className="text-headline px-1">
                {t(`fame.field.${field}`)}
              </h2>
              <ul className="grid grid-cols-2 gap-3 wide:grid-cols-[repeat(auto-fill,minmax(min(13rem,100%),1fr))]">
                {list.map((p) => {
                  const on = Boolean(done[p.mission])
                  const mission = missions.find((x) => x.id === p.mission)!
                  return (
                    <li key={p.id} className="[container-type:inline-size]">
                      {on ? (
                        <button
                          type="button"
                          onClick={() => setOpen(open === p.id ? null : p.id)}
                          aria-expanded={open === p.id}
                          className="edge-light relative press flex h-full w-full flex-col items-center gap-1.5 rounded-[var(--radius-card)] mat-paper p-3 text-center"
                        >
                          <span className="relative grid place-items-center px-2 pb-1">
                            <span className="pedestal tint-paper absolute bottom-0 left-1/2 h-[24%] w-[88%] -translate-x-1/2" aria-hidden="true" />
                            <img src={img(p.img)} alt="" className="pop-3d relative size-[min(5rem,30cqw)] object-contain" />
                          </span>
                          <span className="text-[length:clamp(0.55rem,8.5cqw,1.05rem)] leading-tight font-black">{l(p.name)}</span>
                          {open === p.id && (
                            <m.span initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={bouncy} className="text-sm leading-snug font-semibold text-ink">
                              {l(p.fact)}
                            </m.span>
                          )}
                        </button>
                      ) : (
                        <Link to={`/mission/${p.mission}`} className="press flex h-full flex-col items-center gap-1.5 rounded-[var(--radius-card)] bg-sand/60 p-3 text-center">
                          <img src={img(p.img)} alt="" className="size-[min(5rem,30cqw)] object-contain opacity-40 grayscale" />
                          <span className="text-[length:clamp(0.55rem,8.5cqw,1.05rem)] leading-tight font-black text-muted">{l(p.name)}</span>
                          <span className="text-xs font-bold text-green-dark">{t('fame.play', { title: l(mission.title) })}</span>
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </Screen>
  )
}
