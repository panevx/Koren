import { useEffect, useRef } from 'react'
import type { MilestoneId } from '../content/progress'
import { useT } from '../i18n/useT'
import { m } from '../motion'
import { ART } from '../world'
import { Avatar, img } from './Brand'
import { Sparkles } from './ds'
import { Button } from './ui'

const REWARD_ART: Record<MilestoneId, string> = { bronze: ART.bronze, silver: ART.silver, gold: ART.gold, trophy: ART.trophy }

/**
 * A medal or the cup, won right now: the screen dims to a night-green stage, light rays turn behind the medal,
 * it drops in with a spring and a burst of sparkles, Koren and Raya cheer. One button closes it.
 * A dialog: focus moves to the button, Esc closes it.
 */
export function RewardModal({ reward, onClose }: { reward: MilestoneId; onClose: () => void }) {
  const t = useT()
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    button.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 grid place-items-center bg-night/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-title"
    >
      <m.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-stage-night relative flex w-full max-w-sm flex-col items-center gap-3 overflow-hidden rounded-[var(--radius-stage)] px-6 pt-6 pb-6 text-center text-white shadow-stage"
      >
        <p className="text-label rounded-full bg-gold px-3 py-1 text-ink">{t('reward.new')}</p>
        <h2 id="reward-title" className="text-display">
          {t('reward.modal.title')}
        </h2>
        <div className="relative grid size-52 place-items-center" aria-hidden="true">
          <div
            className="anim-spin-slow absolute inset-0 rounded-full"
            style={{
              background: 'repeating-conic-gradient(from 0deg, var(--color-gold) 0 10deg, transparent 10deg 22deg)',
              WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 70%)',
              maskImage: 'radial-gradient(circle, #000 30%, transparent 70%)',
              opacity: 0.45,
            }}
          />
          <m.img
            src={img(REWARD_ART[reward])}
            alt=""
            initial={{ scale: 0, rotate: -40, y: -80 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 11, delay: 0.2 }}
            className="pop-3d relative size-40 object-contain"
          />
          <Sparkles burst={reward} className="scale-[2.2]" />
        </div>
        <p className="text-xl leading-snug font-extrabold">{t(`reward.${reward}`)}</p>
        <div className="flex -space-x-3" aria-hidden="true">
          {(['raya', 'koren'] as const).map((hero, i) => (
            <m.div key={hero} initial={{ y: 30, opacity: 0 }} animate={{ y: [30, -14, 0], opacity: 1 }} transition={{ duration: 0.8, delay: 0.45 + i * 0.12 }}>
              <Avatar hero={hero} mood="laughter" className="size-14" />
            </m.div>
          ))}
        </div>
        <Button ref={button} variant="primary" className="w-full" onClick={onClose}>
          {t('reward.modal.close')}
        </Button>
      </m.div>
    </m.div>
  )
}
