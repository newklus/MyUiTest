import type { MotionName } from '../engine/types';

export interface MotionPreset {
  /** CSS transition·WAAPI에 쓰는 시간(ms) */
  duration: number;
  /** CSS timing function */
  easing: string;
  /** Motion(motion/react)을 쓰게 되면 transition prop에 그대로 넣을 수 있는 값 */
  transition:
    | { type: 'tween'; duration: number; ease: [number, number, number, number] }
    | { type: 'spring'; stiffness: number; damping: number; mass: number };
}

export const motionPresets: Record<MotionName, MotionPreset> = {
  smooth: {
    duration: 420,
    easing: 'cubic-bezier(.22,1,.36,1)',
    transition: { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  bouncy: {
    duration: 560,
    easing: 'cubic-bezier(.34,1.56,.64,1)',
    transition: { type: 'spring', stiffness: 360, damping: 17, mass: 0.9 },
  },
  snappy: {
    duration: 160,
    easing: 'cubic-bezier(.2,0,0,1)',
    transition: { type: 'tween', duration: 0.16, ease: [0.2, 0, 0, 1] },
  },
  /** 옛 단말기처럼 뚝뚝 끊기며 움직입니다. Motion 라이브러리에는 steps 곡선이 없어 선형으로 근사합니다. */
  stepped: {
    duration: 320,
    easing: 'steps(5, end)',
    transition: { type: 'tween', duration: 0.32, ease: [0, 0, 1, 1] },
  },
};
