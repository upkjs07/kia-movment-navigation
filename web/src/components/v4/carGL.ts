/**
 * 결과 카드의 그림 — 차 + 셀카를 '칸' 으로 다시 그린다.
 *
 * 레퍼런스(uxpilot ASCII Art Lab) 의 Photo art 를 보고 같은 뼈대로 새로 짰다. 코드를
 * 가져온 것이 아니라 동작을 보고 구현한 것이라, 구조는 우리 식이다 — 저쪽은 Canvas 2D
 * 로 칸마다 그리지만 여기서는 프래그먼트 셰이더 한 번에 끝낸다.
 *
 * 그림이 만들어지는 순서:
 *   1  바탕  — 원본을 흐리게 깐다. 손대지 않은 자리는 이 매끈한 그림이 보인다.
 *   2  칸    — 화면을 정사각형 칸으로 끊고, 칸 한가운데 색을 집어 블록이나 글자로 찍는다.
 *   3  잉크  — 밝기를 팔레트에 태운다. 원본이 거의 무채색이라 밝기만으로는 회색 덩어리가
 *              되는데, 여기서 색이 생긴다. 차체색을 따로 칠하던 것을 이 팔레트가 대신한다.
 *   4  마감  — 블룸·결·글리치.
 *
 * 다섯 손잡이(Bloom·Coverage·Dark cut-off·Grain·Glitch)는 전부 0‥1 로 들어온다.
 */

/** 고를 수 있는 두 가지 그리기 방식. 이름은 패널에 그대로 찍힌다. */
export const STYLES = ['BLOCK', 'GLYPHS'] as const;
export type StyleName = (typeof STYLES)[number];

/** 패널이 쥐고 있는 값. 전부 0‥1 이고, glyphs 만 둘 중 하나다. */
export interface Effect {
  glyphs: boolean;
  bloom: number;
  coverage: number;
  dark: number;
  grain: number;
  glitch: number;
  /** 색수차 — 빨강·파랑이 서로 반대로 벌어지는 정도 */
  chroma: number;
}

/* 디자인(Figma 126:8937)에 찍힌 눈금 그대로. */
export const DEFAULTS: Effect = {
  glyphs: false, bloom: 0.20, coverage: 0.50, dark: 0.60, grain: 0.30,
  glitch: 0, chroma: 0,
};

/** 칸 하나의 크기(CSS 픽셀). 653px 폭에서 가로로 23칸쯤 된다. */
const CELL = 28;

/* 찍어서 만드는 모자이크 구역. 레퍼런스(Brand Asset Generator)의 PIXELATE 처럼
   그림을 누른 자리에 굵은 모자이크가 얹힌다. 한 번에 들고 있을 수 있는 개수는
   셰이더의 배열 길이와 같아야 한다 — 넘으면 오래된 것부터 버린다. */
export const MAX_ZONES = 12;
/** 구역 반지름 (캔버스 가로 대비). 0.19 면 653px 에서 124px 쯤 된다. */
const ZONE_R = 0.19;
/** 구역 안의 칸 굵기 (바깥 칸 대비). 1 보다 작으면 더 잘다 — 바깥이 이미 굵은
    모자이크라, 구역도 굵게 하면 단색 네모 하나로 보인다. */
const ZONE_CELL = 0.85;

/* 레퍼런스의 Motion 값(speed 8% · amount 100%). 패널에 손잡이가 없으므로 상수다.
   움직이는 것은 '칸' 뿐이다 — 어느 칸이 블록이 되는지와 그 칸의 색이 천천히 바뀐다.
   결과 결·글리치는 일부러 정지시켜 둔다. 화면 전체가 지글거리면 카드가 시끄럽고,
   그건 앞서 한 번 빼기로 한 것이다. */
const SPEED = 0.08;
const AMOUNT = 1.00;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform sampler2D uCar;
uniform sampler2D uGlass;   // 앞유리 마스크 (흰 = 유리)
uniform sampler2D uCam;     // 셀카 영상
uniform sampler2D uGlyph;   // 글리프 아틀라스 (4x4)
uniform float uHasCam;      // 0 이면 카메라 없이 차만
uniform vec4  uGlassBox;    // 유리의 bbox (x0,y0,x1,y1) — 얼굴을 여기 맞춘다
uniform float uCamFit;      // 영상 비율 보정
uniform vec2  uRes;         // 캔버스 픽셀
uniform vec2  uFit;         // 이미지를 'contain' 으로 맞추기 위한 배율
uniform float uCell;        // 칸 하나의 화면 픽셀
uniform float uGlyphs;      // 0 = 블록, 1 = 글자
uniform float uBloom;
uniform float uCoverage;
uniform float uDark;
uniform float uGrain;
uniform float uGlitch;
uniform float uChroma;
uniform vec2  uLevels;    // 원본 밝기의 아래·위 끝
uniform vec3  uKey;       // 영상 배경색 — 이 색에서 멀수록 그림이다
uniform float uKeyOn;     // 1 이면 색으로 실루엣을 딴다(영상), 0 이면 알파를 쓴다
uniform vec3  uZones[12]; // 찍은 구역 (x, y, 반지름). 반지름 0 이면 빈 칸이다
uniform float uZoneCell;  // 구역 안의 칸이 바깥보다 몇 배 굵은지
uniform float uTime;      // 초
uniform float uMotion;    // 0‥1 — 움직임의 양 (amount)
uniform float uSpeed;     // 0‥1 — 빠르기 (speed)

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/* 네 귀퉁이를 보간한 잡음. 칸을 하나씩 흩뿌리지 않고 '구역' 으로 묶는 데 쓴다. */
float vnoise(vec2 q) {
  vec2 i = floor(q), f = fract(q);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/* 차 + 셀카를 합친 원본. 효과는 이 결과 위에 걸리므로 얼굴도 차와 같은 질감을 받는다.
   유리가 불투명한 렌더라, 마스크 안쪽을 영상으로 갈아 끼우고 유리색을 살짝 남겨
   '유리 너머' 로 보이게 한다. */
vec4 source(vec2 uv) {
  vec4 car = texture2D(uCar, uv);
  if (uKeyOn > 0.5) {
    /* 영상(H.264)에는 알파가 없다. 배경색에서 얼마나 떨어졌는지로 실루엣을 만든다 —
       정지 그림에서 scripts/cutout.py 가 한 번에 하던 일을 여기서 매 프레임 한다.
       두 문턱 사이를 부드럽게 넘겨야 경계가 톱니처럼 서지 않는다. */
    car.a = smoothstep(0.030, 0.105, distance(car.rgb, uKey));
  } else {
    /* 그림 텍스처는 알파가 미리 곱해져 있다. 그대로 밝기를 재면 반투명한 가장자리가
       '어두운 색' 으로 읽혀 팔레트의 맨 아래(보라)에 떨어지고, 실루엣 둘레에 보라
       테두리가 생긴다. 색을 풀어서 돌려주고 알파는 따로 들고 간다. */
    car.rgb /= max(car.a, 0.004);
  }
  if (uHasCam < 0.5) return car;

  float g = texture2D(uGlass, uv).a * car.a;
  if (g < 0.01) return car;

  /* 유리 bbox 안에서만 영상을 쓴다. 좌우를 뒤집어야 거울처럼 보인다. */
  vec2 b0 = uGlassBox.xy, b1 = uGlassBox.zw;
  vec2 t = (uv - b0) / max(b1 - b0, vec2(1e-4));
  t.x = 1.0 - t.x;
  t = (t - 0.5) * vec2(uCamFit, 1.0) + 0.5;         // 비율 보정
  vec4 cam = texture2D(uCam, clamp(t, 0.0, 1.0));

  vec3 seen = mix(cam.rgb, car.rgb, 0.22);          // 유리 색이 살짝 얹힌다
  return vec4(mix(car.rgb, seen, g), car.a);
}

/* 원본의 밝기 폭을 0‥1 로 편다. 차 사진은 어둡고 폭이 좁아서(이 PV5 는 중앙값
   0.19, 0.6 을 넘는 픽셀이 4%뿐) 그대로 쓰면 팔레트의 아래쪽에만 몰리고
   'Dark cut-off' 가 60% 에서 그림을 통째로 지운다. 폭은 그림마다 재서 넣는다. */
float tone(vec3 c) {
  return clamp((lum(c) - uLevels.x) / max(uLevels.y - uLevels.x, 0.04), 0.0, 1.0);
}

/* 색수차 — 채널을 오른쪽으로만 어긋낸다.
   처음에는 가운데 0, 바깥으로 갈수록 벌어지는 렌즈 수차로 만들었는데 레퍼런스와
   달랐다. 레퍼런스는 화면 전체가 같은 양으로, 한쪽(오른쪽)으로만 밀린다.

   채널을 집는 자리를 q - d 로 당기면 그 채널의 그림은 오른쪽으로 d 만큼 밀린다.
   빨강은 제자리, 초록은 d, 파랑은 2d — 그래서 경계에서 빨강·초록·파랑이 차례로
   오른쪽으로 번진다. 0 이면 어긋냄 자체를 건너뛰므로 샘플링도 한 번뿐이다. */
float caD() { return uChroma * 0.030; }

/* 어긋낸 자리가 그림 바깥이면 그 채널만 0 이 되어 순수한 빨강이나 남색이 튄다 —
   팔레트에 없는 색이라 혼자 튀어 보인다. 그림이 없는 쪽에서는 제자리 색으로
   되돌려, 어긋남이 '색이 밀린 것' 으로만 보이고 새 색을 만들지 않게 한다. */
vec4 splitSource(vec2 q) {
  vec4 b0 = source(q);
  if (uChroma < 0.002) return b0;
  float d = caD();
  vec4 sg = source(q - vec2(d, 0.0));
  vec4 sb = source(q - vec2(d * 2.0, 0.0));
  /* 알파는 늘리지 않는다. 밖으로 늘리면 그 자리에 빨강이 없는 채로 파랑만 남아
     남색 테두리가 생긴다 — 어긋남은 그림 안에서만 일어나야 한다. */
  return vec4(b0.r, mix(b0.g, sg.g, sg.a), mix(b0.b, sb.b, sb.a), b0.a);
}

/* 블룸 — 밝은 자리의 빛이 둘레로 번진다.
   처음에는 밝은 픽셀을 그 자리에서 더 밝게 만들었는데, 조금만 올려도 흰색으로
   날아갔다(화이트홀). 밝은 면이 넓으면 그 면 전체가 한꺼번에 타기 때문이다.
   문턱을 높게 두어 '거의 흰 자리' 만 뽑고, 그것을 넓게 퍼뜨려서 더한다 —
   그러면 밝은 덩어리의 둘레가 물들고 가운데는 타지 않는다.
   색은 그 자리의 색을 쓴다. 흰빛을 더하면 채도가 빠진다. */
vec3 bloomTap(vec2 q) {
  vec4 s = source(q);
  /* 문턱은 '잰 밝기 폭'(tone) 이 아니라 실제 밝기로 본다. 폭으로 재면 어떤 그림이든
     위쪽 몇 %가 늘 '거의 흰 것' 으로 계산돼서, 밝은 데가 거의 없는 그림에도 똑같이
     빛이 번진다 — PV5 는 0.8 을 넘는 픽셀이 0.4% 뿐인데 폭으로 재면 14% 였다.
     실제 밝기로 보면 밝은 그림만 번지고 어두운 그림은 가만히 있는다. */
  return s.rgb * smoothstep(0.70, 0.94, lum(s.rgb)) * s.a;
}

vec3 bloomAt(vec2 q) {
  float r = 22.0 / min(uRes.x, uRes.y) / max(min(uFit.x, uFit.y), 0.05);
  float d = r * 0.7;
  vec3 sum = bloomTap(q + vec2(r, 0.0)) + bloomTap(q - vec2(r, 0.0))
           + bloomTap(q + vec2(0.0, r)) + bloomTap(q - vec2(0.0, r))
           + bloomTap(q + vec2(d, d))   + bloomTap(q - vec2(d, d))
           + bloomTap(q + vec2(d, -d))  + bloomTap(q - vec2(d, -d));
  return sum * 0.125;
}

/* 자리에 따른 색. 레퍼런스를 다시 보면 색이 밝기를 따라가지 않는다 — 같은 밝기인
   양의 머리와 다리가 각각 주황과 민트다. 밝기를 팔레트에 태우면 열화상 사진이
   되고(실제로 한 번 그렇게 나왔다), 자리에 색을 두고 밝기는 명암으로만 쓰면
   사진으로 남는다.

   덩어리 다섯 개를 가우시안으로 섞는다. 가중치를 합으로 나누므로 결과는 늘 다섯
   색이 만드는 껍질 안에 있다 — 섞다가 탁한 회색으로 빠지지 않는다. 색은 Q4
   모래시계와 같은 식구라 두 화면이 한 캠페인으로 읽힌다. */
float blob(vec2 q, vec2 at, float k) { vec2 d = q - at; return exp(-dot(d, d) * k); }

/* 덩어리를 넓게 두면 한 점에서 다섯 색이 고르게 섞이는데, sRGB 에서의 평균은
   회색 쪽으로 끌려가 전체가 탁해진다(실제로 한 번 그렇게 나왔다). 폭을 좁혀
   가까운 하나가 20배쯤 이기게 두면, 색은 선명하고 경계만 부드럽다. */
vec3 field(vec2 q) {
  float a = blob(q, vec2(0.22, 0.14), 12.0);
  float b = blob(q, vec2(0.76, 0.18), 12.0);
  float c = blob(q, vec2(0.14, 0.76), 12.0);
  float d = blob(q, vec2(0.84, 0.80), 12.0);
  float e = blob(q, vec2(0.50, 0.50),  9.0);
  vec3 s = vec3(1.000, 0.231, 0.094) * a        // 주홍
         + vec3(0.961, 0.196, 0.604) * b        // 핑크
         + vec3(0.561, 0.910, 0.863) * c        // 민트
         + vec3(0.706, 0.498, 0.878) * d        // 보라
         + vec3(1.000, 0.541, 0.200) * e;       // 주황
  return s / max(a + b + c + d + e, 1e-3);
}

/* 원본에 색이 얼마나 있는지. 차 사진은 거의 무채색(0 에 가깝다)이라 위의 field 가
   색을 전부 정해야 하지만, 이미 색이 칠해진 그림이라면 그 색을 빼앗으면 안 된다.
   그래서 '원본 색이 있으면 그대로, 없으면 field' 로 자동으로 갈린다. */
float chroma(vec3 c) {
  float mx = max(max(c.r, c.g), c.b);
  float mn = min(min(c.r, c.g), c.b);
  return mx <= 0.004 ? 0.0 : (mx - mn) / mx;
}

/* 자리에서 고른 색에 주체의 명암을 입힌다. 어두운 쪽은 가라앉히고 밝은 쪽은
   크림으로 띄운다. 색상은 그대로라 형태가 읽히면서도 색이 날아가지 않는다. */
vec3 shade(vec3 f, float t) {
  t = clamp(t, 0.0, 1.0);
  /* 가운데 밝기에서 색이 가장 진하다. 어두운 쪽으로는 눌러서 가라앉히고 밝은 쪽으로만
     크림을 섞는다 — 양끝에서 바로 크림으로 가면 채도가 통째로 빠진다. */
  /* 바닥을 너무 낮추면 어두운 면(범퍼·타이어)이 때 낀 회색으로 남는다. 카드 바탕이
     밝은 회색이라 더 그렇게 보인다 — 색을 살려 둔 채로만 가라앉힌다. */
  vec3 lo = mix(f * 0.46, f, smoothstep(0.0, 0.52, t));
  return mix(lo, mix(f, vec3(1.0, 0.97, 0.92), 0.55), smoothstep(0.52, 1.0, t));
}

/* 아틀라스에서 idx 번 표식을 꺼내, 칸 안 좌표 f 에서의 잉크 양을 돌려준다. */
float markInk(float idx, vec2 f) {
  vec2 gi = vec2(mod(idx, 4.0), floor(idx * 0.25));
  return texture2D(uGlyph, (gi + clamp(f, 0.0, 1.0)) * 0.25).a;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;                       // 이미지는 위에서부터다

  /* 글리치 — 가로 띠가 통째로 옆으로 밀린다. 시간을 넣지 않아 정지해 있다:
     이것은 '효과' 지 '애니메이션' 이 아니고, 움직이면 카드가 시끄러워진다. */
  float band = floor(uv.y * 54.0);
  float hit = step(1.0 - uGlitch * 0.6, hash2(vec2(band, 4.1)));
  uv.x += (hash2(vec2(band, 9.7)) - 0.5) * uGlitch * 0.16 * hit;

  vec2 p = (uv - 0.5) / uFit + 0.5;        // contain 맞춤

  /* ── 1. 바탕 ─────────────────────────────────────────────────────────
     원본 그대로다. 손잡이를 전부 0 으로 두면 이 그림이 그대로 나와야 한다.
     전에는 여기서 흐리게 깔고 팔레트로 물들였는데, 그러면 0 에서도 사진에
     필터를 씌운 것처럼 보였다 — 색을 입히는 일은 아래의 칸이 맡는다. */
  vec4 bg = splitSource(p);
  float bt = tone(bg.rgb);
  vec3 col = bg.rgb;
  float a = bg.a;

  /* ── 2. 칸 ─────────────────────────────────────────────────────────── */
  /* 칸은 화면 기준으로 끊는다 — 이미지 기준으로 하면 contain 배율에 따라
     직사각형으로 찌그러진다. */
  vec2 g = max(uRes / max(uCell, 4.0), vec2(1.0));
  vec2 cid = floor(uv * g);
  vec2 f = fract(uv * g);
  vec4 c = splitSource((((cid + 0.5) / g) - 0.5) / uFit + 0.5);
  float ct = tone(c.rgb);

  /* 어느 칸을 찍을지. 칸마다 동전을 던지면 소금 뿌린 것처럼 흩어진다 — 레퍼런스는
     덩어리째 블록이고 나머지는 매끈하다. 그래서 낮은 주파수 잡음으로 구역을 만들고
     거기에 문턱을 건다. 칸 단위 난수를 조금 섞어 경계를 계단처럼 들쭉날쭉하게 둔다. */
  /* 천천히 흐른다. 구역은 미끄러지듯 옮겨 가고, 칸 하나하나는 제 차례가 되었을 때
     툭 바뀐다 — 모두 같은 순간에 바뀌면 화면이 한 번씩 번쩍인다. 차례를 칸마다
     다르게 주려고 위상 ph 를 더해 둔다. */
  float tt = uTime * uSpeed * 1.2;
  vec2 drift = vec2(tt * 0.55, tt * 0.31) * uMotion;
  float ph = hash2(cid + 2.9);
  float turn = floor(tt * 6.0 + ph) * uMotion;

  /* 이름이 같으면 아래 field() 함수가 가려진다 — 구역이라는 뜻으로 zone 을 쓴다. */
  float zone = vnoise(cid / 5.5 + drift) * 0.74 + hash2(cid + 11.3 + turn) * 0.26;
  float on = step(1.0 - uCoverage, zone);

  /* 어두운 칸은 아예 빼 버린다. 이 한 손잡이가 형태를 살린다 — 전부 찍으면
     덩어리가 되고, 어두운 쪽을 버리면 밝은 면만 남아 윤곽이 읽힌다. */
  float lit = smoothstep(uDark - 0.05, uDark + 0.05, ct);

  float m = on * lit * step(0.08, c.a);

  /* 칸마다 색을 집는 자리를 흔든다. 바탕과 똑같은 자리에서 집으면 칸이 배경에
     묻혀 안 보인다 — 조금 떨어진 곳의 색을 가져와야 칸이 색으로도 구분된다. */
  vec2 jit = (vec2(hash2(cid + 3.7 + turn), hash2(cid + 8.1 + turn)) - 0.5) * 0.55;
  /* 색이 있는 그림에서는 칸이 제 색 그대로 '납작해지는' 것이 효과다 — 칸 한가운데
     색으로 사각형을 메우므로, 색을 바꾸지 않아도 매끈한 바탕과 또렷이 갈린다. */
  float ck = smoothstep(0.14, 0.42, chroma(c.rgb));
  vec3 cellCol = mix(shade(field(uv + jit), ct), c.rgb, ck);

  col = mix(col, cellCol, m);
  a = max(a, c.a * m);

  /* ── 2b. 표식 — GLYPHS 에서만 ──────────────────────────────────────────
     레퍼런스를 보면 글자가 그림을 '대신' 하지 않는다. 블록 모자이크는 그대로 있고
     그 위에 +, |, /, 마름모, 점무늬가 흩뿌려진다. 그래서 여기서는 칸을 바꾸지 않고
     한 겹을 더 얹는다 — 둘은 격자도 다르다(표식이 더 촘촘하다). */
  if (uGlyphs > 0.5) {
    vec2 mg = g * 1.45;
    vec2 mid = floor(uv * mg);
    vec2 mf = fract(uv * mg);
    /* 가끔 두 칸짜리 큰 표식을 섞는다 — 레퍼런스의 크고 작은 섞임이 여기서 나온다. */
    if (hash2(mid + 43.7) > 0.70) { mid = floor(uv * mg * 0.5) * 2.0; mf = fract(uv * mg * 0.5); }

    vec4 mc4 = splitSource((((mid + 0.5) / mg) - 0.5) / uFit + 0.5);
    float mt = tone(mc4.rgb);
    float mturn = floor(tt * 6.0 + hash2(mid + 6.1)) * uMotion;

    float ink = markInk(floor(hash2(mid + 31.1 + mturn) * 16.0), mf);
    /* 표식도 Coverage 를 따른다. 블록보다 촘촘하게 떨어진다 — 레퍼런스는 표식이
       그림을 거의 덮을 만큼 빽빽하다. */
    float mon = step(1.0 - clamp(uCoverage * 1.35, 0.0, 1.0), hash2(mid + 5.9 + mturn));
    /* 어두운 쪽을 버리는 기준은 블록보다 너그럽다 — 그래야 중간톤에도 표식이 남는다. */
    float mlit = smoothstep(uDark - 0.50, uDark - 0.05, mt);

    /* 색 — 제 색 그대로인 것, 흰 것, 짙은 것을 섞는다. 레퍼런스에 세 가지가 다 있다. */
    float v = hash2(mid + 77.3);
    vec3 base = mc4.rgb;
    vec3 mcol = v < 0.20 ? base * 0.40
              : v < 0.58 ? mix(base, vec3(1.0), 0.80)
              : mix(base, shade(field(uv), 0.7), 0.5);

    float mm = ink * mon * mlit * step(0.08, mc4.a);
    col = mix(col, mcol, mm);
    a = max(a, mc4.a * mm);
  }

  /* ── 2c. 찍은 모자이크 구역 ───────────────────────────────────────────
     레퍼런스(Brand Asset Generator)의 PIXELATE 와 같은 것이다. Coverage 가 정하는
     구역은 잡음이 고르고, 이것은 사람이 '여기' 라고 짚은 자리다 — 그래서 손잡이와
     따로 움직이고, 어두운 칸을 버리는 규칙도 적용하지 않는다. 짚은 자리는 보이는
     것이 당연하기 때문이다.

     배열을 끝까지 도는 것은 WebGL1 의 반복문 제약 때문이다. 빈 칸은 반지름 0 으로
     두고 가중치를 0 으로 눌러서 건너뛴다. */
  vec2 asp = vec2(1.0, uRes.y / uRes.x);     // 화면이 정사각형이 아니어도 원이 되게
  vec2 gz = max(uRes / max(uCell * uZoneCell, 6.0), vec2(1.0));
  vec2 zc = floor(uv * gz);
  /* 구역 안인지 아닌지를 '픽셀' 이 아니라 '블록 한가운데' 로 따진다. 픽셀마다 따지면
     구역 가장자리가 부드럽게 흐려져서 모자이크가 아니라 얼룩으로 보인다 — 블록째
     켜고 끄면 레퍼런스처럼 가장자리까지 각이 산다. */
  vec2 zmid = (zc + 0.5) / gz;
  float pz = 0.0;
  for (int i = 0; i < 12; i++) {
    vec3 z = uZones[i];
    pz = max(pz, step(1e-3, z.z) * step(distance(zmid * asp, z.xy * asp), z.z));
  }
  if (pz > 0.5) {
    vec4 zs = splitSource(((zmid - 0.5) / uFit) + 0.5);
    float zt = tone(zs.rgb);
    float zk = smoothstep(0.14, 0.42, chroma(zs.rgb));
    vec3 zcol = mix(shade(field(uv), zt), zs.rgb, zk);
    float zm = step(0.08, zs.a);
    col = mix(col, zcol, zm);
    a = max(a, zs.a * zm);
  }

  /* ── 3. 마감 ───────────────────────────────────────────────────────── */
  /* 더하기로 얹으면 이미 밝은 면이 금세 1 을 넘어 흰 구멍이 뚫린다. 스크린으로
     얹으면 1 에 점근하므로, 세게 올려도 빛만 늘고 형태가 남는다. */
  vec3 bl = clamp(bloomAt(p) * uBloom * 3.0, 0.0, 1.0);
  /* lit 은 위의 Dark cut-off 가 이미 쓰고 있다 — 다른 이름을 쓴다. */
  vec3 screened = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - bl);
  /* 실루엣 밖으로 번지는 빛. 기준은 바탕의 알파가 아니라 '여기까지 그려진 양'(a)
     이어야 한다 — 바탕이 비어 있어도 칸이 놓인 자리가 있고, 바탕으로만 재면 그 칸이
     검게 뚫린다.
     색을 bl 로 두고 알파도 bl 의 밝기로 뒀더니, 마지막에 알파를 한 번 더 곱하므로
     둘이 같이 어두워져 옅은 회색이 깔렸다 — 윤곽을 따라 연필로 그린 선처럼 보인
     것이 이것이다. 밝기는 알파가 맡고 색은 제 색조만 쓰도록 나눈다. */
  float glow = lum(bl);
  vec3 halo = glow > 0.002 ? clamp(bl / glow * 0.85, 0.0, 1.0) : vec3(0.0);
  col = mix(halo, screened, clamp(a * 4.0, 0.0, 1.0));
  /* 글자 모드에서는 바탕을 걷어냈으므로 번짐도 같이 걷는다 — 안 그러면 글자만
     남아야 할 자리에 빛 얼룩이 남는다. */
  a = max(a, min(glow * 1.2, 0.85));

  /* 결 — 고운 잡티. 좌표로만 뽑아 정지시킨다. */
  float gr = hash2(floor(gl_FragCoord.xy * 0.5)) - 0.5;
  col *= 1.0 + gr * uGrain * 0.42;
  col += gr * uGrain * 0.05;

  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) a = 0.0;
  a = clamp(a, 0.0, 1.0);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * a, a);   // 미리 곱해 둔 알파
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
  }
  return sh;
}

/** 표식 16개를 4×4 로 구운 그림. 흰 표식 + 투명 배경이라 알파만 읽으면 된다.
 *
 *  ASCII 글자가 아니다 — 레퍼런스의 GLYPHS 는 +, |, /, 마름모, 점무늬 같은 기하
 *  표식으로 덮여 있고, 그 아래 블록 모자이크가 그대로 보인다. 밝기 순서로 고르지
 *  않고 칸마다 무작위로 고르므로 순서에 뜻은 없다. 빈 칸(0번)을 하나 두어 표식이
 *  성기게 떨어지게 한다. */
function glyphAtlas(): HTMLCanvasElement {
  const S = 64, N = 4;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S * N;
  const g = cv.getContext('2d')!;
  g.strokeStyle = '#fff';
  g.fillStyle = '#fff';
  g.lineCap = 'butt';
  const h = S / 2;

  /** i 번 칸에 그린다. 좌표는 칸 안에서 0‥S 로 쓴다. */
  const cell = (i: number, fn: () => void) => {
    g.save();
    g.translate((i % N) * S, Math.floor(i / N) * S);
    fn();
    g.restore();
  };
  const line = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  };
  const plus = (len: number, w: number) => {
    line(h - len / 2, h, h + len / 2, h, w);
    line(h, h - len / 2, h, h + len / 2, w);
  };
  const diamond = (r: number, fill: boolean) => {
    g.lineWidth = 5; g.beginPath();
    g.moveTo(h, h - r); g.lineTo(h + r, h); g.lineTo(h, h + r); g.lineTo(h - r, h);
    g.closePath();
    if (fill) g.fill(); else g.stroke();
  };
  /* 점무늬 — 레퍼런스에서 칸 하나가 통째로 망점으로 차 있는 것들이다 */
  const stipple = (step: number, d: number) => {
    for (let y = step / 2; y < S; y += step) {
      for (let x = step / 2; x < S; x += step) g.fillRect(x - d / 2, y - d / 2, d, d);
    }
  };

  cell(0, () => {});                                   // 빈 칸
  cell(1, () => g.fillRect(h - 5, h - 5, 10, 10));     // 점
  cell(2, () => plus(26, 6));
  cell(3, () => plus(54, 7));
  cell(4, () => line(h, h - 15, h, h + 15, 6));        // 짧은 세로
  cell(5, () => line(h, 4, h, S - 4, 6));              // 긴 세로
  cell(6, () => line(10, S - 10, S - 10, 10, 6));      // /
  cell(7, () => line(10, 10, S - 10, S - 10, 6));      // \
  cell(8, () => diamond(16, false));
  cell(9, () => diamond(14, true));
  cell(10, () => stipple(10, 4));
  cell(11, () => { line(12, h - 8, S - 12, h - 8, 5); line(12, h + 8, S - 12, h + 8, 5); });
  cell(12, () => { line(14, 14, S - 14, S - 14, 6); line(S - 14, 14, 14, S - 14, 6); });
  cell(13, () => { g.lineWidth = 5; g.strokeRect(h - 13, h - 13, 26, 26); });
  cell(14, () => { for (let k = -1; k <= 1; k++) g.fillRect(h - 3 + k * 14, h - 3, 6, 6); });
  cell(15, () => line(10, h, S - 10, h, 6));           // 가로

  return cv;
}

/* 그림의 밝기 폭(아래·위 끝)을 잰다. 셰이더가 이 폭으로 0‥1 을 펴야
   Dark cut-off 눈금이 그림마다 같은 뜻이 된다. 한 번만 돌고, 작게 줄여서
   재므로 비용은 무시할 만하다. */
function levels(im: HTMLImageElement): [number, number] {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d', { willReadFrequently: true });
  if (!g) return [0, 1];
  g.drawImage(im, 0, 0, S, S);
  let d: Uint8ClampedArray;
  try { d = g.getImageData(0, 0, S, S).data; } catch { return [0, 1]; }
  const v: number[] = [];
  for (let i = 0; i < d.length; i += 4) {
    /* 투명한 바깥은 빼고 그림이 있는 자리만 센다 */
    if (d[i + 3] > 128) v.push((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255);
  }
  if (v.length < 64) return [0, 1];
  v.sort((a, b) => a - b);
  /* 양 끝 4%는 버린다 — 하이라이트 한 점이 폭을 통째로 늘리는 것을 막는다 */
  const at = (q: number) => v[Math.min(v.length - 1, Math.floor(v.length * q))];
  const lo = at(0.04), hi = at(0.96);
  return hi - lo < 0.08 ? [lo, lo + 0.08] : [lo, hi];
}

/* 영상 첫 화면에서 배경색과 밝기 폭을 잰다. 배경색은 네 귀퉁이의 중앙값으로 잡는다 —
   한 점만 보면 압축 잡티에 흔들린다. 밝기 폭은 배경을 뺀 자리에서만 센다. */
function filmProbe(v: HTMLVideoElement):
  { key: [number, number, number]; lo: number; hi: number } | null {
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d', { willReadFrequently: true });
  if (!g) return null;
  try { g.drawImage(v, 0, 0, S, S); } catch { return null; }
  let d: Uint8ClampedArray;
  try { d = g.getImageData(0, 0, S, S).data; } catch { return null; }

  const at = (x: number, y: number) => {
    const i = (y * S + x) * 4;
    return [d[i] / 255, d[i + 1] / 255, d[i + 2] / 255] as const;
  };
  const corners = [at(1, 1), at(S - 2, 1), at(1, S - 2), at(S - 2, S - 2)];
  const key: [number, number, number] = [0, 1, 2].map((c) => {
    const v3 = corners.map((p) => p[c]).sort((a, b) => a - b);
    return (v3[1] + v3[2]) / 2;
  }) as [number, number, number];

  const lum: number[] = [];
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
    const dist = Math.hypot(r - key[0], gg - key[1], b - key[2]);
    if (dist > 0.105) lum.push(0.2126 * r + 0.7152 * gg + 0.0722 * b);
  }
  if (lum.length < 64) return { key, lo: 0, hi: 1 };
  lum.sort((a, b) => a - b);
  const q = (t: number) => lum[Math.min(lum.length - 1, Math.floor(lum.length * t))];
  const lo = q(0.04), hi = q(0.96);
  return { key, lo, hi: hi - lo < 0.08 ? lo + 0.08 : hi };
}

export interface CarGL {
  resize(w: number, h: number, dpr: number): void;
  /** 매 프레임 영상을 올린다. null 이면 카메라 없이 차만 그린다. */
  setVideo(v: HTMLVideoElement | null): void;
  /** time 은 초. 칸이 천천히 바뀌는 데만 쓴다. */
  draw(e: Effect, time: number): void;
  /** 찍은 구역. 캔버스 기준 0‥1 좌표다(위에서부터). */
  setZones(zs: { x: number; y: number }[]): void;
  /** 그림 자리에 영상을 쓸 때, 매 프레임 지금 화면을 올린다. */
  setFilm(v: HTMLVideoElement | null): void;
  destroy(): void;
}

/** 앞유리 마스크 안에서 얼굴이 놓일 자리 (이미지 기준 0‥1). 마스크에서 잰 값. */
export interface GlassBox { x0: number; y0: number; x1: number; y1: number }

/** 실패하면 null — 호출하는 쪽이 그냥 <img> 로 되돌아갈 수 있게. */
export function createCarGL(
  canvas: HTMLCanvasElement,
  src: string,
  glassSrc?: string,
  glassBox?: GlassBox,
): CarGL | null {
  const ctx = canvas.getContext('webgl',
    { antialias: false, premultipliedAlpha: true }) as WebGLRenderingContext | null;
  if (!ctx) return null;
  /* 아래 클로저(fit, onload)들이 나중에 불리므로, 좁힌 타입을 이름에 담아 둔다. */
  const gl = ctx;

  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link failed');
  } catch { return null; }
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const params = () => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  function blank(unit: number) {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]));
    params();
    return t;
  }

  const tex = blank(0);
  const glassTex = blank(1);
  const camTex = blank(2);

  /* 글리프는 한 번 구워 두면 끝이다 — 그림이나 손잡이가 바뀌어도 그대로 쓴다. */
  const glyphTex = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + 3);
  gl.bindTexture(gl.TEXTURE_2D, glyphTex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, glyphAtlas());
  params();

  gl.uniform1i(gl.getUniformLocation(prog, 'uCar'), 0);
  gl.uniform1i(gl.getUniformLocation(prog, 'uGlass'), 1);
  gl.uniform1i(gl.getUniformLocation(prog, 'uCam'), 2);
  gl.uniform1i(gl.getUniformLocation(prog, 'uGlyph'), 3);

  const uHasCam = gl.getUniformLocation(prog, 'uHasCam');
  const uCamFit = gl.getUniformLocation(prog, 'uCamFit');
  gl.uniform1f(uHasCam, 0);
  gl.uniform1f(uCamFit, 1);
  const gb = glassBox ?? { x0: 0.15, y0: 0.06, x1: 0.87, y1: 0.36 };
  gl.uniform4f(gl.getUniformLocation(prog, 'uGlassBox'), gb.x0, gb.y0, gb.x1, gb.y1);

  if (glassSrc) {
    const gi = new Image();
    gi.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + 1);
      gl.bindTexture(gl.TEXTURE_2D, glassTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gi);
      params();
    };
    gi.src = glassSrc;
  }

  let imgW = 1, imgH = 1;
  const img = new Image();
  img.onload = () => {
    imgW = img.naturalWidth; imgH = img.naturalHeight;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    params();
    const [lo, hi] = levels(img);
    gl.uniform2f(uLevels, lo, hi);
    fit();
  };
  img.src = src;

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uFit = gl.getUniformLocation(prog, 'uFit');
  const uCell = gl.getUniformLocation(prog, 'uCell');
  const uGlyphs = gl.getUniformLocation(prog, 'uGlyphs');
  const uBloom = gl.getUniformLocation(prog, 'uBloom');
  const uCoverage = gl.getUniformLocation(prog, 'uCoverage');
  const uDark = gl.getUniformLocation(prog, 'uDark');
  const uGrain = gl.getUniformLocation(prog, 'uGrain');
  const uGlitch = gl.getUniformLocation(prog, 'uGlitch');
  const uChroma = gl.getUniformLocation(prog, 'uChroma');
  const uLevels = gl.getUniformLocation(prog, 'uLevels');
  gl.uniform2f(uLevels, 0, 1);
  const uKey = gl.getUniformLocation(prog, 'uKey');
  const uKeyOn = gl.getUniformLocation(prog, 'uKeyOn');
  gl.uniform3f(uKey, 0.875, 0.875, 0.875);
  gl.uniform1f(uKeyOn, 0);
  const uZones = gl.getUniformLocation(prog, 'uZones[0]');
  const zoneBuf = new Float32Array(MAX_ZONES * 3);
  gl.uniform3fv(uZones, zoneBuf);
  gl.uniform1f(gl.getUniformLocation(prog, 'uZoneCell'), ZONE_CELL);
  const uTime = gl.getUniformLocation(prog, 'uTime');
  gl.uniform1f(gl.getUniformLocation(prog, 'uMotion'), AMOUNT);
  gl.uniform1f(gl.getUniformLocation(prog, 'uSpeed'), SPEED);

  let cw = 1, ch = 1, scale = 1;
  /** 이미지를 잘리지 않게(contain) 넣기 위한 배율 */
  function fit() {
    const ca = cw / ch, ia = imgW / imgH;
    gl.uniform2f(uFit, ia > ca ? 1 : ia / ca, ia > ca ? ca / ia : 1);
  }

  return {
    resize(w, h, dpr) {
      cw = Math.max(1, Math.round(w * dpr));
      ch = Math.max(1, Math.round(h * dpr));
      scale = dpr;
      canvas.width = cw; canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
      gl.uniform2f(uRes, cw, ch);
      fit();
    },
    setVideo(v) {
      if (!v || v.readyState < 2 || !v.videoWidth) { gl.uniform1f(uHasCam, 0); return; }
      gl.activeTexture(gl.TEXTURE0 + 2);
      gl.bindTexture(gl.TEXTURE_2D, camTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      params();
      /* 유리 칸의 비율에 맞춰 영상을 'cover' 로 넣는다 — 얼굴이 찌그러지지 않게. */
      const boxAR = ((gb.x1 - gb.x0) * imgW) / Math.max((gb.y1 - gb.y0) * imgH, 1);
      gl.uniform1f(uCamFit, (v.videoWidth / v.videoHeight) / boxAR);
      gl.uniform1f(uHasCam, 1);
    },
    setFilm(v) {
      if (!v || v.readyState < 2 || !v.videoWidth) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
      params();
      if (imgW !== v.videoWidth || imgH !== v.videoHeight) {
        imgW = v.videoWidth; imgH = v.videoHeight;
        fit();
        /* 배경색과 밝기 폭은 첫 화면에서 한 번만 잰다. 매 프레임 재면 장면이 바뀔
           때마다 색이 출렁인다. */
        const m = filmProbe(v);
        if (m) {
          gl.uniform3f(uKey, m.key[0], m.key[1], m.key[2]);
          gl.uniform2f(uLevels, m.lo, m.hi);
          gl.uniform1f(uKeyOn, 1);
        }
      }
    },
    setZones(zs) {
      zoneBuf.fill(0);
      for (let i = 0; i < Math.min(zs.length, MAX_ZONES); i++) {
        zoneBuf[i * 3] = zs[i].x;
        zoneBuf[i * 3 + 1] = zs[i].y;
        zoneBuf[i * 3 + 2] = ZONE_R;
      }
      gl.uniform3fv(uZones, zoneBuf);
    },
    draw(e, time) {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uCell, CELL * scale);
      gl.uniform1f(uGlyphs, e.glyphs ? 1 : 0);
      gl.uniform1f(uBloom, e.bloom);
      gl.uniform1f(uCoverage, e.coverage);
      gl.uniform1f(uDark, e.dark);
      gl.uniform1f(uGrain, e.grain);
      gl.uniform1f(uGlitch, e.glitch);
      gl.uniform1f(uChroma, e.chroma);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteTexture(tex); gl.deleteTexture(glassTex); gl.deleteTexture(camTex);
      gl.deleteTexture(glyphTex); gl.deleteBuffer(buf); gl.deleteProgram(prog);
    },
  };
}
