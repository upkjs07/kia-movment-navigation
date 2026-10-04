/**
 * 질문 배경의 설정 타입.
 *
 * 그리는 일은 fieldGL.ts(WebGL)이 맡는다. 여기엔 모양·색 정의만 둔다.
 *
 * 모래시계는 한때 구운 PNG 두 장(색표·실루엣)을 읽었다. 표를 화면 크기로 늘리면
 * 몇 픽셀마다 보간 이음매가 생기고, 무엇보다 색을 움직이려면 표를 옆으로 밀어야
 * 하는데 끝에 닿으면 값이 붙박여 잎 바깥이 통째로 단색 띠가 됐다. 지금은 실루엣도
 * 색도 수식이라 늘려도 뭉개지지 않고, 색을 움직이는 건 덩어리 중심을 옮기는 일이라
 * 붙박일 자리가 없다.
 */

export type Shape = 'bloom' | 'capsule' | 'hourglass' | 'video';
export type RGB = [number, number, number];

/** 모래시계 한 벌의 생김새. scripts/bake-field.py 가 레퍼런스에서 맞춘다. */
export interface FieldShape {
  /** [왼쪽 잎, 오른쪽 잎] 실루엣 다항식. 높은 차수부터 12칸. */
  profile: [number[], number[]];
  /** 색 덩어리. 각 항목은 [u, v, ru, rv, r, g, b].
   *  u 는 부호가 있다 — -1 왼쪽 끝 ‥ 0 허리 ‥ +1 오른쪽 끝. 잎마다 따로 두지 않는
   *  이유는 허리에서 색이 하나로 정해지게 하려는 것이다. */
  blobs: number[][];
}

/** 캡슐(Q2). 가로로 긴 심지에서 바깥으로 퍼지는 고리 7단계 — 안에서 바깥 순서. */
export interface CapsuleShape {
  rings: [string, string, string, string, string, string, string];
  /** 끌 때 앞쪽 캡에 올라오는 색. 가만히 있으면 쓰이지 않는다. */
  lead: string;
}

export interface FieldConfig {
  shape: Shape;
  /** bloom 전용. 바깥 → 안쪽 순서. */
  bands?: RGB[][];
  /** hourglass 전용 */
  field?: FieldShape;
  /** capsule 전용 */
  capsule?: CapsuleShape;
  /** video 전용 */
  src?: string;
}

export const hex = (s: string): RGB =>
  [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];

/* ── OKLab ────────────────────────────────────────────────────────────────────
   셰이더가 색을 OKLab 으로 받는다. sRGB 로 섞으면 중간이 회색 쪽으로 끌려 탁해진다. */

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** '#RRGGBB' → OKLab [L, a, b] */
export function hexToOklab(hex: string): RGB {
  const r = toLinear(parseInt(hex.slice(1, 3), 16) / 255);
  const g = toLinear(parseInt(hex.slice(3, 5), 16) / 255);
  const b = toLinear(parseInt(hex.slice(5, 7), 16) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
