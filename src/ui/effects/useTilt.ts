import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/cn';

/**
 * 포인터 위치에 따라 요소를 3D로 기울입니다. 요소에 `tilt sheen` 클래스를 함께 붙이세요.
 * 리렌더 없이 CSS 변수만 바꿔서 가볍습니다. max가 0이면 꺼집니다.
 */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || max <= 0) return;

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ui-mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--ui-my', `${(y * 100).toFixed(1)}%`);
      if (prefersReducedMotion()) return;
      el.dataset.tilting = '';
      el.style.setProperty('--ui-rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty('--ui-ry', `${((x - 0.5) * max).toFixed(2)}deg`);
    };
    const leave = () => {
      delete el.dataset.tilting;
      el.style.setProperty('--ui-rx', '0deg');
      el.style.setProperty('--ui-ry', '0deg');
    };

    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      leave();
    };
  }, [max]);

  return ref;
}
