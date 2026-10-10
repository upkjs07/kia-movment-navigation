'use client';

/**
 * 4단계 — 결과 카드. Figma 123:8633 (카드 123:8713, 패널 126:8937).
 *
 * 카드는 위가 운전석 그림, 아래가 문구와 두 버튼이다. 오른쪽 패널에서 그리는 방식
 * 하나와 손잡이 다섯 개를 고른다 — 고르는 순간 그림이 바로 바뀐다.
 */

import { useState } from 'react';
import DriverSeat from './DriverSeat';
import { useSelfieCam } from './useSelfieCam';
import { DEFAULTS, type Effect } from './carGL';
import { asset } from '@/lib/asset';
import { RESULTS, type Answers, type Result as ResultData } from '@/lib/flow';
import r from './Result.module.css';

/* Chromatic split 손잡이를 잠깐 숨긴다. 셰이더의 효과와 Effect 의 값은 그대로
   있고 패널에서만 빠진다 — 기본값이 0 이라 숨겨 둔 동안 그림은 달라지지 않는다.
   되살리려면 이 한 줄이다. */
const SHOW_CHROMA = true;

/* 두 버튼의 아이콘. 디자인이 3px 사각형 다섯 개로 그려 둔 그대로다 — 18×18 칸의
   한가운데에서의 어긋남이다. 글꼴 화살표를 쓰면 패널의 픽셀 맛과 어긋난다.
   칸이 24 에서 18 로 줄었을 때 이 값을 안 고쳐서, 바깥쪽 점이 칸을 벗어나 잘렸다. */
const ICON = 18;
const SAVE_DOTS: [number, number][] = [[-6, -2.25], [-3, 0.75], [0, 3.75], [3, 0.75], [6, -2.25]];
const SHARE_DOTS: [number, number][] = [[-3, -6], [0, -3], [3, 0], [0, 3], [-3, 6]];

export default function Result({ data: given }: { data: ResultData; answers: Answers }) {
  const [fx, setFx] = useState<Effect>(DEFAULTS);
  /* 결과를 번갈아 보기 위한 탭. 답변이 정해 준 것에서 시작하고, 고르면 그쪽을 쓴다.
     기획이 확정되기 전까지 두 안을 나란히 보려는 자리다 — 실제 사용자에게는
     자기 결과 하나만 나와야 하므로, 확정되면 이 줄과 아래 RESULT 묶음을 지운다. */
  const [pick, setPick] = useState(() => Math.max(0, RESULTS.indexOf(given)));
  const data = RESULTS[pick] ?? given;
  const cam = useSelfieCam();

  const set = (k: keyof Effect) => (v: number) => setFx((o) => ({ ...o, [k]: v / 100 }));

  return (
    <div className={r.page}>
      {/* 결과 안(案)을 번갈아 보는 자리. 카드에도 패널에도 속하지 않는다 —
          카드는 공유되는 그림이고 패널은 사용자가 쓰는 손잡이인데, 이건 기획
          확정 전에 두 안을 비교하려고 둔 것이라 성격이 다르다.
          확정되면 이 묶음과 pick 상태만 지우면 된다. */}
      <nav className={r.cases}>
        {RESULTS.map((o, i) => (
          <button key={o.id} type="button" title={o.type}
            className={`${r.case} ${i === pick ? r.caseOn : ''}`}
            onClick={() => setPick(i)}>
            RESULT {String.fromCharCode(65 + i)}
          </button>
        ))}
      </nav>

      <div className={r.stack}>
        {/* ── 카드 ─────────────────────────────────────────────── */}
        <section className={r.card}>
          <div className={r.shot}>
            {data.front && (
              <DriverSeat className={r.seat}
                src={asset(data.front.src)}
                glass={data.front.glass ? asset(data.front.glass) : undefined}
                glassBox={data.front.box} effect={fx} video={cam.video} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className={r.badge}><img src={asset('/figma/kia.png')} alt="Kia" /></div>

            {/* 디자인에는 없는 자리다. 카메라는 사용자가 직접 눌러야 열리므로
                허락 전에만 떠 있다가, 켜지면 사라져서 디자인대로 남는다.
                유리 마스크가 없는 그림(동물 등)에는 합성할 자리가 없어 아예 안 뜬다. */}
            {data.front?.glass && cam.state !== 'on' && (
              <button type="button" className={r.allow} onClick={cam.start}>
                {cam.state === 'asking' ? 'ASKING…'
                  : cam.state === 'denied' ? 'CAMERA BLOCKED' : '▸ TURN ON CAMERA'}
              </button>
            )}
          </div>

          <div className={r.copy}>
            <h1 className={r.title}>{data.type}</h1>
            <p className={r.lead}>{data.tagline}</p>
          </div>

          <div className={r.actions}>
            <button type="button" className={r.act}><Pixels dots={SAVE_DOTS} />SAVE</button>
            <button type="button" className={r.act}><Pixels dots={SHARE_DOTS} />SHARE</button>
          </div>
        </section>

        {/* ── 고르는 곳 ────────────────────────────────────────── */}
        <aside className={r.panel}>
          <div className={r.group}>
            <span className={r.chip}>STYLE</span>
            <div className={`${r.bar} ${r.barTight}`}>
              <div className={r.radios}>
                <button type="button" className={r.radio}
                  onClick={() => setFx((o) => ({ ...o, glyphs: false }))}>
                  <i className={fx.glyphs ? r.box : r.boxOn} />BLOCK
                </button>
                <button type="button" className={r.radio}
                  onClick={() => setFx((o) => ({ ...o, glyphs: true }))}>
                  <i className={fx.glyphs ? r.boxOn : r.box} />GLYPHS
                </button>
              </div>
            </div>
          </div>

          <Slider label="Bloom" v={fx.bloom} on={set('bloom')} />
          <Slider label="Coverage" v={fx.coverage} on={set('coverage')} />
          <Slider label="Dark cut-off" v={fx.dark} on={set('dark')} />
          <Slider label="Grain" v={fx.grain} on={set('grain')} />
          {SHOW_CHROMA && (
            /* 디자인에는 없고 레퍼런스에만 있던 것 */
            <Slider label="Chromatic split" v={fx.chroma} on={set('chroma')} />
          )}
          {/* 디자인에서 이 칸만 % 없이 숫자다 */}
          <Slider label="Glitch" v={fx.glitch} on={set('glitch')} bare />
        </aside>
      </div>
    </div>
  );
}

function Slider({ label, v, on, bare }: {
  label: string; v: number; on: (n: number) => void; bare?: boolean;
}) {
  const pct = Math.round(v * 100);
  return (
    <div className={r.group}>
      <span className={r.chip}>{label}</span>
      <div className={r.bar}>
        <input type="range" min={0} max={100} value={pct} aria-label={label}
          className={r.range} style={{ ['--fill' as string]: `${pct}%` }}
          onChange={(e) => on(Number(e.target.value))} />
      </div>
      <span className={r.chip}>{pct}{bare ? '' : '%'}</span>
    </div>
  );
}

function Pixels({ dots }: { dots: [number, number][] }) {
  return (
    <i className={r.icon}>
      {dots.map(([x, y]) => (
        <span key={`${x}:${y}`} style={{ left: ICON / 2 + x, top: ICON / 2 + y }} />
      ))}
    </i>
  );
}
