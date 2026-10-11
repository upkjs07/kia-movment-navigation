"""
carGL.ts 의 셰이더를 그대로 꺼내, 손잡이 값을 달리한 판을 나란히 그려 보는 페이지.

  python3 scripts/fx-probe.py '[["이름", {"uBloom": 1.0}], ...]' [그림경로]

헤드리스 브라우저에서는 rAF 가 거의 돌지 않아 화면 캡처로 효과를 비교하기 어렵다.
여기서는 값을 고정해 한 번씩만 그리므로 비교가 된다. 셰이더를 손으로 베껴 두면
고칠 때마다 옛 버전을 보게 되므로 늘 파일에서 꺼낸다.

public/ 에 쓰므로 확인이 끝나면 지운다.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(HERE, '..', 'src', 'components', 'v4', 'carGL.ts')).read()
CASES = json.loads(sys.argv[1]) if len(sys.argv) > 1 else [['기본', {}]]
IMG = sys.argv[2] if len(sys.argv) > 2 else '/cars/sheep.png'


def grab(name):
    return SRC.split('const %s = `' % name, 1)[1].split('\n`;', 1)[0]


def num(name):
    """carGL.ts 의 상수를 그대로 꺼낸다 — 프로브에 숫자를 적어 두면 소스를 고친 뒤에도
    옛 값으로 그려서 '안 바뀌었다' 고 착각한다. 실제로 두 번 그랬다."""
    return SRC.split('const %s = ' % name, 1)[1].split(';', 1)[0].strip()


def atlas_js():
    """glyphAtlas() 를 파일에서 그대로 꺼내 JS 로 바꾼다.

    여기에 표식을 손으로 베껴 두었더니, 아틀라스를 고친 뒤에도 프로브는 옛 표식을
    그려서 '안 바뀌었다' 고 착각했다. 셰이더와 같은 규칙 — 늘 원본에서 꺼낸다.
    """
    i = SRC.index('function glyphAtlas()')
    d, j = 0, SRC.index('{', i)
    for k in range(j, len(SRC)):
        if SRC[k] == '{':
            d += 1
        elif SRC[k] == '}':
            d -= 1
            if d == 0:
                body = SRC[i:k + 1]
                break
    body = re.sub(r'\)\s*:\s*HTMLCanvasElement', ')', body)
    body = re.sub(r'(\w+)\s*:\s*number', r'\1', body)
    body = re.sub(r'fn\s*:\s*\(\)\s*=>\s*void', 'fn', body)
    body = re.sub(r'(\w+)\s*:\s*boolean', r'\1', body)
    body = body.replace("getContext('2d')!", "getContext('2d')")
    return body


TPL = r"""<!doctype html><meta charset=utf-8>
<body style="margin:0;background:#e0e0e0;display:flex;flex-wrap:wrap;gap:3px"><script>
const FRAG=__FRAG__, VERT=__VERT__, CASES=__CASES__, IMG=__IMG__;
__ATLAS__
const img=new Image(); img.onload=()=>CASES.forEach(c=>draw(c[0],c[1])); img.src=IMG;
function draw(name,over){
  const S=360, cv=document.createElement('canvas'); cv.width=cv.height=S;
  const w=document.createElement('div'); w.style.cssText='position:relative'; w.appendChild(cv);
  const t=document.createElement('b'); t.textContent=name;
  t.style.cssText='position:absolute;left:3px;top:2px;font:12px monospace;background:#000;color:#fff;padding:1px 4px;z-index:2';
  w.appendChild(t); document.body.appendChild(w);
  const gl=cv.getContext('webgl',{antialias:false,premultipliedAlpha:true});
  const mk=(ty,src)=>{const sh=gl.createShader(ty);gl.shaderSource(sh,src);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.log('SHADER FAIL '+gl.getShaderInfoLog(sh));return sh;};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,VERT));
  gl.attachShader(p,mk(gl.FRAGMENT_SHADER,FRAG));gl.linkProgram(p);gl.useProgram(p);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(p,'aPos');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const par=()=>{for(const kv of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],
    [gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,kv[0],kv[1]);};
  /* 아틀라스는 carGL.ts 에서 꺼낸 glyphAtlas() 를 쓴다 (페이지 맨 위에 붙는다) */
  const ac = glyphAtlas();
  [[1,null],[2,null],[3,ac]].forEach(function(e){
    const tt=gl.createTexture();gl.activeTexture(gl.TEXTURE0+e[0]);gl.bindTexture(gl.TEXTURE_2D,tt);
    if(e[1]){gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,e[1]);}
    else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
    par();});
  const tx=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);par();
  const U=n=>gl.getUniformLocation(p,n);
  const base={uBloom:0.20,uCoverage:0.50,uDark:0.60,uGrain:0.30,uGlitch:0,uChroma:0,uGlyphs:0,
              uCell:28,uTime:0,uMotion:0,uSpeed:0,uHasCam:0,uZoneCell:__ZONECELL__};
  Object.assign(base,over);
  gl.uniform1i(U('uCar'),0);gl.uniform1i(U('uGlass'),1);gl.uniform1i(U('uCam'),2);gl.uniform1i(U('uGlyph'),3);
  gl.uniform2f(U('uRes'),S,S);gl.uniform2f(U('uFit'),1,1);gl.uniform2f(U('uLevels'),0.42,0.83);
  /* 배열 uniform(찍은 구역)은 따로 넣는다 */
  const zb = new Float32Array(36);
  (over.zones || []).slice(0,12).forEach(function(z,i){ zb[i*3]=z[0]; zb[i*3+1]=z[1]; zb[i*3+2]=z[2]||__ZONER__; });
  gl.uniform3fv(U('uZones[0]'), zb);
  delete base.zones;
  for(const k in base) gl.uniform1f(U(k),base[k]);
  gl.viewport(0,0,S,S);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
}
</script>"""

html = (TPL.replace('__FRAG__', json.dumps(grab('FRAG')))
           .replace('__VERT__', json.dumps(grab('VERT')))
           .replace('__CASES__', json.dumps(CASES, ensure_ascii=False))
           .replace('__IMG__', json.dumps(IMG))
           .replace('__ATLAS__', atlas_js())
           .replace('__ZONECELL__', num('ZONE_CELL'))
           .replace('__ZONER__', num('ZONE_R')))
out = os.path.join(HERE, '..', 'public', 'fx-probe.html')
open(out, 'w').write(html)
print('→ http://localhost:3000/fx-probe.html  (%d판)' % len(CASES))
