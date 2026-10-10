'use client';

/**
 * 셀카 카메라. 켜기/거부 상태와 video 엘리먼트를 돌려준다.
 *
 * 켜는 일을 버튼(디자인의 03 PHOTO · ALLOW)에서 하고 그림은 다른 컴포넌트가 그리므로,
 * 둘이 공유할 수 있게 훅으로 뺐다. 거부해도 흐름은 멈추지 않는다 — 차만 그린다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export type CamState = 'off' | 'asking' | 'on' | 'denied';

export function useSelfieCam() {
  const video = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<CamState>('off');

  /* iOS 는 사용자가 누른 뒤에만 카메라를 연다. 그래서 버튼에서 부른다. */
  const start = useCallback(async () => {
    setState('asking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 } }, audio: false,
      });
      const v = document.createElement('video');
      v.srcObject = stream;
      v.muted = true; v.playsInline = true; v.autoplay = true;
      await v.play();
      video.current = v;
      setState('on');
    } catch {
      setState('denied');
    }
  }, []);

  useEffect(() => () => {
    (video.current?.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
  }, []);

  return { video, state, start };
}
