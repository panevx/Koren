import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { BadgeArt } from '../components/BadgeArt'
import { HeroFigure, Logo, Scenery } from '../components/Brand'
import { Icon } from '../components/Icon'
import { ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { SectionIcon } from '../components/SectionIcon'
import { UpdateBanner } from '../components/UpdateBanner'
import { Screen, roundButton } from '../components/ui'
import { useLocalized } from '../content/useLocalized'
import { useMissions } from '../content/useMissions'
import { useT } from '../i18n/useT'
import { bouncy, m, settle, stagger } from '../motion'
import { sectionById, type SectionId } from '../sections'
import { activeProfile, useProfiles } from '../store/profiles'
import { ageToLevel, type Level } from '../theme/levels'

/** How the hub adapts per age level, beyond the global size/colour theme. */
const LAYOUT: Record<Level, { label: string; showDesc: boolean }> = {
  small: { label: 'text-2xl', showDesc: false },
  young: { label: 'text-xl', showDesc: false },
  guard: { label: 'text-xl', showDesc: true },
}
/** Labels in the two narrow square modules follow the screen width, so "Български" never breaks. */
const TIGHT = 'text-[clamp(1rem,5.4vw,1.25rem)]'
const TIGHT_TALL = 'text-[clamp(1rem,6vw,1.5rem)]'

/** The six modules in reading order. Each has its own size, shape, colour and icon placement. */
const ORDER: readonly SectionId[] = ['discover', 'missions', 'history', 'language', 'culture', 'collection']

/** A painted icon placed freely inside a module (SectionIcon itself is `relative`, so it gets a positioned wrapper). */
function Art({ id, className }: { id: SectionId; className: string }) {
  return (
    <span className={`pointer-events-none block ${className}`} aria-hidden="true">
      <SectionIcon id={id} className="pop-3d size-full" />
    </span>
  )
}

const chip = 'mt-2 inline-block rounded-full bg-white/85 px-3 py-1 text-sm leading-snug font-bold text-ink'
const tile = 'press puck relative block h-full overflow-hidden'

export function Home() {
  const t = useT()
  const l = useLocalized()
  const profiles = useProfiles((s) => s.profiles)
  const profile = useProfiles(activeProfile)
  const name = useProfileName()
  const level = ageToLevel(profile.age)
  const { label, showDesc } = LAYOUT[level]
  const missions = useMissions()
  const next = missions?.find((mission) => !profile.done[mission.id])
  const played = missions?.filter((mission) => profile.done[mission.id]).length ?? 0

  const section = (id: SectionId) => sectionById(id)!
  const title = (id: SectionId, extra = '', size = label) => (
    <span className={`${size} relative block leading-tight font-black ${extra}`}>{t(section(id).label)}</span>
  )
  const desc = (id: SectionId, extra = '') => showDesc && <span className={`${chip} ${extra}`}>{t(section(id).desc)}</span>

  const modules: Record<SectionId, { span: string; body: ReactNode }> = {
    // Wide green banner, the map tilting out of the right edge.
    discover: {
      span: 'col-span-2',
      body: (
        <Link to={section('discover').path} className={`${tile} min-h-[7.5rem] rounded-[2rem] bg-green p-5 pr-[44%] text-white [--edge:var(--color-green-deep)]`}>
          <span className="absolute -top-12 -right-10 size-48 rounded-full bg-white/10" aria-hidden="true" />
          {title('discover')}
          {desc('discover')}
          <Art id="discover" className="absolute top-1/2 right-3 size-[7.5rem] -translate-y-1/2 rotate-6" />
        </Link>
      ),
    },
    // Tall coral column, the backpack sitting at the bottom.
    missions: {
      span: 'row-span-2',
      body: (
        <Link to={section('missions').path} className={`${tile} flex flex-col rounded-[2rem] bg-coral p-4 text-coral-ink [--edge:var(--color-coral-deep)]`}>
          <span className="absolute -bottom-14 -left-10 size-44 rounded-full bg-white/15" aria-hidden="true" />
          {title('missions', '', TIGHT_TALL)}
          {missions && <span className={chip + ' self-start'}>{t('missions.count', { done: played, total: missions.length })}</span>}
          <Art id="missions" className="relative mt-auto size-28 shrink-0 self-center -rotate-6" />
        </Link>
      ),
    },
    // Gold square, the tower in the top right corner.
    history: {
      span: '',
      body: (
        <Link to={section('history').path} className={`${tile} flex min-h-[8.75rem] flex-col justify-end rounded-[1.75rem] bg-gold p-4 text-ink [--edge:var(--color-gold-deep)]`}>
          <Art id="history" className="absolute top-2 right-2 size-[4.5rem]" />
          {title('history', 'mt-16', TIGHT)}
          {desc('history', 'self-start')}
        </Link>
      ),
    },
    // White square, the book on the left.
    language: {
      span: '',
      body: (
        <Link to={section('language').path} className={`${tile} flex min-h-[8.75rem] flex-col justify-end rounded-[1.75rem] bg-white p-4 text-green-dark [--edge:var(--color-sand)]`}>
          <Art id="language" className="absolute top-2 left-3 size-[4.5rem] -rotate-6" />
          {title('language', 'mt-16', TIGHT)}
          {showDesc && <span className={`${chip} self-start bg-cream`}>{t(section('language').desc)}</span>}
        </Link>
      ),
    },
    // Wide sky banner, the martenitsa hanging on the left.
    culture: {
      span: 'col-span-2',
      body: (
        <Link to={section('culture').path} className={`${tile} flex min-h-[7rem] flex-col justify-center rounded-[2rem] bg-sky p-5 pl-[40%] text-ink [--edge:var(--color-sky-deep)]`}>
          <span className="absolute -bottom-16 -left-8 size-44 rounded-full bg-white/25" aria-hidden="true" />
          <Art id="culture" className="absolute top-1/2 left-4 size-24 -translate-y-1/2 -rotate-12" />
          {title('culture')}
          {desc('culture', 'self-start')}
        </Link>
      ),
    },
    // Dark pill with the medal and the badge counter.
    collection: {
      span: 'col-span-2',
      body: (
        <Link to={section('collection').path} className={`${tile} flex items-center gap-3 rounded-full bg-green-dark py-2.5 pr-5 pl-2.5 text-white [--edge:var(--color-green-deep)]`}>
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold">
            <SectionIcon id="collection" className="size-11" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg leading-tight font-black">{t(section('collection').label)}</span>
            {missions && <span className="block text-sm font-bold text-white/85">{t('passport.count', { n: profile.badges.length, total: missions.length })}</span>}
          </span>
          <Icon name="chevron" className="shrink-0" />
        </Link>
      ),
    },
  }

  return (
    <Screen nav>
      <h1 className="sr-only">{t('nav.home')}</h1>

      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Link
          to="/who"
          className="tap press flex max-w-[70%] min-w-0 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-1 shadow-soft"
          aria-label={`${t('profile.who')} ${name(profile, profiles.indexOf(profile))}`}
        >
          <ProfileAvatar avatar={profile.avatar} className="size-11 bg-green-soft shadow-none" />
          <span className="truncate font-extrabold">{name(profile, profiles.indexOf(profile))}</span>
        </Link>
        <Link to="/parents" className={roundButton} aria-label={t('parents.title')}>
          <Icon name="gear" />
        </Link>
      </div>

      <div className="px-4 pt-3 empty:hidden">
        <UpdateBanner />
      </div>

      {/* Hero: Koren and Raya greet the child in front of the hills. */}
      <section className="relative mx-4 mt-3 h-[15.5rem]">
        <Scenery className="absolute inset-0 rounded-[2rem] shadow-soft" />
        <div className="absolute top-3 left-3 rounded-full bg-white px-3.5 py-1.5 shadow-soft">
          <Logo size="sm" className="h-8" />
        </div>
        <m.p
          initial={{ opacity: 0, scale: 0.8, x: -12 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ ...bouncy, delay: 0.35 }}
          className="absolute top-[4.25rem] left-3 max-w-[50%] origin-bottom-left rounded-[1.5rem] rounded-bl-md bg-white px-4 py-2.5 leading-snug font-extrabold shadow-soft"
        >
          {t(`home.greeting.${level}`)}
        </m.p>
        <div className="absolute right-2 bottom-8 flex items-end" aria-hidden="true">
          <m.div initial={{ y: 36 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.1 }}>
            <HeroFigure hero="raya" className="anim-bob h-[9.75rem]" />
          </m.div>
          <m.div initial={{ y: 36 }} animate={{ y: 0 }} transition={{ ...bouncy, delay: 0.2 }} className="-ml-3">
            <HeroFigure hero="koren" className="anim-bob-late h-[10.25rem]" />
          </m.div>
        </div>
      </section>

      {/* "Next mission" pill, overlapping the hero. Its height is reserved while missions load. */}
      <div className="relative z-10 mx-7 -mt-7 min-h-[var(--tap)]">
        {missions && (
          <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to={next ? `/mission/${next.id}` : '/collection'}
              className="tap press flex items-center gap-3 rounded-full bg-white p-1.5 shadow-float"
            >
              <BadgeArt icon={next ? next.badge.icon : 'tiles/collection.webp'} className="size-[min(3.25rem,13vw)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-black tracking-wide text-coral-dark uppercase">
                  {next ? t('home.next') : t('home.allDone.caption')}
                </span>
                <span className="line-clamp-2 text-[clamp(0.9rem,4.4vw,1rem)] leading-tight font-extrabold">{next ? l(next.title) : t('home.allDone')}</span>
              </span>
              <span className="puck grid size-[min(3rem,12vw)] shrink-0 place-items-center rounded-full bg-coral text-coral-ink [--edge:var(--color-coral-deep)]" aria-hidden="true">
                <Icon name={next ? 'play' : 'star'} />
              </span>
            </Link>
          </m.div>
        )}
      </div>

      <m.ul variants={stagger} initial="hidden" animate="show" className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 px-4 pb-32">
        {ORDER.map((id) => (
          <m.li key={id} variants={settle} className={modules[id].span}>
            {modules[id].body}
          </m.li>
        ))}
      </m.ul>
    </Screen>
  )
}
