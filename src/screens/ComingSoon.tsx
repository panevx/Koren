import { Navigate, useNavigate, useParams } from 'react-router'
import { BottomNav } from '../components/BottomNav'
import { Icon } from '../components/Icon'
import { Button, Screen, TopBar } from '../components/ui'
import { useT } from '../i18n/useT'
import { sectionById, type SectionId } from '../sections'

/**
 * Placeholder for sections that are not built yet. `section` is fixed for
 * /map, /missions, /collection; /topic/:id reads it from the URL.
 */
export function ComingSoon({ section }: { section?: SectionId }) {
  const t = useT()
  const navigate = useNavigate()
  const params = useParams()
  const found = sectionById(section ?? params.id)
  // Only real topics are valid; /topic/anything-else goes home.
  if (!found || (!section && !found.path.startsWith('/topic/'))) return <Navigate to="/home" replace />
  const { Art, label, arrives } = found

  return (
    <Screen>
      <TopBar title={t(label)} onBack={() => navigate('/home')} />
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 pb-32 text-center">
        <div className="relative grid size-40 place-items-center rounded-full bg-white shadow-md">
          <Art className="size-24" />
          <span className="absolute -top-1 -right-2 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-sm font-black text-ink shadow">
            <Icon name="clock" width="1em" height="1em" />
            {t('soon.badge')}
          </span>
        </div>
        <p className="max-w-xs text-lg font-semibold text-muted">{t('soon.text', { version: arrives })}</p>
        <Button variant="accent" onClick={() => navigate('/home')}>
          <Icon name="home" />
          {t('soon.back')}
        </Button>
      </div>
      <BottomNav />
    </Screen>
  )
}
