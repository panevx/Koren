import { useState } from 'react'
import { Avatar, img } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button } from '../components/ui'
import type { Question } from '../content/schema'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { play } from '../sound'

type Props = {
  questions: Question[]
  /** Optional heading above the questions (e.g. "Check what you learned"). */
  title?: string
  onDone: () => void
}

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
      <h3 className="rounded-level bg-white px-4 py-4 text-center text-xl leading-snug font-extrabold shadow-sm">
        {l(question.q)}
      </h3>

      <div className={`grid gap-3 ${withImages ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {question.options.map((option, i) => {
          const isWrong = wrong.includes(i)
          const isRight = solved && i === question.answer
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={isWrong || (solved && !isRight)}
              aria-pressed={isRight || isWrong}
              className={`tap rounded-level flex items-center gap-3 border-2 px-4 py-3 text-left text-lg font-extrabold transition ${
                withImages ? 'flex-col justify-center text-center' : ''
              } ${
                isRight
                  ? 'border-green bg-green text-white shadow-md'
                  : isWrong
                    ? 'border-sand bg-cream text-muted opacity-60'
                    : solved
                      ? 'border-sand bg-white text-muted opacity-60'
                      : 'border-sand bg-white text-ink hover:border-green'
              }`}
            >
              {option.img && <img src={img(option.img)} alt="" className="size-20 object-contain" />}
              <span className="flex-1">{l(option)}</span>
              {isRight && <Icon name="check" />}
            </button>
          )
        })}
      </div>

      <div role="status" aria-live="polite" className="min-h-20">
        {solved ? (
          <div className="flex items-center gap-3">
            <Avatar hero="koren" mood="joy" className="size-[min(4rem,15vw)]" />
            <p className="rounded-level flex-1 rounded-bl-sm bg-green/10 px-4 py-3 text-lg font-extrabold text-green-dark">
              {t('quiz.correct')}
            </p>
          </div>
        ) : wrong.length > 0 ? (
          <div className="flex items-center gap-3">
            <Avatar hero="raya" mood="thoughtful" className="size-[min(4rem,15vw)]" />
            <p className="rounded-level flex-1 rounded-bl-sm bg-gold/20 px-4 py-3 text-lg font-bold text-ink">
              {question.hint ? l(question.hint) : t('quiz.tryAgain')}
            </p>
          </div>
        ) : null}
      </div>

      {solved && (
        <Button variant="accent" className="mt-auto w-full" onClick={onNext} autoFocus>
          {last ? t('quiz.finish') : t('quiz.next')}
          <Icon name="chevron" />
        </Button>
      )}
    </div>
  )
}
