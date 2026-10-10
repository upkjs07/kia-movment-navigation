"""
carGL.ts 의 셰이더를 그대로 꺼내 스타일 단계를 한 판에 그려 보는 페이지를 만든다.

  python3 scripts/car-probe.py [차이미지경로]        기본값 /cars/pv5.png

스타일에 정확히 멈춘 상태와 그 사이 전환 중간을 번갈아 보여 준다. 손으로 셰이더를
복사해 두면 고칠 때마다 옛 버전이 남아 '안 바뀌었다' 고 착각하게 되므로 늘 여기서 뽑는다.

public/ 에 쓰므로 확인이 끝나면 지운다.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(HERE, "..", "src", "components", "v4", "carGL.ts")).read()
CAR = sys.argv[1] if len(sys.argv) > 1 else "/cars/pv5.png"

def grab(name):
    return SRC.split("const %s = `" % name, 1)[1].split("\n`;", 1)[0]

names = re.findall(r"'([A-Z]+)'", SRC.split("export const STYLES", 1)[1].split("]", 1)[0])
items = []
for k, n in enumerate(names):
    items.append([n, k / (len(names) - 1)])
    if k < len(names) - 1:
        items.append(["↓ 전환 중간", (k + 0.5) / (len(names) - 1)])

HTML = """<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#060607;display:flex;flex-wrap:wrap">
<script>
const VERT=__VERT__, FRAG=__FRAG__, ITEMS=__ITEMS__, CAR=__CAR__, PANELS=__PANELS__;
ITEMS.forEach(([name,st])=>{
  const wrap=document.createElement('div');
  wrap.style.cssText='width:33.33%;display:flex;flex-direction:column;align-items:center';
  const cv=document.createElement('canvas'); cv.width=560; cv.height=360;
  cv.style.cssText='width:100%;height:300px;display:block';
  const lab=document.createElement('div');
  lab.textContent=name;
  lab.style.cssText='color:'+(name[0]==='\\u2193'?'#5A5A5E':'#FF8A33')+';font:11px ui-monospace;padding:6px 0 14px;letter-spacing:.08em';
  wrap.append(cv,lab); document.body.append(wrap);
  const gl=cv.getContext('webgl',{antialias:false,premultipliedAlpha:true});
  const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);
    if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))document.title='COMPILE '+gl.getShaderInfoLog(x);return x;};
  const p=gl.createProgram();
  gl.attachShader(p,sh(gl.VERTEX_SHADER,VERT));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,FRAG));
  gl.linkProgram(p);gl.useProgram(p);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(p,'aPos');gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.uniform1i(gl.getUniformLocation(p,'uCar'),0);
  const im=new Image();
  im.onload=()=>{
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
    for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],
        [gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])
      gl.texParameteri(gl.TEXTURE_2D,k,v);
    const ca=cv.width/cv.height, ia=im.naturalWidth/im.naturalHeight;
    gl.uniform2f(gl.getUniformLocation(p,'uFit'), ia>ca?1:ia/ca, ia>ca?ca/ia:1);
    gl.uniform2f(gl.getUniformLocation(p,'uRes'),cv.width,cv.height);
    gl.uniform1f(gl.getUniformLocation(p,'uTime'),0);
    gl.uniform1f(gl.getUniformLocation(p,'uStyle'),st);
    gl.uniform3f(gl.getUniformLocation(p,'uBody'),0.957,0.957,0.949);
    gl.uniform1f(gl.getUniformLocation(p,'uPanels'),PANELS);
    gl.viewport(0,0,cv.width,cv.height);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,3);
  };
  im.src=CAR;
});
</script>"""

out = (HTML.replace("__VERT__", json.dumps(grab("VERT")))
           .replace("__FRAG__", json.dumps(grab("FRAG")))
           .replace("__ITEMS__", json.dumps(items))
           .replace("__CAR__", json.dumps(CAR))
           .replace("__PANELS__", re.search(r"const PANELS = ([0-9.]+)", SRC).group(1)))
open(os.path.join(HERE, "..", "public", "carprobe.html"), "w").write(out)
print("wrote public/carprobe.html  (%s · %d컷)" % (CAR, len(items)))
