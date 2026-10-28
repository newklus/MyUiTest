import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

const tones = {
  ok: 'text-ok bg-ok/15',
  run: 'text-accent bg-accent/15',
  idle: 'text-muted bg-track',
};

/** 상태 표시용 칩. run은 점이 깜빡입니다. */
export function Chip({ tone = 'idle', children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-ui-xs px-2.5 py-1 text-[11.5px] font-semibold leading-tight',
        tones[tone],
        className,
      )}
    >
      {tone === 'run' && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}
