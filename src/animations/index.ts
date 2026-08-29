import type { Variants } from 'framer-motion'

/*
 * NoorulQuran motion system — Phase 10
 * One coherent language of variants consumed across every page/component.
 * All animations use transform + opacity (GPU-composited) and stay short.
 * Global `prefers-reduced-motion` kill-switch lives in index.css.
 */

/** Route change: fade + slight vertical movement, progressive reveal */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.97, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

/** Parent that staggers its <motion.* variants={item...}> children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

/** Interaction presets — spread onto motion elements directly */
export const cardHover = {
  whileHover: { y: -4, transition: { duration: 0.25, ease: 'easeOut' as const } },
  whileTap: { scale: 0.985 },
}

export const pressable = {
  whileTap: { scale: 0.96 },
}

export const modalEnter: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 24, stiffness: 300 },
  },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.16 } },
}

export const drawerEnter: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: { type: 'spring', damping: 28, stiffness: 220 },
  },
  exit: { x: '-100%', transition: { duration: 0.2 } },
}

/** Soft, repeating illumination for the active ayah (never touches the text) */
export const activeAyah: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(14, 122, 99, 0)',
      '0 0 0 3px rgba(14, 122, 99, 0.12)',
      '0 0 0 0 rgba(14, 122, 99, 0)',
    ],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
}

/** Cinematic hero — staged children delays (background → wordmark → CTA) */
export const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
}

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}