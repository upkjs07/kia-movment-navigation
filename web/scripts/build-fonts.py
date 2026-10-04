"""
기아 시그니처 OTF 를 웹용 woff2 로 굽는다. 결과는 src/fonts/ 로 간다.

  python3 scripts/build-fonts.py "<OTF 폴더 경로>"

원본은 저장소에 두지 않는다(한 벌 950KB × 3). woff2 로 구우면 43% 로 줄어든다.
필요한 건 pip install "fonttools[woff]" brotli.
"""
from fontTools.ttLib import TTFont
import os, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else None
if not SRC or not os.path.isdir(SRC):
    sys.exit('OTF 폴더 경로를 달라:  python3 scripts/build-fonts.py "<폴더>"')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "fonts")
os.makedirs(OUT, exist_ok=True)

for name in ("Regular", "Bold"):          # Light 는 아직 쓰는 곳이 없어 굽지 않는다
    p = os.path.join(SRC, "KiaSignatureOTF%s.otf" % name)
    if not os.path.exists(p):
        sys.exit("없는 파일: " + p)
    f = TTFont(p); f.flavor = "woff2"
    dst = os.path.join(OUT, "KiaSignature-%s.woff2" % name)
    f.save(dst)
    print("%-8s %6.0fKB → %5.0fKB" % (name, os.path.getsize(p)/1024, os.path.getsize(dst)/1024))
