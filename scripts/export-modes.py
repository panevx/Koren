#!/usr/bin/env python3
"""v0.26 age modes: one hero per mode, cut down from the full-length poses (900 px, ~130 KB) to the size the
age screen shows them (400 px tall, retina) — public/img/modes/<level>.webp. No new drawing: the same poses.
  small  (4–6)   Raya planting a flower  — pictures and play
  young  (7–10)  Koren with the compass  — journeys and maps
  guard  (11–14) Raya with the book      — history and reasons
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = {'small': 'raya-nature', 'young': 'koren-compass', 'guard': 'raya-reading'}
OUT = ROOT / 'public/img/modes'
OUT.mkdir(exist_ok=True)
for level, pose in SRC.items():
    im = Image.open(ROOT / f'public/img/poses/{pose}.webp').convert('RGBA')
    h = 400
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    dst = OUT / f'{level}.webp'
    im.save(dst, 'WEBP', quality=76, method=6)
    print(dst.relative_to(ROOT), im.size, dst.stat().st_size // 1024, 'KB')
