'use client';

/**
 * v4 — 네 단계를 잇는 곳.
 *
 *   1 hero  →  2 ask (질문 6)  →  3 loading  →  4 result
 *
 * 만드는 동안 아무 단계나 바로 열 수 있어야 해서 ?step= 으로 건너뛴다.
 * 결과만 보려면 ?step=result.
 */

import { useCallback, useState, useSyncExternalStore } from 'react';
import Hero from '@/components/v4/Hero';
import Ask from '@/components/v4/Ask';
import Loading from '@/components/v4/Loading';
import Result from '@/components/v4/Result';
import { QUESTIONS, resultFor, type Answers } from '@/lib/flow';
import styles from './page.module.css';

const STEPS = ['hero', 'ask', 'loading', 'result'] as const;
type Step = (typeof STEPS)[number];

/** 아직 답하지 않은 상태 — ?step=result 로 바로 열었을 때 쓴다. */
const BLANK: Answers = QUESTIONS.map(() => null);

export default function Page() {
  /* 주소는 클라이언트에만 있는 값이라, 서버 스냅샷을 따로 주는 훅으로 읽는다.
     초기 state 에서 읽으면 hydration 이 깨진다. */
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => '',
  );
  const fromUrl = new URLSearchParams(search).get('step') ?? '';
  const start: Step = (STEPS as readonly string[]).includes(fromUrl) ? (fromUrl as Step) : 'hero';

  const [step, setStep] = useState<Step | null>(null);
  const now = step ?? start;
  const [answers, setAnswers] = useState<Answers>(BLANK);

  const done = useCallback((a: Answers) => { setAnswers(a); setStep('loading'); }, []);

  return (
    <>
      {now === 'hero' && <Hero onStart={() => setStep('ask')} />}
      {now === 'ask' && <Ask onDone={done} />}
      {now === 'loading' && <Loading onDone={() => setStep('result')} />}
      {now === 'result' && <Result data={resultFor(answers)} answers={answers} />}

      {/* 만드는 동안 쓰는 단계 전환. 완성되면 지운다. */}
      <nav className={styles.steps}>
        {STEPS.map((id, i) => (
          <button key={id} type="button"
            className={`${styles.step} ${now === id ? styles.on : ''}`}
            onClick={() => setStep(id)}>
            {i + 1} {id}
          </button>
        ))}
      </nav>
    </>
  );
}
