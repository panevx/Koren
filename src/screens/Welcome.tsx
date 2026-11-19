import { useNavigate } from 'react-router'
import { Flag, HeroFigure, Logo, Ornamented } from '../components/Brand'
import { BackWall } from '../components/Diorama'
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
    <Screen className="side:max-w-3xl side:flex-row side:items-center side:gap-4 side:py-3">
      {/* v0.26: the same layered diorama as the hub, full-bleed: the logo on a glass plaque in the sky,
          Koren and Raya standing on the paper slab below (the slab carries the welcome and the language). */}
      <div className="relative h-[52dvh] min-h-72 shrink-0 side:h-[calc(100dvh-1.5rem)] side:min-h-0 side:w-1/2">
        <BackWall className="absolute inset-0 side:rounded-[2rem]" />
        <div className="relative flex h-full flex-col items-center px-6 pt-5 side:pt-3">
          <m.div
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={bouncy}
            className="mat-glass edge-light relative rounded-[2rem] px-6 py-3"
          >
            <Logo className="w-36 side:w-28" />
          </m.div>
          <div className="relative z-20 mt-auto -mb-6 flex items-end justify-center gap-2 side:mb-3">
            <m.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.12 }} className="relative">
              <span className="ground absolute -bottom-1.5 left-1/2 h-5 w-[95%] -translate-x-1/2" aria-hidden="true" />
              <HeroFigure hero="raya" className="anim-bob relative h-[28dvh] max-h-64 min-h-36 side:h-[50dvh] side:min-h-0" />
            </m.div>
            <m.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...bouncy, delay: 0.22 }} className="relative">
              <span className="ground absolute -bottom-1.5 left-1/2 h-5 w-[95%] -translate-x-1/2" aria-hidden="true" />
              <HeroFigure hero="koren" className="anim-bob-late relative h-[29dvh] max-h-64 min-h-36 side:h-[52dvh] side:min-h-0" />
            </m.div>
          </div>
        </div>
      </div>

      <div className="mat-paper edge-light relative z-10 -mt-8 flex flex-1 flex-col gap-4 rounded-t-[2.25rem] px-6 pt-[4.5rem] pb-6 side:mt-0 side:justify-center side:gap-3 side:rounded-[2rem] side:p-5">
        <span className="paper-top" aria-hidden="true" />
        <Ornamented>
          <p className="text-center text-lg leading-snug font-extrabold text-green-dark">{t('app.tagline')}</p>
        </Ornamented>

        <Button variant="primary" className="w-full py-3.5 text-[length:min(1.5rem,6.2vw)] whitespace-nowrap" onClick={() => navigate('/age')}>
          <Icon name="play" />
          {t('welcome.start')}
        </Button>

        <div role="radiogroup" aria-label={t('lang.title')} className="well grid grid-cols-2 gap-1 rounded-full p-1.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={lang === l}
              lang={l}
              onClick={() => setLang(l)}
              className={`tap press flex items-center justify-center gap-2 rounded-full px-3 font-extrabold whitespace-nowrap side:gap-1.5 side:px-2 side:text-[length:min(1rem,2.3vw)] ${
                lang === l ? 'nav-marker text-green-dark' : 'text-muted'
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
