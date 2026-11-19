#!/usr/bin/env python3
"""
v0.26 diorama: cut the hub landscape (public/img/world/hills-v02.webp) into a SKY and a HILLS layer, so clouds, a haze
and the code-drawn distant mountains can sit BETWEEN them, and Koren and Raya in front of the hills.

The sky in this picture is a smooth, very light gradient; the hills are greener. The pale blue far hill in the
middle goes with the sky (the far layer) — it is too close to the sky's colour for a clean cut. For every column we
walk down from the top and find the first pixel that differs clearly from the sky just above it (the hill line).
Everything below the line is opaque; a 3 px ramp keeps the painted edge soft. The result is checked: the cut must
follow one continuous line (after the slope limit no column more than 3 px from its neighbour) and lie in the band where the hills are.

    python3 scripts/diorama-layers.py   → public/img/world/diorama-hills.webp (RGBA)
"""
from pathlib import Path
from PIL import Image
import numpy as np

SRC = Path('public/img/world/hills-v02.webp')
OUT = Path('public/img/world/diorama-hills.webp')

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
h, w, _ = im.shape
lum = im @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
# "skyness": bright and bluish. Hills are darker or greener.
blue_excess = im[..., 2] - (im[..., 0] + im[..., 1]) / 2

def first(col, start, test):
    y = start
    while y < h - 1 and not test(y):
        y += 1
    return y

line = np.zeros(w, dtype=np.int32)
for x in range(w):
    col_l, col_b = lum[:, x], blue_excess[:, x]
    y0 = int(h * 0.35)  # the hills never start above a third of the picture
    sky_l, sky_b = col_l[y0 - 40:y0].mean(), col_b[y0 - 40:y0].mean()  # the sky just above the hills band
    # 1. the first clear edge below the sky: darker, or no longer blue (a white cloud is brighter → not an edge)
    edge = first(col_l, y0, lambda y: col_l[y] < sky_l - 18 or (col_b[y] < sky_b - 14 and col_l[y] < sky_l + 4))
    # 2. if that edge is the pale BLUE far hill (blue clearly above green), it belongs to the far layer:
    #    keep walking to the first GREEN pixel (the code-drawn mountains replace the far hill).
    r, g, b = im[min(edge + 3, h - 1), x]
    if b > g + 14:
        edge = first(col_l, edge, lambda y: im[y, x, 1] > im[y, x, 2] + 4)
    line[x] = edge

# smooth tiny jitters (a 13-px median), never upward past a real step
pad = np.pad(line, 6, mode="edge")
line = np.array([int(np.median(pad[i:i + 13])) for i in range(w)])
# A hill's flank is never a cliff: limit the slope to 3 px per column (both ways), so where a near hill overlaps the
# far one the cut becomes a soft diagonal instead of a vertical step. Lowering the line only ever cuts a little MORE away
# (the original picture is underneath anyway).
for x in range(1, w):
    line[x] = max(line[x], line[x - 1] - 3)
for x in range(w - 2, -1, -1):
    line[x] = max(line[x], line[x + 1] - 3)
jumps = np.abs(np.diff(line))
import sys
if "--debug" in sys.argv: print([(i,int(line[i]),int(line[i+1])) for i in np.where(jumps>24)[0]][:20])
assert jumps.max() <= 3, f'hill line jumps {jumps.max()} px — the cut is not continuous'
assert h * 0.45 < line.min() and line.max() < h * 0.75, f'hill line {line.min()}–{line.max()} outside the hills band'

alpha = np.zeros((h, w), dtype=np.float32)
ys = np.arange(h)[:, None]
alpha = np.clip((ys - (line[None, :] - 2)) / 4.0, 0, 1)
rgba = np.dstack([im, alpha * 255]).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(OUT, 'WEBP', quality=82, method=6)
print(OUT, f'{OUT.stat().st_size // 1024} KB', 'hill line', line.min(), '–', line.max())
