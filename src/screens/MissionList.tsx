import { Link, useParams } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Screen, TopBar } from '../components/ui'
import { missionsBySubject } from '../content/missions'
import type { Subject } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { sectionById, type SectionId } from '../sections'
import { useActiveProfile } from '../store/profiles'
import { ComingSoon } from './ComingSoon'

/** Hub topics that map to a mission subject. */
const TOPIC_SUBJECT: Partial<Record<SectionId, Subject>> = {
  history: 'history',
  culture: 'culture',
  language: 'language',
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

  const played = missions.filter((m) => done[m.id]).length

  return (
    <Screen>
      <TopBar title={section ? t(section.label) : t('missions.title')} />
      <div className="flex flex-col gap-3 px-4 pb-28">
        <p className="text-center text-sm font-bold text-muted">{t('missions.count', { done: played, total: missions.length })}</p>
        <ul className="flex flex-col gap-3">
          {missions.map((m) => {
            const isDone = Boolean(done[m.id])
            return (
              <li key={m.id}>
                <Link
                  to={`/mission/${m.id}`}
                  className="rounded-level flex items-center gap-4 border-2 border-sand bg-white p-3 shadow-sm transition hover:border-green hover:shadow-md"
                >
                  <span className={`grid size-16 shrink-0 place-items-center rounded-full ${isDone ? 'bg-gold' : 'bg-cream'}`}>
                    <img src={img(m.badge.icon)} alt="" className={`size-12 object-contain ${isDone ? '' : 'opacity-80'}`} />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-xs font-black tracking-wide text-red uppercase">{t(`subject.${m.subject}`)}</span>
                    <span className="text-lg leading-tight font-extrabold">{l(m.title)}</span>
                    {isDone && (
                      <span className="flex items-center gap-1 text-sm font-bold text-green">
                        <Icon name="check" width="1em" height="1em" />
                        {t('missions.done')}
                      </span>
                    )}
                    {m.draft && <span className="text-xs font-semibold text-muted">{t('missions.draft')}</span>}
                  </span>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-green text-white" aria-hidden="true">
                    <Icon name="play" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
      <BottomNav />
    </Screen>
  )
}
