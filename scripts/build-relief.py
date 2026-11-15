"""
Builds public/img/map/relief.webp — the shaded relief under the KOREN map — from REAL elevation data.

Source: Terrain Tiles (Mapzen / Tilezen, open data on AWS: s3.amazonaws.com/elevation-tiles-prod, "terrarium" encoding).
Their sources include SRTM (NASA), GMTED, ETOPO1 and others — see https://github.com/tilezen/joerd/blob/master/docs/attribution.md.
The picture is NOT AI-generated: every pixel is an elevation sample, shaded with a standard hillshade (light from the north-west).

  python3 scripts/build-relief.py <folder with zoom-9 terrarium tiles named X_Y.png>

The projection must match src/map/projection.ts (equirectangular, 1000 × 690 map units).
Bulgaria is drawn in soft hypsometric colours; the neighbours are faded (the map is about Bulgaria); the sea is transparent.
It also prints the highest elevation near each peak in content/map/peaks.json — a check that the coordinates are right.
"""
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
TILES = Path(sys.argv[1])
Z = 9
N = 2 ** Z

# Must match src/map/projection.ts
LON0, LON1, LAT1, PHI = 22.0, 29.0, 44.5, 42.7
COS = math.cos(math.radians(PHI))
K = 1000 / ((LON1 - LON0) * COS)
MAP_W, MAP_H = 1000, 690
SCALE = 1.6  # output pixels per map unit → 1600 × 1104
W, H = round(MAP_W * SCALE), round(MAP_H * SCALE)


def load_dem():
    files = {tuple(map(int, f.stem.split('_'))): f for f in TILES.glob('*.png')}
    xs = sorted({x for x, _ in files}); ys = sorted({y for _, y in files})
    dem = np.zeros((len(ys) * 256, len(xs) * 256), dtype=np.float32)
    for (x, y), f in files.items():
        a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32)
        e = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
        dem[(y - ys[0]) * 256:(y - ys[0] + 1) * 256, (x - xs[0]) * 256:(x - xs[0] + 1) * 256] = e
    return dem, xs[0], ys[0]


def merc_px(lat, lon, x0, y0):
    """Pixel position in the DEM mosaic (web mercator, zoom Z)."""
    r = np.radians(lat)
    gx = (lon + 180) / 360 * N * 256
    gy = (1 - np.log(np.tan(r) + 1 / np.cos(r)) / math.pi) / 2 * N * 256
    return gx - x0 * 256, gy - y0 * 256


def sample(dem, px, py):
    """Bilinear sample."""
    x0 = np.clip(np.floor(px).astype(int), 0, dem.shape[1] - 2); y0 = np.clip(np.floor(py).astype(int), 0, dem.shape[0] - 2)
    fx = np.clip(px - x0, 0, 1); fy = np.clip(py - y0, 0, 1)
    a = dem[y0, x0]; b = dem[y0, x0 + 1]; c = dem[y0 + 1, x0]; d = dem[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def outline():
    src = (ROOT / 'src/map/geo.ts').read_text()
    pts = json.loads(re.search(r'BULGARIA_OUTLINE[^=]*=\s*(\[\[.*?\]\])', src, re.S).group(1))
    return [(x * SCALE, y * SCALE) for x, y in pts]


def main():
    dem, x0, y0 = load_dem()
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float64)
    lon = LON0 + (xs / SCALE) / (COS * K)
    lat = LAT1 - (ys / SCALE) / K
    px, py = merc_px(lat, lon, x0, y0)
    elev = sample(dem, px, py)

    # Hillshade (azimuth 315°, altitude 45°), metres per output pixel, vertical exaggeration ×2.5 (gentle, readable on a phone).
    m_per_px = 1000 / (K / 111.2) / SCALE
    gy, gx = np.gradient(np.maximum(elev, 0) * 2.5, m_per_px)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(45)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade, 0, 1)

    # Soft hypsometric colours (KOREN palette): mint lowlands → meadow → sand → light brown → snow.
    stops = [(0, (156, 222, 172)), (250, (182, 226, 158)), (700, (214, 222, 150)), (1300, (214, 190, 140)), (2000, (196, 168, 140)), (2600, (236, 230, 222)), (2950, (255, 255, 255))]
    e = np.clip(elev, 0, 2950)
    col = np.zeros((H, W, 3))
    for (e0, c0), (e1, c1) in zip(stops, stops[1:]):
        m = (e >= e0) & (e <= e1)
        t = ((e - e0) / (e1 - e0))[m][:, None]
        col[m] = np.array(c0) * (1 - t) + np.array(c1) * t
    light = (0.62 + 0.55 * shade)[:, :, None]  # 0.62 in full shadow … 1.17 in full light
    rgb = np.clip(col * light, 0, 255)

    # Bulgaria bright; neighbours faded towards the paper colour; sea transparent.
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).polygon(outline(), fill=255)
    bg = np.asarray(mask.filter(ImageFilter.GaussianBlur(1)), dtype=np.float64)[:, :, None] / 255
    paper = np.array((244, 238, 224))
    faded = paper * 0.72 + (paper * (0.8 + 0.3 * shade[:, :, None])) * 0.28
    rgb = rgb * bg + faded * (1 - bg)
    sea = elev <= 0.5
    alpha = np.where(sea, 0, 255).astype(np.uint8)
    img = Image.fromarray(rgb.astype(np.uint8), 'RGB')
    img.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.6)))
    out = ROOT / 'public/img/map/relief.webp'
    out.parent.mkdir(parents=True, exist_ok=True)
    for q in (80, 72, 64, 56):
        img.save(out, 'WEBP', quality=q, method=6)
        if out.stat().st_size <= 150 * 1024:
            break
    print(f'relief.webp {W}×{H} {out.stat().st_size // 1024} KB')

    # Check: the highest point near each listed peak should be close to its official height.
    peaks = json.loads((ROOT / 'content/map/peaks.json').read_text()) if (ROOT / 'content/map/peaks.json').exists() else []
    for p in peaks:
        d = 0.02  # ~2 km box
        la, lo = np.mgrid[p['lat'] - d:p['lat'] + d:41j, p['lon'] - d:p['lon'] + d:41j]
        qx, qy = merc_px(la, lo, x0, y0)
        top = float(sample(dem, qx, qy).max())
        print(f"{p['id']:14} official {p['height']} m · data max nearby {top:.0f} m · diff {top - p['height']:+.0f}")


if __name__ == '__main__':
    main()
