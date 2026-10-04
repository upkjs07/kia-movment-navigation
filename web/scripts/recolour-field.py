"""
q4Field.ts 의 덩어리 '색' 만 palette.py 로 다시 칠한다. 자리와 반경은 건드리지 않는다
— 그건 레퍼런스에서 맞춘 구조고, 바꾸려는 건 색뿐이다.

  python3 scripts/recolour-field.py

전체를 다시 굽는(bake-field.py) 것보다 빠르고, bake 도 같은 palette.py 를 쓴다.
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from palette import colour_at, streak_blobs

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "components", "q4Field.ts")
s = open(P).read()
head, rest = s.split("const BLOBS: number[][] = [", 1)
body, tail = rest.split("];", 1)

rows = re.findall(r"\[([^\]]+)\]", body)
# 앞의 20개가 '맞춘 자리' 고 뒤는 쐐기다. 쐐기는 매번 새로 붙이므로 잘라낸다 —
# 안 그러면 두 번 돌릴 때마다 쐐기가 쌓인다.
rows = rows[:20]
out = []
for r in rows:
    n = [float(x) for x in r.split(",")]
    u, v, ru, rv = n[0], n[1], n[2], n[3]
    cl, ca, cb = colour_at(u, v)   # OKLab
    out.append("  [%7.4f, %7.4f, %6.4f, %6.4f,  %.4f, %.4f, %.4f]," % (u, v, ru, rv, cl, ca, cb))
for b in streak_blobs():                       # 오른쪽 잎의 옅은 쐐기
    out.append("  [%7.4f, %7.4f, %6.4f, %6.4f,  %.4f, %.4f, %.4f]," % b)
assert len(out) == 24, "덩어리가 24개가 아니다: %d" % len(out)

open(P, "w").write(head + "const BLOBS: number[][] = [\n" + "\n".join(out) + "\n];" + tail)
print("덩어리 %d개 (맞춘 20 + 쐐기 4)" % len(out))
for r in out[:4]:
    print("  " + r.strip())
