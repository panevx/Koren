import { Avatar } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button, Card } from '../components/ui'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'

const bubble = 'min-w-0 flex-1 rounded-[1.5rem] rounded-bl-md px-4 py-3 text-lg leading-snug'

/**
 * The shared voice of every game: Koren hops for a correct answer, Raya tilts her head
 * and gently helps after a mistake. Never red, never "Wrong!".
 * `nudge` re-plays Raya's reaction when the same hint is shown again.
 */
export function Feedback({ correct, help, idle, nudge = 0 }: { correct?: string; help?: string; idle?: string; nudge?: number }) {
  return (
    <div role="status" aria-live="polite" className="min-h-20">
      {correct ? (
        <div className="flex items-center gap-3">
          <m.div
            initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: [0, -14, 0] }}
            transition={{ default: bouncy, y: { duration: 0.55, delay: 0.2, times: [0, 0.4, 1] } }}
          >
            <Avatar hero="koren" mood="joy" className="size-[min(4rem,15vw)]" />
          </m.div>
          <m.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className={`${bubble} bg-green-soft font-extrabold text-green-dark`}>
            {correct}
          </m.p>
        </div>
      ) : help ? (
        <div key={`${help}${nudge}`} className="flex items-center gap-3">
          <m.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, -9, 7, 0] }}
            transition={{ default: bouncy, rotate: { duration: 0.6, delay: 0.15 } }}
          >
            <Avatar hero="raya" mood="thoughtful" className="size-[min(4rem,15vw)]" />
          </m.div>
          <m.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className={`${bubble} bg-gold-soft font-bold text-ink`}>
            {help}
          </m.p>
        </div>
      ) : idle ? (
        <p className="text-center text-sm font-semibold text-muted">{idle}</p>
      ) : null}
    </div>
  )
}

export function DoneButton({ onClick, label }: { onClick: () => void; label?: string }) {
  const t = useT()
  return (
    <m.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={bouncy} className="mt-auto">
      <Button variant="accent" className="w-full" onClick={onClick} autoFocus>
        {label ?? t('quiz.finish')}
        <Icon name="chevron" />
      </Button>
    </m.div>
  )
}

export function Prompt({ children }: { children: string }) {
  return (
    <Card className="px-5 py-4">
      <h3 className="text-center text-xl leading-snug font-extrabold">{children}</h3>
    </Card>
  )
}
