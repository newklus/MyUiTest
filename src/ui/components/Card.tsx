import type { ComponentProps } from 'react';
import { useUI } from '../engine/context';
import type { GlowName } from '../engine/types';
import { glowVars } from '../effects/glows';
import { useTilt } from '../effects/useTilt';
import { cn } from '../lib/cn';

export type CardProps = ComponentProps<'div'> & {
  /** 생략하면 프리셋(card.glow)을 따릅니다. true/false로 강제하거나 글로우 이름을 직접 지정할 수 있어요. */
  glow?: boolean | GlowName;
  /** 생략하면 프리셋(card.tilt)을 따릅니다. */
  tilt?: boolean;
  /** 최대 기울기(도) */
  tiltMax?: number;
};

export function Card({ glow, tilt, tiltMax = 6, className, style, children, ...rest }: CardProps) {
  const { config } = useUI();
  const tiltOn = tilt ?? config.card.tilt;
  const ref = useTilt<HTMLDivElement>(tiltOn ? tiltMax : 0);

  const glowName: GlowName | null =
    glow === undefined
      ? null
      : glow === true
        ? config.card.glow === 'none' ? 'glow-soft' : config.card.glow
        : glow === false
          ? 'none'
          : glow;

  return (
    <div
      ref={ref}
      style={glowName ? { ...glowVars(glowName), ...style } : style}
      className={cn(
        'relative rounded-ui ui-border border-line bg-surface ui-backdrop glow transition',
        tiltOn && 'tilt sheen data-tilting:duration-75 data-tilting:ease-linear',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
