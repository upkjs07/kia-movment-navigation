"""
레퍼런스 이미지 한 장에서 Q4 모래시계 배경의 수식을 뽑아 src/components/q4Field.ts 를 쓴다.

  python3 scripts/bake-field.py <레퍼런스.png>        (몇 분 걸린다)

세 단계다.

1. 실루엣 — 바깥에서 안으로 훑어 잎의 경계를 찾는다. '열 최대 밝기의 50%' 로 찾으면
   왼쪽 잎의 어두운 중심에서 멈춰 버리므로 쓰지 않는다.

   맞출 때는 half(u) = h0 + ∫₀ᵘ q(t)² dt 로 둔다. 적분 대상이 제곱이라 음수가 될 수
   없어 결과가 구조적으로 단조다. 그냥 최소제곱으로 맞추면 오차가 1px 안쪽이어도
   허리에서 기울기가 뒤집혀(오른쪽 잎이 14.3 → 13.3 → 16.5) 중앙 바로 옆에 가짜 목이
   생기고, 그 사이가 모서리 선 작은 색 덩어리로 보인다.

2. 색 — 잎을 (허리→끝, 중심선→경계) 로 편 표를 메모리에 만들고, 그걸 (u,v) 평면 위의
   색 덩어리 10개로 근사한다. 레퍼런스의 색은 '허리→끝' 한 줄짜리 그라데이션이 아니다.
   왼쪽 잎은 어두운 자주색 덩어리를 청록 고리가 감싸고 있어서 한 방향 램프로는 안 된다.

   덩어리 색은 반드시 0‥255 로 묶어서 푼다. 픽셀 색이 덩어리들의 가중 평균이므로 이
   상한만 지키면 결과도 범위 안에 있다. 안 묶으면 최소제곱이 서로 상쇄하는 거대한
   양수·음수 쌍(rgb(1705,…) 과 rgb(-1414,…))을 집어 RMS 만 낮춘다. 잰 자리에서는
   맞지만 덩어리를 움직이는 순간 상쇄가 깨져 색이 터진다 — 하필 우리가 하려는 동작이다.

3. 결과를 TS 로 쓴다. 텍스처가 아니라 수식이라 화면을 키워도 뭉개지지 않는다.

레퍼런스를 바꾸면 WAIST / CY 를 다시 재야 한다.
"""

from PIL import Image, ImageFilter
import numpy as np
import os, sys
from scipy.optimize import least_squares, minimize, lsq_linear

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palette import colour_at, streak_blobs

np.random.seed(11)

SRC = sys.argv[1] if len(sys.argv) > 1 else None
if not SRC or not os.path.exists(SRC):
    sys.exit("레퍼런스 이미지 경로를 달라:  python3 scripts/bake-field.py <이미지>")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.join(HERE, "..", "src", "components", "q4Field.ts")

im   = Image.open(SRC).convert("RGB")
a    = np.asarray(im).astype(np.float64)                                   # 실루엣용
soft = np.asarray(im.filter(ImageFilter.GaussianBlur(2.0))).astype(np.float64)  # 색용
H, W, _ = a.shape
lum = a.max(axis=2)

WAIST, CY, TH = 891, 496.0, 16.0        # 허리 x, 중심선 y, 실루엣 임계 밝기
SPAN = {"L": WAIST, "R": W - 1 - WAIST}
SGN  = {"L": -1, "R": +1}
NB, VC = 10, 0.93                       # 덩어리 수 / 이 위로는 색을 붙들어 둔다

# ── 1. 실루엣 ────────────────────────────────────────────────────────────────
def edge_at(x):
    c = lum[:, x]; hs = []; clipped = False
    for s in (-1, 1):
        kmax = int(CY) if s < 0 else H - 1 - int(CY)
        prev = hit = None
        for k in range(kmax, -1, -1):
            v = c[int(round(CY + s * k))]
            if v >= TH:
                if prev is None: clipped = True; hit = float(kmax)
                else: hit = k + (v - TH) / max(v - prev, 1e-6)
                break
            prev = v
        hs.append(0.0 if hit is None else hit)
    return clipped, (hs[0] + hs[1]) / 2.0

raw = {}
for n in ("L", "R"):
    vals, cls = [], []
    for i in range(SPAN[n] + 1):
        c, h = edge_at(WAIST + SGN[n] * i); vals.append(h); cls.append(c)
    v = np.array(vals); last = None
    for i in range(len(v)):                       # 프레임에 잘린 열은 직전 값으로
        if cls[i] and last is not None: v[i] = last
        else: last = v[i]
    k = 21
    raw[n] = np.convolve(np.pad(v, (k//2, k//2), mode="edge"), np.ones(k)/k, mode="valid") / H

NQ = 6
def integ(p):
    """p = [h0, q0..q5] → half(u) 다항식 계수(높은 차수부터). 11차, vec4 3개에 딱 맞다."""
    q  = np.array(p[1:]); sq = np.convolve(q, q)
    return np.concatenate([[p[0]], sq / np.arange(1, len(sq) + 1)])[::-1]

poly = {}
for n in ("L", "R"):
    y = raw[n]; u = np.linspace(0, 1, len(y))
    p0 = np.concatenate([[y[0]], np.full(NQ, np.sqrt(max(y[-1] - y[0], 1e-6)))])
    r  = least_squares(lambda p: (np.polyval(integ(p), u) - y) / np.maximum(y, 1e-4),
                       p0, max_nfev=20000)
    c  = integ(r.x); rec = np.polyval(c, u); e = np.abs(rec - y) * H
    assert np.all(np.diff(rec) > -1e-12), "%s 실루엣이 단조가 아니다" % n
    print("실루엣 %s  최대 %.2fpx  허리 %.2fpx  단조 O" % (n, e.max(), e[:len(u)//20].max()))
    poly[n] = np.concatenate([np.zeros(12 - len(c)), c])

# ── 2. 색 ───────────────────────────────────────────────────────────────────
# 잎마다 따로 맞추지 않는다. u 를 부호 있는 값(-1 왼쪽 끝 ‥ 0 허리 ‥ +1 오른쪽 끝)으로
# 두고 한 벌로 맞춘다. 따로 맞추면 두 벌이 허리에서 같은 열을 보는데도 서로 다른 색에
# 안착하고(실측 61/255 차이), 셰이더가 그 차이를 좁은 띠에서 메우느라 기울기가 급변해
# 중앙 좌우로 희미한 세로 선 두 개가 남는다. 한 벌이면 허리 색이 애초에 하나뿐이다.
def bilerp(src, x, y):
    if y < 0 or y > H-1 or x < 0 or x > W-1: return np.zeros(3)
    x0, y0 = int(np.floor(x)), int(np.floor(y))
    x1, y1 = min(x0+1, W-1), min(y0+1, H-1); fx, fy = x-x0, y-y0
    return ((src[y0,x0]*(1-fx)+src[y0,x1]*fx)*(1-fy) + (src[y1,x0]*(1-fx)+src[y1,x1]*fx)*fy)

NBLOB  = 20
GU, GV = 192, 48
us = np.linspace(-1, 1, GU); vs = np.linspace(0, 1, GV)
UU, VV = np.meshgrid(us, vs); FU, FV = UU.ravel(), VV.ravel()

def half_px(n, t):
    x  = t * SPAN[n]
    i0 = int(np.floor(x)); i1 = min(i0+1, SPAN[n]); f = x - i0
    return max(raw[n][i0]*(1-f) + raw[n][i1]*f, 1.0/H) * H

T = np.zeros((GV, GU, 3)); area = np.zeros(GU)
for i, su in enumerate(us):
    n = "R" if su >= 0 else "L"
    t = abs(su)
    h = half_px(n, t); area[i] = h
    sx = WAIST + SGN[n] * t * SPAN[n]
    for j, v in enumerate(vs):
        vq = min(v, VC)
        T[j, i] = (bilerp(soft, sx, CY - vq*h) + bilerp(soft, sx, CY + vq*h)) / 2
T  = T.reshape(-1, 3)
sw = np.sqrt(np.repeat(area[None, :], GV, axis=0).ravel())

def weights(p):
    q  = p.reshape(NBLOB, 4)
    du = (FU[:, None] - q[:, 0]) / np.exp(q[:, 2])
    dv = (FV[:, None] - q[:, 1]) / np.exp(q[:, 3])
    w  = np.exp(-(du*du + dv*dv))
    return w / np.maximum(w.sum(axis=1, keepdims=True), 1e-12)

def crowd(p):
    """덩어리끼리 겹쳐 앉으면 벌점 — 상쇄 해가 생길 자리를 없앤다"""
    q = p.reshape(NBLOB, 4)[:, :2]
    d = np.sqrt(((q[:, None, :] - q[None, :, :])**2).sum(-1)) + np.eye(NBLOB)*9
    return float(np.clip(0.08 - d, 0, None).sum()) * 120.0

def score(p, exact=False):
    A = weights(p) * sw[:, None]; Y = T * sw[:, None]
    if exact:
        C = np.column_stack([lsq_linear(A, Y[:, c], bounds=(0, 255), method="bvls").x
                             for c in range(3)])
    else:
        G = A.T @ A + np.eye(NBLOB) * 1e-4 * np.trace(A.T @ A) / NBLOB
        C = np.clip(np.linalg.solve(G, A.T @ Y), 0, 255)
    r = A @ C - Y
    return C, float(np.sqrt((r*r).sum() / (sw*sw).sum() / 3)) + crowd(p)

best = None
for t in range(3):
    p0 = np.column_stack([
        np.linspace(-0.97, 0.97, NBLOB) + np.random.randn(NBLOB)*0.04,
        np.random.rand(NBLOB)*0.9,
        np.log(0.14 + np.random.rand(NBLOB)*0.08),
        np.log(0.28 + np.random.rand(NBLOB)*0.14)])
    bnd = [(-1.2,1.2), (-0.25,1.25), (np.log(0.07),np.log(0.8)), (np.log(0.12),np.log(1.4))]*NBLOB
    r = minimize(lambda p: score(p)[1], p0.ravel(), method="L-BFGS-B",
                 bounds=bnd, options=dict(maxiter=400))
    print("  시도 %d  %.2f" % (t+1, r.fun), flush=True)
    if best is None or r.fun < best[0]: best = (r.fun, r.x)

C, e = score(best[1], exact=True)
assert C.min() >= -1e-6 and C.max() <= 255 + 1e-6, "덩어리 색이 범위를 벗어났다"
q = best[1].reshape(NBLOB, 4)
print("자리 맞춤 %d개  RMS %.2f/255  (색은 아래에서 갈아 끼운다)" % (NBLOB, e))

# 맞춘 건 '자리' 만 쓴다. 색은 palette.py 로 다시 칠한다 — 레퍼런스를 그대로 베끼지
# 않으려는 것이고, 무드 이미지에서 고른 따뜻한 중심 → 핑크 → 보라 → 파랑 차례를 쓴다.
BLOBS = [(q[i,0], q[i,1], np.exp(q[i,2]), np.exp(q[i,3]),
          *colour_at(float(q[i,0]), float(q[i,1]))) for i in range(NBLOB)]
BLOBS += streak_blobs()        # 오른쪽 잎의 옅은 쐐기 — 맞춘 자리에는 능선 위 덩어리가 없다

# 허리 좌우 극한이 같은지 — 한 벌이라 정의상 같아야 한다 (회귀 방지용)
def colour_of(u, v):
    b = np.array(BLOBS)
    du = (u - b[:, 0]) / b[:, 2]; dv = (v - b[:, 1]) / b[:, 3]
    w = np.exp(-(du*du + dv*dv))
    return (w[:, None] * b[:, 4:7]).sum(0) / max(w.sum(), 1e-9) * 255

gap = max(float(np.abs(colour_of(-1e-4, v) - colour_of(1e-4, v)).max())
          for v in np.linspace(0, 1, 40))
print("허리 좌우 색차 최대 %.2f/255  %s" % (gap, "OK" if gap < 1 else "← 이상하다"))

# ── 3. TS 로 쓴다 ────────────────────────────────────────────────────────────
L = ["/**",
     " * Q4 모래시계 배경의 생김새. 레퍼런스 이미지를 재서 수식으로 맞춘 값이다.",
     " * scripts/bake-field.py 가 만든다 — 손으로 고치지 말 것.",
     " *",
     " * 텍스처가 아니라 수식이라 화면을 아무리 키워도 뭉개지지 않고, 색을 움직이는 것도",
     " * '표를 민다' 가 아니라 '어느 좌표의 색을 볼지' 를 바꾸는 일이라 끊기는 자리가 없다.",
     " */", "",
     "import type { FieldShape } from './SpectralField';", "",
     "/* 실루엣 반높이 ÷ 화면높이. 11차, Horner 로 돌리려고 vec4 3개(12칸)에 맞췄다.",
     "   h0 + ∫q(t)²dt 로 맞춰서 '커지기만 하는' 게 보장된다 — 그냥 맞추면 오차가 1px",
     "   안쪽이어도 허리에서 기울기가 뒤집혀 가짜 목이 생긴다. */"]
for n in ("L", "R"):
    L.append("const PROFILE_%s = [" % n)
    for r in range(3):
        L.append("  " + ", ".join("%.6f" % v for v in poly[n][r*4:(r+1)*4]) + ",")
    L.append("];")
L += ["",
      "/* 색 덩어리 — [중심u, 중심v, 반경u, 반경v, L, a, b]. 색은 OKLab 이다 —",
      "   u 는 부호가 있다: -1 왼쪽 끝 ‥ 0 허리 ‥ +1 오른쪽 끝. 잎마다 따로 두지 않는",
      "   이유는 허리에서 색이 하나로 정해지게 하려는 것이다 — 두 벌이면 같은 자리에",
      "   서로 다른 색이 생겨 중앙에 세로 선이 남는다.",
      "   sRGB 로 스물넷을 평균 내면 회색 쪽으로 끌려가 탁해진다. */",
      "const BLOBS: number[][] = ["]
for b_ in BLOBS:
    L.append("  [%7.4f, %7.4f, %6.4f, %6.4f,  %.4f, %.4f, %.4f]," % b_)
L.append("];")
L += ["", "export const Q4_FIELD: FieldShape = {",
      "  profile: [PROFILE_L, PROFILE_R],", "  blobs: BLOBS,", "};", ""]
open(OUT, "w").write("\n".join(L))
print("wrote src/components/q4Field.ts")
