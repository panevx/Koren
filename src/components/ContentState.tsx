import { useT } from '../i18n/useT'
import { Icon } from './Icon'

/**
 * The state of the content in a list of missions (a topic, the path), said once: all drafts (the demo), some drafts (then each draft card also has its
 * chip), or all checked by a teacher (the family build shows only checked missions).
 */
export function ContentState({ drafts, total }: { drafts: number; total: number }) {
  const t = useT()
  if (drafts === 0)
    return (
      <span className="text-meta flex items-center gap-1.5 text-green-dark">
        <Icon name="check" width="1.05em" height="1.05em" className="shrink-0" />
        {t('topic.allReviewed')}
      </span>
    )
  return (
    <span className="text-meta well flex items-start gap-1.5 self-start rounded-[0.875rem] px-2.5 py-1 text-ink">
      <span className="mt-[0.35em] size-2 shrink-0 rounded-full bg-gold-dark" aria-hidden="true" />
      {drafts === total ? t('topic.allDraft') : t('topic.someDraft', { n: drafts })}
    </span>
  )
}

/** One look for "draft" everywhere: a recess with a gold-dark dot — the same mark as on the banner. */
export function DraftChip() {
  const t = useT()
  return (
    <span className="well flex items-center gap-1 rounded-full px-2 py-px text-xs font-bold whitespace-nowrap text-ink">
      <span className="size-1.5 rounded-full bg-gold-dark" aria-hidden="true" />
      {t('missions.draftShort')}
    </span>
  )
}

