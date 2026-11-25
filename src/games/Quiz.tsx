import { fitWords } from '../components/fit'
import { useMemo, useState } from 'react'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import type { Question } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m, rise, stagger } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'
import { HyphenSafe } from '../components/HyphenSafe'
import { answerOrder } from './shuffle'

type Props = {
  questions: Question[]
  /** Optional heading above the questions (e.g. "Check what you learned"). */
  title?: string
  onDone: () => void
  /** Resume at this question (after a reload), and report each new one (the mission keeps it in the history entry). */
  start?: number
  onIndex?: (index: number) => void
  /** v0.27: the FIRST try at each question — right or not (a mistake comes back in practice). */
  onAnswer?: (index: number, right: boolean) => void
}

/** A different colour for each answer's marker, so the list is not four identical rows. */
const DOTS = ['bg-sky', 'bg-gold', 'bg-coral', 'bg-mint']

/**
 * Quiz template: one question at a time, 2–4 answers (text or picture).
 * A wrong answer is gently set aside and Raya gives a hint — never a red screen.
 * The child moves on only after finding the right answer.
 */
export function Quiz({ questions, title, onDone, start = 0, onIndex, onAnswer }: Props) {
  const [index, setIndexState] = useState(() => Math.min(Math.max(0, start), questions.length - 1))
  const setIndex = (n: number) => {
    setIndexState(n)
    onIndex?.(n)
  }
  const question = questions[index]!
  const last = index === questions.length - 1
  return (
    <QuizQuestion
      key={index}
      question={question}
      number={index + 1}
      total={questions.length}
      title={title}
      last={last}
      onFirst={(right) => onAnswer?.(index, right)}
      onNext={() => (last ? onDone() : setIndex(index + 1))}
    />
  )
}

function QuizQuestion({
  question,
  number,
  total,
  title,
  last,
  onFirst,
  onNext,
}: {
  question: Question
  number: number
  total: number
  title?: string
  last: boolean
  onFirst?: (right: boolean) => void
  onNext: () => void
}) {
  const t = useT()
  const l = useLocalized()
  const [wrong, setWrong] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const withImages = question.options.some((o) => o.img)
  // Shown in a seeded order (same in bg and en, same every time) – never simply as written.
  const order = useMemo(() => answerOrder(question.options.length, question.q.bg), [question])

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return
    if (wrong.length === 0) onFirst?.(i === question.answer)
    if (i === question.answer) {
      setSolved(true)
      play('correct')
    } else {
      setWrong([...wrong, i])
      play('hint')
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {title && <h2 className="text-center text-xl font-black text-green-dark">{title}</h2>}
      <p className="text-center text-sm font-bold text-muted short:sr-only">{t('quiz.question', { n: number, total })}</p>
      <Prompt>{l(question.q)}</Prompt>

      <m.div variants={stagger} initial="hidden" animate="show" className={`grid gap-3 ${withImages ? 'grid-cols-2 side:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]' : 'grid-cols-1 side:grid-cols-2'}`}>
        {order.map((i, at) => {
          const option = question.options[i]!
          const isWrong = wrong.includes(i)
          const isRight = solved && i === question.answer
          return (
            // The entrance animation lives on a wrapper: the button keeps its own CSS press spring.
            <m.div key={i} variants={rise}>
            <button
              type="button"
              onClick={() => choose(i)}
              disabled={isWrong || (solved && !isRight)}
              aria-pressed={isRight || isWrong}
              className={`tap press rounded-level flex h-full w-full items-center gap-3 px-4 py-3 text-left text-lg leading-snug font-extrabold [container-type:inline-size] ${
                // Picture cards are narrow: the label shrinks with the card (cqw), so one long word never breaks.
                withImages ? 'flex-col justify-center text-center [container-type:inline-size]' : ''
              } ${
                isRight
                  ? 'anim-right bg-green-soft text-green-dark shadow-soft ring-[3px] ring-green'
                  : isWrong
                    ? 'anim-nudge bg-sand/70 text-muted'
                    : solved
                    ? 'bg-sand/70 text-muted'
                    : 'mat-paper edge-light text-ink'
              }`}
            >
              {option.img ? (
                <img src={img(option.img)} alt="" className="pop-3d size-20 object-contain short:size-14" />
              ) : (
                <span className={`size-3.5 shrink-0 rounded-full ${isWrong || (solved && !isRight) ? 'bg-muted/40' : DOTS[at % DOTS.length]}`} aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]" style={fitWords(l(option), withImages ? 'clamp(0.6rem,12cqw,1.125rem)' : '1.125rem', 0.78, true)}><HyphenSafe text={l(option)} /></span>
              {isWrong && <span aria-hidden="true">×</span>}
              {isRight && (
                <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={bouncy} className="grid size-8 shrink-0 place-items-center rounded-full bg-green text-white">
                  <Icon name="check" width="1.1em" height="1.1em" />
                </m.span>
              )}
            </button>
            </m.div>
          )
        })}
      </m.div>

      <Feedback
        correct={solved ? t('quiz.correct') : undefined}
        help={wrong.length > 0 ? [
          question.hint ? l(question.hint) : t('quiz.tryAgain'),
          wrong.length > 1 && t('quiz.remaining', { n: question.options.length - wrong.length }),
        ].filter(Boolean).join(' ') : undefined}
        nudge={wrong.length}
      />

      {solved && <DoneButton onClick={onNext} label={last ? t('quiz.finish') : t('quiz.next')} />}
    </div>
  )
}
