import { glows } from '../effects/glows';
import { motionPresets } from '../motion/presets';
import type { OverlayName, PresetConfig, Scheme, Theme, Tokens } from './types';

const kebab = (k: string) => k.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

/** 완성된 프리셋 → --ui-* 변수 목록 */
export function buildVars(
  config: PresetConfig,
  theme: Theme,
  opts: { windowEffects: boolean },
): Record<string, string> {
  const tokens: Tokens = { ...theme.tokens, ...config.tokens };
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(tokens)) {
    if (v != null) vars[`--ui-${kebab(k)}`] = String(v);
  }
  // 네이티브 창 효과가 실제로 켜졌을 때만 배경을 반투명으로 바꿉니다.
  if (opts.windowEffects) vars['--ui-bg'] = tokens.bgTint;

  const g = glows[config.card.glow] ?? glows.none;
  vars['--ui-glow-size'] = `${g.size}px`;
  vars['--ui-glow-strength'] = `${g.strength}%`;
  vars['--ui-text-glow'] =
    theme.textGlow && g.strength > 0
      ? `0 0 ${Math.round(g.size * 0.45)}px color-mix(in srgb, var(--ui-accent) ${Math.min(100, Math.round(g.strength * 1.1))}%, transparent)`
      : 'none';

  const m = motionPresets[config.motion] ?? motionPresets.smooth;
  vars['--ui-dur'] = `${m.duration}ms`;
  vars['--ui-ease'] = m.easing;
  return vars;
}

export function applyVars(
  el: HTMLElement,
  vars: Record<string, string>,
  opts: { scheme: Scheme; overlay: OverlayName },
): void {
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  el.style.colorScheme = opts.scheme;
  el.dataset.scheme = opts.scheme;
  el.dataset.overlay = opts.overlay;
}
