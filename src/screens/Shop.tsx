import { useState } from 'react'
import { img } from '../components/Brand'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { Screen, TopBar } from '../components/ui'
import { COINS_PER_DAY, COINS_PER_MISSION, SHOP, SLOTS, adventureDays, shopItem, wallet, type ShopItem } from '../content/rewards'
import { MISSIONS } from '../content/missions'
import { useLocalized } from '../content/useLocalized'
import { useT } from '../i18n/useT'
import { bouncy, m } from '../motion'
import { play } from '../sound'
import { useActiveProfile, useProfiles } from '../store/profiles'
import { ART } from '../world'

const COIN = ART.coin
const PENDAR = ART.pendar

/**
 * The fair stall ("Сергия") and the wardrobe. Things are bought with game coins only — there is no real money anywhere.
 * Buying needs two taps (buy → yes); bought things can be worn and taken off at any time and are kept on the device.
 * A thing the child cannot afford yet says how many coins are still needed — never "you are poor".
 */
export function Shop() {
  const t = useT()
  const l = useLocalized()
  const profile = useActiveProfile()
  const { buy, wear, takeOff } = useProfiles.getState()
  const purse = wallet(profile, MISSIONS)
  const days = adventureDays(profile.days)
  const [asking, setAsking] = useState<string | null>(null)
  const [just, setJust] = useState<string | null>(null)

  const left = (i: ShopItem) => i.price - (i.currency === 'coin' ? purse.coins : purse.pendars)
  const onBuy = (i: ShopItem) => {
    if (asking !== i.id) {
      play('tap')
      setAsking(i.id)
      return
    }
    play('badge')
    buy(i.id, i.slot)
    setAsking(null)
    setJust(i.id)
  }
  const worn = SLOTS.map((s) => profile.outfit[s]).filter(Boolean).map((id) => shopItem(id!)!).filter(Boolean)

  return (
    <Screen nav wide>
      <TopBar title={t('shop.title')} />
      <div className="flex flex-col gap-5 px-4 pb-32 short:pb-8 wide:grid wide:grid-cols-[minmax(0,min(19rem,50%))_minmax(0,1fr)] wide:items-start wide:gap-8 wide:pb-10">
        <div className="flex flex-col gap-4 wide:sticky wide:top-4">
          {/* The purse */}
          <section aria-labelledby="purse" className="bg-stage-night relative rounded-[var(--radius-stage)] p-5 text-white shadow-stage">
            <h2 id="purse" className="sr-only">{t('shop.purse')}</h2>
            <div className="flex items-center justify-center gap-6 pt-6">
              <span className="mat-ceramic grid size-[min(6.5rem,28vw)] place-items-center">
                <ProfileAvatar avatar={profile.avatar} outfit={profile.outfit} className="size-[88%] shadow-none" />
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="well-on-tint flex flex-col items-center rounded-[1.25rem] py-2">
                <img src={img(COIN)} alt="" className="pop-3d size-9" />
                <dd className="text-3xl leading-none font-black">{purse.coins}</dd>
                <dt className="order-last text-sm font-bold text-white/85">{t('shop.coins')}</dt>
              </div>
              <div className="well-on-tint flex flex-col items-center rounded-[1.25rem] py-2">
                <img src={img(PENDAR)} alt="" className="pop-3d size-9" />
                <dd className="text-3xl leading-none font-black">{purse.pendars}</dd>
                <dt className="order-last text-sm font-bold text-white/85">{t('shop.pendars')}</dt>
              </div>
            </dl>
            <p className="mt-3 text-center text-sm font-semibold text-white/90">{t('shop.how', { m: COINS_PER_MISSION, d: COINS_PER_DAY })}</p>
          </section>

          {/* Days of adventure — only good news */}
          <section aria-labelledby="days" className="edge-light relative flex items-center gap-3 rounded-[var(--radius-card)] mat-paper p-4">
            <img src={img(ART.streak)} alt="" className="pop-3d size-12 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 id="days" className="font-black">{t('shop.days', { n: days.total })}</h2>
              <p className="text-sm font-semibold text-muted">{days.row >= 2 ? t('shop.row', { n: days.row }) : t('shop.rowHint')}</p>
            </div>
          </section>

          {/* What is worn */}
          {worn.length > 0 && (
            <section aria-labelledby="worn" className="edge-light relative rounded-[var(--radius-card)] mat-paper p-4">
              <h2 id="worn" className="mb-2 font-black">{t('shop.worn')}</h2>
              <ul className="flex flex-wrap gap-2">
                {worn.map((i) => (
                  <li key={i.id}>
                    <button type="button" onClick={() => takeOff(i.slot)} className="tap press flex items-center gap-1.5 rounded-full bg-green-soft py-1 pr-3 pl-1 text-sm font-extrabold text-green-dark">
                      <img src={img(i.img)} alt="" className="size-8 object-contain" />
                      {t('shop.takeOff', { name: l(i.name) })}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* The stall */}
        <section aria-labelledby="stall" className="flex flex-col gap-3">
          <h2 id="stall" className="text-headline px-1">{t('shop.stall')}</h2>
          <ul className="grid grid-cols-2 gap-3 wide:grid-cols-[repeat(auto-fill,minmax(min(11rem,100%),1fr))]">
            {SHOP.map((i) => {
              const owned = profile.owned.includes(i.id)
              const on = profile.outfit[i.slot] === i.id
              const need = left(i)
              return (
                <li key={i.id} className="[container-type:inline-size]">
                  <m.div
                    animate={just === i.id ? { scale: [1, 1.08, 1] } : undefined}
                    transition={bouncy}
                    className={`edge-light flex h-full flex-col items-center gap-1.5 rounded-[var(--radius-card)] p-3 text-center ${on ? 'mat-satin mat tint-gold' : 'mat-paper'}`}
                  >
                    {/* each item stands on its own little pedestal, like goods laid out on a stall */}
                    <span className="relative grid place-items-center px-2 pb-1">
                      <span className={`pedestal absolute bottom-0 left-1/2 h-[24%] w-[88%] -translate-x-1/2 ${on ? 'tint-gold' : 'tint-paper'}`} aria-hidden="true" />
                      <img src={img(i.img)} alt="" className="pop-3d relative size-[min(5rem,34cqw)] object-contain" />
                    </span>
                    <p className="text-[length:clamp(0.6rem,9cqw,1rem)] leading-tight font-black">{l(i.name)}</p>
                    {owned ? (
                      <button
                        type="button"
                        onClick={() => (on ? takeOff(i.slot) : wear(i.id, i.slot))}
                        aria-pressed={on}
                        className={`tap press mt-auto w-full rounded-full px-2 py-1.5 text-sm font-extrabold ${on ? 'bg-green-dark text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_1px_2px_rgb(10_82_48/0.3)]' : 'bg-green-soft text-green-dark shadow-[inset_0_1px_0_#fff,0_0_0_1px_rgb(10_82_48/0.08)]'}`}
                      >
                        {on ? t('shop.wearing') : t('shop.wear')}
                      </button>
                    ) : need > 0 ? (
                      <p className="well mt-auto flex items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[length:clamp(0.5rem,8cqw,0.75rem)] font-bold text-muted">
                        <img src={img(i.currency === 'coin' ? COIN : PENDAR)} alt="" className="size-4 shrink-0" />
                        {t(i.currency === 'coin' ? 'shop.needCoins' : 'shop.needPendars', { n: need })}
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBuy(i)}
                        className={`tap btn-satin edge-light mt-auto flex w-full items-center justify-center gap-1 rounded-full px-2 py-1.5 text-sm font-extrabold ${asking === i.id ? 'tint-coral text-coral-ink' : 'tint-gold text-ink'}`}
                      >
                        <img src={img(i.currency === 'coin' ? COIN : PENDAR)} alt="" className="size-5" />
                        {asking === i.id ? t('shop.sure') : t('shop.buy', { n: i.price })}
                      </button>
                    )}
                  </m.div>
                </li>
              )
            })}
          </ul>
          <p className="text-center text-xs font-semibold text-muted">{t('shop.noMoney')}</p>
        </section>
      </div>
    </Screen>
  )
}
