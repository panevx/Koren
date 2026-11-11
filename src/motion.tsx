/**
 * Motion setup for KOREN. `m` + LazyMotion keeps the bundle small; `reducedMotion="user"`
 * turns transforms off for people who asked their phone for less motion (opacity still fades).
 * Rule: animate only transform and opacity — they stay on the compositor (60 fps on phones).
 */
import type { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'

export { m }

/** Default: quick and soft. */
export const spring = { type: 'spring', stiffness: 420, damping: 30, mass: 0.9 } as const
/** For rewards and reactions: overshoots a little. */
export const bouncy = { type: 'spring', stiffness: 480, damping: 15 } as const

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user" transition={spring}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

/** A screen sliding in. */
export const pageEnter = { initial: { opacity: 0.4, y: 18 }, animate: { opacity: 1, y: 0 } } as const

/** Parent + children that pop in one after another. */
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } } } as const
export const rise = { hidden: { opacity: 0, y: 18, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } } as const
/**
 * Same movement, but visible from the first frame. For the first screen's big pictures:
 * an element that starts transparent is painted late and slows the "largest paint" (LCP).
 */
export const settle = { hidden: { y: 20, scale: 0.95 }, show: { y: 0, scale: 1 } } as const

/** Something appearing with a little bounce (a badge, a hero's face, a tick). */
export const pop = { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: bouncy } as const
