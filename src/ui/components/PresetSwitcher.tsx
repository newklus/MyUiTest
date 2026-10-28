import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useUI } from '../engine/context';
import { cn } from '../lib/cn';

export interface PresetItem {
  name: string;
  hint?: string;
}

/** 스타일 팩을 고르는 세그먼트 컨트롤. 선택 표시가 모션 프리셋 속도로 미끄러집니다. */
export function PresetSwitcher({
  items,
  label = '스타일 팩',
  className,
}: {
  items?: PresetItem[];
  label?: string;
  className?: string;
}) {
  const { name, presets, setPreset } = useUI();
  const list: PresetItem[] = items ?? Object.keys(presets).map((n) => ({ name: n }));
  const groupRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [animated, setAnimated] = useState(false);
  const index = list.findIndex((it) => it.name === name);

  useLayoutEffect(() => {
    const place = () => {
      const btn = btnRefs.current[index];
      const ind = indRef.current;
      if (!ind) return;
      if (!btn) {
        ind.style.opacity = '0';
        return;
      }
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.transform = `translateX(${btn.offsetLeft}px)`;
      ind.style.opacity = '1';
    };
    place();
    const ro = new ResizeObserver(place);
    if (groupRef.current) ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, [index, list.length]);

  // 첫 배치는 애니메이션 없이, 그 다음부터 미끄러지게
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step || index < 0) return;
    e.preventDefault();
    const next = (index + step + list.length) % list.length;
    setPreset(list[next].name);
    btnRefs.current[next]?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('relative grid gap-0.5 rounded-ui-sm border border-line bg-surface p-1 ui-backdrop transition', className)}
      style={{ gridTemplateColumns: `repeat(${list.length}, minmax(0, 1fr))` }}
    >
      <span
        ref={indRef}
        aria-hidden="true"
        className={cn('absolute top-1 bottom-1 left-0 rounded-ui-xs bg-accent glow-sm opacity-0', animated && 'transition-all')}
      />
      {list.map((it, i) => {
        const on = i === index;
        return (
          <button
            key={it.name}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || index < 0 ? 0 : -1}
            onClick={() => setPreset(it.name)}
            className={cn(
              'relative grid cursor-pointer justify-items-center gap-0.5 rounded-ui-xs px-1 pt-2.5 pb-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              on ? 'text-on-accent' : 'text-fg',
            )}
          >
            <span className="font-mono text-sm font-semibold leading-tight">{it.name}</span>
            {it.hint && <span className={cn('text-[11px] leading-tight', on ? 'text-on-accent/80' : 'text-muted')}>{it.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}
