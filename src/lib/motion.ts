import type { Transition } from "framer-motion";

// Keep the reveal curve and timing in sync with the CSS tokens in globals.css.
const settle = [0.22, 1, 0.36, 1] as const;

export const motionReveal = {
  type: "tween",
  duration: 0.42,
  ease: [...settle],
} satisfies Transition;

export const motionFade = {
  type: "tween",
  duration: 0.22,
  ease: [0.25, 0.1, 0.25, 1],
} satisfies Transition;

export const motionSpring = {
  type: "spring",
  visualDuration: motionReveal.duration,
  bounce: 0.16,
} satisfies Transition;

export const motionPanel = {
  ...motionSpring,
  opacity: motionFade,
} satisfies Transition;
