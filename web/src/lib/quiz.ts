/**
 * Movement Navigator · 판정 로직
 *
 * 기획에서 받은 mn-logic 모듈(v1.0.0-0930)을 타입스크립트로 옮긴 것.
 * 문항은 표 이미지 기준 최종본으로 교체했고, 축 인덱스는 QUESTIONS 에서
 * 자동 산출하므로 문항 순서를 바꿔도 여기를 고칠 필요가 없다.
 *
 * 9문항 · 3축 × 3문항 다수결 · 8유형. 512 조합이 유형당 정확히 64개씩 떨어진다
 * (selfTest 로 확인).
 */

export type AxisKey = 'A' | 'B' | 'C';
export type Letter = 'E' | 'R' | 'P' | 'F' | 'W' | 'M';
export type TypeCode =
  | 'EPW' | 'EPM' | 'EFW' | 'EFM'
  | 'RPW' | 'RPM' | 'RFW' | 'RFM';
/** 1 = 선택지 01, 2 = 선택지 02 */
export type Choice = 1 | 2;

export interface Question {
  id: string;
  act: 1 | 2 | 3;
  axis: AxisKey;
  pick: [Letter, Letter];
  scene: string;
  text: string;
  options: [string, string];
}

/** act / scene 은 표에 없던 값이라 제안값. 기획 확인 필요. */
export const QUESTIONS: Question[] = [
  // 1막 · 2026년을 돌아보며
  { id: 'Q1', act: 1, axis: 'A', pick: ['E', 'R'], scene: '미뤄둔 것들',
    text: '2026년을 떠올리면, 가장 아쉬운 건?',
    options: ['가보고 싶던 곳, 해보고 싶던 일을 자꾸 미뤄둔 것',
              '쉼 없이 달리느라 나를 돌보지 못한 것'] },
  { id: 'Q2', act: 1, axis: 'C', pick: ['W', 'M'], scene: '버티게 한 힘',
    text: '그래도 2026년을 버티게 한 힘은?',
    options: ['곁에서 함께해 준 사람들',
              '조용히 나를 믿어준 나 자신'] },
  { id: 'Q3', act: 1, axis: 'B', pick: ['P', 'F'], scene: '좋았던 일들',
    text: '2026년의 좋은 일들은 대부분 어떻게 찾아왔나요?',
    options: ['차근차근 준비한 끝에',
              '예상 못한 우연 속에서'] },
  // 2막 · 12월 31일, 마지막 밤
  { id: 'Q4', act: 2, axis: 'B', pick: ['P', 'F'], scene: '두고 갈 짐',
    text: '2027년으로 넘어가기 전, 여기 두고 가고 싶은 짐은?',
    options: ['되는 대로 흘려보낸 시간들',
              '계획대로 안 될까 봐 하던 걱정들'] },
  { id: 'Q5', act: 2, axis: 'A', pick: ['E', 'R'], scene: '나에게 건네는 말',
    text: '2026년의 나에게 한마디 건넨다면?',
    options: ['“충분히 잘했어. 이제 더 멀리 가보자.”',
              '“충분히 잘했어. 이제 좀 쉬어도 돼.”'] },
  { id: 'Q6', act: 2, axis: 'C', pick: ['W', 'M'], scene: '마지막 밤',
    text: '2026년의 마지막 밤, 가장 하고 싶은 일은?',
    options: ['고마웠던 사람들에게 연락을 돌린다',
              '한 해를 조용히 적어 내려간다'] },
  // 3막 · 2027년으로 출발
  { id: 'Q7', act: 3, axis: 'C', pick: ['W', 'M'], scene: '옆자리',
    text: '2027년으로 출발하는 차, 옆자리는?',
    options: ['함께 가고 싶은 사람을 위해 비워둔다',
              '온전히 나를 위한 자리로 둔다'] },
  { id: 'Q8', act: 3, axis: 'B', pick: ['P', 'F'], scene: '경로 설정',
    text: '내비게이션에 2027년 경로를 설정하려는데…',
    options: ['경유지까지 하나하나 찍어 경로를 완성한다',
              '방향만 정하고 나머지는 달리며 정한다'] },
  { id: 'Q9', act: 3, axis: 'A', pick: ['E', 'R'], scene: '목적지 입력',
    text: '마지막으로, 2027년의 목적지를 입력하세요.',
    options: ['한 번도 가보지 않은 곳',
              '가장 나다운 곳'] },
];

export const ACTS: Record<1 | 2 | 3, string> = {
  1: '2026년을 돌아보며',
  2: '12월 31일, 마지막 밤',
  3: '2027년으로 출발',
};

interface AxisDef {
  name: string;
  letters: [Letter, Letter];
  labels: [string, string];
  /** QUESTIONS 안에서 이 축을 재는 문항의 인덱스 */
  index: number[];
}

export const AXES: Record<AxisKey, AxisDef> = {
  A: { name: '방향', letters: ['E', 'R'], labels: ['밖으로 · 탐험', '안으로 · 휴식'], index: [] },
  B: { name: '방식', letters: ['P', 'F'], labels: ['계획 · 플랜', '즉흥 · 플로우'], index: [] },
  C: { name: '동승', letters: ['W', 'M'], labels: ['함께 · 크루', '조용히 · 솔로'], index: [] },
};
(Object.keys(AXES) as AxisKey[]).forEach((k) => {
  AXES[k].index = QUESTIONS.reduce<number[]>((acc, q, i) => {
    if (q.axis === k) acc.push(i);
    return acc;
  }, []);
});

export interface AxisScore {
  axis: AxisKey;
  name: string;
  letter: Letter;
  label: string;
  /** [선택지 01 득표, 선택지 02 득표] */
  votes: [number, number];
  /** 3:0 이면 strong, 2:1 이면 lean */
  strength: 'strong' | 'lean';
}

export function scoreAxis(answers: Choice[], axisKey: AxisKey): AxisScore {
  const ax = AXES[axisKey];
  const first = ax.index.filter((i) => answers[i] === 1).length;
  const second = ax.index.length - first;
  const isFirst = first >= 2;              // 3문항이라 동률이 없다
  return {
    axis: axisKey,
    name: ax.name,
    letter: isFirst ? ax.letters[0] : ax.letters[1],
    label: isFirst ? ax.labels[0] : ax.labels[1],
    votes: [first, second],
    strength: first === 3 || second === 3 ? 'strong' : 'lean',
  };
}

export function computeCode(answers: Choice[]): TypeCode {
  return (scoreAxis(answers, 'A').letter +
          scoreAxis(answers, 'B').letter +
          scoreAxis(answers, 'C').letter) as TypeCode;
}

/** 512 조합이 8유형에 64개씩 균등하게 떨어지는지 — 문항을 고칠 때마다 돌려볼 것 */
export function selfTest() {
  const n = QUESTIONS.length;
  const total = 2 ** n;
  const count = {} as Record<TypeCode, number>;
  for (let i = 0; i < total; i++) {
    const ans: Choice[] = [];
    for (let b = 0; b < n; b++) ans.push(((i >> b) & 1 ? 1 : 2) as Choice);
    const c = computeCode(ans);
    count[c] = (count[c] ?? 0) + 1;
  }
  const expected = total / 8;
  const pass = Object.values(count).every((v) => v === expected) &&
               Object.keys(count).length === 8;
  return { pass, total, expectedPerType: expected, count };
}
