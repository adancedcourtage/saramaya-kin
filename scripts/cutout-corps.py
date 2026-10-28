"""Cut out the real product photos in assets-src/corps/originaux/ into transparent PNGs.

Usage: python3 scripts/cutout-corps.py
Writes assets-src/corps/detours/NN.png, cropped to the product with a small margin.
"""
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets-src/corps/originaux'
OUT = ROOT / 'assets-src/corps/detours'
OUT.mkdir(parents=True, exist_ok=True)

session = new_session('isnet-general-use', providers=['CPUExecutionProvider'])

for path in sorted(SRC.glob('*.jpg')):
    target = OUT / f'{path.stem}.png'
    if target.exists():
        continue
    img = Image.open(path).convert('RGB')
    cut = remove(img, session=session, post_process_mask=True)
    alpha = cut.getchannel('A').point(lambda a: 255 if a > 200 else (0 if a < 25 else a))
    cut.putalpha(alpha)
    box = alpha.point(lambda a: 255 if a > 40 else 0).getbbox()
    if box:
        pad = 6
        box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, cut.width), min(box[3] + pad, cut.height))
        cut = cut.crop(box)
    cut.save(target)
    print(path.name, cut.size)
