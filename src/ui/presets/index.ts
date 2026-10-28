import type { PresetDef } from '../engine/types';

/**
 * 스타일 팩 = 테마 + 이펙트 + 모션 + 창 효과의 조합.
 * 전부 데이터라서 JSON으로 저장하거나 불러와도 됩니다.
 */
export const presets = {
  glass: {
    theme: 'glass',
    motion: 'smooth',
    background: { shader: 'aurora', speed: 0.35 },
    card: { glow: 'glow-soft', tilt: true },
    button: { ripple: true },
    // Windows 11은 mica, macOS 26은 Liquid Glass(이전 버전은 hudWindow로 대체)
    window: { windows: ['micaDark'], macos: ['liquidGlassRegular', 'hudWindow'] },
  },
  neon: {
    theme: 'neon',
    motion: 'bouncy',
    background: { shader: 'grid', speed: 0.6 },
    card: { glow: 'glow-strong', tilt: true },
    button: { ripple: true },
  },
  minimal: {
    theme: 'minimal',
    motion: 'snappy',
    background: { shader: 'none' },
    card: { glow: 'none', tilt: false },
    button: { ripple: false },
  },
  terminal: {
    theme: 'terminal',
    motion: 'stepped',
    background: { shader: 'phosphor', speed: 1, overlay: 'scanlines' },
    card: { glow: 'glow-soft', tilt: false },
    button: { ripple: false },
  },
  brutal: {
    theme: 'brutal',
    motion: 'snappy',
    background: { shader: 'none' },
    card: { glow: 'none', tilt: false },
    button: { ripple: false, press: true },
  },
  clay: {
    theme: 'clay',
    motion: 'bouncy',
    background: { shader: 'blobs', speed: 0.25, overlay: 'grain' },
    card: { glow: 'none', tilt: true },
    button: { ripple: true },
  },
  macos: {
    theme: 'macos',
    motion: 'smooth',
    background: { shader: 'blobs', speed: 0.15 },
    card: { glow: 'none', tilt: false },
    button: { ripple: false },
    window: { windows: ['micaLight'], macos: ['liquidGlassRegular', 'underWindowBackground'] },
  },
  goryeo: {
    theme: 'goryeo',
    motion: 'smooth',
    background: { shader: 'ink', speed: 0.12, overlay: 'grain' },
    card: { glow: 'none', tilt: false, decor: 'frame' },
    button: { ripple: false },
  },
  cyber: {
    theme: 'cyber',
    motion: 'snappy',
    background: { shader: 'rain', speed: 0.9, overlay: 'scanlines' },
    card: { glow: 'glow-soft', tilt: true, decor: 'corners' },
    button: { ripple: false },
  },
  forest: {
    theme: 'forest',
    motion: 'smooth',
    background: { shader: 'fireflies', speed: 0.5 },
    card: { glow: 'glow-soft', tilt: true },
    button: { ripple: true },
  },
  fantasy: {
    theme: 'fantasy',
    motion: 'smooth',
    background: { shader: 'stars', speed: 0.6 },
    card: { glow: 'glow-soft', tilt: true, decor: 'corners' },
    button: { ripple: true },
  },
  steampunk: {
    theme: 'steampunk',
    motion: 'snappy',
    background: { shader: 'gears', speed: 0.35, overlay: 'grain' },
    card: { glow: 'none', tilt: false, decor: 'rivets' },
    button: { ripple: false },
  },
  /** 상속 예시: glass를 물려받고 accent 색, 틸트, 배경 속도만 바꿉니다. */
  calm: {
    extends: 'glass',
    tokens: { accent: '#ffc9a8', onAccent: '#2a1408' },
    card: { tilt: false },
    background: { speed: 0.08 },
  },
} satisfies Record<string, PresetDef>;

export type PresetName = keyof typeof presets;
