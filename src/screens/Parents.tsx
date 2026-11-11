import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Flag } from '../components/Brand'
import { OfflinePanel } from '../components/OfflinePanel'
import { Icon, type IconName } from '../components/Icon'
import { AvatarPicker, ProfileAvatar, useProfileName } from '../components/ProfileAvatar'
import { Button, Screen, TopBar } from '../components/ui'
import { MISSIONS } from '../content/missions'
import { useLocalized } from '../content/useLocalized'
import { LANGS } from '../i18n'
import { useT } from '../i18n/useT'
import { MAX_PROFILES, NICKNAME_MAX, useProfiles, type AvatarId, type Profile } from '../store/profiles'
import { useSettings } from '../store/settings'
import { DEFAULT_AGE, MAX_AGE, MIN_AGE, ageToLevel, clampAge } from '../theme/levels'

// ── Gate ─────────────────────────────────────────────────────────────
/** Once solved, the gate stays open for a few minutes so a parent can move around. */
const UNLOCK_MS = 10 * 60 * 1000
let unlockedAt = 0
export const lockParents = () => {
  unlockedAt = 0
}

function newSum() {
  const r = () => 6 + Math.floor(Math.random() * 4) // 6..9 — beyond what young children know by heart
  return { a: r(), b: r() }
}

function Gate({ onPass }: { onPass: () => void }) {
  const t = useT()
  const navigate = useNavigate()
  const [sum, setSum] = useState(newSum)
  const [input, setInput] = useState('')
  const [wrong, setWrong] = useState(false)

  const submit = () => {
    if (Number(input) === sum.a * sum.b) {
      unlockedAt = Date.now()
      onPass()
      return
    }
    setWrong(true)
    setInput('')
    setSum(newSum())
  }
  const key = (k: string) => {
    setWrong(false)
    setInput((v) => (k === '⌫' ? v.slice(0, -1) : (v + k).slice(0, 3)))
  }

  return (
    <Screen>
      <TopBar title={t('gate.title')} onBack={() => navigate('/home')} />
      <div className="flex flex-1 flex-col items-center gap-4 px-6 pb-8">
        <p className="text-center font-semibold text-muted">{t('gate.text')}</p>
        <p className="text-3xl font-black" id="gate-q">
          {t('gate.question', { a: sum.a, b: sum.b })}
        </p>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="rounded-level grid h-16 w-40 place-items-center border-2 border-sand bg-white text-3xl font-black tracking-widest"
        >
          <span className="sr-only">{t('gate.answer')}: </span>
          {input || ' '}
        </div>
        <p role="status" className="min-h-6 text-center font-bold text-red">
          {wrong ? t('gate.wrong') : ''}
        </p>
        <div className="grid w-full max-w-xs grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => key(k)}
              aria-label={k === '⌫' ? t('gate.delete') : k}
              className="tap rounded-level border-2 border-sand bg-white text-2xl font-black hover:border-green"
            >
              {k}
            </button>
          ))}
          <button type="button" onClick={submit} disabled={!input} className="tap rounded-level bg-green text-lg font-black text-white disabled:opacity-40">
            {t('gate.ok')}
          </button>
        </div>
      </div>
    </Screen>
  )
}

// ── Parents area ─────────────────────────────────────────────────────
export function Parents() {
  const [open, setOpen] = useState(() => Date.now() - unlockedAt < UNLOCK_MS)
  return open ? <ParentsArea /> : <Gate onPass={() => setOpen(true)} />
}

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

function SwitchRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex-1 text-sm text-muted">{hint}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`tap relative flex shrink-0 items-center rounded-full transition ${checked ? 'bg-green' : 'bg-sand'}`}
        style={{ width: 'calc(var(--tap) * 1.4)' }}
      >
        <span className={`absolute size-7 rounded-full bg-white shadow transition-all ${checked ? 'right-1.5' : 'left-1.5'}`} />
      </button>
    </div>
  )
}

/** A destructive button that needs a second tap within 4 s. */
function useConfirm(): [boolean, () => boolean] {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const id = window.setTimeout(() => setArmed(false), 4000)
    return () => window.clearTimeout(id)
  }, [armed])
  return [
    armed,
    () => {
      if (armed) return true
      setArmed(true)
      return false
    },
  ]
}

type Draft = { nickname: string; age: number; avatar: AvatarId }

function ProfileForm({ initial, onSave, onCancel }: { initial: Draft; onSave: (d: Draft) => void; onCancel: () => void }) {
  const t = useT()
  const [d, setD] = useState(initial)
  return (
    <div className="flex flex-col gap-4 rounded-level border-2 border-green bg-cream p-3">
      <label className="flex flex-col gap-1 font-bold">
        {t('parents.nickname')}
        <input
          type="text"
          value={d.nickname}
          maxLength={NICKNAME_MAX}
          autoComplete="off"
          onChange={(e) => setD({ ...d, nickname: e.target.value })}
          className="tap rounded-level border-2 border-sand bg-white px-3 text-lg font-bold"
        />
        <span className="text-sm font-normal text-muted">{t('parents.nicknameHint')}</span>
      </label>
      <div className="flex items-center gap-3 font-bold">
        <span className="flex-1">{t('parents.age')}</span>
        <button type="button" aria-label={t('parents.younger')} onClick={() => setD({ ...d, age: clampAge(d.age - 1) })} disabled={d.age <= MIN_AGE} className="tap grid place-items-center rounded-full border-2 border-sand bg-white text-2xl disabled:opacity-40">
          −
        </button>
        <output className="w-24 text-center text-xl font-black" aria-live="polite">
          {t('age.years', { n: d.age })}
        </output>
        <button type="button" aria-label={t('parents.older')} onClick={() => setD({ ...d, age: clampAge(d.age + 1) })} disabled={d.age >= MAX_AGE} className="tap grid place-items-center rounded-full border-2 border-sand bg-white text-2xl disabled:opacity-40">
          +
        </button>
      </div>
      <div>
        <p className="mb-2 font-bold">{t('profile.avatar')}</p>
        <AvatarPicker value={d.avatar} onChange={(avatar) => setD({ ...d, avatar })} />
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          {t('parents.cancel')}
        </Button>
        <Button variant="accent" className="flex-1" onClick={() => onSave(d)}>
          {t('parents.save')}
        </Button>
      </div>
    </div>
  )
}

function ProfileCard({ profile, index }: { profile: Profile; index: number }) {
  const t = useT()
  const name = useProfileName()
  const { activeId, profiles, updateProfile, removeProfile } = useProfiles()
  const [editing, setEditing] = useState(false)
  const [armed, confirm] = useConfirm()
  const total = MISSIONS.length

  if (editing)
    return (
      <ProfileForm
        initial={{ nickname: profile.nickname, age: profile.age, avatar: profile.avatar }}
        onCancel={() => setEditing(false)}
        onSave={(d) => {
          updateProfile(profile.id, d)
          setEditing(false)
        }}
      />
    )

  return (
    <li className="rounded-level flex flex-col gap-3 border-2 border-sand p-3">
      <div className="flex items-center gap-3">
        <ProfileAvatar avatar={profile.avatar} className="size-14" />
        <div className="flex-1">
          <p className="text-lg font-black">{name(profile, index)}</p>
          <p className="text-sm font-semibold text-muted">
            {t('age.years', { n: profile.age })} · {t(`level.${ageToLevel(profile.age)}.short`)} ·{' '}
            {t('profile.badges', { n: profile.badges.length, total })}
          </p>
          {profile.id === activeId && <p className="text-xs font-black text-green uppercase">{t('profile.playing')}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)} aria-label={`${t('parents.edit')}: ${name(profile, index)}`}>
          {t('parents.edit')}
        </Button>
        {profiles.length > 1 && (
          <Button
            variant="secondary"
            className={`flex-1 ${armed ? 'border-red text-red' : ''}`}
            onClick={() => confirm() && removeProfile(profile.id)}
            aria-label={`${armed ? t('parents.removeConfirm') : t('parents.remove')}: ${name(profile, index)}`}
          >
            {armed ? t('parents.removeConfirm') : t('parents.remove')}
          </Button>
        )}
      </div>
    </li>
  )
}

function Learns({ profile, index }: { profile: Profile; index: number }) {
  const t = useT()
  const l = useLocalized()
  const name = useProfileName()
  const played = MISSIONS.filter((m) => profile.done[m.id])
  return (
    <div className="flex flex-col gap-2">
      <p className="font-black">
        {name(profile, index)} — {t('parents.learnsDone', { n: played.length, total: MISSIONS.length })}
      </p>
      {played.length === 0 ? (
        <p className="text-sm text-muted">{t('parents.learnsNone')}</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {played.map((m) => (
            <li key={m.id} className="flex items-center gap-2">
              <Icon name="check" className="shrink-0 text-green" width="1em" height="1em" />
              <span className="flex-1">
                <b>{l(m.title)}</b> · {t(`subject.${m.subject}`)} · {t(`level.${profile.done[m.id]!.level}.short`)}
              </span>
              <span className="text-muted">{profile.done[m.id]!.at}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ParentsArea() {
  const t = useT()
  const navigate = useNavigate()
  const { lang, remember, sound, setLang, setRemember, setSound } = useSettings()
  const { profiles, addProfile } = useProfiles()
  const [adding, setAdding] = useState(false)
  const [armed, confirm] = useConfirm()

  const eraseAll = () => {
    if (!confirm()) return
    useProfiles.getState().reset()
    useSettings.getState().reset()
    void useProfiles.persist.clearStorage()
    void useSettings.persist.clearStorage()
    lockParents()
    navigate('/', { replace: true })
  }

  return (
    <Screen>
      <TopBar title={t('parents.title')} onBack={() => navigate('/home')} />
      <div className="flex flex-col gap-4 px-4 pb-8">
        <Section icon="users" title={t('parents.profiles')}>
          <p className="mb-3 text-sm text-muted">{t('parents.profilesHint')}</p>
          <ul className="flex flex-col gap-3">
            {profiles.map((p, i) => (
              <ProfileCard key={p.id} profile={p} index={i} />
            ))}
          </ul>
          {profiles.length < MAX_PROFILES &&
            (adding ? (
              <div className="mt-3">
                <ProfileForm
                  initial={{ nickname: '', age: DEFAULT_AGE, avatar: 'compass' }}
                  onCancel={() => setAdding(false)}
                  onSave={(d) => {
                    addProfile(d)
                    setAdding(false)
                  }}
                />
              </div>
            ) : (
              <Button variant="accent" className="mt-3 w-full" onClick={() => setAdding(true)}>
                + {t('parents.add')}
              </Button>
            ))}
        </Section>

        <Section icon="star" title={t('parents.learns')}>
          <div className="flex flex-col gap-4">
            {profiles.map((p, i) => (
              <Learns key={p.id} profile={p} index={i} />
            ))}
          </div>
        </Section>

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

        <Section icon="save" title={t('offline.title')}>
          <OfflinePanel />
        </Section>

        <Section icon="sound" title={t('settings.sound')}>
          <SwitchRow label={t('settings.sound')} hint={t('settings.soundHint')} checked={sound} onChange={setSound} />
        </Section>

        <Section icon="save" title={t('settings.remember')}>
          <SwitchRow label={t('settings.remember')} hint={t('settings.rememberHint')} checked={remember} onChange={setRemember} />
        </Section>

        <Section icon="check" title={t('parents.privacy')}>
          <p className="text-sm text-muted">{t('parents.privacyText')}</p>
        </Section>

        <div className="flex flex-col items-center gap-2 pt-2">
          <Button variant="secondary" onClick={eraseAll} className={armed ? 'border-red text-red' : ''}>
            <Icon name="refresh" />
            {armed ? t('parents.eraseConfirm') : t('parents.eraseAll')}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
