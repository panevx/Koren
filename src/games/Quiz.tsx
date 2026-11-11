import { useState } from 'react'
import { img } from '../components/Brand'
import { Icon } from '../components/Icon'
import type { Question } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m, rise, stagger } from '../motion'
import { play } from '../sound'
import { DoneButton, Feedback, Prompt } from './Feedback'

type Props = {
  questions: Question[]
  /** Optional heading above the questions (e.g. "Check what you learned"). */
  title?: string
  onDone: () => void
}

/** A different colour for each answer's marker, so the list is not four identical rows. */
const DOTS = ['bg-sky', 'bg-gold', 'bg-coral', 'bg-mint']

/**
 * Quiz template: one question at a time, 2–4 answers (text or picture).
 * A wrong answer is gently set aside and Raya gives a hint — never a red screen.
 * The child moves on only after finding the right answer.
 */
export function Quiz({ questions, title, onDone }: Props) {
  const [index, setIndex] = useState(0)
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
  onNext,
}: {
  question: Question
  number: number
  total: number
  title?: string
  last: boolean
  onNext: () => void
}) {
  const t = useT()
  const l = useLocalized()
  const [wrong, setWrong] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const withImages = question.options.some((o) => o.img)

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return
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
      <p className="text-center text-sm font-bold text-muted">{t('quiz.question', { n: number, total })}</p>
      <Prompt>{l(question.q)}</Prompt>

      <m.div variants={stagger} initial="hidden" animate="show" className={`grid gap-3 ${withImages ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {question.options.map((option, i) => {
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
              className={`tap press rounded-level flex h-full w-full items-center gap-3 px-4 py-3 text-left text-lg leading-snug font-extrabold ${
                withImages ? 'flex-col justify-center text-center' : ''
              } ${
                isRight
                  ? 'bg-green-soft text-green-dark shadow-soft ring-[3px] ring-green'
                  : isWrong || solved
                    ? 'bg-sand/70 text-muted'
                    : 'bg-white text-ink shadow-soft'
              }`}
            >
              {option.img ? (
                <img src={img(option.img)} alt="" className="pop-3d size-20 object-contain" />
              ) : (
                <span className={`size-3.5 shrink-0 rounded-full ${isWrong || (solved && !isRight) ? 'bg-muted/40' : DOTS[i % DOTS.length]}`} aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1">{l(option)}</span>
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
        help={wrong.length > 0 ? (question.hint ? l(question.hint) : t('quiz.tryAgain')) : undefined}
        nudge={wrong.length}
      />

      {solved && <DoneButton onClick={onNext} label={last ? t('quiz.finish') : t('quiz.next')} />}
    </div>
  )
}
