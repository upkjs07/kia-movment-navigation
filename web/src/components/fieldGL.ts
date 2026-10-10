/**
 * 질문 배경을 WebGL 로 그린다.
 *
 * Canvas 2D 로는 '픽셀마다 다른 값'을 줄 수 없어서, 색이 가로·세로 양쪽으로
 * 변하는 것도 축을 따라 흐림이 달라지는 것도 전부 버퍼를 겹치고 띠를 나눠
 * 흉내 내야 했다. 그 띠 경계가 세로 접힌 자국으로 남았다.
 * 프래그먼트 셰이더에서는 이 전부가 좌표의 함수 한 줄이다.
 *
 * 모래시계(Q4)는 색을 손으로 찍지 않는다. 레퍼런스 이미지를 실측해 구운 표
 * 두 장을 읽는다 — 잎을 (허리→끝, 중심선→테두리) 좌표로 편 색표와, 열마다의
 * 실루엣 반높이. 이 둘만으로 원본을 되짚어 그리면 평균 오차가 1.1/255 다.
 */

import { hexToOklab, type FieldConfig, type RGB } from './SpectralField';

/** 색 덩어리 수 — 맞춘 20 + 오른쪽 잎 쐐기 4 */
const NB = 24;

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uValue;      // -1 ‥ +1, 드래그
uniform float uShape;      // 0 = bloom, 1 = capsule, 2 = hourglass
uniform vec3  uCap[7];     // 캡슐 고리색 — 안에서 바깥 순서 (OKLab)
uniform vec3  uLead;       // 끌 때 앞쪽 캡에 올라오는 색 (OKLab)

/* 배경색(선형 sRGB). 가장자리는 검정이 아니라 이 색으로 사그라들어야 한다 —
   검정으로 빼면 밝은 배경에서 검은 후광이 생긴다. 어두운 모드에서는 0 이라
   예전과 똑같이 동작한다. */
uniform vec3  uBg;
uniform sampler2D uRamp;   // bloom 전용 256×1 색 띠

/* 효과 세기 0‥1. 전부 드래그량(|uValue|)에 비례해 들어가므로, 가만히 있으면
   세기를 올려 놔도 아무 일도 일어나지 않는다. 0 이면 완전히 꺼진다. */
uniform float uMelt;       // 행이 가로로 끌리는 번짐
uniform float uJitter;     // 가로 띠 어긋남 + RGB 분리
uniform float uPixel;      // 한 구역만 큰 블록으로

/* 결(texture)은 드래그와 무관하게 늘 깔린다 — 표면의 질감이지 조작의 반응이 아니다.
   역시 0 이면 완전히 꺼진다. */
uniform float uGrain;      // 아주 고운 명도 잡티 (필름 결)
uniform float uNoise;      // 굵은 색 잡음 (스태틱)

/* 모래시계는 텍스처를 안 쓴다. 전부 수식이라 해상도에 매이지 않는다.
   유니폼 칸은 vec4 기준 blobs 20 + colours 20 + profile 6 ≈ 46 칸 — 다항식을
   vec4 세 개에 밀어 넣은 건 이 예산 때문이다. */
uniform vec4  uBlob[24];       // xy = 중심(부호 있는 u, v), zw = 반경
uniform vec3  uCol[24];      // OKLab (L, a, b)
uniform vec4  uPolyL[3];       // 높은 차수부터, 앞은 0 으로 채움
uniform vec4  uPolyR[3];

/** 실루엣 반높이 ÷ 화면높이. Horner 로 12항. */
float halfAt(float u, float rightf) {
  float acc = 0.0;
  for (int k = 0; k < 3; k++) {
    vec4 c = mix(uPolyL[k], uPolyR[k], rightf);
    acc = ((((acc * u + c.x) * u + c.y) * u + c.z) * u + c.w);
  }
  return max(acc, 0.0005);
}

/** 색 덩어리들의 가중 평균 — OKLab 에서 섞는다. sRGB 에서 스물넷을 평균 내면
 *  회색 쪽으로 끌려가 탁해진다. u 는 부호가 있다 — -1 왼쪽 끝 ‥ 0 허리 ‥ +1 오른쪽 끝.
 *  두 잎을 한 벌로 두는 이유: 따로 맞추면 허리에서 같은 자리인데도 서로 다른 색에
 *  안착하고(실측 61/255), 그 차이를 좁은 띠에서 메우느라 기울기가 급변해 중앙 좌우로
 *  희미한 세로 선 두 개가 남는다. 한 벌이면 허리 색이 애초에 하나뿐이라 띠도 필요 없다.
 *
 *  덩어리 색이 전부 0‥1 안에 있으면 평균인 결과도 반드시 그 안에 있다. 그래서 좌표를
 *  아무리 옮겨도 색이 범위를 벗어나거나 붙박이지 않는다. */
vec3 fieldAt(float u, float v) {
  vec3 num = vec3(0.0);
  float den = 0.0;
  for (int k = 0; k < 24; k++) {
    vec4 b = uBlob[k];
    float du = (u - b.x) / b.z;
    float dv = (v - b.y) / b.w;
    float w = exp(-(du * du + dv * dv));
    num += w * uCol[k];
    den += w;
  }
  return num / max(den, 1e-6);
}

/* 난수. 모자이크 칸은 좌표로 고정해야 한다 — 시간을 섞으면 프레임마다 깜빡인다.
   반대로 띠 어긋남은 깜빡여야 제맛이라 시간을 섞는다. */
float hash1(float n) { return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

/** OKLab → 선형 sRGB */
vec3 oklabToLinear(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l; m = m * m * m; s = s * s * s;
  return vec3(
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
}

/** 선형 sRGB → sRGB (감마) */
vec3 linearToSrgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

/** 잎 좌표에서 색을 떠서 색상 회전까지 마친 선형 sRGB */
vec3 sampleLin(float su, float v, float hc, float hs) {
  vec3 lab = fieldAt(clamp(su, -1.25, 1.25), v);
  lab.yz = vec2(lab.y * hc - lab.z * hs, lab.y * hs + lab.z * hc);
  return oklabToLinear(lab);
}

/** 모서리가 둥근 사각형까지의 거리. 음수면 안쪽. */
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float x = (uv.x - 0.5) * 2.0;
  float y = (uv.y - 0.5) * 2.0;

  vec3 col = vec3(0.0);

  if (uShape < 0.5) {
    /* 블룸 — 가운데 하나의 기둥. 거리장으로 그려서 띠가 생기지 않는다. */
    float lean = uValue * 0.22;
    vec2  p = vec2(x - lean, y);
    float breathe = 1.0 + sin(uTime * 0.38) * 0.03;
    vec2  b = vec2(0.56, 0.74) * breathe;
    float d = sdRoundBox(p, b, min(b.x, b.y));
    float t = clamp(-d / (min(b.x, b.y) * 1.55), 0.0, 1.0);   // 1 = 심지
    // 램프는 '바깥 → 안쪽' 순서라 뒤집어 읽는다
    col = mix(linearToSrgb(uBg), texture2D(uRamp, vec2(1.0 - t, 0.5)).rgb,
              smoothstep(0.0, 0.16, t));
  } else if (uShape < 1.5) {
    /* 캡슐 — 가로로 긴 심지에서 바깥으로 겹겹의 고리가 퍼진다. 모래시계와 같은
       생각이다: 형태를 수식으로 두고 그 위의 좌표로 색을 고른다. 여기서는 그 좌표가
       '심지까지의 거리' 라서 동심 고리가 저절로 생긴다.

       거리는 가로세로 비를 맞춘 뒤에 잰다. 안 그러면 화면이 넓을수록 고리가
       가로로 늘어나 납작해진다. */
    float ar = uRes.x / max(uRes.y, 1.0);
    float k = abs(uValue);
    vec2 q = vec2((x - uValue * 0.16) * ar, y);      // 끄는 쪽으로 몸통이 간다

    const float Lh = 0.42;                           // 심지 반길이 (반높이 단위)

    /* 끌면 뒤쪽이 풀어진다. 앞쪽 캡은 또렷하게 남고, 뒤로 갈수록
         · 치마처럼 벌어지고 (세로를 나눠서 잰다)
         · 고리 간격이 넓어져 윤곽이 뭉개지고
         · 바깥 경계가 일찍, 부드럽게 사그라든다
       새 모양을 따로 그리는 게 아니라 같은 고리를 다르게 재는 것뿐이라, 손을 떼면
       (k=0) 전부 1배가 되어 원래 동심 고리로 정확히 돌아온다. */
    float tailDir = uValue < 0.0 ? 1.0 : -1.0;       // 왼쪽으로 끌면 꼬리는 오른쪽
    float sx = q.x * tailDir;                        // + 가 꼬리 쪽
    float back = clamp(max(0.0, sx - Lh * 0.2) / 1.1, 0.0, 1.0);   // 뒤쪽 깊이 0‥1
    float flare = 1.0 + 3.4 * k * back * back;       // 치마처럼 벌어진다
    float xw = sx > 0.0 ? sx / (1.0 + 1.7 * k) : sx;
    float d = length(vec2(max(abs(xw) - Lh, 0.0), q.y / flare));

    /* 숨쉬기 — 고리가 천천히 넓어졌다 좁아진다. 드래그하면 더 넓게 퍼진다. */
    /* 끌 때 reach 는 키우지 않는다 — 꼬리는 위의 거리 압축에서 이미 나오므로
       여기서 또 넓히면 화면을 넘어간다. */
    float reach = 0.74 * (1.0 + sin(uTime * 0.32) * 0.045);
    /* 뒤로 갈수록 고리가 넓게 풀려 형태가 사라진다 — 이게 블러처럼 보인다. */
    float reachL = reach * (1.0 + 1.6 * k * back);
    float t = clamp(d / reachL, 0.0, 1.0) * 6.0;

    /* GLSL ES 1.0 은 유니폼 배열을 변수로 색인할 수 없다. 단계마다 겹쳐 섞는다. */
    vec3 lab = mix(uCap[0], uCap[1], clamp(t,       0.0, 1.0));
    lab      = mix(lab,     uCap[2], clamp(t - 1.0, 0.0, 1.0));
    lab      = mix(lab,     uCap[3], clamp(t - 2.0, 0.0, 1.0));
    lab      = mix(lab,     uCap[4], clamp(t - 3.0, 0.0, 1.0));
    lab      = mix(lab,     uCap[5], clamp(t - 4.0, 0.0, 1.0));
    lab      = mix(lab,     uCap[6], clamp(t - 5.0, 0.0, 1.0));

    /* 앞쪽 캡에 초록이 올라온다. 끌 때만 — k 가 0 이면 아무 일도 없다. */
    float lead = clamp(-sx / (Lh + 0.30), 0.0, 1.0);
    lab = mix(lab, uLead, lead * lead * k * 0.95);

    /* 드래그하면 색상도 돈다 — 모래시계와 같은 방식이다. OKLab 의 (a,b) 평면을
       돌리는 게 곧 색상 회전이고 채도는 그대로 남는다. */
    float ca = uValue * 0.42, cc = cos(ca), cs = sin(ca);
    lab.yz = vec2(lab.y * cc - lab.z * cs, lab.y * cs + lab.z * cc);

    // 바깥은 검정으로 사그라든다. 끄는 일은 선형에서 해야 제 밝기로 꺼진다.
    // 바깥은 검정으로 사그라든다. 뒤쪽일수록 일찍, 더 부드럽게 — 윤곽이 날아간다.
    float edge = mix(0.80, 0.26, k * back);
    vec3 lin = mix(uBg, oklabToLinear(lab), 1.0 - smoothstep(edge, 1.0, d / reachL));

    col = linearToSrgb(lin);
  } else {
    /* 모래시계 — 허리에서 꼬집히고 양쪽으로 벌어지는 두 잎 */
    float amt = abs(uValue);                 // 자리를 흔드는 효과는 드래그량에 비례한다

    /* Line jitter — 넓은 가로 띠마다 통째로 좌우로 밀린다. x 를 먼저 밀기 때문에
       실루엣 윤곽도 같이 어긋나 계단처럼 보인다. */
    float xj = x;
    if (uJitter > 0.0) {
      float band = floor(uv.y * 26.0);
      xj += (hash1(band * 2.17) - 0.5) * uJitter * amt * 0.42;
    }

    /* Melt / Smear — 세로로 출렁인다. 성긴 사인파 두 개를 겹쳐 느리게 흐르게 한다.
       잡음으로 하면 결이 너무 촘촘해져서 파동으로 바꿨다. */
    float yw = y;
    if (uMelt > 0.0) {
      /* 화면 가로를 2주기쯤 지나게 잡는다. 5.0 은 0.8주기뿐이라 파동이 아니라
         그냥 한쪽으로 밀린 것처럼 보였다. 둘째 항이 결을 준다. */
      float w = sin(uv.x * 13.0 + uTime * 0.55) * 0.68
              + sin(uv.x * 27.0 - uTime * 0.33) * 0.22;
      yw += w * uMelt * amt * 0.26;
    }

    /* 실루엣 다항식만 잎마다 다르므로 가운데서 짧게 넘긴다. 색은 한 벌이라 넘길 게 없다. */
    float rightf = smoothstep(-0.012, 0.012, xj);
    float side = rightf * 2.0 - 1.0;
    /* 숨쉬기 위상. 삼항으로 끊으면 x=0 에서 1.9 → 0.0 으로 튀고, 이 값이 ySpan·slide·
       spread 에 모두 들어가 허리 한가운데 세로 경계가 생긴다. */
    float off  = mix(1.9, 0.0, rightf);

    /* 드래그 효과는 허리에서 0 으로 죽인다. 허리는 두 잎이 만나는 한 점이라 좌우가
       같아야 하는데, 여기에 좌우가 다른 값이 걸리면(미는 쪽 spread 1.30 대 끌리는 쪽
       0.85) 그 차이가 22px 안에서 메워지며 기울기가 급변해 세로 선으로 보인다. */
    float grow = 1.03;
    float u0 = clamp(abs(xj) / grow, 0.0, 1.0);
    float gate = smoothstep(0.0, 0.28, u0);
    float push = max(0.0,  side * uValue) * gate;
    float pull = max(0.0, -side * uValue) * gate;

    /* 모양은 거의 건드리지 않는다 — 드래그에서 움직여야 하는 건 색이다. */
    grow = 1.03 + push * 0.04;
    float su = xj / grow;                           // 부호 있는 u
    float u  = clamp(abs(su), 0.0, 1.0);            // 실루엣용

    /* 드래그하면 색 자체도 돈다. 자리를 미는 slide·spread 만으로는 '같은 색이
       움직이는' 느낌이라 색상도 같이 돌린다. OKLab 에서는 (a,b) 평면을 돌리는 게
       곧 색상 회전이고 채도는 그대로 유지된다.
       회전 방향은 잎마다 반대다. 한 방향으로만 돌리면 왼쪽 잎의 자주빛이 빨강
       쪽으로 밀려 와인색이 된다. side 는 허리에서 매끄럽게 넘어간다. */
    float ha = uValue * side * 0.40, hc = cos(ha), hs = sin(ha);

    float ySpan = (1.0 - pull * 0.05) * (1.0 + sin(uTime * 0.38 + off) * 0.02);
    float ph = halfAt(u, rightf) * 2.0 * ySpan;     // y 가 -1‥1 이라 2배
    float v  = abs(yw) / max(ph, 1e-5);             // 1 = 실루엣 경계

    /* 색이 움직이는 두 갈래. 둘 다 '어느 좌표의 색을 볼지' 를 바꾸는 것뿐이라
       어디서도 붙박이지 않는다.
         slide  — 색의 간격이 늘고 줄어 허리↔끝으로 흐른다
         spread — 안쪽 색이 바깥으로 번진다 (빛이 몸통을 지나가는 느낌) */
    float slide  = 1.0 + (push - pull * 0.6) * 0.30 + sin(uTime * 0.30 + off) * 0.04;
    float spread = 1.0 + (push - pull * 0.5) * 0.30 + sin(uTime * 0.23 + off) * 0.030;
    float su2 = su / slide, v2 = v / spread;

    vec3 lin = sampleLin(su2, v2, hc, hs);

    /* 경계. 허리는 또렷하게, 양끝으로 갈수록 풀어진다.
       허리 쪽 soft 는 v 기준 0.035 인데 거기서는 잎이 13px 밖에 안 돼 0.45px — 한
       픽셀도 안 되니 계단이 드러난다. 화면 픽셀 기준 하한을 깔아 준다. */
    float soft = max(mix(0.035, 0.34, u), 1.6 / max(ph * uRes.y * 0.5, 1.0));
    float mask = (1.0 - smoothstep(1.0 - soft, 1.0 + soft * 0.5, v))
               * (1.0 - smoothstep(0.98, 1.02, abs(xj) / grow));
    lin = mix(uBg, lin, mask);              // 섞는 일은 선형에서 해야 제 밝기로 사그라든다

    /* Pixel — 모래시계 '바깥' 배경에만 블록을 깐다. 칸 중심이 잎 좌표로 어디인지
       구해 그 색을 가져오므로, 잎이 더 뻗었다면 있었을 색이 배경에 흩뿌려진다.
       칸은 크게, 띄엄띄엄 빠지고, 가끔 진한 칸이 섞인다. 난수는 칸 좌표로 고정해야
       프레임마다 깜빡이지 않는다. */
    if (uPixel > 0.0) {
      vec2 g = vec2(22.0, 22.0 * uRes.y / uRes.x);
      vec2 cell = floor(uv * g);
      if (hash2(cell + 3.1) > 0.72) cell = floor(uv * g * 0.5) * 2.0;   // 2칸을 한 칸으로
      vec2 quv = (cell + 0.5) / g;

      float cx = (quv.x - 0.5) * 2.0, cyy = (quv.y - 0.5) * 2.0;
      float csu = cx / grow;
      float cu = clamp(abs(csu), 0.0, 1.0);
      float cph = halfAt(cu, step(0.0, cx)) * 2.0 * ySpan;
      vec3 bl = sampleLin(csu / slide, abs(cyy) / max(cph, 1e-5) / spread, hc, hs);

      float keep  = step(0.18, hash2(cell + 19.7));                     // 칸이 빠진다
      float bright = 0.10 + 0.42 * hash2(cell + 5.5);                   // 칸마다 명도
      if (hash2(cell + 31.3) > 0.93) bright *= 2.6;                     // 가끔 진한 칸
      vec2 d = (uv - vec2(0.5 + sign(uValue) * 0.30, 0.5)) / vec2(0.34, 0.46);
      lin = mix(lin, bl * bright, keep * uPixel * amt * exp(-dot(d, d)) * (1.0 - mask));
    }

    col = linearToSrgb(lin);
  }

  /* 결(texture)은 움직이지 않는다 — 난수를 화면 좌표로만 뽑아 고정한다.
     시간을 섞으면 프레임마다 다시 뽑혀 지글거린다. */
  /* Grain — 픽셀 단위의 고운 명도 잡티. 곱으로 걸어서 검은 배경은 건드리지 않는다. */
  if (uGrain > 0.0) {
    col *= 1.0 + (hash2(gl_FragCoord.xy) - 0.5) * uGrain * 0.38;
  }
  /* Noise — 2px 덩어리의 굵은 색 잡음. 더하기라 배경에도 올라온다. */
  if (uNoise > 0.0) {
    vec2 q = floor(gl_FragCoord.xy * 0.5);
    vec3 n = vec3(hash2(q), hash2(q + 17.3), hash2(q + 41.7)) - 0.5;
    col += n * uNoise * 0.11;
  }

  // 8비트 그라데이션의 계단을 지우는 아주 약한 디더
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(col + dither, 0.0, 1.0), 1.0);
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

/** 확대·축소는 지정한 필터로, 가장자리는 물고 늘어지게. 밉맵은 쓰지 않는다 —
 *  2의 거듭제곱이 아닌 크기(256×96)를 WebGL1 에서 쓰려면 이 조합이어야 한다. */
function params(gl: WebGLRenderingContext, filter: number) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/** 유닛을 먼저 잡지 않으면 직전에 활성화된 유닛의 바인딩을 덮어써서
 *  셰이더가 엉뚱한 텍스처를 읽는다. */
function bindAt(gl: WebGLRenderingContext, unit: number, tex: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
}

/** 1×1 검정. 아직 채우지 않은 유닛을 비워 두지 않으려고 쓴다. */
function blankTexture(gl: WebGLRenderingContext, unit: number) {
  const tex = gl.createTexture()!;
  bindAt(gl, unit, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]));
  params(gl, gl.NEAREST);
  return tex;
}

/** 색 배열을 256×1 텍스처로 굽는다 (bloom 용) */
function rampTexture(gl: WebGLRenderingContext, unit: number, stops: RGB[]) {
  const N = 256;
  const data = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const f = (i / (N - 1)) * (stops.length - 1);
    const a = stops[Math.floor(f)], b = stops[Math.min(stops.length - 1, Math.floor(f) + 1)];
    const t = f - Math.floor(f);
    data[i * 4] = Math.round(a[0] + (b[0] - a[0]) * t);
    data[i * 4 + 1] = Math.round(a[1] + (b[1] - a[1]) * t);
    data[i * 4 + 2] = Math.round(a[2] + (b[2] - a[2]) * t);
    data[i * 4 + 3] = 255;
  }
  const tex = gl.createTexture()!;
  bindAt(gl, unit, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  params(gl, gl.LINEAR);
  return tex;
}

/** 효과 세기 0‥1. 전부 드래그량에 비례하므로 0 이면 완전히 꺼진다. */
export interface FieldFx {
  melt: number; jitter: number; pixel: number; grain: number; noise: number;
}

export interface FieldGL {
  resize(w: number, h: number, dpr: number): void;
  setBackground(hex: string): void;
  draw(value: number, time: number, fx?: FieldFx): void;
  destroy(): void;
}

/** 실패하면 null 을 돌려준다 — 호출하는 쪽이 2D 로 되돌아갈 수 있게. */
export function createFieldGL(canvas: HTMLCanvasElement, cfg: FieldConfig): FieldGL | null {
  const gl = (canvas.getContext('webgl', { antialias: false, alpha: false })
    || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  if (!gl) return null;

  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
    }
  } catch {
    return null;
  }
  gl.useProgram(prog);

  // 화면을 덮는 삼각형 하나
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const isGlass = cfg.shape === 'hourglass' && !!cfg.field;
  const isCapsule = cfg.shape === 'capsule' && !!cfg.capsule;

  // 블룸만 텍스처를 쓴다. 모래시계는 전부 유니폼으로 들어간다.
  const ramp = cfg.bands ? rampTexture(gl, 0, cfg.bands[0]) : blankTexture(gl, 0);
  gl.uniform1i(gl.getUniformLocation(prog, 'uRamp'), 0);
  gl.uniform1f(gl.getUniformLocation(prog, 'uShape'), isGlass ? 2 : isCapsule ? 1 : 0);

  if (isCapsule) {
    const c = cfg.capsule!;
    c.rings.forEach((hex, i) => {
      const [L, A, B] = hexToOklab(hex);
      gl.uniform3f(gl.getUniformLocation(prog, `uCap[${i}]`), L, A, B);
    });
    gl.uniform3f(gl.getUniformLocation(prog, 'uLead'), ...hexToOklab(c.lead));
  }

  /* vec4 배열은 원소 하나를 통째로 넣는다. uPolyL[0].x 같은 이름은 없다. */
  if (isGlass) {
    const f = cfg.field!;
    (['L', 'R'] as const).forEach((sfx, li) => {
      const poly = f.profile[li];
      for (let i = 0; i < 3; i++) {
        gl.uniform4f(gl.getUniformLocation(prog, `uPoly${sfx}[${i}]`),
          poly[i * 4], poly[i * 4 + 1], poly[i * 4 + 2], poly[i * 4 + 3]);
      }
    });
    if (f.blobs.length !== NB) throw new Error(`색 덩어리는 ${NB} 개여야 한다`);
    f.blobs.forEach((b, k) => {
      gl.uniform4f(gl.getUniformLocation(prog, `uBlob[${k}]`), b[0], b[1], b[2], b[3]);
      gl.uniform3f(gl.getUniformLocation(prog, `uCol[${k}]`), b[4], b[5], b[6]);
    });
  }

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uValue = gl.getUniformLocation(prog, 'uValue');
  const uBg = gl.getUniformLocation(prog, 'uBg');
  const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const setBg = (hex: string) => gl.uniform3f(uBg,
    toLin(parseInt(hex.slice(1, 3), 16) / 255),
    toLin(parseInt(hex.slice(3, 5), 16) / 255),
    toLin(parseInt(hex.slice(5, 7), 16) / 255));
  setBg('#000000');

  const uMelt = gl.getUniformLocation(prog, 'uMelt');
  const uJitter = gl.getUniformLocation(prog, 'uJitter');
  const uPixel = gl.getUniformLocation(prog, 'uPixel');
  const uGrain = gl.getUniformLocation(prog, 'uGrain');
  const uNoise = gl.getUniformLocation(prog, 'uNoise');

  return {
    resize(w, h, dpr) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    },
    setBackground(hex) { setBg(hex); },
    draw(value, time, fx) {
      gl.uniform1f(uValue, value);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uMelt, fx ? fx.melt : 0);
      gl.uniform1f(uJitter, fx ? fx.jitter : 0);
      gl.uniform1f(uPixel, fx ? fx.pixel : 0);
      gl.uniform1f(uGrain, fx ? fx.grain : 0);
      gl.uniform1f(uNoise, fx ? fx.noise : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      gl.deleteTexture(ramp);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
