import type { ComponentType } from 'react'
import { Link } from 'react-router'
import { BookArt, CastleArt, GamepadArt, MapArt, ShevitsaArt, TrophyArt } from '../components/Art'
import { BottomNav } from '../components/BottomNav'
import { Landscape, Logo } from '../components/Brand'
import { Icon } from '../components/Icon'
import { Screen } from '../components/ui'
import type { TKey } from '../i18n'
import { useT } from '../i18n/useT'

type Tile = { to: string; label: TKey; Art: ComponentType<{ className?: string }> }

export const HOME_TILES: readonly Tile[] = [
  { to: '/map', label: 'tile.discover', Art: MapArt },
  { to: '/topic/history', label: 'tile.history', Art: CastleArt },
  { to: '/topic/culture', label: 'tile.culture', Art: ShevitsaArt },
  { to: '/topic/language', label: 'tile.language', Art: BookArt },
  { to: '/missions', label: 'tile.missions', Art: GamepadArt },
  { to: '/collection', label: 'tile.collection', Art: TrophyArt },
]

export function Home() {
  const t = useT()

  return (
    <Screen>
      <header className="relative overflow-hidden">
        <Landscape className="absolute inset-0 h-full w-full" />
        <div className="relative flex items-start justify-between px-4 pt-4 pb-14">
          <span className="tap" aria-hidden="true" />
          <Logo size="sm" />
          <Link
            to="/settings"
            className="tap grid place-items-center rounded-full bg-white/80 text-green shadow-sm hover:bg-white"
            aria-label={t('settings.title')}
          >
            <Icon name="gear" />
          </Link>
        </div>
      </header>

      <div className="relative -mt-8 flex-1 rounded-t-[2rem] bg-cream px-4 pt-5 pb-28">
        <h1 className="sr-only">{t('nav.home')}</h1>
        <ul className="grid grid-cols-2 gap-3">
          {HOME_TILES.map(({ to, label, Art }) => (
            <li key={to}>
              <Link
                to={to}
                className="rounded-level flex aspect-[1.1] flex-col items-center justify-center gap-2 border-2 border-sand bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-green hover:shadow-md"
              >
                <Art className="size-16" />
                <span className="text-base leading-tight font-extrabold text-green-dark">{t(label)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <BottomNav />
    </Screen>
  )
}
