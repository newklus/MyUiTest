import { useLayoutEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  isTauri,
  PresetInspector,
  PresetSwitcher,
  resolvePreset,
  Reveal,
  ShaderBackground,
  Stagger,
  Switch,
  Titlebar,
  useUI,
  type PresetConfig,
} from './ui';

const stats = [
  { label: '성공률', value: '98.4', unit: '%', sub: '최근 빌드 50회' },
  { label: '번들 크기', value: '4.2', unit: 'MB', sub: '지난주 −0.6 MB' },
  { label: '컴파일', value: '38', unit: '초', sub: 'Rust 증분 빌드' },
];

const tasks = [
  { name: '프론트 번들 빌드', meta: '2분 전', tone: 'ok', status: '완료' },
  { name: 'Rust 코어 컴파일', meta: '지금', tone: 'run', status: '진행 중' },
  { name: '업데이트 서명', meta: '대기열 1번', tone: 'idle', status: '대기' },
] as const;

const packs = [
  { name: 'glass', hint: '유리' },
  { name: 'neon', hint: '네온' },
  { name: 'minimal', hint: '미니멀' },
  { name: 'calm', hint: 'glass 상속' },
];

/** 창 효과가 없는 팩에서 스위치를 켰을 때 쓰는 기본값 */
const FALLBACK_WINDOW: PresetConfig['window'] = { windows: ['mica'], macos: ['underWindowBackground'] };

export default function App() {
  const { name, presets, config, override, replay } = useUI();
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const windowOn = config.window.windows.length + config.window.macos.length > 0;
  const toggleWindow = (on: boolean) => {
    const base = resolvePreset(name, presets).window;
    const baseOn = base.windows.length + base.macos.length > 0;
    override('window', on ? (baseOn ? base : FALLBACK_WINDOW) : { windows: [], macos: [] });
  };

  return (
    <div className="flex h-dvh flex-col">
      <ShaderBackground />

      <Titlebar title="atlas-desktop">
        {!isTauri() && (
          <span className="rounded-full border border-dashed border-line px-2 py-1 font-mono text-[11px] leading-none text-muted">
            브라우저 미리보기
          </span>
        )}
      </Titlebar>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 pt-7 pb-16">
          <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="min-w-0 flex-[1_1_320px]">
              <p className="mb-2 font-mono text-xs text-muted">src/ui · React 19 + Tailwind v4 + Tauri 2</p>
              <h1 className="type-display text-glow text-[clamp(28px,4vw,42px)] leading-tight tracking-tight [text-wrap:balance]">
                UI 엔진 프리셋
              </h1>
              <p className="mt-2.5 max-w-[54ch] text-muted">
                스타일 팩을 고르면 토큰, 이펙트, 모션, 창 효과가 한 번에 바뀌어요. 컴포넌트는 Tailwind 클래스만 쓰고, 값은 전부
                엔진이 정합니다.
              </p>
            </div>
            <PresetSwitcher items={packs} className="max-w-[520px] flex-[1_1_360px]" />
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Stagger className="grid min-w-0 gap-4">
              <div className="grid grid-cols-3 gap-3">
                {stats.map((s) => (
                  <Reveal key={s.label} className="min-w-0">
                    <Card tiltMax={12} className="grid h-full content-start gap-1 px-3 py-3.5">
                      <p className="label-caps text-muted">{s.label}</p>
                      <p className="type-display text-glow text-[clamp(20px,2.6vw,30px)] leading-tight whitespace-nowrap tabular-nums">
                        {s.value}
                        <span className="ml-0.5 text-[.55em] text-muted">{s.unit}</span>
                      </p>
                      <p className="text-xs leading-snug text-muted">{s.sub}</p>
                    </Card>
                  </Reveal>
                ))}
              </div>

              <div className="grid items-start gap-4 md:grid-cols-2">
                <Reveal className="min-w-0">
                  <Card tiltMax={3} className="p-4">
                    <header className="mb-1.5 flex items-center justify-between gap-2.5">
                      <h2 className="type-heading text-[15px] leading-snug">최근 작업</h2>
                      <span className="font-mono text-xs text-muted">{tasks.length}건</span>
                    </header>
                    <ul className="divide-y divide-line">
                      {tasks.map((t) => (
                        <li key={t.name} className="flex items-center justify-between gap-2.5 py-2.5">
                          <span className="grid min-w-0 gap-px">
                            <span className="font-medium">{t.name}</span>
                            <span className="text-xs text-muted">{t.meta}</span>
                          </span>
                          <Chip tone={t.tone}>{t.status}</Chip>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>

                <Reveal className="min-w-0">
                  <Card tiltMax={3} className="p-4">
                    <h2 className="type-heading text-[15px] leading-snug">프로젝트 설정</h2>
                    <div className="grid gap-1.5 pt-2 pb-3">
                      <label htmlFor="app-name" className="text-xs text-muted">
                        프로젝트 이름
                      </label>
                      <input
                        id="app-name"
                        defaultValue="atlas-desktop"
                        spellCheck={false}
                        autoComplete="off"
                        className="w-full rounded-ui-xs border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm text-fg transition focus:border-accent focus:ring-3 focus:ring-accent/25 focus:outline-none"
                      />
                    </div>
                    <label htmlFor="app-update" className="flex cursor-pointer items-center justify-between gap-2.5 border-t border-line py-2.5">
                      <span>자동 업데이트</span>
                      <Switch id="app-update" defaultChecked />
                    </label>
                    <label htmlFor="app-window" className="flex cursor-pointer items-center justify-between gap-2.5 border-t border-line py-2.5">
                      <span className="grid gap-0.5">
                        <span>창 투명 효과</span>
                        <span className="text-xs text-muted">mica · vibrancy</span>
                      </span>
                      <Switch id="app-window" checked={windowOn} onChange={(e) => toggleWindow(e.target.checked)} />
                    </label>
                    <div className="grid gap-2 border-t border-line pt-3">
                      <div className="flex justify-between text-[13px] text-muted">
                        <span>원격 동기화</span>
                        <span className="font-mono text-fg tabular-nums">72%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label="원격 동기화"
                        aria-valuenow={72}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 rounded-ui-xs bg-track"
                      >
                        <i className="block h-full w-[72%] rounded-[inherit] bg-linear-to-r from-accent to-accent-2 glow-sm" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" onClick={() => setToast({ id: Date.now(), text: '빌드를 시작했어요' })}>
                        빌드 실행
                      </Button>
                      <Button variant="ghost" className="flex-1" onClick={replay}>
                        다시 그리기
                      </Button>
                    </div>
                  </Card>
                </Reveal>
              </div>

              <p className="text-[12.5px] text-muted">
                Tauri로 실행하면 glass 팩은 창 자체에 mica(Windows 11)나 vibrancy·Liquid Glass(macOS)를 켜고, 배경을 반투명으로
                바꿉니다.
              </p>
            </Stagger>

            <Stagger className="min-w-0">
              <Reveal>
                <PresetInspector />
              </Reveal>
            </Stagger>
          </div>
        </div>
      </main>

      {toast && <Toast key={toast.id} text={toast.text} onDone={() => setToast(null)} />}
    </div>
  );
}

function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { motion } = useUI();
  const latest = useRef({ motion, onDone });
  useLayoutEffect(() => {
    latest.current = { motion, onDone };
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { duration, easing } = latest.current.motion;
    if (!reduce) {
      el.animate([{ transform: 'translateY(24px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: duration + 80, easing });
    }
    const timer = window.setTimeout(() => {
      if (reduce) return latest.current.onDone();
      const out = el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(12px)' }], {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards',
      });
      out.onfinish = () => latest.current.onDone();
    }, 2400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      className="fixed bottom-5 left-1/2 z-30 flex max-w-[calc(100vw-32px)] -translate-x-1/2 flex-wrap items-center justify-center gap-2.5 rounded-ui-sm bg-accent px-4 py-3 font-semibold text-on-accent glow"
    >
      {text}
      <small className="font-mono text-[11px] font-medium opacity-75">
        motion/{motion.name} · {motion.duration}ms
      </small>
    </div>
  );
}
