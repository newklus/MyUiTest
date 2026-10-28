/** 조건부 클래스 합치기. 같은 속성 클래스가 겹치면 뒤의 것이 이기도록 하려면 tailwind-merge로 바꾸세요. */
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
