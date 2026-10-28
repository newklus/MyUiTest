export type Scheme = 'dark' | 'light';
export type GlowName = 'glow-soft' | 'glow-strong' | 'none';
export type MotionName = 'smooth' | 'bouncy' | 'snappy';
export type ShaderName = 'aurora' | 'grid' | 'dots' | 'none';

/**
 * Tauri 2 창 효과 이름 (Rust의 WindowEffect, camelCase).
 * @tauri-apps/api 버전에 따라 JS enum에 없는 이름도 있어서 직접 정의합니다.
 */
export type WindowEffectName =
  // Windows
  | 'mica' | 'micaDark' | 'micaLight' | 'tabbed' | 'tabbedDark' | 'tabbedLight' | 'acrylic' | 'blur'
  // macOS
  | 'sidebar' | 'hudWindow' | 'underWindowBackground' | 'windowBackground' | 'contentBackground'
  | 'headerView' | 'sheet' | 'popover' | 'menu' | 'titlebar' | 'fullScreenUI' | 'tooltip'
  | 'underPageBackground' | 'liquidGlassRegular' | 'liquidGlassClear';

/** 엔진이 --ui-* CSS 변수로 내보내는 값. 키는 kebab-case가 됩니다 (surface2 → --ui-surface-2). */
export interface Tokens {
  /** 창 배경 (불투명) */
  bg: string;
  /** mica·vibrancy 같은 네이티브 창 효과가 켜졌을 때 쓰는 반투명 배경 */
  bgTint: string;
  surface: string;
  surface2: string;
  line: string;
  fg: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  ok: string;
  track: string;
  codeBg: string;
  radius: string;
  backdrop: string;
  shadow: string;
  /** 틸트 카드 위 하이라이트 세기 (0~1) */
  sheen: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  displayWeight: string;
  headingWeight: string;
  labelTracking: string;
}

export interface Theme {
  scheme: Scheme;
  /** 글로우가 켜져 있으면 큰 숫자·제목에도 빛 번짐을 줄지 */
  textGlow: boolean;
  /** 레이어 조절에서 배경을 켰을 때 쓸 기본 셰이더 */
  shader: Exclude<ShaderName, 'none'>;
  /** 셰이더 색 3개, "r,g,b" 형식 */
  shaderColors: readonly [string, string, string];
  tokens: Tokens;
}

export interface PresetConfig {
  theme: string;
  motion: MotionName;
  /** 테마 토큰 일부만 덮어쓰기 */
  tokens: Partial<Tokens>;
  background: { shader: ShaderName; speed: number };
  card: { glow: GlowName; tilt: boolean };
  button: { ripple: boolean };
  /** 운영체제별 네이티브 창 효과. 앞쪽 항목이 우선이고, 빈 배열이면 끕니다. Linux는 지원하지 않습니다. */
  window: { windows: WindowEffectName[]; macos: WindowEffectName[] };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** 프리셋 정의. extends로 다른 프리셋을 상속하고 필요한 부분만 적습니다. */
export type PresetDef = DeepPartial<PresetConfig> & { extends?: string };
