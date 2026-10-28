// engine
export { UIProvider, type UIProviderProps } from './engine/UIProvider';
export { useUI, type UIContextValue } from './engine/context';
export { resolvePreset, DEFAULT_CONFIG } from './engine/resolve';
export type {
  DeepPartial,
  GlowName,
  MotionName,
  OverlayName,
  PresetConfig,
  PresetDef,
  Scheme,
  ShaderName,
  Theme,
  Tokens,
  WindowEffectName,
} from './engine/types';

// data
export { themes, glass, neon, minimal, terminal, brutal, clay } from './themes';
export { presets, type PresetName } from './presets';
export { motionPresets, type MotionPreset } from './motion/presets';
export { glows, glowVars } from './effects/glows';

// effects
export { useTilt } from './effects/useTilt';
export { useRipple } from './effects/useRipple';
export { ShaderBackground } from './effects/ShaderBackground';

// motion
export { Stagger, Reveal } from './motion/Stagger';

// components
export { Card, type CardProps } from './components/Card';
export { Button, type ButtonProps } from './components/Button';
export { Switch } from './components/Switch';
export { Chip } from './components/Chip';
export { PresetSwitcher, type PresetItem } from './components/PresetSwitcher';

// tauri
export { Titlebar } from './tauri/Titlebar';
export { applyWindowEffects, detectOS, isTauri, revealWindow } from './tauri/window';

// dev
export { PresetInspector } from './dev/PresetInspector';

export { cn } from './lib/cn';
