import type { CSSProperties } from 'react';
import type { GlowName } from '../engine/types';

/** size는 번짐 반경(px), strength는 accent 색을 섞는 비율(%) */
export const glows: Record<GlowName, { size: number; strength: number }> = {
  'glow-soft': { size: 22, strength: 32 },
  'glow-strong': { size: 30, strength: 72 },
  none: { size: 0, strength: 0 },
};

/** 특정 요소에만 다른 글로우를 줄 때 style로 넣는 변수 */
export function glowVars(name: GlowName): CSSProperties {
  const g = glows[name];
  return { '--ui-glow-size': `${g.size}px`, '--ui-glow-strength': `${g.strength}%` } as CSSProperties;
}
