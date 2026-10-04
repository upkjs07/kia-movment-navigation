'use client';

/**
 * Movement Signature — 질문 화면의 배경.
 *
 * 재질은 레퍼런스(네온 그라데이션 · 강한 그레인 · 번짐)에서 가져왔다.
 * 색만 맞추면 벡터로 읽히므로, 재질을 만드는 건 그레인과 번짐 층이다.
 *
 * 축이 그림을 바꾸는 방식
 *   a  E ↔ R   색온도.         E = 차갑게, R = 따뜻하게
 *   b  P ↔ F   형태의 질서.    P = 정렬·반복, F = 불규칙·표류
 *   c  W ↔ M   형태의 수.      W = 여럿이 모임, M = 하나와 여백
 *
 * progress 는 질문이 진행된 정도(0‥1). 올라갈수록 초현실감이 짙어진다 —
 * 바탕이 검정에서 대기를 가진 색면으로 열리고, 덩어리가 겹치기 시작하고,
 * 빛나는 알갱이가 떠다닌다. 무엇이 될지는 말하지 않는다. 결과 페이지는
 * 별개의 화면이므로 여기서 어떤 형상으로 수렴할 필요가 없다.
 */

import { useEffect, useRef } from 'react';

export interface SignatureState {
  /** -1 = E, +1 = R */ a: number;
  /** -1 = P, +1 = F */ b: number;
  /** -1 = W, +1 = M */ c: number;
  /** 0 ‥ 1 — 질문 진행도. 초현실감의 세기 */ progress: number;
  grain?: number;
  bloom?: number;
}

const COOL_HEX = ['#2B3DFF', '#16C8FF', '#7A3CFF', '#00FFC2', '#3C7BFF'];
const WARM_HEX = ['#FF2E5B', '#FF7A2C', '#FFC93C', '#FF3CC8', '#FF5A3C'];
/** 바탕 — 완전한 검정에서 시작해 진행할수록 이 색으로 열린다 */
const GROUND_COOL = [10, 12, 30];
const GROUND_WARM = [26, 10, 20];

const COOL = COOL_HEX.map(hex);
const WARM = WARM_HEX.map(hex);

interface Blob { hx: number; hy: number; r: number; drift: number; ci: number; ph: number }
interface Mote { x: number; y: number; r: number; sp: number; ci: number; ph: number }

type RGB = [number, number, number];

/* 색은 문자열이 아니라 숫자 배열로 다룬다. 섞은 결과를 다시 파싱하려다
   rgba(NaN,…) 이 나와 addColorStop 이 던지는 사고가 있었다. */
function hex(c: string): RGB {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}
function mix(a: RGB, b: RGB, k: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * k),
    Math.round(a[1] + (b[1] - a[1]) * k),
    Math.round(a[2] + (b[2] - a[2]) * k),
  ];
}
const css = (c: RGB, alpha = 1) => `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;

export default function Signature({ state }: { state: SignatureState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  // 최신 상태를 루프가 읽게 둔다. 렌더 중 ref 쓰기는 안 되므로 effect 에서 옮긴다.
  const target = useRef(state);
  useEffect(() => { target.current = state; }, [state]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const fx = document.createElement('canvas');
    const fxc = fx.getContext('2d');
    if (!fxc) return;

    ctx.filter = 'blur(2px)';
    const canBlur = ctx.filter !== 'none';
    ctx.filter = 'none';

    let W = 0, H = 0, dpr = 1, raf = 0;
    const t0 = performance.now();
    const shown = { ...target.current };
    let blobs: Blob[] = [];
    let motes: Mote[] = [];
    let grainPattern: CanvasPattern | null = null;

    /* 그레인은 한 번만 만들고 프레임마다 위치만 흔든다 — 매 프레임 픽셀을
       새로 만들면 비싸고, 흔들기만 해도 필름처럼 보인다 */
    function buildGrain() {
      const n = 180;
      const tile = document.createElement('canvas');
      tile.width = tile.height = n;
      const g = tile.getContext('2d');
      if (!g) return;
      const img = g.createImageData(n, n);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 128 + (Math.random() - 0.5) * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      grainPattern = ctx!.createPattern(tile, 'repeat');
    }

    function seed() {
      blobs = Array.from({ length: 9 }, (_, i) => ({
        hx: Math.random(), hy: Math.random(),
        r: 0.17 + Math.random() * 0.26,
        drift: 0.5 + Math.random(),
        ci: i % 5,
        ph: Math.random() * 6.28,
      }));
      motes = Array.from({ length: 46 }, (_, i) => ({
        x: Math.random(), y: Math.random(),
        r: 0.004 + Math.random() * 0.012,
        sp: 0.2 + Math.random() * 0.7,
        ci: i % 5,
        ph: Math.random() * 6.28,
      }));
    }

    function resize() {
      W = cv!.clientWidth || window.innerWidth;
      H = cv!.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [cv!, fx]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      fxc!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!grainPattern) buildGrain();
    }

    const warmth = () => (shown.a + 1) / 2;                   // 0 = E(차갑게) ‥ 1 = R(따뜻하게)
    const paletteAt = (i: number): RGB =>
      mix(COOL[i % COOL.length], WARM[i % WARM.length], warmth());

    /** 바탕 — 검정에서 시작해 진행할수록 대기를 가진 색면으로 열린다 */
    function drawGround(c: CanvasRenderingContext2D, p: number, time: number) {
      const k = warmth();
      const g0 = GROUND_COOL.map((v, i) => Math.round(v + (GROUND_WARM[i] - v) * k));
      const lift = 0.25 + p * 0.75;                           // 진행할수록 바탕이 열린다
      c.fillStyle = `rgb(${Math.round(g0[0] * lift)},${Math.round(g0[1] * lift)},${Math.round(g0[2] * lift)})`;
      c.fillRect(0, 0, W, H);

      // 거대한 대기층 몇 개. 아주 흐리고 아주 옅게 — 단색 검정을 벗기는 역할
      const S = Math.max(W, H);
      for (let i = 0; i < 3; i++) {
        const ph = time * 0.05 + i * 2.1;
        const x = W * (0.5 + Math.cos(ph) * 0.38);
        const y = H * (0.5 + Math.sin(ph * 0.8) * 0.42);
        const rad = S * (0.55 + i * 0.16);
        const g = c.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, css(paletteAt(i + 1), 0.1 + p * 0.22));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
      }
    }

    /** P 쪽일수록 둥글고 고르게, F 쪽일수록 울퉁불퉁하게 */
    function blobPath(c: CanvasRenderingContext2D, x: number, y: number, rad: number, time: number) {
      const pts = 9;
      const wild = (shown.b + 1) / 2;
      c.beginPath();
      for (let i = 0; i <= pts; i++) {
        const th = (i / pts) * Math.PI * 2;
        const wob = 1 + Math.sin(th * 3 + time * 0.6 + rad) * 0.1 * wild
                      + Math.sin(th * 5 - time * 0.4) * 0.16 * wild;
        const rr = rad * wob;
        const px = x + Math.cos(th) * rr, py = y + Math.sin(th) * rr * 0.92;
        if (i === 0) { c.moveTo(px, py); continue; }
        const pth = ((i - 1) / pts) * Math.PI * 2;
        const mth = (th + pth) / 2;
        const mr = rad * (1 + Math.sin(mth * 3 + time * 0.6 + rad) * 0.1 * wild);
        c.quadraticCurveTo(x + Math.cos(mth) * mr * 1.06, y + Math.sin(mth) * mr * 0.98, px, py);
      }
      c.closePath();
    }

    function drawShapes(c: CanvasRenderingContext2D, p: number, time: number) {
      const S = Math.min(W, H);
      const solo = (shown.c + 1) / 2;         // 1 = M(하나와 여백)
      const order = 1 - (shown.b + 1) / 2;    // 1 = P(완전히 정렬)
      // 진행할수록 덩어리가 늘어 겹치기 시작한다 — 겹침이 초현실감을 만든다
      const max = Math.round(2 + p * 7);
      const count = Math.max(1, Math.round(max * (1 - solo * 0.6)));

      for (let i = 0; i < count; i++) {
        const b = blobs[i % blobs.length];
        const gx = (i + 0.5) / count, gy = 0.5 + Math.sin(i * 1.7) * 0.14;
        let x = (b.hx * (1 - order) + gx * order) * W;
        let y = (b.hy * (1 - order) + gy * order) * H;
        x += Math.sin(time * 0.17 * b.drift + b.ph) * S * 0.035;
        y += Math.cos(time * 0.13 * b.drift + b.ph) * S * 0.035;

        const rad = S * b.r * (0.7 + solo * 0.8);
        const g = c.createRadialGradient(x - rad * 0.3, y - rad * 0.35, rad * 0.05, x, y, rad);
        g.addColorStop(0, css(paletteAt(b.ci)));
        g.addColorStop(0.55, css(paletteAt(b.ci + 2)));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        blobPath(c, x, y, rad, time + i);
        c.fill();
      }
    }

    /** 떠다니는 빛 알갱이. 진행할수록 늘어난다 */
    function drawMotes(c: CanvasRenderingContext2D, p: number, time: number) {
      if (p < 0.08) return;
      const S = Math.min(W, H);
      const count = Math.round(motes.length * p);
      for (let i = 0; i < count; i++) {
        const m = motes[i];
        const x = ((m.x + time * 0.004 * m.sp) % 1) * W;
        const y = ((m.y - time * 0.011 * m.sp) % 1 + 1) % 1 * H;
        const r = S * m.r * (0.8 + Math.sin(time * 1.2 + m.ph) * 0.2);
        const g = c.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, css(paletteAt(m.ci), 0.9));
        g.addColorStop(0.3, css(paletteAt(m.ci), 0.28));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r * 4, 0, 6.283);
        c.fill();
      }
    }

    function frame(now: number) {
      const time = (now - t0) / 1000;
      const T = target.current;
      shown.a += (T.a - shown.a) * 0.045;
      shown.b += (T.b - shown.b) * 0.045;
      shown.c += (T.c - shown.c) * 0.045;
      shown.progress += (T.progress - shown.progress) * 0.045;

      const p = shown.progress;
      const grain = T.grain ?? 0.42;
      const bloom = T.bloom ?? 0.62;

      // 형태는 별도 레이어에 — 번짐을 위해 한 번 더 쓰기 때문
      fxc!.setTransform(dpr, 0, 0, dpr, 0, 0);
      fxc!.clearRect(0, 0, W, H);
      drawShapes(fxc!, p, time);
      drawMotes(fxc!, p, time);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.globalCompositeOperation = 'source-over';
      drawGround(ctx!, p, time);

      if (bloom > 0.01 && canBlur) {
        ctx!.save();
        ctx!.globalCompositeOperation = 'lighter';
        ctx!.globalAlpha = bloom * 0.9;
        ctx!.filter = `blur(${Math.round(Math.min(W, H) * 0.06)}px)`;
        ctx!.drawImage(fx, 0, 0, W, H);
        ctx!.restore();
      }
      ctx!.save();
      ctx!.globalAlpha = 0.95;
      // 초반일수록 더 흐리게 — 형태가 아직 정해지지 않은 느낌
      if (canBlur) ctx!.filter = `blur(${2 + (1 - p) * 7}px)`;
      ctx!.drawImage(fx, 0, 0, W, H);
      ctx!.restore();

      if (grain > 0.01 && grainPattern) {
        ctx!.save();
        ctx!.globalCompositeOperation = 'overlay';
        ctx!.globalAlpha = grain * 0.5;
        ctx!.translate(Math.random() * 180 | 0, Math.random() * 180 | 0);
        ctx!.fillStyle = grainPattern;
        ctx!.fillRect(-180, -180, W + 360, H + 360);
        ctx!.restore();
      }
      // 비네팅 — 진행할수록 조금 걷힌다
      const vg = ctx!.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3,
                                           W / 2, H / 2, Math.max(W, H) * 0.78);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, `rgba(0,0,0,${0.72 - p * 0.22})`);
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(frame);
    }

    seed();
    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
    // 루프는 한 번만 건다. 상태는 target ref 로 흘려보낸다.
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />;
}
