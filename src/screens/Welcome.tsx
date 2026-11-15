import { useNavigate } from 'react-router'
import { Flag, HeroFigure, Logo, Ornamented, Scenery } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Button, Screen, useTitle } from '../components/ui'
import { LANGS } from '../i18n'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { useSettings } from '../store/settings'

export function Welcome() {
  const t = useT()
  const navigate = useNavigate()
  const lang = useSettings((s) => s.lang)
  const setLang = useSettings((s) => s.setLang)
  useTitle()

  return (
    // Wide landscape screen: the scene on the left, the buttons on the right.
    <Screen className="side:max-w-3xl side:flex-row side:items-center side:gap-2 side:py-3">
      <div className="relative h-[54dvh] min-h-72 shrink-0 side:h-[calc(100dvh-1.5rem)] side:min-h-0 side:w-1/2">
        <Scenery className="absolute inset-0 rounded-b-[2.5rem] side:rounded-[2rem]" />
        <div className="relative flex h-full flex-col items-center px-6 pt-5 side:pt-3">
          <m.div
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={bouncy}
            className="rounded-[2rem] bg-white px-6 py-3 shadow-float"
          >
            <Logo className="w-36 side:w-28" />
          </m.div>
          <div className="mt-auto flex items-end justify-center gap-2 pb-2">
            <m.div initial={{ y: 44 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.12 }}>
              <HeroFigure hero="raya" className="anim-bob h-[29dvh] max-h-64 min-h-36 side:h-[50dvh] side:min-h-0" />
            </m.div>
            <m.div initial={{ y: 44 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.22 }}>
              <HeroFigure hero="koren" className="anim-bob-late h-[30dvh] max-h-64 min-h-36 side:h-[52dvh] side:min-h-0" />
            </m.div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pt-5 pb-6 side:justify-center side:gap-3 side:p-3">
        <Ornamented>
          <p className="text-center text-lg leading-snug font-extrabold text-green-dark">{t('app.tagline')}</p>
        </Ornamented>

        <Button variant="primary" className="w-full py-3.5 text-2xl" onClick={() => navigate('/age')}>
          <Icon name="play" />
          {t('welcome.start')}
        </Button>

        <div role="radiogroup" aria-label={t('lang.title')} className="grid grid-cols-2 gap-1 rounded-full bg-sand p-1.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              lang={l}
              onClick={() => setLang(l)}
              className={`tap press flex items-center justify-center gap-2 rounded-full px-3 font-extrabold whitespace-nowrap side:gap-1.5 side:px-2 side:text-[length:min(1rem,2.3vw)] ${
                lang === l ? 'bg-white text-green-dark shadow-soft' : 'text-muted'
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
