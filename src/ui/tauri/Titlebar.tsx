import { useMemo, type ReactNode } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { cn } from '../lib/cn';
import { detectOS, isTauri } from './window';

/**
 * decorations: false 창을 위한 커스텀 타이틀바.
 * - 빈 곳을 끌면 창이 이동하고, 더블클릭하면 최대화됩니다 (data-tauri-drag-region).
 * - macOS는 titleBarStyle: "Overlay"로 신호등 버튼을 그대로 쓰고, 그 자리만 비워 둡니다.
 * - 브라우저(dev 서버)에서는 창 버튼 없이 모양만 보입니다.
 */
export function Titlebar({ title, children, className }: { title: ReactNode; children?: ReactNode; className?: string }) {
  const tauri = isTauri();
  const macTrafficLights = tauri && detectOS() === 'macos';
  return (
    <header
      data-tauri-drag-region
      className={cn(
        'relative z-20 flex h-10 shrink-0 select-none items-center gap-3 border-b border-line transition-colors',
        macTrafficLights ? 'pl-20' : 'pl-4',
        className,
      )}
    >
      <span data-tauri-drag-region className="min-w-0 truncate font-mono text-[13px] text-muted">
        {title}
      </span>
      <div data-tauri-drag-region className="flex h-full min-w-0 flex-1 items-center justify-end gap-2 pr-3">
        {children}
      </div>
      {tauri && !macTrafficLights && <WindowControls />}
    </header>
  );
}

const ctl =
  'grid h-10 w-11 cursor-pointer place-items-center text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent';

function WindowControls() {
  const win = useMemo(() => getCurrentWindow(), []);
  return (
    <div className="flex self-stretch">
      <button type="button" aria-label="최소화" className={ctl} onClick={() => void win.minimize()}>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M0 5h10" stroke="currentColor" fill="none" />
        </svg>
      </button>
      <button type="button" aria-label="최대화" className={ctl} onClick={() => void win.toggleMaximize()}>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" fill="none" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="닫기"
        className={cn(ctl, 'hover:bg-[#c42b1c] hover:text-white')}
        onClick={() => void win.close()}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" fill="none" />
        </svg>
      </button>
    </div>
  );
}
