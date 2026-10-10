'use client';

/**
 * 판단용 화면 — Q2, Q4 를 슬라이더 방식으로 시험한다.
 * 공통 메커니즘(노브를 끝까지 밀어 선택)에 질문별 그라데이션 형태만 끼운다.
 */

import { useState, useSyncExternalStore } from 'react';
import QuestionStage from '@/components/QuestionStage';
import type { FieldFx } from '@/components/fieldGL';
import type { FieldConfig } from '@/components/SpectralField';
import { Q4_FIELD } from '@/components/q4Field';
import { asset } from '@/lib/asset';
import { QUESTIONS } from '@/lib/quiz';
import styles from './page.module.css';

/** 레퍼런스 시안에서 뽑은 색. 바깥 → 안쪽 순서. */
const FIELDS: Record<string, FieldConfig> = {
  /* Q2 — 가로로 긴 캡슐. 모래시계와 같은 생각이다: 형태를 수식으로 두고 그 심지까지의
     거리로 색을 고른다. 거리가 곧 고리라 동심원이 저절로 생긴다.
     색은 레퍼런스에서 실측했다 — 안쪽부터 바깥 순서. */
  Q2: {
    shape: 'capsule',
    capsule: {
      rings: ['#ED732F', '#ED8732', '#ECA53B', '#F3AD68',
              '#EC94CA', '#A980F2', '#2B3A96'],
      lead: '#5BEF4A',
    },
  },
  // Q4 — 모래시계. 생김새는 레퍼런스에서 맞춘 수식(q4Field.ts). 텍스처가 아니다.
  Q4: { shape: 'hourglass', field: Q4_FIELD },
};

/* 탭에 보이는 것. Q2(캡슐)는 아직 다듬는 중이라 감췄다 — 코드는 그대로 두고
   ?q=Q2 로는 계속 열린다. */
const TEST = ['Q4', 'Q3'] as const;
const ALL = ['Q2', 'Q3', 'Q4'] as const;

export default function Page() {
  /* ?q=Q3 으로 바로 열 수 있게 — 검증할 때 쓴다.
     주소는 클라이언트에만 있는 값이라, 서버 스냅샷을 따로 주는 useSyncExternalStore 로
     읽는다. 초기 state 에서 읽으면 hydration 이 깨지고, effect 에서 setState 하면
     연쇄 렌더가 된다. */
  const search = useSyncExternalStore(
    () => () => {},                       // 로드 후 바뀌지 않는다
    () => window.location.search,
    () => '',                             // 서버
  );
  const params = new URLSearchParams(search);
  const fromUrl = params.get('q') ?? '';
  const [override, setOverride] = useState<(typeof ALL)[number] | null>(null);
  const which: (typeof ALL)[number] =
    override ?? ((ALL as readonly string[]).includes(fromUrl) ? (fromUrl as (typeof ALL)[number]) : 'Q4');
  const [picked, setPicked] = useState<string>('');
  /* 효과 조절판. 전부 드래그량에 비례해 들어가므로 0 이면 완전히 꺼진다. */
  const [fx, setFx] = useState<FieldFx>({ melt: 0, jitter: 0, pixel: 0, grain: 0, noise: 0 });
  const [fxOpen, setFxOpen] = useState(false);   // 기본은 닫힘
  /* ?mode=light 로도 열 수 있다 — 확인하거나 링크로 보여 줄 때 쓴다. */
  const [schemeOverride, setScheme] = useState<'dark' | 'light' | null>(null);
  const scheme: 'dark' | 'light' = schemeOverride ?? (params.get('mode') === 'light' ? 'light' : 'dark');
  const FX: { key: keyof FieldFx; label: string }[] = [
    { key: 'melt', label: 'Melt / Smear' },
    { key: 'jitter', label: 'Line Jitter' },
    { key: 'pixel', label: 'Pixel Zone' },
    { key: 'grain', label: 'Grain' },
    { key: 'noise', label: 'Noise' },
  ];

  const q = QUESTIONS.find((x) => x.id === which)!;

  return (
    <main className={styles.root}>
      <QuestionStage
        key={which}
        index={q.id + '.'}
        text={q.text}
        options={q.options}
        tone={which === 'Q3' ? 'light' : 'dark'}
        field={which === 'Q3' ? undefined : FIELDS[which]}
        effects={fx}
        scheme={scheme}
        videoSrc={which === 'Q3' ? asset('/q3.mp4') : undefined}
        onCommit={(c) => setPicked(`${q.id} → ${c === 1 ? '왼쪽(01)' : '오른쪽(02)'} · ${q.options[c - 1]}`)}
      />

      <button className={`${styles.scheme} ${scheme === 'light' ? styles.schemeOnLight : ''}`} onClick={() => setScheme((m) => (m === 'dark' ? 'light' : 'dark'))}>
        {scheme === 'dark' ? '라이트 모드' : '다크 모드'}
      </button>

      <div className={styles.panel}>
        <button className={styles.panelHead} onClick={() => setFxOpen((o) => !o)}
          aria-expanded={fxOpen}>
          <span>효과</span>
          <span className={styles.chev} aria-hidden>{fxOpen ? '\u2212' : '+'}</span>
        </button>
        {fxOpen && FX.map(({ key, label }) => (
          <label key={key} className={styles.fxRow}>
            <span className={styles.fxName}>{label}</span>
            <input
              type="range" min={0} max={1} step={0.01} value={fx[key]}
              className={styles.fxRange}
              onChange={(e) => setFx((f) => ({ ...f, [key]: Number(e.target.value) }))}
            />
            <span className={styles.fxVal}>{fx[key].toFixed(2)}</span>
          </label>
        ))}
        {fxOpen && (
          <button className={styles.fxReset}
            onClick={() => setFx({ melt: 0, jitter: 0, pixel: 0, grain: 0, noise: 0 })}>
            효과 끄기
          </button>
        )}
      </div>

      <div className={styles.tools}>
        {TEST.map((id) => (
          <button key={id}
            className={`${styles.btn} ${which === id ? styles.on : ''}`}
            onClick={() => { setOverride(id); setPicked(''); }}>
            {id}
          </button>
        ))}
        <button className={styles.btn} onClick={() => { setOverride(null); setPicked(''); }}>
          초기화
        </button>
        {picked && <span className={styles.picked}>{picked}</span>}
      </div>
    </main>
  );
}
