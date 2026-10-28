import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { useUI } from '../engine/context';
import { prefersReducedMotion } from '../lib/cn';

/**
 * 안쪽의 <Reveal>들을 순서대로 등장시킵니다.
 * 스타일 팩이나 모션 프리셋이 바뀌면(replayKey) 그 팩의 속도·곡선으로 다시 재생됩니다.
 * Stagger 안에 Stagger를 또 넣지는 마세요.
 */
export function Stagger({ step = 45, children, ...rest }: ComponentProps<'div'> & { step?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { replayKey, motion } = useUI();

  // 재생 시점은 replayKey만 정하고, 속도·곡선은 그 순간의 프리셋 값을 씁니다.
  const timing = useRef({ duration: motion.duration, easing: motion.easing, step });
  useLayoutEffect(() => {
    timing.current = { duration: motion.duration, easing: motion.easing, step };
  });

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const { duration, easing, step: gap } = timing.current;
    const items = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const anims = Array.from(items, (el, i) =>
      el.animate(
        [
          { opacity: 0.25, transform: 'translateY(14px) scale(.985)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: duration + 120, easing, delay: i * gap, fill: 'backwards' },
      ),
    );
    return () => anims.forEach((a) => a.cancel());
  }, [replayKey]);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}

/** <Stagger> 안에서 등장 애니메이션을 받을 단위 */
export function Reveal({ children, ...rest }: ComponentProps<'div'>) {
  return (
    <div data-reveal="" {...rest}>
      {children}
    </div>
  );
}
