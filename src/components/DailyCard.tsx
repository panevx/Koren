import { Link } from 'react-router'
import { COINS_PER_WEEK, WEEK_GOAL, dueToday, stampedWeeks, thisWeek } from '../content/habits'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import type { Profile } from '../store/profiles'
import { ageToLevel } from '../theme/levels'
import { Icon } from './Icon'

/**
 * v0.27 — the day's adventure and the week's stamp, on the hub (loaded after the first screen, so the start stays small).
 * Only good news: today is "yours" after one mission or one practice; the week needs 3 days of 7 for its stamp.
 * A missed day is never named: when the stamp can no longer be reached this week, the card simply stops counting down.
 */
export default function DailyCard({ profile }: { profile: Profile }) {
  const t = useT()
  const { week, count, stamped, doneToday } = thisWeek(profile.days)
  const left = WEEK_GOAL - count
  const daysLeft = week.filter((d) => !d.done && (d.today || d.future)).length
  const letters = t('week.days').split(',')
  const canPractice = ageToLevel(profile.age) !== 'small' && Object.keys(profile.done).length > 0
  const due = dueToday(profile.review).length
  const stamps = stampedWeeks(profile.days)

  return (
    <section aria-labelledby="today" className="mat-paper edge-light relative flex flex-col gap-3 rounded-[var(--radius-panel)] p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-[min(3.25rem,14vw)] shrink-0 place-items-center rounded-full ${doneToday ? 'mat-ceramic-gold' : 'well'}`} aria-hidden="true">
          {doneToday ? (
            <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy} className="text-green-dark">
              <Icon name="check" width="1.6em" height="1.6em" />
            </m.span>
          ) : (
            <Icon name="star" className="text-gold-dark" width="1.4em" height="1.4em" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-eyebrow block text-muted">{t('today.eyebrow')}</span>
          <h2 id="today" className="text-row mt-0.5 block font-black">
            {doneToday ? t('today.done') : t('today.goal')}
          </h2>
        </span>
      </div>

      {/* The week: Monday to Sunday — a gold coin for each day with an adventure. */}
      <div>
        <ol className="grid grid-cols-7 gap-1 wide:mx-auto wide:max-w-xl" aria-label={t('week.label', { n: count, goal: WEEK_GOAL })}>
          {week.map((d, i) => (
            <li key={d.day} className="flex flex-col items-center gap-1">
              <span
                className={`grid size-[min(2rem,8.5vw)] place-items-center rounded-full ${
                  d.done ? 'mat-ceramic-gold text-green-dark' : d.today ? 'well outline-2 outline-offset-1 outline-green-dark/50 outline-dashed' : 'well'
                } ${d.future && !d.done ? 'opacity-60' : ''}`}
                aria-hidden="true"
              >
                {d.done && <Icon name="check" width="0.95em" height="0.95em" />}
              </span>
              <span className={`text-[length:min(0.75rem,3.2vw)] font-extrabold ${d.today ? 'text-green-dark' : 'text-muted'}`} aria-hidden="true">
                {letters[i]}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-meta mt-2 text-center font-bold text-muted">
          {stamped
            ? t('week.stamped', { n: COINS_PER_WEEK })
            : left <= daysLeft
              ? t('week.left', { n: left })
              : stamps > 0
                ? t('week.stamps', { n: stamps })
                : t('week.hint', { goal: WEEK_GOAL })}
        </p>
      </div>

      {canPractice && (
        <Link to="/practice" className="btn-satin tint-sky edge-light tap flex items-center justify-center gap-2 rounded-full px-5 font-black text-ink wide:w-max wide:self-center wide:px-10">
          <span className="whitespace-nowrap">{t('practice.start')}</span>
          {/* how many questions came back today: a coral bubble with the number (the words are for screen readers) */}
          {due > 0 && (
            <span className="grid min-w-7 place-items-center rounded-full bg-coral px-1.5 text-sm leading-7 text-coral-ink">
              <span aria-hidden="true">{due}</span>
              <span className="sr-only">{t('practice.due', { n: due })}</span>
            </span>
          )}
          <Icon name="chevron" width="0.9em" height="0.9em" />
        </Link>
      )}
    </section>
  )
}
