'use client';

/**
 * 운전석 — 차 정면에 셀카를 합성하고, 그 결과 전체에 효과를 먹인다.
 *
 * 고르는 일(스타일·다섯 손잡이·카메라)은 바깥이 하고 여기는 그리기만 한다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createCarGL, MAX_ZONES, type CarGL, type Effect, type GlassBox } from './carGL';

/** 눌러서 모자이크 구역을 찍는 기능. 잠깐 꺼 둔다. */
const TAP_ZONES = false;

export default function DriverSeat({
  src, glass, glassBox, effect, video, film, className,
}: {
  src: string; glass?: string; glassBox?: GlassBox;
  effect: Effect;
  video: React.RefObject<HTMLVideoElement | null>;
  /** 그림 자리에 돌릴 반복 영상. 없으면 src 그림을 그대로 쓴다. */
  film?: React.RefObject<HTMLVideoElement | null>;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  /* 찍어서 만드는 모자이크 구역. 그림 위를 누른 자리에 하나씩 쌓이고, 두 번 누르면
     전부 지운다. 좌표는 캔버스 기준 0‥1 이라 창 크기가 바뀌어도 자리가 안 틀어진다.

     지금은 꺼 둔다 — 셰이더의 구역 코드와 여기 상태는 그대로 있고, 아래 한 줄만
     true 로 되돌리면 다시 찍힌다. 끄면 구역이 비어 있어 그림에는 영향이 없다. */
  const [zones, setZones] = useState<{ x: number; y: number }[]>([]);
  const gref = useRef<CarGL | null>(null);
  useEffect(() => { gref.current?.setZones(zones); }, [zones]);

  const tap = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = box.current;
    if (!TAP_ZONES || !el) return;
    const b = el.getBoundingClientRect();
    const p = { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height };
    /* 오래된 것부터 버린다 — 셰이더가 들고 있을 수 있는 개수가 정해져 있다. */
    setZones((z) => [...z, p].slice(-MAX_ZONES));
  }, []);

  /* 매 프레임 읽히기만 하므로 ref 에 담는다 — 손잡이를 움직일 때마다 WebGL 을
     다시 만들지 않는다. */
  const fx = useRef(effect);
  useEffect(() => { fx.current = effect; }, [effect]);
  /* 그림을 다시 만들 때(차종이 바뀔 때) 지금 찍혀 있는 구역을 그대로 넘긴다 */
  const zonesRef = useRef(zones);
  useEffect(() => { zonesRef.current = zones; }, [zones]);

  useEffect(() => {
    const el = box.current, canvas = cv.current;
    if (!el || !canvas) return;
    const gl: CarGL | null = createCarGL(canvas, src, glass, glassBox);
    if (!gl) return;
    gref.current = gl;
    gl.setZones(zonesRef.current);

    const resize = () => gl.resize(el.clientWidth, el.clientHeight,
      Math.min(window.devicePixelRatio || 1, 2));
    resize();

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      if (film) gl.setFilm(film.current);
      gl.setVideo(video.current);
      gl.draw(fx.current, (now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf); gl.destroy(); gref.current = null;
      window.removeEventListener('resize', resize);
    };
  }, [src, glass, glassBox, video, film]);

  return (
    <div ref={box} className={className}
      onPointerDown={tap} onDoubleClick={() => setZones([])}
      style={TAP_ZONES ? { cursor: 'crosshair', touchAction: 'manipulation' } : undefined}>
      <canvas ref={cv} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
