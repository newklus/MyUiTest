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
 * 프리셋의 background 설정을 따라 창 뒤에 그리는 배경 (aurora, grid, dots, phosphor, blobs, ink, rain, fireflies, stars, gears).
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

    /** 수묵 산수: 겹겹이 먹빛 능선 + 산 아래 안개 + 붉은 해 + 흘러가는 구름 */
    const ink = ([a, b]: Params['colors']) => {
      const sr = Math.min(w, h) * 0.07;
      ctx.fillStyle = `rgba(${b},0.18)`;
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.22, sr, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 4; i++) {
        const base = h * (0.5 + i * 0.12);
        const amp = h * (0.16 - i * 0.025);
        const seed = i * 1.7 + 0.3;
        const drift = t * (0.02 + i * 0.015);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 8; x += 8) {
          const u = x / w + drift;
          const ridge =
            0.55 * Math.sin(u * 6.3 * (1 + i * 0.4) + seed) +
            0.3 * Math.sin(u * 17 + seed * 2) +
            0.15 * Math.sin(u * 41 + seed * 3);
          ctx.lineTo(x, base - amp * ridge - amp * 0.4);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp * 1.4, 0, base + h * 0.12);
        g.addColorStop(0, `rgba(${a},${(0.1 + i * 0.07).toFixed(2)})`);
        g.addColorStop(1, `rgba(${a},0)`);
        ctx.fillStyle = g;
        ctx.fill();
      }

      for (let i = 0; i < 4; i++) {
        const cx = (((hash(i, 3) + t * 0.01 * (i + 1)) % 1.3) - 0.15) * w;
        const cy = h * (0.3 + hash(i, 4) * 0.35);
        const rx = w * (0.12 + hash(i, 5) * 0.1);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        g.addColorStop(0, 'rgba(255,252,244,0.6)');
        g.addColorStop(1, 'rgba(255,252,244,0)');
        // 세로로 납작하게 눌러 구름띠로 만듭니다.
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.14);
        ctx.translate(-cx, -cy);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    /** 네온 비 내리는 도시: 창문이 깜빡이는 빌딩 실루엣 + 사선 빗줄기 + 가끔 지나가는 글리치 */
    const rain = ([a, b, c]: Params['colors']) => {
      const n = 24;
      const bw = w / n;
      const lit = Math.floor(t * 0.5);
      for (let i = 0; i < n; i++) {
        const bh = h * (0.12 + hash(i, 7) * 0.3);
        const x = i * bw;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, h - bh, bw - 2, bh);
        for (let wy = h - bh + 8; wy < h - 6; wy += 10) {
          for (let wx = x + 4; wx < x + bw - 6; wx += 8) {
            const hv = hash(wx * 0.37 + wy * 1.31, lit + i);
            if (hv > 0.84) {
              ctx.fillStyle = `rgba(${hv > 0.95 ? b : a},0.5)`;
              ctx.fillRect(wx, wy, 2, 3);
            }
          }
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < 90; i++) {
        const x = hash(i, 11) * w;
        const sp = 0.6 + hash(i, 12);
        const y = ((hash(i, 13) + t * sp * 0.6) % 1.1) * h - 40;
        const len = 14 + hash(i, 14) * 26;
        ctx.strokeStyle = `rgba(${i % 5 === 0 ? b : a},${(0.12 + hash(i, 15) * 0.22).toFixed(2)})`;
        line(x, y, x - 3, y + len);
      }
      const gs = Math.floor(t * 4);
      if (hash(gs, 21) > 0.7) {
        const gy = hash(gs, 22) * h;
        ctx.fillStyle = `rgba(${c},0.08)`;
        ctx.fillRect(0, gy, w, 2 + hash(gs, 23) * 10);
        ctx.fillStyle = `rgba(${b},0.08)`;
        ctx.fillRect(hash(gs, 24) * w * 0.5, gy + 14, w * 0.4, 3);
      }
    };

    /** 밤 숲: 비스듬한 빛줄기 + 두 겹의 침엽수 실루엣 + 깜빡이는 반딧불 */
    const fireflies = ([a, b, c]: Params['colors']) => {
      for (let i = 0; i < 3; i++) {
        const x0 = w * (0.12 + i * 0.22) + Math.sin(t * 0.3 + i) * 20;
        const g = ctx.createLinearGradient(x0, 0, x0 + w * 0.25, h);
        g.addColorStop(0, `rgba(${a},0.08)`);
        g.addColorStop(1, `rgba(${a},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0 + 70, 0);
        ctx.lineTo(x0 + w * 0.3 + 160, h);
        ctx.lineTo(x0 + w * 0.3, h);
        ctx.closePath();
        ctx.fill();
      }
      for (let layer = 0; layer < 2; layer++) {
        const n = layer ? 9 : 14;
        ctx.fillStyle = layer ? 'rgba(0,0,0,0.55)' : `rgba(${c},0.75)`;
        for (let i = 0; i < n; i++) {
          const cx = ((i + hash(i, 30 + layer) * 0.8) / n) * w;
          const th = h * (layer ? 0.42 : 0.3) * (0.7 + hash(i, 32 + layer) * 0.5);
          const tw = th * 0.32;
          const by = h + 4;
          ctx.beginPath();
          ctx.moveTo(cx, by - th);
          ctx.lineTo(cx + tw * 0.5, by - th * 0.55);
          ctx.lineTo(cx + tw * 0.3, by - th * 0.55);
          ctx.lineTo(cx + tw * 0.75, by - th * 0.2);
          ctx.lineTo(cx + tw * 0.45, by - th * 0.2);
          ctx.lineTo(cx + tw, by);
          ctx.lineTo(cx - tw, by);
          ctx.lineTo(cx - tw * 0.45, by - th * 0.2);
          ctx.lineTo(cx - tw * 0.75, by - th * 0.2);
          ctx.lineTo(cx - tw * 0.3, by - th * 0.55);
          ctx.lineTo(cx - tw * 0.5, by - th * 0.55);
          ctx.closePath();
          ctx.fill();
        }
      }
      for (let i = 0; i < 46; i++) {
        const x = (hash(i, 40) + Math.sin(t * (0.3 + hash(i, 41) * 0.5) + i) * 0.04) * w;
        const y = (0.25 + hash(i, 42) * 0.7 + Math.cos(t * (0.25 + hash(i, 43) * 0.4) + i * 2) * 0.04) * h;
        const pulse = 0.5 + 0.5 * Math.sin(t * (1.2 + hash(i, 44) * 2) + i * 3);
        const r = 2 + pulse * 6;
        const rgb = i % 6 === 0 ? b : a;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, `rgba(${rgb},${(0.35 + pulse * 0.55).toFixed(2)})`);
        g.addColorStop(0.25, `rgba(${rgb},${(0.15 * pulse).toFixed(2)})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      }
    };

    /** 밤하늘: 천천히 움직이는 성운 + 반짝이는 별 + 가끔 별똥별 */
    const stars = ([a, b, c]: Params['colors']) => {
      const nebulae: Array<[string, number, number, number]> = [
        [b, 0.25, 0.3, 0.5],
        [c, 0.75, 0.6, 0.45],
        [a, 0.55, 0.15, 0.3],
      ];
      for (const [rgb, x, y, r] of nebulae) {
        const cx = (x + Math.sin(t * 0.1 + x * 5) * 0.03) * w;
        const cy = (y + Math.cos(t * 0.08 + y * 4) * 0.03) * h;
        const rad = r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${rgb},0.15)`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      for (let i = 0; i < 140; i++) {
        const x = hash(i, 50) * w;
        const y = hash(i, 51) * h;
        const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(i, 52) * 3) + i);
        const s = hash(i, 53);
        const big = s > 0.93;
        ctx.fillStyle = `rgba(${big ? a : '235,230,255'},${(0.25 + tw * 0.6).toFixed(2)})`;
        if (big) {
          const l = 3 + tw * 5;
          ctx.fillRect(x - l, y - 0.5, l * 2, 1);
          ctx.fillRect(x - 0.5, y - l, 1, l * 2);
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const d = s > 0.7 ? 1.6 : 1;
          ctx.fillRect(x, y, d, d);
        }
      }
      const cycle = t * 0.35;
      const k = Math.floor(cycle);
      const f = cycle - k;
      if (f < 0.25 && hash(k, 60) > 0.4) {
        const p = f / 0.25;
        const sx = (0.2 + hash(k, 61) * 0.6) * w + p * w * 0.25;
        const sy = (0.05 + hash(k, 62) * 0.3) * h + p * h * 0.18;
        const g = ctx.createLinearGradient(sx, sy, sx - 120, sy - 86);
        g.addColorStop(0, `rgba(${a},${(0.85 * (1 - p)).toFixed(2)})`);
        g.addColorStop(1, `rgba(${a},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        line(sx, sy, sx - 120, sy - 86);
      }
    };

    /** 톱니바퀴 하나. 이빨 간격이 같아서 크기가 달라도 맞물려 보입니다. */
    const gear = (cx: number, cy: number, r: number, angle: number, rgb: string, alpha: number) => {
      const depth = r * 0.14;
      const inner = r - depth;
      const teeth = Math.max(8, Math.round((Math.PI * 2 * r) / 26));
      const step = (Math.PI * 2) / teeth;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = angle + i * step;
        ctx.lineTo(cx + Math.cos(a0) * inner, cy + Math.sin(a0) * inner);
        ctx.lineTo(cx + Math.cos(a0 + step * 0.15) * r, cy + Math.sin(a0 + step * 0.15) * r);
        ctx.lineTo(cx + Math.cos(a0 + step * 0.45) * r, cy + Math.sin(a0 + step * 0.45) * r);
        ctx.lineTo(cx + Math.cos(a0 + step * 0.6) * inner, cy + Math.sin(a0 + step * 0.6) * inner);
      }
      ctx.closePath();
      ctx.moveTo(cx + r * 0.28, cy);
      ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2, true);
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.fill('evenodd');
      ctx.strokeStyle = `rgba(${rgb},${Math.min(1, alpha * 1.6).toFixed(2)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, inner * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      for (let s = 0; s < 4; s++) {
        const sa = angle + (s * Math.PI) / 2;
        line(cx + Math.cos(sa) * r * 0.3, cy + Math.sin(sa) * r * 0.3, cx + Math.cos(sa) * inner * 0.72, cy + Math.sin(sa) * inner * 0.72);
      }
    };

    /** 스팀펑크: 맞물려 도는 황동·구리 톱니 + 가장자리를 어둡게 하는 비네트 */
    const gears = ([a, b, c]: Params['colors']) => {
      const s = Math.min(w, h);
      const spin = t * 0.5;
      // [x, y, 반지름, 회전 방향, 색]
      const r1 = s * 0.24;
      const r2 = s * 0.13;
      const g2x = w * 0.1 + Math.cos(0.5) * (r1 + r2 - r2 * 0.12);
      const g2y = h * 0.22 + Math.sin(0.5) * (r1 + r2 - r2 * 0.12);
      const r3 = s * 0.3;
      const r4 = s * 0.15;
      const g4x = w * 0.9 + Math.cos(-2.5) * (r3 + r4 - r4 * 0.12);
      const g4y = h * 0.86 + Math.sin(-2.5) * (r3 + r4 - r4 * 0.12);
      gear(w * 0.1, h * 0.22, r1, spin / (r1 / s), a, 0.13);
      gear(g2x, g2y, r2, -spin / (r2 / s) + 0.2, b, 0.14);
      gear(w * 0.9, h * 0.86, r3, -spin / (r3 / s), a, 0.12);
      gear(g4x, g4y, r4, spin / (r4 / s) + 0.1, c, 0.16);
      gear(w * 0.86, h * 0.12, s * 0.08, spin / 0.08, b, 0.12);

      const v = ctx.createRadialGradient(w / 2, h / 2, s * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      v.addColorStop(0, `rgba(${a},0.05)`);
      v.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    };

    const painters: Partial<Record<ShaderName, (c: Params['colors']) => void>> = {
      aurora,
      grid,
      dots,
      phosphor,
      blobs,
      ink,
      rain,
      fireflies,
      stars,
      gears,
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const { shader, colors } = params.current;
      painters[shader]?.(colors);
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
