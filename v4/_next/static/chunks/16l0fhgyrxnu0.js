(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,5825,e=>{e.v({arrow:"QuestionStage-module__dsrUrW__arrow",canvas:"QuestionStage-module__dsrUrW__canvas",dark:"QuestionStage-module__dsrUrW__dark",dots:"QuestionStage-module__dsrUrW__dots",grabbing:"QuestionStage-module__dsrUrW__grabbing",head:"QuestionStage-module__dsrUrW__head",hit:"QuestionStage-module__dsrUrW__hit",idx:"QuestionStage-module__dsrUrW__idx",inner:"QuestionStage-module__dsrUrW__inner",knob:"QuestionStage-module__dsrUrW__knob",knobBody:"QuestionStage-module__dsrUrW__knobBody",label:"QuestionStage-module__dsrUrW__label",light:"QuestionStage-module__dsrUrW__light",on:"QuestionStage-module__dsrUrW__on",onLight:"QuestionStage-module__dsrUrW__onLight",q:"QuestionStage-module__dsrUrW__q",right:"QuestionStage-module__dsrUrW__right",row:"QuestionStage-module__dsrUrW__row",rule:"QuestionStage-module__dsrUrW__rule",stage:"QuestionStage-module__dsrUrW__stage",target:"QuestionStage-module__dsrUrW__target",targetL:"QuestionStage-module__dsrUrW__targetL",targetR:"QuestionStage-module__dsrUrW__targetR"})},1884,e=>{e.v({btn:"page-module__hvyxdW__btn",chev:"page-module__hvyxdW__chev",fxName:"page-module__hvyxdW__fxName",fxRange:"page-module__hvyxdW__fxRange",fxReset:"page-module__hvyxdW__fxReset",fxRow:"page-module__hvyxdW__fxRow",fxVal:"page-module__hvyxdW__fxVal",on:"page-module__hvyxdW__on",panel:"page-module__hvyxdW__panel",panelHead:"page-module__hvyxdW__panelHead",picked:"page-module__hvyxdW__picked",root:"page-module__hvyxdW__root",scheme:"page-module__hvyxdW__scheme",schemeOnLight:"page-module__hvyxdW__schemeOnLight",tools:"page-module__hvyxdW__tools"})},35879,e=>{"use strict";var t=e.i(43476),a=e.i(71645);let l=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4;function r(e){let t=l(parseInt(e.slice(1,3),16)/255),a=l(parseInt(e.slice(3,5),16)/255),r=l(parseInt(e.slice(5,7),16)/255),i=Math.cbrt(.4122214708*t+.5363325363*a+.0514459929*r),o=Math.cbrt(.2119034982*t+.6806995451*a+.1073969566*r),n=Math.cbrt(.0883024619*t+.2817188376*a+.6299787005*r);return[.2104542553*i+.793617785*o-.0040720468*n,1.9779984951*i-2.428592205*o+.4505937099*n,.0259040371*i+.7827717662*o-.808675766*n]}let i=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,o=`
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
uniform sampler2D uRamp;   // bloom 전용 256\xd71 색 띠

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

/** 실루엣 반높이 \xf7 화면높이. Horner 로 12항. */
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
         \xb7 치마처럼 벌어지고 (세로를 나눠서 잰다)
         \xb7 고리 간격이 넓어져 윤곽이 뭉개지고
         \xb7 바깥 경계가 일찍, 부드럽게 사그라든다
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
    /* 숨쉬기 위상. 삼항으로 끊으면 x=0 에서 1.9 → 0.0 으로 튀고, 이 값이 ySpan\xb7slide\xb7
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

    /* 드래그하면 색 자체도 돈다. 자리를 미는 slide\xb7spread 만으로는 '같은 색이
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
`;function n(e,t,a){let l=e.createShader(t);if(e.shaderSource(l,a),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(l)||"shader compile failed");return l}function s(e,t){e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}function u(e,t,a){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,a)}var c=e.i(93209),d=e.i(5825);let f="#010206",m="#F2EFE9";function h({index:e,text:l,options:x,tone:g,field:p,videoSrc:_,effects:b,scheme:v="dark",onCommit:R}){let y=(0,a.useRef)(null),L=(0,a.useRef)(null),E=(0,a.useRef)(null),k=(0,a.useRef)(null),S=(0,a.useRef)(null),T=(0,a.useRef)(null),w=(0,a.useRef)(null),U=(0,a.useRef)(null),A=(0,a.useRef)(0),N=(0,a.useRef)(!1),M=(0,a.useRef)(null),[W,j]=(0,a.useState)(null),C=(0,a.useRef)(b);(0,a.useEffect)(()=>{C.current=b},[b]),(0,a.useEffect)(()=>{let e=y.current,t=L.current;if(!e||!t)return;let a=null,l=null;p&&!_?(a=function(e,t){let a,l,c=e.getContext("webgl",{antialias:!1,alpha:!1})||e.getContext("experimental-webgl");if(!c)return null;try{if(a=c.createProgram(),c.attachShader(a,n(c,c.VERTEX_SHADER,i)),c.attachShader(a,n(c,c.FRAGMENT_SHADER,o)),c.linkProgram(a),!c.getProgramParameter(a,c.LINK_STATUS))throw Error(c.getProgramInfoLog(a)||"link failed")}catch{return null}c.useProgram(a);let d=c.createBuffer();c.bindBuffer(c.ARRAY_BUFFER,d),c.bufferData(c.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),c.STATIC_DRAW);let f=c.getAttribLocation(a,"aPos");c.enableVertexAttribArray(f),c.vertexAttribPointer(f,2,c.FLOAT,!1,0,0);let m="hourglass"===t.shape&&!!t.field,h="capsule"===t.shape&&!!t.capsule,x=t.bands?function(e,t){let a=new Uint8Array(1024);for(let e=0;e<256;e++){let l=e/255*(t.length-1),r=t[Math.floor(l)],i=t[Math.min(t.length-1,Math.floor(l)+1)],o=l-Math.floor(l);a[4*e]=Math.round(r[0]+(i[0]-r[0])*o),a[4*e+1]=Math.round(r[1]+(i[1]-r[1])*o),a[4*e+2]=Math.round(r[2]+(i[2]-r[2])*o),a[4*e+3]=255}let l=e.createTexture();return u(e,0,l),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,256,1,0,e.RGBA,e.UNSIGNED_BYTE,a),s(e,e.LINEAR),l}(c,t.bands[0]):(l=c.createTexture(),u(c,0,l),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,1,1,0,c.RGBA,c.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),s(c,c.NEAREST),l);if(c.uniform1i(c.getUniformLocation(a,"uRamp"),0),c.uniform1f(c.getUniformLocation(a,"uShape"),m?2:+!!h),h){let e=t.capsule;e.rings.forEach((e,t)=>{let[l,i,o]=r(e);c.uniform3f(c.getUniformLocation(a,`uCap[${t}]`),l,i,o)}),c.uniform3f(c.getUniformLocation(a,"uLead"),...r(e.lead))}if(m){let e=t.field;if(["L","R"].forEach((t,l)=>{let r=e.profile[l];for(let e=0;e<3;e++)c.uniform4f(c.getUniformLocation(a,`uPoly${t}[${e}]`),r[4*e],r[4*e+1],r[4*e+2],r[4*e+3])}),24!==e.blobs.length)throw Error("색 덩어리는 24 개여야 한다");e.blobs.forEach((e,t)=>{c.uniform4f(c.getUniformLocation(a,`uBlob[${t}]`),e[0],e[1],e[2],e[3]),c.uniform3f(c.getUniformLocation(a,`uCol[${t}]`),e[4],e[5],e[6])})}let g=c.getUniformLocation(a,"uRes"),p=c.getUniformLocation(a,"uTime"),_=c.getUniformLocation(a,"uValue"),b=c.getUniformLocation(a,"uBg"),v=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4,R=e=>c.uniform3f(b,v(parseInt(e.slice(1,3),16)/255),v(parseInt(e.slice(3,5),16)/255),v(parseInt(e.slice(5,7),16)/255));R("#000000");let y=c.getUniformLocation(a,"uMelt"),L=c.getUniformLocation(a,"uJitter"),E=c.getUniformLocation(a,"uPixel"),k=c.getUniformLocation(a,"uGrain"),S=c.getUniformLocation(a,"uNoise");return{resize(t,a,l){e.width=Math.round(t*l),e.height=Math.round(a*l),c.viewport(0,0,e.width,e.height),c.uniform2f(g,e.width,e.height)},setBackground(e){R(e)},draw(e,t,a){c.uniform1f(_,e),c.uniform1f(p,t),c.uniform1f(y,a?a.melt:0),c.uniform1f(L,a?a.jitter:0),c.uniform1f(E,a?a.pixel:0),c.uniform1f(k,a?a.grain:0),c.uniform1f(S,a?a.noise:0),c.drawArrays(c.TRIANGLES,0,3)},destroy(){c.deleteTexture(x),c.deleteBuffer(d),c.deleteProgram(a)}}}(t,p),a?.setBackground("light"===v?m:f),a||(l=t.getContext("2d"))):l=t.getContext("2d");let c=null,h=!1;_&&((c=document.createElement("video")).src=_,c.muted=!0,c.playsInline=!0,c.preload="auto",c.addEventListener("loadeddata",()=>{h=!0}));let x=0,g=0,b=1,E=0,W=-1,B=0,Q=0,P=0,F=0,$=0,D=1,G=1,I=performance.now();function q(){x=e.clientWidth,g=e.clientHeight,b=Math.min(window.devicePixelRatio||1,2),a?a.resize(x,g,b):(t.width=Math.round(x*b),t.height=Math.round(g*b));let l=k.current,r=w.current;if(l&&r){let t=l.getBoundingClientRect(),a=e.getBoundingClientRect();B=t.width,F=(Q=r.offsetWidth)/2,$=B-Q/2,D=Math.max(1,(P=Math.min(Math.max(a.left+a.width/2-t.left,F),$))-F),G=Math.max(1,$-P)}}let V=e=>P+e*(e<0?D:G),O=0,z=0;function X(e){null===M.current&&(N.current=!0,O=e.clientX,z=A.current,w.current?.setPointerCapture(e.pointerId),U.current?.classList.add(d.default.grabbing),e.preventDefault())}function K(e){let t;N.current&&(A.current=Math.max(-1,Math.min(1,((t=Math.min(Math.max(V(z)+(e.clientX-O),F),$))-P)/(t<P?D:G))))}function H(){if(!N.current)return;N.current=!1,U.current?.classList.remove(d.default.grabbing);let e=A.current;if(Math.abs(e)>=.88&&null===M.current){let t=e<0?1:2;M.current=t,j(t),R?.(t)}}let J=w.current;return J?.addEventListener("pointerdown",X),J?.addEventListener("pointermove",K),J?.addEventListener("pointerup",H),J?.addEventListener("pointercancel",H),window.addEventListener("resize",q),q(),E=requestAnimationFrame(function e(t){let r=(t-I)/1e3;if(N.current||null!==M.current){if(null!==M.current){let e=1===M.current?-1:1;A.current+=(e-A.current)*.2}}else{let e=.06*Math.sin(.9*r);A.current+=(e-A.current)*.06}let i=A.current,o=Q/2,n=V(i);if(w.current&&(w.current.style.transform=`translateX(${(n-o).toFixed(2)}px)`),S.current){let e=Q,t=Math.max(0,n-o-e);S.current.style.left=`${e.toFixed(2)}px`,S.current.style.width=`${t.toFixed(2)}px`}if(T.current){let e=n+o,t=Math.max(0,B-Q-e);T.current.style.left=`${e.toFixed(2)}px`,T.current.style.width=`${t.toFixed(2)}px`}let s=Math.max(0,1-Math.min(Math.abs(n-F)/D,Math.abs(n-$)/G));if(U.current&&(U.current.style.backgroundColor=`rgba(255,255,255,${(.3*s*s).toFixed(3)})`),a)a.draw(i,r,C.current);else if(l&&(l.setTransform(b,0,0,b,0,0),l.fillStyle="light"===v?m:f,l.fillRect(0,0,x,g),c&&h&&c.duration)){let e=(i+1)/2*(c.duration-.04);!c.seeking&&Math.abs(e-W)>.012&&(W=e,c.currentTime=e);let t=Math.max(x/c.videoWidth,g/c.videoHeight),a=c.videoWidth*t,r=c.videoHeight*t;l.drawImage(c,(x-a)/2,(g-r)/2,a,r)}E=requestAnimationFrame(e)}),()=>{cancelAnimationFrame(E),a?.destroy(),J?.removeEventListener("pointerdown",X),J?.removeEventListener("pointermove",K),J?.removeEventListener("pointerup",H),J?.removeEventListener("pointercancel",H),window.removeEventListener("resize",q)}},[p,_,v,R]);let B=(0,c.asset)("dark"===g?"/figma/handle-dark.svg":"/figma/handle.svg"),Q="dark"===g?72:96;return(0,t.jsxs)("div",{ref:y,className:`${d.default.stage} ${d.default[g]} ${"light"===v?d.default.onLight:""}`,children:[(0,t.jsx)("canvas",{ref:L,className:d.default.canvas}),(0,t.jsxs)("div",{className:d.default.head,children:[(0,t.jsx)("img",{src:(0,c.asset)("/figma/prev.svg"),alt:"",width:36,height:36,className:d.default.arrow}),(0,t.jsx)("span",{className:d.default.idx,children:e}),(0,t.jsx)("img",{src:(0,c.asset)("/figma/rule.svg"),alt:"",width:90,height:3,className:d.default.rule}),(0,t.jsx)("span",{className:d.default.q,children:l}),(0,t.jsx)("img",{src:(0,c.asset)("/figma/next.svg"),alt:"",width:36,height:36,className:d.default.arrow})]}),(0,t.jsxs)("div",{ref:E,className:d.default.row,children:[(0,t.jsx)("div",{className:`${d.default.label} ${1===W?d.default.on:""}`,children:x[0]}),(0,t.jsxs)("div",{ref:k,className:d.default.inner,children:[(0,t.jsx)("div",{className:`${d.default.target} ${d.default.targetL} ${1===W?d.default.hit:""}`}),(0,t.jsx)("div",{ref:S,className:d.default.dots}),(0,t.jsx)("div",{ref:w,className:d.default.knob,children:(0,t.jsx)("div",{ref:U,className:d.default.knobBody,children:(0,t.jsx)("img",{src:B,alt:"밀어서 선택",width:Q,height:Q})})}),(0,t.jsx)("div",{ref:T,className:d.default.dots}),(0,t.jsx)("div",{className:`${d.default.target} ${d.default.targetR} ${2===W?d.default.hit:""}`})]}),(0,t.jsx)("div",{className:`${d.default.label} ${d.default.right} ${2===W?d.default.on:""}`,children:x[1]})]})]})}let x=[{id:"Q1",act:1,axis:"A",pick:["E","R"],scene:"미뤄둔 것들",text:"2026년을 떠올리면, 가장 아쉬운 건?",options:["가보고 싶던 곳, 해보고 싶던 일을 자꾸 미뤄둔 것","쉼 없이 달리느라 나를 돌보지 못한 것"]},{id:"Q2",act:1,axis:"C",pick:["W","M"],scene:"버티게 한 힘",text:"그래도 2026년을 버티게 한 힘은?",options:["곁에서 함께해 준 사람들","조용히 나를 믿어준 나 자신"]},{id:"Q3",act:1,axis:"B",pick:["P","F"],scene:"좋았던 일들",text:"2026년의 좋은 일들은 대부분 어떻게 찾아왔나요?",options:["차근차근 준비한 끝에","예상 못한 우연 속에서"]},{id:"Q4",act:2,axis:"B",pick:["P","F"],scene:"두고 갈 짐",text:"2027년으로 넘어가기 전, 여기 두고 가고 싶은 짐은?",options:["되는 대로 흘려보낸 시간들","계획대로 안 될까 봐 하던 걱정들"]},{id:"Q5",act:2,axis:"A",pick:["E","R"],scene:"나에게 건네는 말",text:"2026년의 나에게 한마디 건넨다면?",options:["“충분히 잘했어. 이제 더 멀리 가보자.”","“충분히 잘했어. 이제 좀 쉬어도 돼.”"]},{id:"Q6",act:2,axis:"C",pick:["W","M"],scene:"마지막 밤",text:"2026년의 마지막 밤, 가장 하고 싶은 일은?",options:["고마웠던 사람들에게 연락을 돌린다","한 해를 조용히 적어 내려간다"]},{id:"Q7",act:3,axis:"C",pick:["W","M"],scene:"옆자리",text:"2027년으로 출발하는 차, 옆자리는?",options:["함께 가고 싶은 사람을 위해 비워둔다","온전히 나를 위한 자리로 둔다"]},{id:"Q8",act:3,axis:"B",pick:["P","F"],scene:"경로 설정",text:"내비게이션에 2027년 경로를 설정하려는데…",options:["경유지까지 하나하나 찍어 경로를 완성한다","방향만 정하고 나머지는 달리며 정한다"]},{id:"Q9",act:3,axis:"A",pick:["E","R"],scene:"목적지 입력",text:"마지막으로, 2027년의 목적지를 입력하세요.",options:["한 번도 가보지 않은 곳","가장 나다운 곳"]}],g={A:{name:"방향",letters:["E","R"],labels:["밖으로 · 탐험","안으로 · 휴식"],index:[]},B:{name:"방식",letters:["P","F"],labels:["계획 · 플랜","즉흥 · 플로우"],index:[]},C:{name:"동승",letters:["W","M"],labels:["함께 · 크루","조용히 · 솔로"],index:[]}};Object.keys(g).forEach(e=>{g[e].index=x.reduce((t,a,l)=>(a.axis===e&&t.push(l),t),[])});var p=e.i(1884);let _={Q2:{shape:"capsule",capsule:{rings:["#ED732F","#ED8732","#ECA53B","#F3AD68","#EC94CA","#A980F2","#2B3A96"],lead:"#5BEF4A"}},Q4:{shape:"hourglass",field:{profile:[[17.889207,-117.946009,348.096698,-608.246826,696.527583,-539.670262,276.529515,-83.604121,8.295342,2.442759,.132675,.013873],[201.112908,-1124.011215,2783.910913,-4040.42628,3815.797611,-2439.476465,1046.728088,-280.148769,35.738175,1.21682,.012449,.012858]],blobs:[[.578,-.1821,.2142,.7545,.7099,.1377,.1357],[.3873,.0161,.1862,.6085,.7216,.1259,.138],[.4448,.7293,.1665,.3871,.6984,.1542,.1233],[-1.0724,.4502,.1123,1.0687,.3941,.0835,-.2037],[.7298,.0558,.1091,.2046,.6989,.1529,.1249],[-.5623,1.25,.6766,.4201,.5329,.0962,-.265],[-.0686,-.25,.1236,.7795,.6939,.1422,.1403],[.8481,.0855,.0854,.3502,.6913,.1719,.1003],[-.0055,1.1565,.07,.3387,.4832,.1987,-.0481],[-.202,.0521,.3639,.3345,.5887,.2111,.1173],[.9506,1.063,.4482,.1629,.595,.2436,-.0227],[-.7708,.9194,.1759,.2884,.4518,.1004,-.2292],[.309,.0326,.1658,.2299,.7264,.1216,.1382],[-.59,-.001,.1483,.2593,.4652,.1876,-.0878],[.5427,1.0309,.5663,.1551,.686,.1914,.0702],[-.8555,.2058,.1003,.4331,.815,-.1025,-.0876],[-.7301,-.25,.0973,.5814,.4764,.1365,-.2097],[-.742,.6928,.101,.1513,.6992,-.019,-.1559],[-.515,.9655,.1971,.1471,.815,-.1025,-.0876],[1.1193,.0643,.1331,1.0068,.6675,.2388,.0067],[.1,.66,.11,.15,.8595,.0598,.0738],[.2,.55,.12,.15,.8454,.0674,.0793],[.32,.41,.13,.15,.8126,.0845,.0928],[.46,.31,.14,.16,.7772,.1043,.1057]]}}},b=["Q4","Q3"],v=["Q2","Q3","Q4"];e.s(["default",0,function(){let e=new URLSearchParams((0,a.useSyncExternalStore)(()=>()=>{},()=>window.location.search,()=>"")),l=e.get("q")??"",[r,i]=(0,a.useState)(null),o=r??(v.includes(l)?l:"Q4"),[n,s]=(0,a.useState)(""),[u,d]=(0,a.useState)({melt:0,jitter:0,pixel:0,grain:0,noise:0}),[f,m]=(0,a.useState)(!1),[g,R]=(0,a.useState)(null),y=g??("light"===e.get("mode")?"light":"dark"),L=x.find(e=>e.id===o);return(0,t.jsxs)("main",{className:p.default.root,children:[(0,t.jsx)(h,{index:L.id+".",text:L.text,options:L.options,tone:"Q3"===o?"light":"dark",field:"Q3"===o?void 0:_[o],effects:u,scheme:y,videoSrc:"Q3"===o?(0,c.asset)("/q3.mp4"):void 0,onCommit:e=>s(`${L.id} → ${1===e?"왼쪽(01)":"오른쪽(02)"} \xb7 ${L.options[e-1]}`)},o),(0,t.jsx)("button",{className:`${p.default.scheme} ${"light"===y?p.default.schemeOnLight:""}`,onClick:()=>R(e=>"dark"===e?"light":"dark"),children:"dark"===y?"라이트 모드":"다크 모드"}),(0,t.jsxs)("div",{className:p.default.panel,children:[(0,t.jsxs)("button",{className:p.default.panelHead,onClick:()=>m(e=>!e),"aria-expanded":f,children:[(0,t.jsx)("span",{children:"효과"}),(0,t.jsx)("span",{className:p.default.chev,"aria-hidden":!0,children:f?"−":"+"})]}),f&&[{key:"melt",label:"Melt / Smear"},{key:"jitter",label:"Line Jitter"},{key:"pixel",label:"Pixel Zone"},{key:"grain",label:"Grain"},{key:"noise",label:"Noise"}].map(({key:e,label:a})=>(0,t.jsxs)("label",{className:p.default.fxRow,children:[(0,t.jsx)("span",{className:p.default.fxName,children:a}),(0,t.jsx)("input",{type:"range",min:0,max:1,step:.01,value:u[e],className:p.default.fxRange,onChange:t=>d(a=>({...a,[e]:Number(t.target.value)}))}),(0,t.jsx)("span",{className:p.default.fxVal,children:u[e].toFixed(2)})]},e)),f&&(0,t.jsx)("button",{className:p.default.fxReset,onClick:()=>d({melt:0,jitter:0,pixel:0,grain:0,noise:0}),children:"효과 끄기"})]}),(0,t.jsxs)("div",{className:p.default.tools,children:[b.map(e=>(0,t.jsx)("button",{className:`${p.default.btn} ${o===e?p.default.on:""}`,onClick:()=>{i(e),s("")},children:e},e)),(0,t.jsx)("button",{className:p.default.btn,onClick:()=>{i(null),s("")},children:"초기화"}),n&&(0,t.jsx)("span",{className:p.default.picked,children:n})]})]})}],35879)},93209,e=>{"use strict";e.i(47167),e.s(["asset",0,e=>"/kia-movment-navigation/v4"+e])}]);