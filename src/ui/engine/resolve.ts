import { merge } from './merge';
import type { PresetConfig, PresetDef } from './types';

/** 모든 프리셋의 바닥값. 프리셋에 없는 항목은 여기서 채워집니다. */
export const DEFAULT_CONFIG: PresetConfig = {
  theme: 'glass',
  motion: 'smooth',
  tokens: {},
  background: { shader: 'none', speed: 0.25, overlay: 'none' },
  card: { glow: 'none', tilt: false, decor: 'none' },
  button: { ripple: false, press: false },
  window: { windows: [], macos: [] },
};

/** extends 사슬을 따라가며 프리셋 하나를 완성된 설정으로 풀어냅니다. */
export function resolvePreset(
  name: string,
  registry: Record<string, PresetDef>,
  seen: string[] = [],
): PresetConfig {
  const def = registry[name];
  if (!def) {
    throw new Error(`[ui] "${name}" 프리셋이 없어요. 등록된 프리셋: ${Object.keys(registry).join(', ')}`);
  }
  if (seen.includes(name)) {
    throw new Error(`[ui] extends가 순환해요: ${[...seen, name].join(' → ')}`);
  }
  const { extends: parent, ...rest } = def;
  const base = parent ? resolvePreset(parent, registry, [...seen, name]) : DEFAULT_CONFIG;
  return merge(base, rest);
}
