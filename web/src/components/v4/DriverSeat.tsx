'use client';

/**
 * 운전석 — 차 정면에 셀카를 합성하고, 그 결과 전체에 효과를 먹인다.
 *
 * 고르는 일(스타일·다섯 손잡이·카메라)은 바깥이 하고 여기는 그리기만 한다.
 */

import { useEffect, useRef } from 'react';
import { createCarGL, type CarGL, type Effect, type GlassBox } from './carGL';

export default function DriverSeat({
  src, glass, glassBox, effect, video, className,
}: {
  src: string; glass?: string; glassBox?: GlassBox;
  effect: Effect;
  video: React.RefObject<HTMLVideoElement | null>;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  /* 매 프레임 읽히기만 하므로 ref 에 담는다 — 손잡이를 움직일 때마다 WebGL 을
     다시 만들지 않는다. */
  const fx = useRef(effect);
  useEffect(() => { fx.current = effect; }, [effect]);

  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    const gl: CarGL | null = createCarGL(canvas, src, glass, glassBox);
    if (!gl) return;

    const resize = () => gl.resize(el.clientWidth, el.clientHeight,
      Math.min(window.devicePixelRatio || 1, 2));
    resize();

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      gl.setVideo(video.current);
      gl.draw(fx.current, (now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf); gl.destroy();
      window.removeEventListener('resize', resize);
    };
  }, [src, glass, glassBox, video]);

  return (
    <div ref={box} className={className}>
      <canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
