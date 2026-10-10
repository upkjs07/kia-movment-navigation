'use client';

/**
 * 3단계 — 로딩. 'AI 가 생성하는 느낌' 을 맡는 구간이다(실제 호출은 없다).
 * 지금은 넘어가는 타이밍만 잡아 둔다.
 */

import { useEffect } from 'react';
import s from './Stage.module.css';

/** 연출 길이 */
const MS = 2200;

export default function Loading({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={s.stage}>
      <div className={s.inner}>
        <div className={s.slot}>
          <p className={s.slotLabel}>3 · loading</p>
          <p style={{ marginTop: 10 }}>
            매칭 과정을 보여 주는 구간. 사고 과정이 흐르다가 결과로 넘어간다.
          </p>
        </div>
      </div>
    </div>
  );
}
