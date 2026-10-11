/**
 * v4 의 질문과 결과 구조.
 *
 * 내용은 아직 기획 확정 전이다 — 지금 값은 자리를 잡아 두기 위한 임시 문구다.
 * 확정되면 이 파일만 갈아끼우면 되도록, 화면 쪽은 여기 모양에만 기댄다.
 *
 * 여섯 질문은 세 가지 주제로 둘씩 묶인다. 주제가 곧 축이 되면 2³ = 8 타입이지만,
 * 축/타입 구조는 아직 정해지지 않았으므로 여기서는 주제만 표시해 둔다.
 */

export type Theme = '2026' | '2027' | 'self';

export interface Question {
  id: string;
  theme: Theme;
  /** 터미널에 찍히는 질문 */
  text: string;
  /** 고를 수 있는 두 답 */
  options: [string, string];
}

export const THEME_LABEL: Record<Theme, string> = {
  '2026': '2026',
  '2027': '2027',
  self: 'you',
};

/* TODO(기획): 문구 확정되면 교체. 주제별 2문항 구성만 유지하면 된다. */
export const QUESTIONS: Question[] = [
  { id: 'Q1', theme: '2026', text: '2026년을 한 문장으로 줄인다면?',
    options: ['쉬지 않고 달린 해', '버티는 데 다 쓴 해'] },
  { id: 'Q2', theme: '2026', text: '올해 가장 자주 미뤘던 것은?',
    options: ['가보고 싶던 곳', '만나고 싶던 사람'] },
  { id: 'Q3', theme: '2027', text: '2027년에 더 갖고 싶은 것은?',
    options: ['계획대로 되는 하루', '예측 못 할 하루'] },
  { id: 'Q4', theme: '2027', text: '새해 첫 주, 지금 마음이 가는 시작은?',
    options: ['해보고 싶은 일을 적어보는 시작', '마음 가는 대로 여는 시작'] },
  { id: 'Q5', theme: 'self', text: '길이 막혔을 때 나는?',
    options: ['돌아가는 길을 찾는다', '그 자리에서 기다린다'] },
  { id: 'Q6', theme: 'self', text: '함께 떠난다면 나는?',
    options: ['운전대를 잡는 쪽', '옆자리에서 보는 쪽'] },
];

/** 고른 답(0 또는 1)들. 길이는 QUESTIONS 와 같다. */
export type Answers = (0 | 1 | null)[];

/* ── 결과 ──────────────────────────────────────────────────────────────────
   성향 이름 하나에 차 한 대. 한국 판매 라인업에서 8대를 쓰기로 했고, 지금은
   구조를 보기 위해 한 대만 채워 뒀다. */

export interface Result {
  id: string;
  /** 카드 제목. 한글 의성어 한 마디다 */
  type: string;
  /** 제목 오른쪽에 픽셀 글꼴로 붙는 영문 메아리 — 같은 소리를 영어로 옮긴 것 */
  echo: string;
  /** 제목 아래 회색 한 줄 — 공유될 때 읽히는 문장이라 인용할 만해야 한다 */
  tagline: string;
  /** 검은 띠에 흰 글씨로 들어가는 '해볼 것' 한 줄 */
  action: string;
  /** 왜 이 차가 어울리는지 — 성향과 차를 잇는 문장. 지금 디자인에는 자리가 없다. */
  note: string;
  /** 차종 */
  model: string;
  /** 고를 수 있는 색. label 은 패널용 약칭, name 은 카드에 적는 정식 명칭. */
  colours: { label: string; name: string; hex: string }[];
  /** 카드에 그릴 그림. 받기 전에는 비워 두면 자리만 잡힌다.
   *  glass 는 앞유리 마스크(흰 = 유리), box 는 그 안에서 얼굴이 놓일 자리다.
   *  차가 아닌 그림(동물 등)에는 유리가 없으므로 둘 다 없어도 된다 — 그때는
   *  카메라 합성만 건너뛰고 효과는 똑같이 걸린다. */
  front?: {
    src: string;
    /** 그림 대신 돌릴 반복 영상. 있으면 카드 아래에 전송 바가 생긴다.
     *  src 는 영상 첫 화면이 올 때까지 보여 줄 그림으로 남는다. */
    film?: string;
    glass?: string;
    box?: { x0: number; y0: number; x1: number; y1: number };
  };
}

/* TODO(기획): 8대로 채운다. 축↔차 연결은 '혼자/함께' 가 인승·공간에 바로 닿으므로
   그 축을 중심으로 잡는 것이 추천이 자의적으로 보이지 않는다. */
export const RESULTS: Result[] = [
  {
    /* TODO(기획): 문구 확정 전 임시. 8타입이 정해지면 전부 교체한다. */
    /* Figma 126:8775 */
    id: 'boom-boom',
    type: '쿵짝쿵짝',
    echo: 'Boom Boom!',
    tagline: '가보고 싶던 곳으로, 함께 한 걸음 더',
    action: '함께 가보고 싶은 여행지 한 곳씩 골라 하루 코스 만들기',
    note: 'TODO(기획): 왜 이 차가 어울리는지. 지금 카드에는 자리가 없다.',
    model: 'KIA PV5',
    /* 디자인이 쓰는 그림. 배경을 따내어 투명하게 둔 것이다.
       차 정면으로 되돌리려면 아래를 이렇게 바꾸면 된다:
         src: '/cars/pv5-front.png', glass: '/cars/pv5-front-glass.png',
         box: { x0: 0.147, y0: 0.059, x1: 0.869, y1: 0.362 },   // 마스크에서 잰 값 */
    front: { src: '/cars/sheep.png', film: '/cars/ship_loop_b.mp4' },
    /* TODO(기획): 기아 실제 컬러명·값으로 확인 필요 */
    colours: [
      { label: 'WHITE', name: 'Snow White Pearl', hex: '#F4F4F2' },
      { label: 'GREY', name: 'Gravity Grey', hex: '#6E7378' },
      { label: 'BLACK', name: 'Aurora Black Pearl', hex: '#15161A' },
    ],
  },
  {
    /* Figma 143:11065 (result_B) */
    id: 'flutter',
    type: '살랑살랑',
    echo: 'Flutter-Flutter',
    tagline: '가끔은 계획 없이, 나만의 시간으로.',
    action: '날씨 좋은 날, 마음이 내키면 30분 산책 나서기',
    note: 'TODO(기획): 왜 이 차가 어울리는지. 지금 카드에는 자리가 없다.',
    model: 'KIA PV5',
    front: { src: '/cars/sheep2.png', film: '/cars/ship_loop_c.mp4' },
    colours: [
      { label: 'WHITE', name: 'Snow White Pearl', hex: '#F4F4F2' },
      { label: 'GREY', name: 'Gravity Grey', hex: '#6E7378' },
      { label: 'BLACK', name: 'Aurora Black Pearl', hex: '#15161A' },
    ],
  },
];

/** 답변 → 결과. 축/타입 구조가 확정되면 여기만 바뀐다. */
export function resultFor(answers: Answers): Result {
  // TODO(기획): 3축 조합으로 8개 중 하나를 고른다. 지금은 한 대뿐이라 그대로 돌려준다.
  void answers;
  return RESULTS[0];
}

/** 답변을 일련번호로. 카드에 찍히고, 나중에 공유 링크의 열쇠가 된다. */
export function seedOf(answers: Answers): string {
  const bits = answers.map((a) => (a === null ? '-' : a)).join('');
  return `MN-${bits}`;
}
