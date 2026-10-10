'use client';

/**
 * 2단계 — 질문 여섯. 터미널 UI 온보딩.
 *
 * 한 번에 한 질문만 크게 보여 주고, 답한 것은 위로 쌓인다. 로그가 쌓이는 것 자체가
 * '답변이 쌓여가는 느낌' 을 맡는다 — 따로 장치를 만들지 않아도 된다.
 *
 * 질문 내용과 결과 구조는 lib/flow.ts 에 있다. 기획이 확정되면 그 파일만 갈아끼운다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { QUESTIONS, THEME_LABEL, type Answers } from '@/lib/flow';
import styles from './Ask.module.css';

/** 글자가 찍히는 속도 (ms/자) */
const TYPE_MS = 26;

type Entry = { kind: 'sys' | 'q' | 'a'; text: string };

const BOOT: string[] = [
  'movement-navigator v4',
  '2026 → 2027 · 6 questions',
  '',
];

export default function Ask({ onDone }: { onDone: (a: Answers) => void }) {
  const [step, setStep] = useState(0);                       // 0‥5 질문, 6 = 끝
  /* 고른 답은 여기서 모아 두고, 마지막 답까지 채워지면 부모에게 넘긴다. */
  const answers = useRef<Answers>(QUESTIONS.map(() => null));
  const [log, setLog] = useState<Entry[]>(() => BOOT.map((text) => ({ kind: 'sys', text })));
  /* 찍히는 중인 글자. 어느 질문의 것인지 같이 들고 있어야, 질문이 바뀐 직후
     한 틱 동안 이전 질문이 남아 보이지 않는다. */
  const [typed, setTyped] = useState({ id: '', text: '' });
  const [hover, setHover] = useState(0);
  const tail = useRef<HTMLDivElement>(null);

  const q = step < QUESTIONS.length ? QUESTIONS[step] : null;

  /* 지금 질문의 것만 보여 준다 — 질문이 바뀌면 자동으로 빈 문자열이 된다. */
  const shown = q && typed.id === q.id ? typed.text : '';
  const ready = !!q && shown.length === q.text.length;

  /* 한 글자씩 찍는다. setState 는 전부 타이머 안에서만 부른다 — effect 본문에서
     곧바로 부르면 연쇄 렌더가 된다. */
  useEffect(() => {
    if (!q) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped({ id: q.id, text: q.text.slice(0, i) });
      if (i >= q.text.length) clearInterval(id);
    }, TYPE_MS);
    return () => clearInterval(id);
  }, [q]);

  // 로그는 늘 바닥을 보여 준다
  useEffect(() => { tail.current?.scrollIntoView({ block: 'end' }); }, [log, shown]);

  const choose = useCallback((pick: 0 | 1) => {
    if (!q || !ready) return;
    setLog((l) => [...l,
      { kind: 'q', text: `${q.id}  ${q.text}` },
      { kind: 'a', text: q.options[pick] },
    ]);
    answers.current = answers.current.map((v, i) => (i === step ? pick : v));
    if (step + 1 >= QUESTIONS.length) onDone(answers.current);
    setStep((s) => s + 1);
    setHover(0);
  }, [q, ready, step, onDone]);

  /* 키보드로도 고를 수 있어야 터미널답다 */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!ready) return;
      if (e.key === '1') choose(0);
      else if (e.key === '2') choose(1);
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); setHover((h) => (h === 0 ? 1 : 0));
      } else if (e.key === 'Enter') choose(hover as 0 | 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, hover, choose]);

  return (
    <main className={styles.root}>
      <div className={styles.screen}>
        <div className={styles.log}>
          {log.map((e, i) => (
            <p key={i} className={styles[e.kind]}>
              {e.kind === 'a' ? <><span className={styles.caret}>›</span> {e.text}</> : e.text}
            </p>
          ))}
          <div ref={tail} />
        </div>

        {q && (
          <section className={styles.ask}>
            <p className={styles.meta}>
              <span className={styles.theme}>{THEME_LABEL[q.theme]}</span>
              <span className={styles.count}>{step + 1} / {QUESTIONS.length}</span>
            </p>
            <h1 className={styles.question}>
              {shown}
              {!ready && <span className={styles.cursor} aria-hidden />}
            </h1>
            <div className={styles.options} data-ready={ready || undefined}>
              {q.options.map((opt, i) => (
                <button key={opt} type="button"
                  className={`${styles.option} ${hover === i ? styles.on : ''}`}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => choose(i as 0 | 1)}>
                  <span className={styles.key}>{i + 1}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
            <p className={styles.hint}>1 · 2 또는 ↑↓ + Enter</p>
          </section>
        )}

      </div>
    </main>
  );
}
