'use client';

/**
 * 화면 위아래에 흐르는 띠. Figma 123:8633 의 ticker-to-left / ticker-to-right.
 *
 * 위는 왼쪽으로, 아래는 오른쪽으로 천천히 흐른다. 같은 줄을 두 벌 이어 붙이고
 * 한 벌 길이만큼(-50%) 밀어서 끝과 처음이 맞물리게 한다 — 그래서 이음매가 없다.
 */

import t from './Ticker.module.css';

/** 한 바퀴에 들어가는 말. 사이에 짧은 막대가 하나씩 끼어든다. */
const WORDS = ['2027', 'MOVEMENTS', 'NAVIGATOR', 'MOVEMENTS'];
/** 한 벌을 몇 바퀴 반복할지. 넓은 화면에서도 한 벌이 화면을 넘겨야 빈 자리가 안 생긴다. */
const LOOPS = 4;

function Run() {
  return (
    <div className={t.run}>
      {Array.from({ length: LOOPS }, (_, k) =>
        WORDS.map((w, i) => (
          <span className={t.item} key={`${k}-${i}`}>
            <span className={t.word}>{w}</span>
            <i className={t.dash} />
          </span>
        )))}
    </div>
  );
}

export default function Ticker({ dir }: { dir: 'left' | 'right' }) {
  return (
    /* 읽을 내용이 아니라 장식이다 — 화면 낭독기가 같은 말을 수십 번 읽지 않게 숨긴다. */
    <div className={`${t.bar} ${dir === 'left' ? t.top : t.bottom}`} aria-hidden="true">
      <div className={`${t.track} ${dir === 'left' ? t.toLeft : t.toRight}`}>
        <Run />
        <Run />
      </div>
    </div>
  );
}
