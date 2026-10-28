import type { ComponentProps } from 'react';
import { useUI } from '../engine/context';
import { useRipple } from '../effects/useRipple';
import { cn } from '../lib/cn';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
  /** 생략하면 프리셋(button.ripple)을 따릅니다. */
  ripple?: boolean;
};

const base =
  'relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-ui-sm border px-4 py-3 text-sm font-semibold leading-tight transition active:scale-[.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary: 'border-transparent bg-accent text-on-accent glow hover:brightness-110',
  ghost: 'border-line bg-transparent text-fg hover:border-accent',
};

export function Button({ variant = 'primary', ripple, type = 'button', className, onPointerDown, ...rest }: ButtonProps) {
  const { config, motion } = useUI();
  const addRipple = useRipple<HTMLButtonElement>(ripple ?? config.button.ripple, motion.duration);
  return (
    <button
      type={type}
      {...rest}
      onPointerDown={(e) => {
        addRipple(e);
        onPointerDown?.(e);
      }}
      className={cn(base, variants[variant], className)}
    />
  );
}
