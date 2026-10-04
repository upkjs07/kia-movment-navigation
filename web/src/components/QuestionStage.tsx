'use client';

/* next/image 는 정적 export 에서 최적화가 없고(images.unoptimized), 이 아이콘들은
   Figma 가 준 고정 크기 SVG 다. 루트의 width/height 를 지키려면 <img> 가 맞다. */
/* eslint-disable @next/next/no-img-element */

/**
 * 질문 한 화면 — Figma(57:711 어두운 판 / 57:686 밝은 판) 레이아웃.
 *
 * 한 줄 안에  레이블 — 과녁 — 점선 — 핸들 — 점선 — 과녁 — 레이블  이 30px 간격으로
 * 놓인다. 핸들은 좌표로 옮기지 않고 양쪽 점선의 flex-grow 를 바꿔 민다. Figma 가
 * 점선을 flex:1 로 둔 구조 그대로라, 창 크기가 바뀌어도 따로 계산할 게 없다.
 *
 * 끌고 가는 동안에는 과녁에 붙지 않는다. 손을 뗀 자리가 과녁 근처면 그때 자석처럼
 * 당겨지고 답이 정해진다.
 *
 * 배경은 두 가지다 — 캔버스 필드(Q2·Q4)이거나 영상(Q3). 영상일 때는 핸들 위치가
 * 그대로 재생 지점이 된다. 왼쪽 끝이 첫 프레임, 오른쪽 끝이 마지막 프레임.
 */

import { useEffect, useRef, useState } from 'react';
import type { FieldConfig } from './SpectralField';
import { createFieldGL, type FieldGL, type FieldFx } from './fieldGL';
import { asset } from '@/lib/asset';
import styles from './QuestionStage.module.css';

export interface QuestionStageProps {
  index: string;
  text: string;
  options: [string, string];
  /** dark = 반투명 알약 레이블(Q2·Q4), light = 흰 박스 레이블(Q3) */
  tone: 'dark' | 'light';
  field?: FieldConfig;
  videoSrc?: string;
  /** 효과 세기 0‥1. 전부 드래그량에 비례한다 — 0 이면 꺼진다. */
  effects?: FieldFx;
  onCommit?: (choice: 1 | 2) => void;
}

/** 손을 뗐을 때 이 지점을 넘어서 있어야 과녁으로 당겨진다. 과녁에 거의 닿았을 때만. */
const SNAP = 0.88;
/** 가만히 있을 때 핸들이 흔들리는 폭 */
const IDLE = 0.06;

export default function QuestionStage({
  index, text, options, tone, field, videoSrc, effects, onCommit,
}: QuestionStageProps) {
  const stage = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const lineL = useRef<HTMLDivElement>(null);
  const lineR = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const value = useRef(0);                 // −1(왼쪽 과녁) ‥ +1(오른쪽 과녁)
  const dragging = useRef(false);
  const snapped = useRef<1 | 2 | null>(null);
  const [picked, setPicked] = useState<1 | 2 | null>(null);
  /* 효과 세기는 그리는 루프가 매 프레임 읽기만 한다. ref 에 담아 두면 슬라이더를
     움직여도 효과를 다시 만들지 않는다 — 렌더 중에 쓰면 안 되므로 effect 에서 옮긴다. */
  const fx = useRef<FieldFx | undefined>(effects);
  useEffect(() => { fx.current = effects; }, [effects]);

  useEffect(() => {
    const el = stage.current, canvas = cv.current;
    if (!el || !canvas) return;
    /* 필드는 WebGL 로, 영상(Q3)은 2D 로 그린다. 한 캔버스에 두 컨텍스트를 걸 수
       없으므로 필드일 때만 WebGL 을 잡는다. 실패하면 아무것도 그리지 않고
       배경색만 남는다 — 화면이 깨지지는 않는다. */
    let gl: FieldGL | null = null;
    let ctx2d: CanvasRenderingContext2D | null = null;
    if (field && !videoSrc) {
      gl = createFieldGL(canvas, field);
      if (!gl) ctx2d = canvas.getContext('2d');
    } else {
      ctx2d = canvas.getContext('2d');
    }

    /* 영상 배경(Q3) — 핸들 위치가 그대로 재생 지점이 된다.
       왼쪽 끝 = 첫 프레임, 오른쪽 끝 = 마지막 프레임. */
    let vid: HTMLVideoElement | null = null;
    let vidReady = false;
    if (videoSrc) {
      vid = document.createElement('video');
      vid.src = videoSrc;
      vid.muted = true;
      vid.playsInline = true;
      vid.preload = 'auto';
      vid.addEventListener('loadeddata', () => { vidReady = true; });
    }

    let W = 0, H = 0, dpr = 1, raf = 0, wantT = -1;
    let innerW = 0, knobW = 0, cRest = 0, leftC = 0, rightC = 0, travelL = 1, travelR = 1;
    const t0 = performance.now();

    function resize() {
      W = el!.clientWidth; H = el!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (gl) gl.resize(W, H, dpr);
      else {
        canvas!.width = Math.round(W * dpr);
        canvas!.height = Math.round(H * dpr);
      }
      /* 핸들의 쉬는 자리는 '묶음의 한가운데' 가 아니라 '화면의 한가운데' 다. 레이블 길이가
         좌우로 다르면 묶음이 한쪽으로 치우치는데, 그래도 핸들은 정중앙에 있어야 한다.
         그래서 좌·우로 갈 수 있는 거리를 따로 잰다 — 과녁까지의 거리가 서로 다르다. */
      const g = inner.current, kn = knob.current;
      if (g && kn) {
        const gr = g.getBoundingClientRect(), sr = el!.getBoundingClientRect();
        innerW = gr.width;
        knobW = kn.offsetWidth;
        leftC = knobW / 2;
        rightC = innerW - knobW / 2;
        cRest = Math.min(Math.max(sr.left + sr.width / 2 - gr.left, leftC), rightC);
        travelL = Math.max(1, cRest - leftC);
        travelR = Math.max(1, rightC - cRest);
      }
    }

    /** -1‥+1 을 핸들 중심 좌표로. 좌우 거리가 달라도 ±1 이 정확히 과녁에 닿는다. */
    const cFromV = (v: number) => cRest + v * (v < 0 ? travelL : travelR);
    const vFromC = (c: number) => (c - cRest) / (c < cRest ? travelL : travelR);

    function frame(now: number) {
      const time = (now - t0) / 1000;
      if (!dragging.current && snapped.current === null) {
        const want = Math.sin(time * 0.9) * IDLE;
        value.current += (want - value.current) * 0.06;
      } else if (snapped.current !== null) {
        const want = snapped.current === 1 ? -1 : 1;
        value.current += (want - value.current) * 0.2;      // 과녁으로 당겨지는 동작
      }
      const v = value.current;
      /* 핸들 중심을 먼저 정하고, 점선은 '과녁 바깥 끝 ~ 핸들 끝' 만 채운다. 그래서
         핸들이 과녁에 얹혀도 점선이 그 밑으로 파고들지 않고, 반대쪽에 틈도 안 생긴다.
         끝까지 가면 핸들이 과녁 한가운데에 정확히 포개진다. */
      const r = knobW / 2;
      const c = cFromV(v);                               // 핸들 중심
      if (knob.current) knob.current.style.transform = `translateX(${(c - r).toFixed(2)}px)`;
      if (lineL.current) {
        const x = knobW, w = Math.max(0, c - r - x);
        lineL.current.style.left = `${x.toFixed(2)}px`;
        lineL.current.style.width = `${w.toFixed(2)}px`;
      }
      if (lineR.current) {
        const x = c + r, w = Math.max(0, innerW - knobW - x);
        lineR.current.style.left = `${x.toFixed(2)}px`;
        lineR.current.style.width = `${w.toFixed(2)}px`;
      }
      /* 가까운 쪽 과녁까지의 거리로 핸들 배경을 짙게 한다. SVG 안의 흰 원 20% 위에
         더해지는 값이라 쉴 때는 0 — Figma 그대로다. 끝에서 올라오게 제곱을 건다. */
      const t = Math.max(0, 1 - Math.min(Math.abs(c - leftC) / travelL,
                                         Math.abs(c - rightC) / travelR));
      if (body.current) {
        body.current.style.backgroundColor = `rgba(255,255,255,${(0.3 * t * t).toFixed(3)})`;
      }

      if (gl) {
        gl.draw(v, time, fx.current);
      } else if (ctx2d) {
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx2d.fillStyle = '#010206';
        ctx2d.fillRect(0, 0, W, H);
        if (vid && vidReady && vid.duration) {
          const t = ((v + 1) / 2) * (vid.duration - 0.04);
          if (!vid.seeking && Math.abs(t - wantT) > 0.012) { wantT = t; vid.currentTime = t; }
          const sc = Math.max(W / vid.videoWidth, H / vid.videoHeight);
          const dw = vid.videoWidth * sc, dh = vid.videoHeight * sc;
          ctx2d.drawImage(vid, (W - dw) / 2, (H - dh) / 2, dw, dh);
        }
      }
      raf = requestAnimationFrame(frame);
    }

    let startX = 0, startVal = 0;
    function down(e: PointerEvent) {
      if (snapped.current !== null) return;
      dragging.current = true;
      startX = e.clientX;
      startVal = value.current;
      // 캡처는 핸들이 받는다. 손가락이 핸들을 벗어나도 끌기는 이어진다.
      knob.current?.setPointerCapture(e.pointerId);
      body.current?.classList.add(styles.grabbing);
      e.preventDefault();
    }
    function move(e: PointerEvent) {
      if (!dragging.current) return;
      /* 손가락이 움직인 만큼 핸들 중심을 옮긴 뒤 v 로 되돌린다. 좌우 거리가 다를 수
         있어서 v 에 바로 더하면 한쪽이 빨라진다. */
      const c = Math.min(Math.max(cFromV(startVal) + (e.clientX - startX), leftC), rightC);
      value.current = Math.max(-1, Math.min(1, vFromC(c)));
    }
    function up() {
      if (!dragging.current) return;
      dragging.current = false;
      body.current?.classList.remove(styles.grabbing);
      // 끌고 가는 동안에는 붙지 않는다. 뗀 자리가 과녁 근처일 때만 당긴다.
      const v = value.current;
      if (Math.abs(v) >= SNAP && snapped.current === null) {
        const c: 1 | 2 = v < 0 ? 1 : 2;
        snapped.current = c;
        setPicked(c);
        onCommit?.(c);
      }
    }

    const kn = knob.current;
    kn?.addEventListener('pointerdown', down);
    kn?.addEventListener('pointermove', move);
    kn?.addEventListener('pointerup', up);
    kn?.addEventListener('pointercancel', up);
    window.addEventListener('resize', resize);
    resize();
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      gl?.destroy();
      kn?.removeEventListener('pointerdown', down);
      kn?.removeEventListener('pointermove', move);
      kn?.removeEventListener('pointerup', up);
      kn?.removeEventListener('pointercancel', up);
      window.removeEventListener('resize', resize);
    };
  }, [field, videoSrc, onCommit]);

  // 핸들 SVG 는 판마다 크기가 다르게 뽑혀 있다 — 어두운 판 72(68:32), 밝은 판 96(57:686)
  const handleSrc = asset(tone === 'dark' ? '/figma/handle-dark.svg' : '/figma/handle.svg');
  const size = tone === 'dark' ? 72 : 96;

  return (
    <div ref={stage} className={`${styles.stage} ${styles[tone]}`}>
      <canvas ref={cv} className={styles.canvas} />

      {/* 상단 바 — ‹ Q3. ── 질문 › */}
      <div className={styles.head}>
        <img src={asset('/figma/prev.svg')} alt="" width={36} height={36} className={styles.arrow} />
        <span className={styles.idx}>{index}</span>
        <img src={asset('/figma/rule.svg')} alt="" width={90} height={3} className={styles.rule} />
        <span className={styles.q}>{text}</span>
        <img src={asset('/figma/next.svg')} alt="" width={36} height={36} className={styles.arrow} />
      </div>

      {/* 한 줄 — Figma 68:53. 레이블과 묶음 사이만 30px, 묶음 안은 0 */}
      <div ref={row} className={styles.row}>
        <div className={`${styles.label} ${picked === 1 ? styles.on : ''}`}>{options[0]}</div>
        <div ref={inner} className={styles.inner}>
          <div className={`${styles.target} ${styles.targetL} ${picked === 1 ? styles.hit : ''}`} />
          <div ref={lineL} className={styles.dots} />
          <div ref={knob} className={styles.knob}>
            <div ref={body} className={styles.knobBody}>
              <img src={handleSrc} alt="밀어서 선택" width={size} height={size} />
            </div>
          </div>
          <div ref={lineR} className={styles.dots} />
          <div className={`${styles.target} ${styles.targetR} ${picked === 2 ? styles.hit : ''}`} />
        </div>
        <div className={`${styles.label} ${styles.right} ${picked === 2 ? styles.on : ''}`}>{options[1]}</div>
      </div>
    </div>
  );
}
