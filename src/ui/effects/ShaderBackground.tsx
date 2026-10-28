import { useEffect, useRef } from 'react';
import { useUI } from '../engine/context';
import type { ShaderName } from '../engine/types';
import { cn } from '../lib/cn';

interface Params {
  shader: ShaderName;
  speed: number;
  colors: readonly [string, string, string];
}

/**
 * 프리셋의 background 설정을 따라 창 뒤에 그리는 배경 (aurora / grid / dots / phosphor / blobs).
 * 앱 최상단에 한 번만 두세요. 탭이 숨겨지거나 '동작 줄이기'가 켜져 있으면 멈춥니다.
 */
export function ShaderBackground({ className }: { className?: string }) {
  const { config, theme } = useUI();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef<Params>({ shader: 'none', speed: 0.25, colors: theme.shaderColors });
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let t = 0;
    let last = 0;
    let raf = 0;
    let w = 0;
    let h = 0;

    const line = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const aurora = ([a, b, c]: Params['colors']) => {
      const blobs: Array<[string, number, number, number, number]> = [
        [a, 0.22, 0.28, 0.55, 1.0],
        [b, 0.78, 0.22, 0.6, 1.3],
        [c, 0.58, 0.82, 0.5, 0.8],
        [a, 0.12, 0.9, 0.42, 1.6],
      ];
      const big = Math.max(w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const [rgb, x, y, r, k] of blobs) {
        const cx = (x + Math.sin(t * k + x * 6) * 0.12) * w;
        const cy = (y + Math.cos(t * k * 0.8 + y * 5) * 0.1) * h;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * big);
        g.addColorStop(0, `rgba(${rgb},0.36)`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const grid = ([a, b]: Params['colors']) => {
      const hy = h * 0.56;
      const sky = ctx.createLinearGradient(0, hy - h * 0.3, 0, hy);
      sky.addColorStop(0, `rgba(${a},0)`);
      sky.addColorStop(1, `rgba(${a},0.18)`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, hy - h * 0.3, w, h * 0.3);
      ctx.lineWidth = 1;
      const rows = 16;
      const off = (t * 1.2) % 1;
      for (let i = 0; i < rows; i++) {
        const p = ((i + off) / rows) ** 2;
        const y = hy + (h - hy) * p;
        ctx.strokeStyle = `rgba(${a},${(0.1 + 0.55 * p).toFixed(3)})`;
        line(0, y, w, y);
      }
      const cols = 14;
      const cx = w / 2;
      const step = w / cols;
      ctx.strokeStyle = `rgba(${b},0.22)`;
      for (let i = -cols; i <= cols; i++) line(cx + i * step * 0.06, hy, cx + i * step * 1.2, h);
      ctx.strokeStyle = `rgba(${b},0.5)`;
      line(0, hy, w, hy);
    };

    const dots = ([a]: Params['colors']) => {
      const s = 22;
      const ox = (t * 18) % s;
      const oy = (t * 10) % s;
      ctx.fillStyle = `rgba(${a},0.13)`;
      for (let y = -s + oy; y < h + s; y += s) {
        for (let x = -s + ox; x < w + s; x += s) ctx.fillRect(x, y, 1.6, 1.6);
      }
    };

    // 0~1 사이의 고정 난수 (같은 i, seed면 같은 값)
    const hash = (i: number, seed: number) => {
      const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    /** CRT 형광: 가운데 번짐 + 위에서 아래로 지나가는 밝은 띠 + 깜빡이는 점 */
    const phosphor = ([a, , c]: Params['colors']) => {
      const glow = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, Math.max(w, h) * 0.7);
      glow.addColorStop(0, `rgba(${a},0.11)`);
      glow.addColorStop(1, `rgba(${a},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const by = (((t * 0.12) % 1.3) - 0.15) * h;
      const band = ctx.createLinearGradient(0, by - 90, 0, by + 90);
      band.addColorStop(0, `rgba(${a},0)`);
      band.addColorStop(0.5, `rgba(${a},0.08)`);
      band.addColorStop(1, `rgba(${a},0)`);
      ctx.fillStyle = band;
      ctx.fillRect(0, by - 90, w, 180);

      const seed = Math.floor(t * 6);
      for (let i = 0; i < 48; i++) {
        const on = hash(i, seed) > 0.55;
        ctx.fillStyle = `rgba(${i % 7 === 0 ? c : a},${on ? 0.5 : 0.14})`;
        ctx.fillRect(Math.floor(hash(i, 1) * w), Math.floor(hash(i, 2) * h), 2, 2);
      }
    };

    /** 파스텔 덩어리가 천천히 떠다닙니다. 밝은 배경용 (빛 더하기 합성 없이) */
    const blobs = ([a, b, c]: Params['colors']) => {
      const big = Math.min(w, h);
      const items: Array<[string, number, number, number, number]> = [
        [a, 0.18, 0.24, 0.42, 0.7],
        [b, 0.82, 0.3, 0.36, 1.1],
        [c, 0.62, 0.82, 0.46, 0.9],
        [b, 0.12, 0.86, 0.3, 1.4],
      ];
      for (const [rgb, x, y, r, k] of items) {
        const cx = (x + Math.sin(t * k + x * 4) * 0.07) * w;
        const cy = (y + Math.cos(t * k * 0.9 + y * 3) * 0.07) * h;
        const rad = r * big * (1 + Math.sin(t * k * 1.3) * 0.06);
        const g = ctx.createRadialGradient(cx, cy, rad * 0.15, cx, cy, rad);
        g.addColorStop(0, `rgba(${rgb},0.5)`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const { shader, colors } = params.current;
      if (shader === 'aurora') aurora(colors);
      else if (shader === 'grid') grid(colors);
      else if (shader === 'dots') dots(colors);
      else if (shader === 'phosphor') phosphor(colors);
      else if (shader === 'blobs') blobs(colors);
    };
    const frame = (ts: number) => {
      if (last) t += Math.min(0.05, (ts - last) / 1000) * params.current.speed;
      last = ts;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const start = () => {
      stop();
      if (params.current.shader === 'none' || reduce.matches || document.hidden) {
        draw();
        return;
      }
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    resize();
    start();
    kick.current = start;
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', start);
    return () => {
      stop();
      kick.current = () => {};
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', start);
      reduce.removeEventListener('change', start);
    };
  }, []);

  const { shader, speed } = config.background;
  useEffect(() => {
    params.current = { shader, speed, colors: theme.shaderColors };
    kick.current();
  }, [shader, speed, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 size-full transition-opacity',
        shader === 'none' && 'opacity-0',
        className,
      )}
    />
  );
}
