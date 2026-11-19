import { fitWords } from '../components/fit'
import { Avatar, img } from '../components/Brand'
import { Sparkles } from '../components/ds'
import { ART } from '../world'
import { Icon } from '../components/Icon'
import { Button } from '../components/ui'
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
            className="relative shrink-0"
            transition={{ default: bouncy, y: { duration: 0.55, delay: 0.2, times: [0, 0.4, 1] } }}
          >
            <Sparkles burst={correct} />
            <Avatar hero="koren" mood="joy" className="size-[min(4rem,15vw)]" />
            <m.img
              src={img(ART.star)}
              alt=""
              initial={{ scale: 0, rotate: -60 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ ...bouncy, delay: 0.25 }}
              className="absolute -top-2 -right-2 size-[45%]"
            />
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
            className="relative shrink-0"
            transition={{ default: bouncy, rotate: { duration: 0.6, delay: 0.15 } }}
          >
            <Avatar hero="raya" mood="thoughtful" className="size-[min(4rem,15vw)]" />
            <img src={img(ART.heart)} alt="" className="absolute -right-1.5 -bottom-1 size-[40%]" />
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

/**
 * The task of a game, said by Koren: his face and a speech bubble. (Koren gives tasks and cheers; Raya helps.)
 * On the narrowest phones the face gets smaller so the words keep their room.
 */
export function Prompt({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <m.span initial={{ scale: 0.5, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={bouncy} className="shrink-0">
        <Avatar hero="koren" mood="determination" className="size-[min(3.5rem,13vw)]" />
      </m.span>
      <div className="edge-light relative min-w-0 flex-1 rounded-[1.5rem] rounded-bl-md mat-paper px-[min(1.125rem,4vw)] py-3.5 [container-type:inline-size]">
        {/* Capped by the bubble's own width AND by its longest word (v0.26): at 320 px with a big font „крепостта!“ broke. */}
        <h3 className="leading-snug font-extrabold" style={fitWords(children, 'min(1.2rem,5.6vw,11cqw)', 0.66)}>
          {children}
        </h3>
      </div>
    </div>
  )
}
