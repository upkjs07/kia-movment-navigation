'use client';

/** 1단계 — 첫 화면. 디자인 대기. 레거시 히어로 A/B 를 여기로 가져올 자리다. */

import s from './Stage.module.css';

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className={s.stage}>
      <div className={s.inner}>
        <div className={s.slot}>
          <p className={s.slotLabel}>1 · hero</p>
          <p style={{ marginTop: 10 }}>
            첫 화면. 레거시 히어로 A(기울어지는 타이포 패널) / B(드래그 플레이트)를
            가져올 자리.
          </p>
        </div>
        <button type="button" onClick={onStart} style={{ marginTop: 24, alignSelf: 'start' }}>
          시작하기 →
        </button>
      </div>
    </div>
  );
}
