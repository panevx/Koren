"""
Exports the Playful 3D objects (design/v4/*.png, 1024×1024 from ChatGPT) to public/img/world/*.webp.

  python3 scripts/export-world.py

Each picture: alpha below 8% cleared (no pale haze), trimmed to the object, centred on a square
with a small margin (so every object has the same visual size in a grid), then resized.
Small interface icons (star, heart, lantern…) are 192 px; everything else 320 px.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / 'design/v4', ROOT / 'public/img/world'
SMALL = {'correct-star', 'try-again-heart', 'hint-lantern', 'question-orb', 'discovery-magnifier', 'direction-arrow',
         'mission-key', 'progress-gem-blue', 'progress-gem-green', 'puzzle-piece-green', 'puzzle-piece-yellow', 'passport-stamp'}

OUT.mkdir(parents=True, exist_ok=True)
for src in sorted(SRC.glob('*.png')):
    im = Image.open(src).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 0 if v < 20 else v)
    im.putalpha(a)
    im = im.crop(a.getbbox())
    side = round(max(im.size) * 1.04)
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
    size = 192 if src.stem in SMALL else 320
    sq.resize((size, size), Image.LANCZOS).save(OUT / f'{src.stem}.webp', 'WEBP', quality=82, method=6)
    print(f'{src.stem}.webp {size}px {(OUT / f"{src.stem}.webp").stat().st_size // 1024} KB')
