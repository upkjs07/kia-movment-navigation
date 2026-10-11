(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,46310,e=>{e.v({act:"Result-module__aXuB2W__act",action:"Result-module__aXuB2W__action",actions:"Result-module__aXuB2W__actions",allow:"Result-module__aXuB2W__allow",back:"Result-module__aXuB2W__back",badge:"Result-module__aXuB2W__badge",bar:"Result-module__aXuB2W__bar",barTight:"Result-module__aXuB2W__barTight",box:"Result-module__aXuB2W__box",boxOn:"Result-module__aXuB2W__boxOn",card:"Result-module__aXuB2W__card",case:"Result-module__aXuB2W__case",caseOn:"Result-module__aXuB2W__caseOn",cases:"Result-module__aXuB2W__cases",chip:"Result-module__aXuB2W__chip",copy:"Result-module__aXuB2W__copy",echo:"Result-module__aXuB2W__echo",film:"Result-module__aXuB2W__film",group:"Result-module__aXuB2W__group",heads:"Result-module__aXuB2W__heads",icon:"Result-module__aXuB2W__icon",lead:"Result-module__aXuB2W__lead",lines:"Result-module__aXuB2W__lines",page:"Result-module__aXuB2W__page",panel:"Result-module__aXuB2W__panel",pause:"Result-module__aXuB2W__pause",play:"Result-module__aXuB2W__play",radio:"Result-module__aXuB2W__radio",radios:"Result-module__aXuB2W__radios",range:"Result-module__aXuB2W__range",save:"Result-module__aXuB2W__save",seat:"Result-module__aXuB2W__seat",seek:"Result-module__aXuB2W__seek",share:"Result-module__aXuB2W__share",shot:"Result-module__aXuB2W__shot",stack:"Result-module__aXuB2W__stack",stackFilm:"Result-module__aXuB2W__stackFilm",title:"Result-module__aXuB2W__title"})},20897,e=>{e.v({on:"page-module___8aEwW__on",step:"page-module___8aEwW__step",steps:"page-module___8aEwW__steps"})},52683,e=>{"use strict";var t=e.i(43476),a=e.i(71645),l=e.i(29483);function o({onStart:e}){return(0,t.jsx)("div",{className:l.default.stage,children:(0,t.jsxs)("div",{className:l.default.inner,children:[(0,t.jsxs)("div",{className:l.default.slot,children:[(0,t.jsx)("p",{className:l.default.slotLabel,children:"1 · hero"}),(0,t.jsx)("p",{style:{marginTop:10},children:"첫 화면. 레거시 히어로 A(기울어지는 타이포 패널) / B(드래그 플레이트)를 가져올 자리."})]}),(0,t.jsx)("button",{type:"button",onClick:e,style:{marginTop:24,alignSelf:"start"},children:"시작하기 →"})]})})}let r={2026:"2026",2027:"2027",self:"you"},s=[{id:"Q1",theme:"2026",text:"2026년을 한 문장으로 줄인다면?",options:["쉬지 않고 달린 해","버티는 데 다 쓴 해"]},{id:"Q2",theme:"2026",text:"올해 가장 자주 미뤘던 것은?",options:["가보고 싶던 곳","만나고 싶던 사람"]},{id:"Q3",theme:"2027",text:"2027년에 더 갖고 싶은 것은?",options:["계획대로 되는 하루","예측 못 할 하루"]},{id:"Q4",theme:"2027",text:"새해 첫 주, 지금 마음이 가는 시작은?",options:["해보고 싶은 일을 적어보는 시작","마음 가는 대로 여는 시작"]},{id:"Q5",theme:"self",text:"길이 막혔을 때 나는?",options:["돌아가는 길을 찾는다","그 자리에서 기다린다"]},{id:"Q6",theme:"self",text:"함께 떠난다면 나는?",options:["운전대를 잡는 쪽","옆자리에서 보는 쪽"]}],i=[{id:"boom-boom",type:"쿵짝쿵짝",echo:"Boom Boom!",tagline:"가보고 싶던 곳으로, 함께 한 걸음 더",action:"함께 가보고 싶은 여행지 한 곳씩 골라 하루 코스 만들기",note:"TODO(기획): 왜 이 차가 어울리는지. 지금 카드에는 자리가 없다.",model:"KIA PV5",front:{src:"/cars/sheep.png",film:"/cars/ship_loop_b.mp4"},colours:[{label:"WHITE",name:"Snow White Pearl",hex:"#F4F4F2"},{label:"GREY",name:"Gravity Grey",hex:"#6E7378"},{label:"BLACK",name:"Aurora Black Pearl",hex:"#15161A"}]},{id:"flutter",type:"살랑살랑",echo:"Flutter-Flutter",tagline:"가끔은 계획 없이, 나만의 시간으로.",action:"날씨 좋은 날, 마음이 내키면 30분 산책 나서기",note:"TODO(기획): 왜 이 차가 어울리는지. 지금 카드에는 자리가 없다.",model:"KIA PV5",front:{src:"/cars/sheep2.png",film:"/cars/ship_loop_c.mp4"},colours:[{label:"WHITE",name:"Snow White Pearl",hex:"#F4F4F2"},{label:"GREY",name:"Gravity Grey",hex:"#6E7378"},{label:"BLACK",name:"Aurora Black Pearl",hex:"#15161A"}]}];var n=e.i(26369);let u=["movement-navigator v4","2026 → 2027 · 6 questions",""];function c({onDone:e}){let[l,o]=(0,a.useState)(0),i=(0,a.useRef)(s.map(()=>null)),[m,d]=(0,a.useState)(()=>u.map(e=>({kind:"sys",text:e}))),[f,_]=(0,a.useState)({id:"",text:""}),[h,v]=(0,a.useState)(0),x=(0,a.useRef)(null),g=l<s.length?s[l]:null,p=g&&f.id===g.id?f.text:"",b=!!g&&p.length===g.text.length;(0,a.useEffect)(()=>{if(!g)return;let e=0,t=setInterval(()=>{e+=1,_({id:g.id,text:g.text.slice(0,e)}),e>=g.text.length&&clearInterval(t)},26);return()=>clearInterval(t)},[g]),(0,a.useEffect)(()=>{x.current?.scrollIntoView({block:"end"})},[m,p]);let T=(0,a.useCallback)(t=>{g&&b&&(d(e=>[...e,{kind:"q",text:`${g.id}  ${g.text}`},{kind:"a",text:g.options[t]}]),i.current=i.current.map((e,a)=>a===l?t:e),l+1>=s.length&&e(i.current),o(e=>e+1),v(0))},[g,b,l,e]);return(0,a.useEffect)(()=>{let e=e=>{b&&("1"===e.key?T(0):"2"===e.key?T(1):"ArrowUp"===e.key||"ArrowDown"===e.key?(e.preventDefault(),v(e=>+(0===e))):"Enter"===e.key&&T(h))};return window.addEventListener("keydown",e),()=>window.removeEventListener("keydown",e)},[b,h,T]),(0,t.jsx)("main",{className:n.default.root,children:(0,t.jsxs)("div",{className:n.default.screen,children:[(0,t.jsxs)("div",{className:n.default.log,children:[m.map((e,a)=>(0,t.jsx)("p",{className:n.default[e.kind],children:"a"===e.kind?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{className:n.default.caret,children:"›"})," ",e.text]}):e.text},a)),(0,t.jsx)("div",{ref:x})]}),g&&(0,t.jsxs)("section",{className:n.default.ask,children:[(0,t.jsxs)("p",{className:n.default.meta,children:[(0,t.jsx)("span",{className:n.default.theme,children:r[g.theme]}),(0,t.jsxs)("span",{className:n.default.count,children:[l+1," / ",s.length]})]}),(0,t.jsxs)("h1",{className:n.default.question,children:[p,!b&&(0,t.jsx)("span",{className:n.default.cursor,"aria-hidden":!0})]}),(0,t.jsx)("div",{className:n.default.options,"data-ready":b||void 0,children:g.options.map((e,a)=>(0,t.jsxs)("button",{type:"button",className:`${n.default.option} ${h===a?n.default.on:""}`,onMouseEnter:()=>v(a),onClick:()=>T(a),children:[(0,t.jsx)("span",{className:n.default.key,children:a+1}),(0,t.jsx)("span",{children:e})]},e))}),(0,t.jsx)("p",{className:n.default.hint,children:"1 · 2 또는 ↑↓ + Enter"})]})]})})}function m({onDone:e}){return(0,a.useEffect)(()=>{let t=setTimeout(e,2200);return()=>clearTimeout(t)},[e]),(0,t.jsx)("div",{className:l.default.stage,children:(0,t.jsx)("div",{className:l.default.inner,children:(0,t.jsxs)("div",{className:l.default.slot,children:[(0,t.jsx)("p",{className:l.default.slotLabel,children:"3 · loading"}),(0,t.jsx)("p",{style:{marginTop:10},children:"매칭 과정을 보여 주는 구간. 사고 과정이 흐르다가 결과로 넘어간다."})]})})})}let d={glyphs:!1,bloom:.2,coverage:.5,dark:.6,grain:.3,glitch:0,chroma:0},f=`
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`,_=`
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
uniform vec2  uLevels;    // 원본 밝기의 아래\xb7위 끝
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
   빨강은 제자리, 초록은 d, 파랑은 2d — 그래서 경계에서 빨강\xb7초록\xb7파랑이 차례로
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
  /* 바닥을 너무 낮추면 어두운 면(범퍼\xb7타이어)이 때 낀 회색으로 남는다. 카드 바탕이
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
`;function h(e,t,a){let l=e.createShader(t);if(e.shaderSource(l,a),e.compileShader(l),!e.getShaderParameter(l,e.COMPILE_STATUS))throw Error(e.getShaderInfoLog(l)||"shader compile failed");return l}function v({src:e,glass:l,glassBox:o,effect:r,video:s,film:i,className:n}){let u=(0,a.useRef)(null),c=(0,a.useRef)(null),[m,d]=(0,a.useState)([]),x=(0,a.useRef)(null);(0,a.useEffect)(()=>{x.current?.setZones(m)},[m]);let g=(0,a.useCallback)(e=>{u.current},[]),p=(0,a.useRef)(r);(0,a.useEffect)(()=>{p.current=r},[r]);let b=(0,a.useRef)(m);return(0,a.useEffect)(()=>{b.current=m},[m]),(0,a.useEffect)(()=>{let t=u.current,a=c.current;if(!t||!a)return;let r=function(e,t,a,l){let o,r,s,i,n,u,c,m=e.getContext("webgl",{antialias:!1,premultipliedAlpha:!0});if(!m)return null;try{if(o=m.createProgram(),m.attachShader(o,h(m,m.VERTEX_SHADER,f)),m.attachShader(o,h(m,m.FRAGMENT_SHADER,_)),m.linkProgram(o),!m.getProgramParameter(o,m.LINK_STATUS))throw Error("link failed")}catch{return null}m.useProgram(o),m.enable(m.BLEND),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA);let d=m.createBuffer();m.bindBuffer(m.ARRAY_BUFFER,d),m.bufferData(m.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),m.STATIC_DRAW);let v=m.getAttribLocation(o,"aPos");m.enableVertexAttribArray(v),m.vertexAttribPointer(v,2,m.FLOAT,!1,0,0);let x=()=>{m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MIN_FILTER,m.LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MAG_FILTER,m.LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_S,m.CLAMP_TO_EDGE),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_T,m.CLAMP_TO_EDGE)};function g(e){let t=m.createTexture();return m.activeTexture(m.TEXTURE0+e),m.bindTexture(m.TEXTURE_2D,t),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,1,1,0,m.RGBA,m.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),x(),t}let p=g(0),b=g(1),T=g(2),E=m.createTexture();m.activeTexture(m.TEXTURE0+3),m.bindTexture(m.TEXTURE_2D,E),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,((r=document.createElement("canvas")).width=r.height=256,(s=r.getContext("2d")).strokeStyle="#fff",s.fillStyle="#fff",s.lineCap="butt",i=(e,t)=>{s.save(),s.translate(e%4*64,64*Math.floor(e/4)),t(),s.restore()},n=(e,t,a,l,o)=>{s.lineWidth=o,s.beginPath(),s.moveTo(e,t),s.lineTo(a,l),s.stroke()},u=(e,t)=>{n(32-e/2,32,32+e/2,32,t),n(32,32-e/2,32,32+e/2,t)},c=(e,t)=>{s.lineWidth=5,s.beginPath(),s.moveTo(32,32-e),s.lineTo(32+e,32),s.lineTo(32,32+e),s.lineTo(32-e,32),s.closePath(),t?s.fill():s.stroke()},i(0,()=>{}),i(1,()=>s.fillRect(27,27,10,10)),i(2,()=>u(26,6)),i(3,()=>u(54,7)),i(4,()=>n(32,17,32,47,6)),i(5,()=>n(32,4,32,60,6)),i(6,()=>n(10,54,54,10,6)),i(7,()=>n(10,10,54,54,6)),i(8,()=>c(16,!1)),i(9,()=>c(14,!0)),i(10,()=>(()=>{for(let e=5;e<64;e+=10)for(let t=5;t<64;t+=10)s.fillRect(t-2,e-2,4,4)})()),i(11,()=>{n(12,24,52,24,5),n(12,40,52,40,5)}),i(12,()=>{n(14,14,50,50,6),n(50,14,14,50,6)}),i(13,()=>{s.lineWidth=5,s.strokeRect(19,19,26,26)}),i(14,()=>{for(let e=-1;e<=1;e++)s.fillRect(29+14*e,29,6,6)}),i(15,()=>n(10,32,54,32,6)),r)),x(),m.uniform1i(m.getUniformLocation(o,"uCar"),0),m.uniform1i(m.getUniformLocation(o,"uGlass"),1),m.uniform1i(m.getUniformLocation(o,"uCam"),2),m.uniform1i(m.getUniformLocation(o,"uGlyph"),3);let R=m.getUniformLocation(o,"uHasCam"),k=m.getUniformLocation(o,"uCamFit");m.uniform1f(R,0),m.uniform1f(k,1);let y=l??{x0:.15,y0:.06,x1:.87,y1:.36};if(m.uniform4f(m.getUniformLocation(o,"uGlassBox"),y.x0,y.y0,y.x1,y.y1),a){let e=new Image;e.onload=()=>{m.activeTexture(m.TEXTURE0+1),m.bindTexture(m.TEXTURE_2D,b),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,e),x()},e.src=a}let A=1,j=1,N=new Image;N.onload=()=>{A=N.naturalWidth,j=N.naturalHeight,m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D,p),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,N),x();let[e,t]=function(e){let t,a=document.createElement("canvas");a.width=a.height=128;let l=a.getContext("2d",{willReadFrequently:!0});if(!l)return[0,1];l.drawImage(e,0,0,128,128);try{t=l.getImageData(0,0,128,128).data}catch{return[0,1]}let o=[];for(let e=0;e<t.length;e+=4)t[e+3]>128&&o.push((.2126*t[e]+.7152*t[e+1]+.0722*t[e+2])/255);if(o.length<64)return[0,1];o.sort((e,t)=>e-t);let r=e=>o[Math.min(o.length-1,Math.floor(o.length*e))],s=r(.04),i=r(.96);return i-s<.08?[s,s+.08]:[s,i]}(N);m.uniform2f(X,e,t),H()},N.src=t;let B=m.getUniformLocation(o,"uRes"),F=m.getUniformLocation(o,"uFit"),L=m.getUniformLocation(o,"uCell"),W=m.getUniformLocation(o,"uGlyphs"),w=m.getUniformLocation(o,"uBloom"),C=m.getUniformLocation(o,"uCoverage"),U=m.getUniformLocation(o,"uDark"),S=m.getUniformLocation(o,"uGrain"),P=m.getUniformLocation(o,"uGlitch"),D=m.getUniformLocation(o,"uChroma"),X=m.getUniformLocation(o,"uLevels");m.uniform2f(X,0,1);let G=m.getUniformLocation(o,"uKey"),I=m.getUniformLocation(o,"uKeyOn");m.uniform3f(G,.875,.875,.875),m.uniform1f(I,0);let M=m.getUniformLocation(o,"uZones[0]"),z=new Float32Array(36);m.uniform3fv(M,z),m.uniform1f(m.getUniformLocation(o,"uZoneCell"),.85);let q=m.getUniformLocation(o,"uTime");m.uniform1f(m.getUniformLocation(o,"uMotion"),1),m.uniform1f(m.getUniformLocation(o,"uSpeed"),.08);let O=1,$=1,K=1;function H(){let e=O/$,t=A/j;m.uniform2f(F,t>e?1:t/e,t>e?e/t:1)}return{resize(t,a,l){O=Math.max(1,Math.round(t*l)),$=Math.max(1,Math.round(a*l)),K=l,e.width=O,e.height=$,m.viewport(0,0,O,$),m.uniform2f(B,O,$),H()},setVideo(e){if(!e||e.readyState<2||!e.videoWidth)return void m.uniform1f(R,0);m.activeTexture(m.TEXTURE0+2),m.bindTexture(m.TEXTURE_2D,T),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,!1),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,e),x();let t=(y.x1-y.x0)*A/Math.max((y.y1-y.y0)*j,1);m.uniform1f(k,e.videoWidth/e.videoHeight/t),m.uniform1f(R,1)},setFilm(e){if(e&&!(e.readyState<2)&&e.videoWidth&&(m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D,p),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,!1),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,e),x(),A!==e.videoWidth||j!==e.videoHeight)){A=e.videoWidth,j=e.videoHeight,H();let t=function(e){let t,a=document.createElement("canvas");a.width=a.height=128;let l=a.getContext("2d",{willReadFrequently:!0});if(!l)return null;try{l.drawImage(e,0,0,128,128)}catch{return null}try{t=l.getImageData(0,0,128,128).data}catch{return null}let o=(e,a)=>{let l=(128*a+e)*4;return[t[l]/255,t[l+1]/255,t[l+2]/255]},r=[o(1,1),o(126,1),o(1,126),o(126,126)],s=[0,1,2].map(e=>{let t=r.map(t=>t[e]).sort((e,t)=>e-t);return(t[1]+t[2])/2}),i=[];for(let e=0;e<t.length;e+=4){let a=t[e]/255,l=t[e+1]/255,o=t[e+2]/255;Math.hypot(a-s[0],l-s[1],o-s[2])>.105&&i.push(.2126*a+.7152*l+.0722*o)}if(i.length<64)return{key:s,lo:0,hi:1};i.sort((e,t)=>e-t);let n=e=>i[Math.min(i.length-1,Math.floor(i.length*e))],u=n(.04),c=n(.96);return{key:s,lo:u,hi:c-u<.08?u+.08:c}}(e);t&&(m.uniform3f(G,t.key[0],t.key[1],t.key[2]),m.uniform2f(X,t.lo,t.hi),m.uniform1f(I,1))}},setZones(e){z.fill(0);for(let t=0;t<Math.min(e.length,12);t++)z[3*t]=e[t].x,z[3*t+1]=e[t].y,z[3*t+2]=.19;m.uniform3fv(M,z)},draw(e,t){m.uniform1f(q,t),m.uniform1f(L,28*K),m.uniform1f(W,+!!e.glyphs),m.uniform1f(w,e.bloom),m.uniform1f(C,e.coverage),m.uniform1f(U,e.dark),m.uniform1f(S,e.grain),m.uniform1f(P,e.glitch),m.uniform1f(D,e.chroma),m.clearColor(0,0,0,0),m.clear(m.COLOR_BUFFER_BIT),m.drawArrays(m.TRIANGLES,0,3)},destroy(){m.deleteTexture(p),m.deleteTexture(b),m.deleteTexture(T),m.deleteTexture(E),m.deleteBuffer(d),m.deleteProgram(o)}}}(a,e,l,o);if(!r)return;x.current=r,r.setZones(b.current);let n=()=>r.resize(t.clientWidth,t.clientHeight,Math.min(window.devicePixelRatio||1,2));n();let m=0,d=performance.now(),v=e=>{i&&r.setFilm(i.current),r.setVideo(s.current),r.draw(p.current,(e-d)/1e3),m=requestAnimationFrame(v)};return m=requestAnimationFrame(v),window.addEventListener("resize",n),()=>{cancelAnimationFrame(m),r.destroy(),x.current=null,window.removeEventListener("resize",n)}},[e,l,o,s,i]),(0,t.jsx)("div",{ref:u,className:n,onPointerDown:g,onDoubleClick:()=>d([]),style:void 0,children:(0,t.jsx)("canvas",{ref:c,style:{width:"100%",height:"100%",display:"block"}})})}var x=e.i(19621);let g=["2027","MOVEMENTS","NAVIGATOR","MOVEMENTS"];function p(){return(0,t.jsx)("div",{className:x.default.run,children:Array.from({length:4},(e,a)=>g.map((e,l)=>(0,t.jsxs)("span",{className:x.default.item,children:[(0,t.jsx)("span",{className:x.default.word,children:e}),(0,t.jsx)("i",{className:x.default.dash})]},`${a}-${l}`)))})}function b({dir:e}){return(0,t.jsx)("div",{className:`${x.default.bar} ${"left"===e?x.default.top:x.default.bottom}`,"aria-hidden":"true",children:(0,t.jsxs)("div",{className:`${x.default.track} ${"left"===e?x.default.toLeft:x.default.toRight}`,children:[(0,t.jsx)(p,{}),(0,t.jsx)(p,{})]})})}var T=e.i(93209),E=e.i(46310);let R=[[-6,-2.25],[-3,.75],[0,3.75],[3,.75],[6,-2.25]],k=[[-3,-6],[0,-3],[3,0],[0,3],[-3,6]];function y({data:e,onBack:l}){let[o,r]=(0,a.useState)(d),[s,n]=(0,a.useState)(()=>Math.max(0,i.indexOf(e))),u=i[s]??e,c=function(){let e=(0,a.useRef)(null),[t,l]=(0,a.useState)("off"),o=(0,a.useCallback)(async()=>{l("asking");try{let t=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:960}},audio:!1}),a=document.createElement("video");a.srcObject=t,a.muted=!0,a.playsInline=!0,a.autoplay=!0,await a.play(),e.current=a,l("on")}catch{l("denied")}},[]);return(0,a.useEffect)(()=>()=>{e.current?.srcObject?.getTracks().forEach(e=>e.stop())},[]),{video:e,state:t,start:o}}(),{video:m,playing:f,t:_,dur:h,play:x,pause:g,seek:p}=function(e){let t=(0,a.useRef)(null),[l,o]=(0,a.useState)(!0),[r,s]=(0,a.useState)(0),[i,n]=(0,a.useState)(0);(0,a.useEffect)(()=>{let a=t.current;if(!a||!e)return;let l=()=>n(a.duration||0);return a.addEventListener("loadedmetadata",l),a.readyState>=1&&l(),()=>a.removeEventListener("loadedmetadata",l)},[e]),(0,a.useEffect)(()=>{if(!l)return;let e=0,a=()=>{let l=t.current;l&&s(l.currentTime),e=requestAnimationFrame(a)};return e=requestAnimationFrame(a),()=>cancelAnimationFrame(e)},[l]);let u=(0,a.useCallback)(()=>{t.current?.play().then(()=>o(!0)).catch(()=>o(!1))},[]),c=(0,a.useCallback)(()=>{t.current?.pause(),o(!1)},[]),m=(0,a.useCallback)(e=>{let a=t.current;a&&(a.pause(),a.currentTime=e,o(!1),s(e))},[]);return{video:t,playing:l,t:r,dur:i,play:u,pause:c,seek:m}}(u.front?.film),N=e=>t=>r(a=>({...a,[e]:t/100}));return(0,t.jsxs)("div",{className:E.default.page,children:[(0,t.jsx)(b,{dir:"left"}),(0,t.jsx)(b,{dir:"right"}),(0,t.jsx)("nav",{className:E.default.cases,children:i.map((e,a)=>(0,t.jsxs)("button",{type:"button",title:e.type,className:`${E.default.case} ${a===s?E.default.caseOn:""}`,onClick:()=>n(a),children:["RESULT ",String.fromCharCode(65+a)]},e.id))}),(0,t.jsxs)("div",{className:`${E.default.stack} ${u.front?.film?E.default.stackFilm:""}`,children:[l&&(0,t.jsx)("button",{type:"button",className:E.default.back,onClick:l,"aria-label":"뒤로",children:(0,t.jsx)("img",{src:(0,T.asset)("/figma/back.svg"),alt:""})}),(0,t.jsxs)("section",{className:E.default.card,children:[(0,t.jsxs)("div",{className:E.default.shot,children:[u.front&&(0,t.jsx)(v,{className:E.default.seat,src:(0,T.asset)(u.front.src),glass:u.front.glass?(0,T.asset)(u.front.glass):void 0,glassBox:u.front.box,effect:o,video:c.video,film:m}),(0,t.jsx)("div",{className:E.default.badge,children:(0,t.jsx)("img",{src:(0,T.asset)("/figma/kia.png"),alt:"Kia"})}),u.front?.glass&&"on"!==c.state&&(0,t.jsx)("button",{type:"button",className:E.default.allow,onClick:c.start,children:"asking"===c.state?"ASKING…":"denied"===c.state?"CAMERA BLOCKED":"▸ TURN ON CAMERA"})]}),u.front?.film&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("video",{ref:m,src:(0,T.asset)(u.front.film),muted:!0,loop:!0,playsInline:!0,autoPlay:!0,preload:"auto","aria-hidden":"true",style:{position:"absolute",width:1,height:1,opacity:0,pointerEvents:"none"}}),(0,t.jsxs)("div",{className:E.default.film,children:[(0,t.jsx)("button",{type:"button",className:E.default.play,onClick:f?g:x,"aria-label":f?"일시정지":"재생",children:f?(0,t.jsxs)("i",{className:E.default.pause,children:[(0,t.jsx)("span",{}),(0,t.jsx)("span",{})]}):(0,t.jsx)(j,{dots:k})}),(0,t.jsx)("input",{type:"range",className:E.default.seek,"aria-label":"재생 위치",min:0,max:Math.max(h,.01),step:.01,value:_,style:{"--fill":`${_/Math.max(h,.01)*100}%`},onChange:e=>p(Number(e.target.value))})]})]}),(0,t.jsxs)("div",{className:E.default.copy,children:[(0,t.jsxs)("div",{className:E.default.heads,children:[(0,t.jsx)("h1",{className:E.default.title,children:u.type}),(0,t.jsx)("span",{className:E.default.echo,children:u.echo})]}),(0,t.jsxs)("div",{className:E.default.lines,children:[(0,t.jsx)("p",{className:E.default.lead,children:u.tagline}),(0,t.jsx)("p",{className:E.default.action,children:u.action})]})]}),(0,t.jsxs)("div",{className:E.default.actions,children:[(0,t.jsxs)("button",{type:"button",className:`${E.default.act} ${E.default.save}`,children:[(0,t.jsx)(j,{dots:R}),"SAVE"]}),(0,t.jsxs)("button",{type:"button",className:`${E.default.act} ${E.default.share}`,children:[(0,t.jsx)(j,{dots:k}),"SHARE"]})]})]}),(0,t.jsxs)("aside",{className:E.default.panel,children:[(0,t.jsxs)("div",{className:E.default.group,children:[(0,t.jsx)("span",{className:E.default.chip,children:"STYLE"}),(0,t.jsx)("div",{className:`${E.default.bar} ${E.default.barTight}`,children:(0,t.jsxs)("div",{className:E.default.radios,children:[(0,t.jsxs)("button",{type:"button",className:E.default.radio,onClick:()=>r(e=>({...e,glyphs:!1})),children:[(0,t.jsx)("i",{className:o.glyphs?E.default.box:E.default.boxOn}),"BLOCK"]}),(0,t.jsxs)("button",{type:"button",className:E.default.radio,onClick:()=>r(e=>({...e,glyphs:!0})),children:[(0,t.jsx)("i",{className:o.glyphs?E.default.boxOn:E.default.box}),"GLYPHS"]})]})})]}),(0,t.jsx)(A,{label:"Bloom",v:o.bloom,on:N("bloom")}),(0,t.jsx)(A,{label:"Coverage",v:o.coverage,on:N("coverage")}),(0,t.jsx)(A,{label:"Dark cut-off",v:o.dark,on:N("dark")}),(0,t.jsx)(A,{label:"Grain",v:o.grain,on:N("grain")}),(0,t.jsx)(A,{label:"Chromatic split",v:o.chroma,on:N("chroma")}),(0,t.jsx)(A,{label:"Glitch",v:o.glitch,on:N("glitch"),bare:!0})]})]})]})}function A({label:e,v:a,on:l,bare:o}){let r=Math.round(100*a);return(0,t.jsxs)("div",{className:E.default.group,children:[(0,t.jsx)("span",{className:E.default.chip,children:e}),(0,t.jsx)("div",{className:E.default.bar,children:(0,t.jsx)("input",{type:"range",min:0,max:100,value:r,"aria-label":e,className:E.default.range,style:{"--fill":`${r}%`},onChange:e=>l(Number(e.target.value))})}),(0,t.jsxs)("span",{className:E.default.chip,children:[r,o?"":"%"]})]})}function j({dots:e}){return(0,t.jsx)("i",{className:E.default.icon,children:e.map(([e,a])=>(0,t.jsx)("span",{style:{left:`${(9+e)/18*100}%`,top:`${(9+a)/18*100}%`}},`${e}:${a}`))})}var N=e.i(20897);let B=["hero","ask","loading","result"],F=s.map(()=>null);e.s(["default",0,function(){let e=new URLSearchParams((0,a.useSyncExternalStore)(()=>()=>{},()=>window.location.search,()=>"")).get("step")??"",l=B.includes(e)?e:"hero",[r,s]=(0,a.useState)(null),n=r??l,[u,d]=(0,a.useState)(F),f=(0,a.useCallback)(e=>{d(e),s("loading")},[]);return(0,t.jsxs)(t.Fragment,{children:["hero"===n&&(0,t.jsx)(o,{onStart:()=>s("ask")}),"ask"===n&&(0,t.jsx)(c,{onDone:f}),"loading"===n&&(0,t.jsx)(m,{onDone:()=>s("result")}),"result"===n&&(0,t.jsx)(y,{data:i[0],answers:u,onBack:()=>s("ask")}),(0,t.jsx)("nav",{className:N.default.steps,children:B.map((e,a)=>(0,t.jsxs)("button",{type:"button",className:`${N.default.step} ${n===e?N.default.on:""}`,onClick:()=>s(e),children:[a+1," ",e]},e))})]})}],52683)},29483,e=>{e.v({inner:"Stage-module__Opo8sa__inner",slot:"Stage-module__Opo8sa__slot",slotLabel:"Stage-module__Opo8sa__slotLabel",stage:"Stage-module__Opo8sa__stage"})},26369,e=>{e.v({a:"Ask-module__8w8FFW__a",ask:"Ask-module__8w8FFW__ask",blink:"Ask-module__8w8FFW__blink",caret:"Ask-module__8w8FFW__caret",count:"Ask-module__8w8FFW__count",cursor:"Ask-module__8w8FFW__cursor",debug:"Ask-module__8w8FFW__debug",hint:"Ask-module__8w8FFW__hint",key:"Ask-module__8w8FFW__key",log:"Ask-module__8w8FFW__log",meta:"Ask-module__8w8FFW__meta",on:"Ask-module__8w8FFW__on",option:"Ask-module__8w8FFW__option",options:"Ask-module__8w8FFW__options",q:"Ask-module__8w8FFW__q",question:"Ask-module__8w8FFW__question",root:"Ask-module__8w8FFW__root",screen:"Ask-module__8w8FFW__screen",sys:"Ask-module__8w8FFW__sys",theme:"Ask-module__8w8FFW__theme"})},19621,e=>{e.v({bar:"Ticker-module__TPvsta__bar",bottom:"Ticker-module__TPvsta__bottom",dash:"Ticker-module__TPvsta__dash",item:"Ticker-module__TPvsta__item",run:"Ticker-module__TPvsta__run",toLeft:"Ticker-module__TPvsta__toLeft",toRight:"Ticker-module__TPvsta__toRight",top:"Ticker-module__TPvsta__top",track:"Ticker-module__TPvsta__track",word:"Ticker-module__TPvsta__word"})}]);