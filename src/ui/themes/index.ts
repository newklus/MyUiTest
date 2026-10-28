import type { Theme } from '../engine/types';

const KR = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",system-ui,sans-serif';
const fonts = {
  gothic: `"Gothic A1",${KR}`,
  plex: `"IBM Plex Sans KR",${KR}`,
  orbit: `"Orbit",${KR}`,
  mono: '"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
};

/** 유리: 반투명 표면 + 블러. 네이티브 창 효과(mica·vibrancy)와 잘 어울립니다. */
export const glass: Theme = {
  scheme: 'dark',
  textGlow: false,
  shader: 'aurora',
  shaderColors: ['45,212,191', '99,102,241', '244,114,182'],
  tokens: {
    bg: '#0b1026',
    bgTint: 'rgba(11,16,38,0.6)',
    surface: 'rgba(255,255,255,0.075)',
    surface2: 'rgba(255,255,255,0.12)',
    line: 'rgba(255,255,255,0.16)',
    fg: '#eef1ff',
    muted: 'rgba(226,232,255,0.7)',
    accent: '#8ef0dc',
    accent2: '#b9a8ff',
    onAccent: '#05231d',
    ok: '#8ef0a8',
    track: 'rgba(255,255,255,0.14)',
    codeBg: 'rgba(5,9,28,0.5)',
    radius: '20px',
    backdrop: 'blur(18px) saturate(150%)',
    shadow: '0 14px 40px rgba(2,6,23,0.45)',
    sheen: '0.16',
    fontDisplay: fonts.gothic,
    fontBody: fonts.plex,
    fontMono: fonts.mono,
    displayWeight: '800',
    headingWeight: '600',
    labelTracking: '0.06em',
  },
};

/** 네온: 각진 모서리, 강한 발광, 레트로 그리드 */
export const neon: Theme = {
  scheme: 'dark',
  textGlow: true,
  shader: 'grid',
  shaderColors: ['255,43,214', '34,230,255', '255,43,214'],
  tokens: {
    bg: '#08060f',
    bgTint: 'rgba(8,6,15,0.82)',
    surface: 'rgba(20,14,38,0.92)',
    surface2: '#1d1535',
    line: 'rgba(255,43,214,0.5)',
    fg: '#f7f2ff',
    muted: '#ab9fcc',
    accent: '#ff2bd6',
    accent2: '#22e6ff',
    onAccent: '#17001d',
    ok: '#3dffb4',
    track: 'rgba(34,230,255,0.16)',
    codeBg: '#0c0918',
    radius: '6px',
    backdrop: 'none',
    shadow: '0 0 #0000',
    sheen: '0.08',
    fontDisplay: fonts.orbit,
    fontBody: fonts.plex,
    fontMono: fonts.mono,
    displayWeight: '400',
    headingWeight: '400',
    labelTracking: '0.12em',
  },
};

/** 미니멀: 밝은 바탕, 얇은 선, 이펙트 없음 */
export const minimal: Theme = {
  scheme: 'light',
  textGlow: false,
  shader: 'dots',
  shaderColors: ['21,23,28', '36,70,216', '21,23,28'],
  tokens: {
    bg: '#f4f5f7',
    bgTint: 'rgba(244,245,247,0.82)',
    surface: '#ffffff',
    surface2: '#f1f2f5',
    line: '#d9dce3',
    fg: '#15171c',
    muted: '#5a616e',
    accent: '#2446d8',
    accent2: '#15171c',
    onAccent: '#ffffff',
    ok: '#127a4a',
    track: '#e1e4ea',
    codeBg: '#f4f5f7',
    radius: '10px',
    backdrop: 'none',
    shadow: '0 1px 2px rgba(21,23,28,0.06), 0 8px 24px rgba(21,23,28,0.05)',
    sheen: '0',
    fontDisplay: fonts.plex,
    fontBody: fonts.plex,
    fontMono: fonts.mono,
    displayWeight: '600',
    headingWeight: '600',
    labelTracking: '0.04em',
  },
};

export const themes: Record<string, Theme> = { glass, neon, minimal };
