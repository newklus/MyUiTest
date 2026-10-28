import { useRef, useState, type ReactNode } from 'react';
import { Card } from '../components/Card';
import { Switch } from '../components/Switch';
import { useUI } from '../engine/context';
import { getPath, isObj, merge } from '../engine/merge';
import { resolvePreset } from '../engine/resolve';
import type { MotionName, Tokens } from '../engine/types';
import { cn } from '../lib/cn';
import { motionPresets } from '../motion/presets';
import { isTauri } from '../tauri/window';

/**
 * 개발용 패널: 레이어를 하나씩 바꿔 보고, 그 결과를 프리셋 코드로 복사합니다.
 * 배포 빌드에서는 빼거나 import.meta.env.DEV일 때만 렌더하세요.
 */
export function PresetInspector({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-4', className)}>
      <LayerControls />
      <PresetCode />
      <TokenSwatches />
    </div>
  );
}

function PanelHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-3 flex flex-wrap items-center gap-2.5">
      <h2 className="type-heading text-[15px] leading-snug">{title}</h2>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}

const smallBtn =
  'cursor-pointer rounded-ui-xs ui-border border-line px-2.5 py-1.5 text-xs font-medium transition hover:border-accent disabled:cursor-default disabled:opacity-40 disabled:hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

function LayerControls() {
  const { name, presets, theme, config, overrides, override, resetOverrides } = useUI();
  const base = resolvePreset(name, presets);
  const hasOverrides = Object.keys(overrides).length > 0;

  const rows: Array<{ id: string; label: string; path: string; on: boolean; set: (on: boolean) => void }> = [
    {
      id: 'opt-glow',
      label: '글로우',
      path: 'card.glow',
      on: config.card.glow !== 'none',
      set: (on) => override('card.glow', on ? (base.card.glow !== 'none' ? base.card.glow : 'glow-soft') : 'none'),
    },
    { id: 'opt-tilt', label: '틸트', path: 'card.tilt', on: config.card.tilt, set: (on) => override('card.tilt', on) },
    { id: 'opt-ripple', label: '리플', path: 'button.ripple', on: config.button.ripple, set: (on) => override('button.ripple', on) },
    { id: 'opt-press', label: '누르기', path: 'button.press', on: config.button.press, set: (on) => override('button.press', on) },
    {
      id: 'opt-bg',
      label: '배경 셰이더',
      path: 'background.shader',
      on: config.background.shader !== 'none',
      set: (on) =>
        override('background.shader', on ? (base.background.shader !== 'none' ? base.background.shader : theme.shader) : 'none'),
    },
    {
      id: 'opt-overlay',
      label: '오버레이',
      path: 'background.overlay',
      on: config.background.overlay !== 'none',
      set: (on) =>
        override('background.overlay', on ? (base.background.overlay !== 'none' ? base.background.overlay : 'grain') : 'none'),
    },
    {
      id: 'opt-decor',
      label: '장식',
      path: 'card.decor',
      on: config.card.decor !== 'none',
      set: (on) => override('card.decor', on ? (base.card.decor !== 'none' ? base.card.decor : 'corners') : 'none'),
    },
  ];

  return (
    <Card tiltMax={3} className="p-4">
      <PanelHead title="레이어 직접 조절">
        <button type="button" className={smallBtn} disabled={!hasOverrides} onClick={resetOverrides}>
          프리셋 값으로
        </button>
      </PanelHead>

      <p className="mb-0.5 font-mono text-[11.5px] text-muted">effects/</p>
      <div className="mb-3 grid grid-cols-2 gap-x-4">
        {rows.map((r) => (
          <label key={r.id} htmlFor={r.id} className="flex cursor-pointer items-center justify-between gap-2.5 border-t border-line py-2.5">
            <span className="grid min-w-0 gap-0.5">
              <span>{r.label}</span>
              <code className="font-mono text-[11px] leading-tight text-muted [overflow-wrap:anywhere]">{r.path}</code>
            </span>
            <Switch id={r.id} checked={r.on} onChange={(e) => r.set(e.target.checked)} />
          </label>
        ))}
      </div>

      <p className="mb-2 font-mono text-[11.5px] text-muted">motion/</p>
      <div role="radiogroup" aria-label="모션 프리셋" className="grid grid-cols-4 gap-1.5">
        {(Object.keys(motionPresets) as MotionName[]).map((m) => {
          const on = config.motion === m;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => override('motion', m)}
              className={cn(
                'grid min-w-0 cursor-pointer justify-items-center gap-0.5 rounded-ui-xs ui-border px-1 py-2 font-mono text-[12.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                on ? 'border-line bg-accent text-on-accent' : 'border-line bg-surface-2 text-fg hover:border-accent',
              )}
            >
              {m}
              <small className={cn('text-[11px] font-normal', on ? 'text-on-accent/80' : 'text-muted')}>
                {motionPresets[m].duration}ms
              </small>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

type Seg = { t: string; k?: 'kw' | 'str' | 'num' | 'punc' };

function fmt(v: unknown, depth: number, out: Seg[]) {
  const punc = (t: string) => out.push({ t, k: 'punc' });
  const text = (t: string) => out.push({ t });
  if (Array.isArray(v)) {
    punc('[');
    v.forEach((x, i) => {
      if (i) punc(', ');
      fmt(x, depth + 1, out);
    });
    punc(']');
    return;
  }
  if (isObj(v)) {
    const keys = Object.keys(v);
    if (keys.length === 0) return punc('{}');
    const flat = keys.every((k) => !isObj(v[k]) && !Array.isArray(v[k]));
    if (depth > 0 && flat) {
      // 한 줄에 들어가는 짧은 객체만 한 줄로 씁니다.
      const inline: Seg[] = [];
      inline.push({ t: '{ ', k: 'punc' });
      keys.forEach((k, i) => {
        if (i) inline.push({ t: ', ', k: 'punc' });
        inline.push({ t: k }, { t: ': ', k: 'punc' });
        fmt(v[k], depth + 1, inline);
      });
      inline.push({ t: ' }', k: 'punc' });
      if (inline.reduce((n, s) => n + s.t.length, 0) <= 36) {
        out.push(...inline);
        return;
      }
    }
    const pad = '  '.repeat(depth + 1);
    punc('{');
    text('\n');
    for (const k of keys) {
      text(pad + k);
      punc(': ');
      fmt(v[k], depth + 1, out);
      punc(',');
      text('\n');
    }
    text('  '.repeat(depth));
    punc('}');
    return;
  }
  if (typeof v === 'string') out.push({ t: `'${v}'`, k: 'str' });
  else out.push({ t: String(v), k: 'num' });
}

const segClass = { kw: 'text-accent-2', str: 'text-accent', num: 'text-ok', punc: 'text-muted' };

function PresetCode() {
  const ui = useUI();
  const custom = Object.keys(ui.overrides).length > 0;
  const varName = custom ? 'custom' : ui.name;
  const def = custom ? merge({ extends: ui.name }, ui.overrides) : ui.presets[ui.name];

  const segs: Seg[] = [{ t: 'export const', k: 'kw' }, { t: ` ${varName} ` }, { t: '=', k: 'punc' }, { t: ' ' }];
  fmt(def, 0, segs);
  segs.push({ t: ' satisfies', k: 'kw' }, { t: ' PresetDef' }, { t: ';', k: 'punc' });
  const source = segs.map((s) => s.t).join('');

  const codeRef = useRef<HTMLElement>(null);
  const [copyLabel, setCopyLabel] = useState('복사');
  const flash = (label: string) => {
    setCopyLabel(label);
    window.setTimeout(() => setCopyLabel('복사'), 1600);
  };
  const copy = () => {
    const selectFallback = () => {
      const el = codeRef.current;
      const sel = window.getSelection();
      if (el && sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      flash('선택됨 · 직접 복사');
    };
    try {
      navigator.clipboard.writeText(source).then(() => flash('복사했어요'), selectFallback);
    } catch {
      selectFallback();
    }
  };

  const shader = ui.config.background.shader;
  const chips: Array<[string, string, string]> = [
    ['theme', ui.config.theme, 'theme'],
    ['motion', ui.config.motion, 'motion'],
    ['glow', ui.config.card.glow, 'card.glow'],
    ['tilt', ui.config.card.tilt ? 'on' : 'off', 'card.tilt'],
    ['decor', ui.config.card.decor, 'card.decor'],
    ['ripple', ui.config.button.ripple ? 'on' : 'off', 'button.ripple'],
    ['press', ui.config.button.press ? 'on' : 'off', 'button.press'],
    ['bg', shader === 'none' ? 'none' : `${shader} ×${ui.config.background.speed}`, 'background.shader'],
    ['overlay', ui.config.background.overlay, 'background.overlay'],
    ['window', !isTauri() ? 'Tauri 전용' : ui.window.active ? ui.window.effects.join(' → ') : 'off', 'window'],
  ];

  return (
    <Card tiltMax={3} className="p-4">
      <PanelHead title="현재 스타일 팩">
        <span className="font-mono text-[11.5px] text-muted">presets/{varName}.ts</span>
        <button type="button" className={smallBtn} onClick={copy}>
          {copyLabel}
        </button>
      </PanelHead>
      <pre className="overflow-x-auto rounded-ui-sm ui-border border-line bg-code p-3.5 font-mono text-[12.5px] leading-[1.7]">
        <code ref={codeRef}>
          {segs.map((s, i) => (
            <span key={i} className={s.k ? segClass[s.k] : undefined}>
              {s.t}
            </span>
          ))}
        </code>
      </pre>
      <p className="mt-3.5 mb-2 text-xs text-muted">적용 결과 (상속·덮어쓰기 반영)</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map(([k, v, path]) => {
          const changed = getPath(ui.overrides, path) !== undefined;
          return (
            <span
              key={k}
              className={cn(
                'rounded-ui-xs ui-border px-2 py-1.5 font-mono text-[11.5px] leading-tight text-muted',
                changed ? 'border-accent' : 'border-line',
              )}
            >
              {k} <b className={cn('font-medium', changed ? 'text-accent' : 'text-fg')}>{v}</b>
            </span>
          );
        })}
      </div>
    </Card>
  );
}

const SWATCHES: Array<keyof Tokens> = ['bg', 'surface', 'fg', 'accent', 'accent2', 'radius', 'borderWidth', 'fontDisplay'];
const kebab = (k: string) => k.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();

function TokenSwatches() {
  const { theme, config } = useUI();
  const tokens: Tokens = { ...theme.tokens, ...config.tokens };
  return (
    <Card tiltMax={3} className="p-4">
      <PanelHead title="토큰">
        <span className="font-mono text-[11.5px] text-muted">themes/{config.theme}</span>
      </PanelHead>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3">
        {SWATCHES.map((k) => {
          const v = String(tokens[k]);
          const shown = k === 'fontDisplay' ? v.split(',')[0].replaceAll('"', '') : v;
          const changed = k in config.tokens;
          return (
            <div key={k} className="grid grid-cols-[30px_minmax(0,1fr)] items-center gap-x-2.5">
              {k === 'radius' ? (
                <i className="row-span-2 size-[30px] border-2 border-accent" style={{ borderRadius: v }} />
              ) : k === 'borderWidth' ? (
                <i className="row-span-2 size-[30px] rounded-ui-xs border-solid border-fg" style={{ borderWidth: v }} />
              ) : k === 'fontDisplay' ? (
                <i className="row-span-2 grid size-[30px] place-items-center rounded-ui-xs border border-line bg-surface-2 text-base not-italic type-display">
                  가
                </i>
              ) : (
                <i className="row-span-2 size-[30px] rounded-ui-xs border border-line" style={{ background: v }} />
              )}
              <b className={cn('font-mono text-xs font-medium', changed && 'text-accent')}>--ui-{kebab(k)}</b>
              <span title={shown} className="truncate font-mono text-[11px] text-muted">
                {shown}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
