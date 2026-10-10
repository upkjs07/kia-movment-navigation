"""
결과 카드에 쓰는 그림에서 배경을 따낸다.

  python3 scripts/cutout.py <입력.png> <출력.png>

가장자리에서 배경색을 따라 흘려보내 바깥을 찾는다. 전체를 색으로 거르면 양의
밝은 털처럼 배경과 비슷한 안쪽까지 날아가므로, 연결된 바깥만 지운다.

알파를 0/255 로만 주면 안 된다. 그림의 가장자리는 배경과 부드럽게 섞여 있어서,
배경과 10~60 밖에 차이 나지 않는 띠가 통째로 불투명하게 살아남는다. 그 띠는
셰이더에서 '밝기가 낮은 주체' 로 읽혀 옅은 유령 윤곽으로 나타난다 — 실제로 그렇게
보였다. 그래서 지운 자리 둘레 FEATHER 픽셀 안에서는 배경과 얼마나 다른지에 따라
알파를 서서히 올린다.
"""
import sys
from collections import deque
from PIL import Image

TOL = 26        # 바깥을 흘려보낼 때 배경으로 칠 최대 차이
FEATHER = 3     # 지운 자리에서 이만큼 안쪽까지 알파를 재계산한다
LO, HI = 8, 40  # 이 사이에서 알파가 0 → 255 로 오른다

# 띠를 넓게(8px) 잡았더니 그림 자체의 밝은 테두리까지 반투명해졌고, Bloom 을 높이면
# 그 테두리가 밝게 살아나 연필로 그린 윤곽선처럼 보였다. 띠는 경계의 안티에일리어싱
# 폭(2~3px)만 덮으면 된다 — 그 안쪽은 그림이지 배경이 아니다.


def cutout(src_path: str, out_path: str) -> None:
    im = Image.open(src_path).convert('RGBA')
    W, H = im.size
    px = im.load()
    bg = px[0, 0][:3]

    def diff(c):
        return max(abs(c[i] - bg[i]) for i in range(3))

    # ── 바깥 찾기 ──────────────────────────────────────────────────────────
    out = bytearray(W * H)
    q = deque()
    def seed(x, y):
        if not out[y * W + x] and diff(px[x, y][:3]) <= TOL:
            out[y * W + x] = 1
            q.append((x, y))
    for x in range(W):
        seed(x, 0); seed(x, H - 1)
    for y in range(H):
        seed(0, y); seed(W - 1, y)
    while q:
        x, y = q.popleft()
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < W and 0 <= ny < H:
                seed(nx, ny)

    # ── 지운 자리 둘레 띠 ──────────────────────────────────────────────────
    # 바깥에서 FEATHER 번 부풀린다. 거기 걸리는 픽셀만 알파를 다시 매긴다.
    near = bytearray(out)
    ring = [(x, y) for y in range(H) for x in range(W) if out[y * W + x]]
    for _ in range(FEATHER):
        nxt = []
        for x, y in ring:
            for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                if 0 <= nx < W and 0 <= ny < H and not near[ny * W + nx]:
                    near[ny * W + nx] = 1
                    nxt.append((nx, ny))
        ring = nxt

    res = im.copy()
    rp = res.load()
    faded = 0
    for y in range(H):
        for x in range(W):
            i = y * W + x
            r, g, b, a = px[x, y]
            if out[i]:
                rp[x, y] = (r, g, b, 0)
            elif near[i]:
                d = diff((r, g, b))
                t = 0.0 if d <= LO else 1.0 if d >= HI else (d - LO) / (HI - LO)
                na = int(round(a * t))
                if na < a:
                    faded += 1
                rp[x, y] = (r, g, b, na)

    res.save(out_path)
    kept = sum(1 for y in range(0, H, 2) for x in range(0, W, 2) if rp[x, y][3] > 0)
    print(f'{src_path} → {out_path}')
    print(f'  배경 {bg}  지움 {sum(out)} px  둘레에서 알파 낮춘 것 {faded} px')
    print(f'  남은 실루엣 {res.split()[3].getbbox()}')


if __name__ == '__main__':
    cutout(sys.argv[1], sys.argv[2])
