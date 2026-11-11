import { Link, useParams } from 'react-router'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Screen, TopBar } from '../components/ui'
import { missionsBySubject } from '../content/missions'
import type { Subject } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { m, rise, stagger } from '../motion'
import { sectionById, type SectionId } from '../sections'
import { useActiveProfile } from '../store/profiles'
import { ComingSoon } from './ComingSoon'

/** Hub topics that map to a mission subject. */
const TOPIC_SUBJECT: Partial<Record<SectionId, Subject>> = {
  history: 'history',
  culture: 'culture',
  language: 'language',
}

/** Each subject has its own colour: the tinted disc behind the badge and the subject chip. */
export const SUBJECT_TINT: Record<Subject, string> = {
  history: 'bg-gold-soft',
  culture: 'bg-coral-soft',
  language: 'bg-green-soft',
  geography: 'bg-sky-soft',
}

/**
 * /missions lists every mission; /topic/:id lists one subject.
 * A topic with no missions yet falls back to the "Coming soon" screen.
 */
export function MissionList({ topic }: { topic?: boolean }) {
  const t = useT()
  const l = useLocalized()
  const params = useParams()
  const done = useActiveProfile().done

  const section = topic ? sectionById(params.id) : sectionById('missions')
  const subject = topic && section ? TOPIC_SUBJECT[section.id] : undefined
  if (topic && !subject) return <ComingSoon />
  const missions = missionsBySubject(subject)
  if (missions.length === 0) return topic ? <ComingSoon /> : <ComingSoon section="missions" />

  const played = missions.filter((mission) => done[mission.id]).length

  return (
    <Screen nav>
      <TopBar title={section ? t(section.label) : t('missions.title')} />
      <div className="flex flex-col gap-4 px-4 pb-32">
        {/* Progress pill */}
        <div className="flex items-center gap-3 rounded-full bg-white py-2 pr-4 pl-2 shadow-soft">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-ink">
            <Icon name="star" width="1.2em" height="1.2em" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">{t('missions.count', { done: played, total: missions.length })}</p>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
              <div className="h-full rounded-full bg-green" style={{ width: `${(played / missions.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <m.ul variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-3">
          {missions.map((mission) => {
            const isDone = Boolean(done[mission.id])
            return (
              <m.li key={mission.id} variants={rise}>
                <Link to={`/mission/${mission.id}`} className="press rounded-level flex items-center gap-3 bg-white p-2.5 shadow-soft">
                  <span
                    className={`grid size-[min(4.25rem,17vw)] shrink-0 place-items-center rounded-full ${isDone ? 'bg-gold' : SUBJECT_TINT[mission.subject]}`}
                  >
                    <img src={img(mission.badge.icon)} alt="" className="pop-3d size-[72%] object-contain" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-black tracking-wide text-ink uppercase ${SUBJECT_TINT[mission.subject]}`}>
                        {t(`subject.${mission.subject}`)}
                      </span>
                      {mission.draft && <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-bold text-ink">{t('missions.draftShort')}</span>}
                    </span>
                    <span className="text-lg leading-tight font-extrabold">{l(mission.title)}</span>
                    {isDone && (
                      <span className="flex items-center gap-1 text-sm font-bold text-green-dark">
                        <Icon name="check" width="1em" height="1em" />
                        {t('missions.done')}
                      </span>
                    )}
                  </span>
                  <span
                    className={`puck grid size-[min(3rem,12vw)] shrink-0 place-items-center rounded-full ${
                      isDone ? 'bg-green text-white [--edge:var(--color-green-deep)]' : 'bg-coral text-coral-ink [--edge:var(--color-coral-deep)]'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon name={isDone ? 'refresh' : 'play'} width="1.3em" height="1.3em" />
                  </span>
                </Link>
              </m.li>
            )
          })}
        </m.ul>
      </div>
    </Screen>
  )
}
