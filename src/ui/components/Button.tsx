import type { ComponentProps } from 'react';
import { useUI } from '../engine/context';
import { useRipple } from '../effects/useRipple';
import { cn } from '../lib/cn';

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'ghost';
  /** 생략하면 프리셋(button.ripple)을 따릅니다. */
  ripple?: boolean;
  /** 생략하면 프리셋(button.press)을 따릅니다. */
  press?: boolean;
};

const base =
  'relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-ui-sm ui-border px-4 py-3 text-sm font-semibold leading-tight transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50';

// press 팩(딱딱한 그림자 테마)에서는 모든 버튼에 테두리와 그림자를 줘서, 눌리면 그림자 쪽으로 들어가게 합니다.
const variants = {
  primary: (press: boolean) =>
    cn('bg-accent text-on-accent glow hover:brightness-110', press ? 'border-line' : 'border-transparent'),
  ghost: (press: boolean) => cn('border-line bg-transparent text-fg hover:border-accent', press && 'ui-shadow'),
};

export function Button({ variant = 'primary', ripple, press, type = 'button', className, onPointerDown, ...rest }: ButtonProps) {
  const { config, motion } = useUI();
  const addRipple = useRipple<HTMLButtonElement>(ripple ?? config.button.ripple, motion.duration);
  const pressOn = press ?? config.button.press;
  return (
    <button
      type={type}
      {...rest}
      onPointerDown={(e) => {
        addRipple(e);
        onPointerDown?.(e);
      }}
      className={cn(base, variants[variant](pressOn), pressOn ? 'press' : 'active:scale-[.97]', className)}
    />
  );
}
