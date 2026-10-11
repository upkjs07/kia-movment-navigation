'use client';

/**
 * 카드 그림 자리에서 도는 반복 영상.
 *
 * 기본은 '반복 재생 중' 이다. 멈추는 길은 둘 — 일시정지를 누르거나 시킹 바를 잡는
 * 것이고, 둘 다 같은 자리에서 멈춘다. 다시 돌리려면 재생을 눌러야 한다(바를 놓는다고
 * 저절로 이어지지 않는다). 사용자가 '멈춤' 을 고른 상태를 바 조작이 몰래 되돌리면
 * 어느 쪽이 참인지 알 수 없어진다.
 *
 * 영상 요소 자체는 화면에 안 보인다 — 그림은 셰이더가 그리고, 이 요소는 프레임을
 * 꺼내 쓰는 통로일 뿐이다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Film {
  video: React.RefObject<HTMLVideoElement | null>;
  /** 돌고 있는지 */
  playing: boolean;
  /** 지금 위치(초)와 전체 길이(초) */
  t: number;
  dur: number;
  play(): void;
  pause(): void;
  /** 바를 끌 때. 끄는 순간 멈춘다. */
  seek(sec: number): void;
}

export function useFilm(src?: string): Film {
  const video = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  /* 길이는 메타데이터가 와야 안다. timeupdate 는 초당 네 번쯤이라 바가 뚝뚝 끊겨서,
     돌고 있는 동안만 rAF 로 따라간다. */
  useEffect(() => {
    const v = video.current;
    if (!v || !src) return;
    const meta = () => setDur(v.duration || 0);
    v.addEventListener('loadedmetadata', meta);
    if (v.readyState >= 1) meta();
    return () => v.removeEventListener('loadedmetadata', meta);
  }, [src]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v) setT(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const play = useCallback(() => {
    /* 자동재생이 막히면 play() 가 거절한다. 그때는 '멈춤' 으로 되돌려야 버튼 모양과
       실제가 어긋나지 않는다. */
    video.current?.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const pause = useCallback(() => {
    video.current?.pause();
    setPlaying(false);
  }, []);

  const seek = useCallback((sec: number) => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = sec;
    setPlaying(false);
    setT(sec);
  }, []);

  return { video, playing, t, dur, play, pause, seek };
}
