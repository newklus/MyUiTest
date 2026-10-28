import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';

const track =
  "relative h-6 w-[42px] shrink-0 cursor-pointer appearance-none rounded-ui border border-line bg-track transition checked:border-transparent checked:bg-accent checked:glow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const thumb =
  "before:absolute before:top-0.5 before:left-0.5 before:size-[18px] before:rounded-ui before:bg-fg before:transition before:content-[''] checked:before:translate-x-[18px] checked:before:bg-on-accent";

/** 네이티브 체크박스 기반 스위치. <label>로 감싸면 글자를 눌러도 토글됩니다. */
export function Switch({ className, ...rest }: Omit<ComponentProps<'input'>, 'type' | 'role'>) {
  return <input type="checkbox" role="switch" className={cn(track, thumb, className)} {...rest} />;
}
