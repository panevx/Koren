import { img } from './Brand'

/**
 * A mission's badge. Painted medallions (public/img/badges) already have their gold rim
 * and are shown as they are. Any other picture (a mission without its own medallion yet)
 * gets a gold frame, so a new mission never needs new art to look finished.
 * `earned={false}` = the grey "not yet" state in the passport.
 */
export function BadgeArt({
  icon,
  earned = true,
  className = 'size-24',
  lazy = false,
}: {
  icon: string
  earned?: boolean
  className?: string
  /** For badges far down a long list: fetched only when scrolled near. */
  lazy?: boolean
}) {
  if (icon.startsWith('badges/')) {
    return (
      <img
        src={img(icon)}
        alt=""
        width={320}
        height={320}
        className={`shrink-0 object-contain ${earned ? '' : 'opacity-40 grayscale'} ${className}`}
        loading={lazy ? 'lazy' : undefined}
        decoding="async"
      />
    )
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full p-[7%] ${
        earned
          ? 'bg-gold shadow-[inset_0_3px_0_rgb(255_255_255/0.55),0_4px_0_var(--color-gold-deep)]'
          : 'bg-sand shadow-[inset_0_3px_6px_rgb(28_43_35/0.12)]'
      } ${className}`}
    >
      <span className={`grid size-full place-items-center rounded-full ${earned ? 'bg-white' : 'bg-cream'}`}>
        <img
          src={img(icon)}
          alt=""
          className={`size-[70%] object-contain ${earned ? '' : 'opacity-40 grayscale'}`}
          loading={lazy ? 'lazy' : undefined}
          decoding="async"
        />
      </span>
    </span>
  )
}
