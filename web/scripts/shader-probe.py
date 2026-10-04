"""
fieldGL.ts 의 셰이더와 q4Field.ts 의 값을 그대로 꺼내 혼자 도는 확인용 페이지를 만든다.

왜 필요한가: 헤드리스 크롬은 가상 시간에서 requestAnimationFrame 이 거의 돌지
않아, 실제 앱을 찍으면 프레임이 없어 화면이 비어 나온다. 이 페이지는 rAF 없이
한 번만 그려서 셰이더 자체가 맞는지만 본다.

  python3 scripts/shader-probe.py
  chrome --headless --enable-unsafe-swiftshader --force-device-scale-factor=1 \
    --window-size=1808,998 --virtual-time-budget=4000 \
    --screenshot=out.png "http://localhost:3000/shaderprobe.html?v=1"

  ?v=  -1(왼쪽 끝) ‥ 0(가만히) ‥ 1(오른쪽 끝)
  &melt= &jitter= &pixel= &grain= &noise=   효과 세기 0‥1
  &shape=capsule            Q2 캡슐로 (기본은 모래시계)

WebGL 이 켜지는 플래그를 써야 한다. --disable-gpu 나 --use-gl=swiftshader 는
컨텍스트를 아예 null 로 만든다.

public/ 에 쓰므로 확인이 끝나면 지운다. 빌드에 끼어 들어가면 안 된다.
"""

import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = open(os.path.join(HERE, "..", "src", "components", "fieldGL.ts")).read()
DAT  = open(os.path.join(HERE, "..", "src", "components", "q4Field.ts")).read()

def shader(name):
    body = SRC.split("const %s = `" % name, 1)[1].split("\n`;", 1)[0]
    for k, v in re.findall(r"^const (NB) = (\d+);", SRC, re.M):
        body = body.replace("${%s}" % k, v)
    if "${" in body:
        sys.exit("셰이더에 안 채워진 자리가 있다")
    return body

def nums(block):
    return [float(x) for x in re.findall(r"-?\d+\.?\d*(?:e-?\d+)?", block)]

def grab(var):
    body = DAT.split("const %s" % var, 1)[1].split("[", 1)[1].split("];", 1)[0]
    return body

prof  = {s: nums(grab("PROFILE_" + s)) for s in ("L", "R")}

# Q2 캡슐 색은 page.tsx 에 있다. OKLab 으로 바꿔 함께 넘긴다.
from palette import srgb_to_oklab
PAGE = open(os.path.join(HERE, "..", "src", "app", "page.tsx")).read()
_rings = re.findall(r"#[0-9A-Fa-f]{6}", PAGE.split("rings:", 1)[1].split("]", 1)[0])
_lead  = re.search(r"lead:\s*'(#[0-9A-Fa-f]{6})'", PAGE).group(1)
_hx = lambda h: (int(h[1:3],16)/255, int(h[3:5],16)/255, int(h[5:7],16)/255)
cap  = [list(srgb_to_oklab(_hx(h))) for h in _rings]
lead = list(srgb_to_oklab(_hx(_lead)))
blobs = [nums(r) for r in re.findall(r"\[([^\]]+)\]", grab("BLOBS"))]

HTML = """<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#000"><canvas id="c" width=1808 height=998></canvas>
<pre id="o" style="position:fixed;left:8px;top:8px;color:#0f0;font:16px monospace"></pre>
<script>
const DATA = __DATA__, VERT = __VERT__, FRAG = __FRAG__;
const o = document.getElementById('o');
window.onerror = (m,_s,l,c) => { o.textContent += 'JSERROR '+m+' @'+l+':'+c+'\\n'; };
const Q = new URLSearchParams(location.search);
const V = parseFloat(Q.get('v') || '0');
const SHAPE = Q.get('shape') === 'capsule' ? 1 : 2;
const FX = {melt:+(Q.get('melt')||0), jitter:+(Q.get('jitter')||0), pixel:+(Q.get('pixel')||0),
            grain:+(Q.get('grain')||0), noise:+(Q.get('noise')||0)};
const cv = document.getElementById('c');
const gl = cv.getContext('webgl', {antialias:false, alpha:false, preserveDrawingBuffer:true});
o.textContent += 'ctx=' + (gl ? 'ok' : 'NULL') + '\\n';
o.textContent += 'uniform vectors=' + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) + '\\n';
function sh(t,src){ const x=gl.createShader(t); gl.shaderSource(x,src); gl.compileShader(x);
  if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)) o.textContent+='COMPILE '+gl.getShaderInfoLog(x)+'\\n';
  return x; }
const p = gl.createProgram();
gl.attachShader(p, sh(gl.VERTEX_SHADER,VERT)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER,FRAG));
gl.linkProgram(p);
if(!gl.getProgramParameter(p,gl.LINK_STATUS)) o.textContent+='LINK '+gl.getProgramInfoLog(p)+'\\n';
gl.useProgram(p);
const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const a=gl.getAttribLocation(p,'aPos'); gl.enableVertexAttribArray(a);
gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
const t=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,t);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
gl.uniform1i(gl.getUniformLocation(p,'uRamp'),0);
gl.uniform1f(gl.getUniformLocation(p,'uShape'),SHAPE);   // 1 = 캡슐, 2 = 모래시계
DATA.cap.forEach((c,i)=>gl.uniform3f(gl.getUniformLocation(p,`uCap[${i}]`),c[0],c[1],c[2]));
gl.uniform3f(gl.getUniformLocation(p,'uLead'),DATA.lead[0],DATA.lead[1],DATA.lead[2]);
for (const s of ['L','R']) {
  const pr = DATA.profile[s];
  for (let i=0;i<3;i++) gl.uniform4f(gl.getUniformLocation(p,`uPoly${s}[${i}]`),
    pr[i*4],pr[i*4+1],pr[i*4+2],pr[i*4+3]);
}
DATA.blobs.forEach((bl,k)=>{
  gl.uniform4f(gl.getUniformLocation(p,`uBlob[${k}]`),bl[0],bl[1],bl[2],bl[3]);
  gl.uniform3f(gl.getUniformLocation(p,`uCol[${k}]`),bl[4],bl[5],bl[6]);
});
gl.uniform2f(gl.getUniformLocation(p,'uRes'),cv.width,cv.height);
gl.uniform1f(gl.getUniformLocation(p,'uTime'),0);
gl.uniform1f(gl.getUniformLocation(p,'uValue'),V);
gl.uniform1f(gl.getUniformLocation(p,'uMelt'),FX.melt);
gl.uniform1f(gl.getUniformLocation(p,'uJitter'),FX.jitter);
gl.uniform1f(gl.getUniformLocation(p,'uPixel'),FX.pixel);
gl.uniform1f(gl.getUniformLocation(p,'uGrain'),FX.grain);
gl.uniform1f(gl.getUniformLocation(p,'uNoise'),FX.noise);
gl.viewport(0,0,cv.width,cv.height);
gl.drawArrays(gl.TRIANGLES,0,3);
o.textContent += 'drew v='+V+' fx='+JSON.stringify(FX)+' glError='+gl.getError()+'\\n';
</script>"""

out = (HTML.replace("__DATA__", json.dumps({"profile": prof, "blobs": blobs, "cap": cap, "lead": lead}))
           .replace("__VERT__", json.dumps(shader("VERT")))
           .replace("__FRAG__", json.dumps(shader("FRAG"))))
open(os.path.join(HERE, "..", "public", "shaderprobe.html"), "w").write(out)
print("wrote public/shaderprobe.html  (blobs %d)" % len(blobs))
