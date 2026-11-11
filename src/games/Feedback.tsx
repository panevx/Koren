import { Avatar } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button } from '../components/ui'
import { useT } from '../i18n/useT'

/**
 * The shared voice of every game: Koren cheers a correct answer, Raya gently helps
 * after a mistake. Never red, never "Wrong!".
 */
export function Feedback({ correct, help }: { correct?: string; help?: string }) {
  return (
    <div role="status" aria-live="polite" className="min-h-20">
      {correct ? (
        <div className="flex items-center gap-3">
          <Avatar hero="koren" mood="joy" className="size-16" />
          <p className="rounded-level flex-1 rounded-bl-sm bg-green/10 px-4 py-3 text-lg font-extrabold text-green-dark">{correct}</p>
        </div>
      ) : help ? (
        <div className="flex items-center gap-3">
          <Avatar hero="raya" mood="thoughtful" className="size-16" />
          <p className="rounded-level flex-1 rounded-bl-sm bg-gold/20 px-4 py-3 text-lg font-bold text-ink">{help}</p>
        </div>
      ) : null}
    </div>
  )
}

export function DoneButton({ onClick }: { onClick: () => void }) {
  const t = useT()
  return (
    <Button variant="accent" className="mt-auto w-full" onClick={onClick} autoFocus>
      {t('quiz.finish')}
      <Icon name="chevron" />
    </Button>
  )
}

export function Prompt({ children }: { children: string }) {
  return <h3 className="rounded-level bg-white px-4 py-3 text-center text-xl leading-snug font-extrabold shadow-sm">{children}</h3>
}
