import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { motionPresets } from '../motion/presets';
import { presets as builtinPresets } from '../presets';
import { applyWindowEffects, effectsFor, revealWindow } from '../tauri/window';
import { themes as builtinThemes } from '../themes';
import { UIContext, type UIContextValue } from './context';
import { getPath, isObj, merge, sameValue, setPath, unsetPath } from './merge';
import { resolvePreset } from './resolve';
import type { DeepPartial, PresetConfig, PresetDef, Theme, WindowEffectName } from './types';
import { applyVars, buildVars } from './vars';

interface Saved {
  name: string;
  overrides: DeepPartial<PresetConfig>;
}

export interface UIProviderProps {
  children: ReactNode;
  presets?: Record<string, PresetDef>;
  themes?: Record<string, Theme>;
  defaultPreset?: string;
  /** 선택한 팩을 저장할 localStorage 키. null이면 저장하지 않습니다. */
  storageKey?: string | null;
}

function load(key: string | null, registry: Record<string, PresetDef>, fallback: string): Saved {
  if (key) {
    try {
      const raw = localStorage.getItem(key);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      if (isObj(saved) && typeof saved.name === 'string' && registry[saved.name]) {
        return { name: saved.name, overrides: isObj(saved.overrides) ? saved.overrides : {} };
      }
    } catch {
      /* 저장소를 못 쓰는 환경이면 기본값으로 */
    }
  }
  return { name: fallback, overrides: {} };
}

export function UIProvider({
  children,
  presets = builtinPresets,
  themes = builtinThemes,
  defaultPreset = 'glass',
  storageKey = 'ui-preset',
}: UIProviderProps) {
  const [state, setState] = useState<Saved>(() => load(storageKey, presets, defaultPreset));
  const [replayKey, setReplayKey] = useState(0);
  const [effects, setEffects] = useState<WindowEffectName[]>([]);
  const [effectsActive, setEffectsActive] = useState(false);

  const config = useMemo(
    () => merge(resolvePreset(state.name, presets), state.overrides),
    [state, presets],
  );
  const theme = themes[config.theme];
  if (!theme) throw new Error(`[ui] "${config.theme}" 테마가 없어요. 등록된 테마: ${Object.keys(themes).join(', ')}`);

  // 1) 토큰 → CSS 변수. 페인트 전에 적용해서 깜빡임이 없게 합니다.
  useLayoutEffect(() => {
    applyVars(document.documentElement, buildVars(config, theme, { windowEffects: effectsActive }), {
      scheme: theme.scheme,
      overlay: config.background.overlay,
    });
  }, [config, theme, effectsActive]);

  // 2) 네이티브 창 효과 (Tauri에서만 동작). 다른 항목을 덮어쓸 때 다시 호출되지 않도록 문자열로 비교합니다.
  const windowKey = JSON.stringify(config.window);
  const scheme = theme.scheme;
  useEffect(() => {
    let alive = true;
    (async () => {
      const names = await effectsFor(JSON.parse(windowKey) as PresetConfig['window']);
      const on = await applyWindowEffects(names, scheme);
      if (alive) {
        setEffects(names);
        setEffectsActive(on);
      }
    })();
    return () => {
      alive = false;
    };
  }, [windowKey, scheme]);

  // 3) 첫 적용이 끝난 뒤 창 보이기
  useEffect(() => {
    void revealWindow();
  }, []);

  // 4) 저장
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* 저장 실패는 무시 */
    }
  }, [storageKey, state]);

  const setPreset = useCallback(
    (name: string) => {
      if (!presets[name]) {
        console.warn(`[ui] "${name}" 프리셋이 없어요.`);
        return;
      }
      setState({ name, overrides: {} });
      setReplayKey((k) => k + 1);
    },
    [presets],
  );

  const override = useCallback(
    (path: string, value: unknown) => {
      setState((s) => {
        const next = structuredClone(s.overrides) as Record<string, unknown>;
        const original = getPath(resolvePreset(s.name, presets), path);
        if (sameValue(original, value)) unsetPath(next, path);
        else setPath(next, path, value);
        return { ...s, overrides: next };
      });
      if (path === 'motion' || path === 'theme') setReplayKey((k) => k + 1);
    },
    [presets],
  );

  const resetOverrides = useCallback(() => {
    setState((s) => ({ ...s, overrides: {} }));
    setReplayKey((k) => k + 1);
  }, []);

  const replay = useCallback(() => setReplayKey((k) => k + 1), []);

  const value = useMemo<UIContextValue>(
    () => ({
      name: state.name,
      config,
      theme,
      motion: { name: config.motion, ...(motionPresets[config.motion] ?? motionPresets.smooth) },
      presets,
      themes,
      overrides: state.overrides,
      window: { effects, active: effectsActive },
      replayKey,
      setPreset,
      override,
      resetOverrides,
      replay,
    }),
    [state, config, theme, presets, themes, effects, effectsActive, replayKey, setPreset, override, resetOverrides, replay],
  );

  return <UIContext value={value}>{children}</UIContext>;
}
