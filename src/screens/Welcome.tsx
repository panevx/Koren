import { useNavigate } from 'react-router'
import { Flag, Heroes, Landscape, Logo, Ornamented } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button, Screen } from '../components/ui'
import { LANGS } from '../i18n'
import { useT } from '../i18n/useT'
import { useSettings } from '../store/settings'

export function Welcome() {
  const t = useT()
  const navigate = useNavigate()
  const lang = useSettings((s) => s.lang)
  const setLang = useSettings((s) => s.setLang)

  return (
    <Screen>
      <div className="relative overflow-hidden">
        <Landscape className="absolute inset-0 h-full w-full" />
        <div className="relative flex flex-col items-center px-6 pt-5">
          <Logo />
          <Ornamented className="mt-2">
            <p className="text-center text-base leading-snug font-bold text-green-dark">{t('app.tagline')}</p>
          </Ornamented>
          <Heroes className="mt-3 aspect-[768/810] max-h-[34dvh] w-full max-w-sm rounded-[2rem] border-4 border-white object-cover object-top shadow-lg" />
        </div>
        <div className="relative mt-4 bg-white py-1.5">
          <div className="shevitsa" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        <Button variant="primary" className="w-full py-3 text-xl" onClick={() => navigate('/age')}>
          <Icon name="play" />
          {t('welcome.start')}
        </Button>

        <div role="radiogroup" aria-label={t('lang.title')} className="grid grid-cols-2 gap-3">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              lang={l}
              onClick={() => setLang(l)}
              className={`tap rounded-level flex items-center justify-center gap-2 border-2 px-3 font-extrabold transition ${
                lang === l ? 'border-green bg-white text-green shadow-sm' : 'border-sand bg-white/60 text-muted hover:border-green'
              }`}
            >
              <Flag lang={l} />
              {t(`lang.${l}`)}
            </button>
          ))}
        </div>
      </div>
    </Screen>
  )
}
