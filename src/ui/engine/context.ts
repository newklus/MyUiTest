import { createContext, use } from 'react';
import type { MotionPreset } from '../motion/presets';
import type { DeepPartial, MotionName, PresetConfig, PresetDef, Theme, WindowEffectName } from './types';

export interface UIContextValue {
  /** 선택된 스타일 팩 이름 */
  name: string;
  /** 상속과 덮어쓰기까지 반영된 최종 설정 */
  config: PresetConfig;
  theme: Theme;
  motion: MotionPreset & { name: MotionName };
  presets: Record<string, PresetDef>;
  themes: Record<string, Theme>;
  /** 선택된 팩 위에 런타임으로 덮어쓴 값 */
  overrides: DeepPartial<PresetConfig>;
  /** 이 운영체제에서 시도한 창 효과와, 실제로 켜졌는지 */
  window: { effects: WindowEffectName[]; active: boolean };
  /** 바뀔 때마다 <Stagger> 등장 애니메이션이 다시 재생됩니다 */
  replayKey: number;
  setPreset: (name: string) => void;
  /** 'card.tilt' 같은 경로로 값 하나를 덮어씁니다. 원래 값과 같으면 덮어쓰기를 지웁니다. */
  override: (path: string, value: unknown) => void;
  resetOverrides: () => void;
  replay: () => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = use(UIContext);
  if (!ctx) throw new Error('[ui] useUI()는 <UIProvider> 안에서만 쓸 수 있어요.');
  return ctx;
}
