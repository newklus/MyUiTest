import { isTauri } from '@tauri-apps/api/core';
import { getCurrentWindow, type Effect } from '@tauri-apps/api/window';
import type { PresetConfig, Scheme, WindowEffectName } from '../engine/types';

export { isTauri };

export type OS = 'windows' | 'macos' | 'linux' | 'other';

/** WebView의 UA로 운영체제를 구분합니다 (WebView2 / WKWebView / WebKitGTK). */
export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Linux|X11/i.test(ua)) return 'linux';
  return 'other';
}

type UAData = { getHighEntropyValues(hints: string[]): Promise<{ platformVersion?: string }> };

/** mica·tabbed는 Windows 11 전용입니다. Windows 10에서 켜면 아무 효과 없이 창만 투명해지므로 미리 거릅니다. */
async function isWindows11(): Promise<boolean> {
  const uad = (navigator as Navigator & { userAgentData?: UAData }).userAgentData;
  if (!uad) return false;
  try {
    const { platformVersion = '0' } = await uad.getHighEntropyValues(['platformVersion']);
    return parseInt(platformVersion, 10) >= 13;
  } catch {
    return false;
  }
}

const warned = new Set<string>();
function warnOnce(permission: string, err: unknown) {
  if (warned.has(permission)) return;
  warned.add(permission);
  console.warn(`[ui] Tauri 창 API 호출이 거부됐어요. capabilities에 "${permission}" 권한이 있는지 확인하세요.`, err);
}

const asEffects = (names: WindowEffectName[]) => names as unknown as Effect[];

/** 이 운영체제에서 실제로 쓸 수 있는 효과 목록 */
export async function effectsFor(cfg: PresetConfig['window']): Promise<WindowEffectName[]> {
  const os = detectOS();
  if (os === 'macos') return cfg.macos;
  if (os !== 'windows') return [];
  const win11 = await isWindows11();
  return win11 ? cfg.windows : cfg.windows.filter((n) => !/^(mica|tabbed)/.test(n));
}

/**
 * 프리셋의 창 효과를 적용합니다. 실제로 켜졌으면 true.
 * Tauri 밖(브라우저 dev 서버)에서는 아무것도 하지 않고 false를 돌려줍니다.
 */
export async function applyWindowEffects(names: WindowEffectName[], scheme: Scheme): Promise<boolean> {
  if (!isTauri()) return false;
  const win = getCurrentWindow();

  // 네이티브 부분(타이틀바 신호등, mica 색조, 스크롤바)을 프리셋 명암에 맞춥니다.
  await win.setTheme(scheme).catch((e: unknown) => warnOnce('core:window:allow-set-theme', e));

  if (names.length === 0) {
    await win.clearEffects().catch((e: unknown) => warnOnce('core:window:allow-set-effects', e));
    return false;
  }
  try {
    await win.setEffects({ effects: asEffects(names) });
    return true;
  } catch (err) {
    // Liquid Glass를 모르는 이전 Tauri 버전이면 나머지 효과로 다시 시도합니다.
    const older = names.filter((n) => !n.startsWith('liquidGlass'));
    if (older.length > 0 && older.length < names.length) {
      try {
        await win.setEffects({ effects: asEffects(older) });
        return true;
      } catch {
        /* 아래에서 경고 */
      }
    }
    warnOnce('core:window:allow-set-effects', err);
    return false;
  }
}

/** tauri.conf.json에서 visible: false로 띄운 창을 첫 렌더 뒤에 보여줍니다 (깜빡임 방지). */
export async function revealWindow(): Promise<void> {
  if (!isTauri()) return;
  await getCurrentWindow()
    .show()
    .catch((e: unknown) => warnOnce('core:window:allow-show', e));
}
