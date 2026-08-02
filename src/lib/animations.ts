import { useSyncExternalStore } from "react";
import type { Variants, Transition } from "framer-motion";

/* ────────────────────────────────────────────────────────────
   Accessibility — Prefers Reduced Motion
   SSR-safe: uses useSyncExternalStore so server and client
   produce identical initial output (false), preventing
   React hydration error #418.
   ──────────────────────────────────────────────────────────── */
const MQ = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(MQ).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

/* ────────────────────────────────────────────────────────────
   Shared Framer Motion Variants
   ──────────────────────────────────────────────────────────── */

/** Standard fade-in + slide-up reveal. Duration ~400ms ease-out. */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Stagger container — children animate in sequence with ~60ms delay */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

/** Subtle fade-in / slide-up for icons, avatars, badges (replacing bouncy scaleIn) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/** For cards: hover lift + scale effect */
export const cardHoverScale = 1.015;
export const cardHoverTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

/** Button micro-interaction: active press */
export const buttonTapScale = 0.97;
export const buttonHoverScale = 1.025;

/** Count-up animation config */
export const countUpTransition: Transition = {
  duration: 1.0,
  ease: [0.22, 1, 0.36, 1],
};

/** Progress fill transition (bars and rings) */
export const progressTransition: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

/** Modal / overlay in */
export const modalIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Slide-in drawer (from left) */
export const drawerIn: Variants = {
  hidden: { x: "-100%" },
  show: { x: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
};

/** Page transition: quick fade */
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: "easeIn" } },
};

/** Filter/grid re-arrange: opacity + scale for enter/exit */
export const listItem: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
};

/* ────────────────────────────────────────────────────────────
   Accessibility: disable animations when reduced motion
   ──────────────────────────────────────────────────────────── */

/** Return empty/instant variants when user prefers reduced motion */
export function safeVariants(variants: Variants, reduced: boolean): Variants {
  if (!reduced) return variants;
  // Return variants with instant transitions
  const instant: Variants = {};
  for (const key of Object.keys(variants)) {
    const val = variants[key] as Record<string, unknown>;
    instant[key] = { ...val, transition: { duration: 0 } };
  }
  return instant;
}

export function safeTransition(
  transition: Transition | undefined,
  reduced: boolean,
): Transition {
  if (!reduced) return transition ?? {};
  return { duration: 0 };
}
