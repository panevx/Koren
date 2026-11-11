import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AgePicker } from '../components/AgePicker'
import { Flag } from '../components/Brand'
import { Icon, type IconName } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'
import { LANGS } from '../i18n'
import { useT } from '../i18n/useT'
import { useSettings } from '../store/settings'
import { ageToLevel } from '../theme/levels'

function Section({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <section className="rounded-level bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
        <span className="text-green">
          <Icon name={icon} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Settings() {
  const t = useT()
  const navigate = useNavigate()
  const { lang, age, remember, setLang, setRemember, reset } = useSettings()
  const level = ageToLevel(age)

  // Show "saved" feedback after any change made on this screen.
  const [changed, setChanged] = useState(false)
  useEffect(
    () =>
      useSettings.subscribe((s, prev) => {
        if (s.lang !== prev.lang || s.age !== prev.age || s.remember !== prev.remember) setChanged(true)
      }),
    [],
  )

  const [confirmReset, setConfirmReset] = useState(false)
  useEffect(() => {
    if (!confirmReset) return
    const id = window.setTimeout(() => setConfirmReset(false), 4000)
    return () => window.clearTimeout(id)
  }, [confirmReset])

  const onReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    reset()
    useSettings.persist.clearStorage()
    navigate('/', { replace: true })
  }

  return (
    <Screen>
      <TopBar title={t('settings.title')} />
      <div className="flex flex-col gap-4 px-4 pb-8">
        <Section icon="globe" title={t('settings.language')}>
          <div role="radiogroup" aria-label={t('settings.language')} className="grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={lang === l}
                lang={l}
                onClick={() => setLang(l)}
                className={`tap flex items-center justify-center gap-2 rounded-full font-extrabold transition ${
                  lang === l ? 'bg-green text-white shadow' : 'text-muted hover:text-green'
                }`}
              >
                <Flag lang={l} className="h-4 w-6" />
                {t(`lang.${l}`)}
              </button>
            ))}
          </div>
        </Section>

        <Section icon="users" title={t('settings.age')}>
          <p className="mb-3 font-bold text-muted">
            {t('settings.ageCurrent', { level: t(`level.${level}.range`) })}
          </p>
          <AgePicker />
        </Section>

        <Section icon="save" title={t('settings.remember')}>
          <label className="flex items-start gap-4">
            <span className="flex-1 text-sm text-muted">{t('settings.rememberHint')}</span>
            <button
              type="button"
              role="switch"
              aria-checked={remember}
              aria-label={t('settings.remember')}
              onClick={() => setRemember(!remember)}
              className={`tap relative flex shrink-0 items-center rounded-full transition ${remember ? 'bg-green' : 'bg-sand'}`}
              style={{ width: 'calc(var(--tap) * 1.4)' }}
            >
              <span
                className={`absolute size-7 rounded-full bg-white shadow transition-all ${remember ? 'right-1.5' : 'left-1.5'}`}
              />
            </button>
          </label>
        </Section>

        <p
          role="status"
          className={`rounded-level flex min-h-12 items-center gap-3 px-4 py-2 font-bold transition ${
            changed ? (remember ? 'bg-green/10 text-green-dark' : 'bg-gold/20 text-ink') : 'invisible'
          }`}
        >
          {changed && (
            <>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full text-white ${remember ? 'bg-green' : 'bg-muted'}`}>
                <Icon name="check" width="1em" height="1em" />
              </span>
              {remember ? t('settings.saved') : t('settings.notSaved')}
            </>
          )}
        </p>

        <div className="flex flex-col items-center gap-2 pt-2">
          <Button variant="secondary" onClick={onReset} className={confirmReset ? 'border-red text-red' : ''}>
            <Icon name="refresh" />
            {confirmReset ? t('settings.resetConfirm') : t('settings.reset')}
          </Button>
          <p className="text-center text-sm text-muted">{t('settings.resetHint')}</p>
        </div>
      </div>
    </Screen>
  )
}
