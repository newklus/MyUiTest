import { useCallback, type PointerEvent } from 'react';
import { prefersReducedMotion } from '../lib/cn';

/**
 * 누른 지점에서 퍼지는 물결. 반환된 함수를 onPointerDown에 연결하세요.
 * 대상 요소에는 `relative overflow-hidden`이 필요합니다.
 */
export function useRipple<T extends HTMLElement>(enabled: boolean, durationMs = 420) {
  return useCallback(
    (e: PointerEvent<T>) => {
      if (!enabled || prefersReducedMotion()) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const dot = document.createElement('span');
      dot.className = 'ui-ripple';
      dot.style.width = dot.style.height = `${d}px`;
      dot.style.left = `${e.clientX - r.left - d / 2}px`;
      dot.style.top = `${e.clientY - r.top - d / 2}px`;
      el.appendChild(dot);
      const anim = dot.animate(
        [
          { transform: 'scale(0)', opacity: 0.4 },
          { transform: 'scale(1)', opacity: 0 },
        ],
        { duration: Math.max(480, durationMs * 1.4), easing: 'cubic-bezier(.2,.6,.3,1)' },
      );
      anim.onfinish = () => dot.remove();
    },
    [enabled, durationMs],
  );
}
