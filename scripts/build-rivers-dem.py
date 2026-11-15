"""
Traces the Iskar, the Vit and the Osam from REAL elevation data (the same Terrain Tiles as build-relief.py),
because Natural Earth does not have them and OpenStreetMap was not reachable when the map was built.

Standard hydrology, no drawing by hand:
  1. priority-flood (Barnes et al. 2014) fills the pits and gives every cell the direction water flows to;
  2. flow accumulation = how many cells drain through each cell;
  3. from a town that stands on the river, follow the water DOWN until it joins the Danube, and walk UP,
     always into the neighbour that carries the most water, until the stream gets small (the source).
The result is checked against towns that stand on each river (CHECK) — every one must be within 3 km of the line
(the town coordinates are town centres, not river banks), and the upstream end must be within 12 km of the source area (a sanity bound: the main range above the first town).

  python3 scripts/build-rivers-dem.py <folder with zoom-9 terrarium tiles> <out.json>
  (the Natural Earth river files must be in the parent folder of the tiles — for the Danube)

Output: {"source": "...", "rivers": [{"name": "Искър", "line": [[lon, lat], …]}]} — mouth → source order is reversed
to source → mouth. scripts/build-layers.py reads it as rivers-dem.json.
"""
import heapq
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

TILES = Path(sys.argv[1])
OUT = Path(sys.argv[2])
Z = 9
N = 2 ** Z
LON_MIN, LON_MAX, LAT_MIN, LAT_MAX = 22.3, 27.0, 40.96, 44.0

# name, anchor town (None = start at the source and only go down — when a tributary carries more water than the
# upper river, as at the Struma), snapped to the river; the line is traced down to the Danube and up to the source from it),
# source area (lat, lon), towns on the river (lat, lon) for the check
RIVERS = [
    ('Искър', 'Своге', (42.19, 23.36), {
        'Самоков': (42.337, 23.556), 'Панчарево': (42.596, 23.412), 'Нови Искър': (42.810, 23.352), 'Своге': (42.961, 23.350),
        'Мездра': (43.140, 23.708), 'Роман': (43.148, 23.921), 'Червен бряг': (43.268, 24.090)}),
    ('Вит', 'Тетевен', (42.78, 24.40), {'Тетевен': (42.918, 24.262), 'Садовец': (43.310, 24.338), 'Гулянци': (43.640, 24.693)}),
    ('Осъм', 'Троян', (42.78, 24.60), {'Троян': (42.891, 24.712), 'Ловеч': (43.135, 24.716), 'Левски': (43.364, 25.144)}),
    ('Марица', 'Пловдив', (42.16, 23.62), {
        'Пазарджик': (42.192, 24.333), 'Пловдив': (42.150, 24.750), 'Първомай': (42.100, 25.220), 'Димитровград': (42.056, 25.594),
        'Харманли': (41.929, 25.900), 'Свиленград': (41.766, 26.199)}),
    ('Струма', None, (42.56, 23.25), {'Перник': (42.605, 23.038), 'Бобошево': (42.153, 23.000), 'Симитли': (41.888, 23.112), 'Кресна': (41.725, 23.150)}),
    # The Yantra is NOT here: at ~220 m per cell its narrow meanders at Veliko Tarnovo are blocked and the water spills
    # the wrong way (checked: 14 km off Veliko Tarnovo). The map keeps Natural Earth's Yantra.
    ('Тунджа', 'Ямбол', (42.70, 24.95), {'Калофер': (42.612, 24.976), 'Ямбол': (42.484, 26.503), 'Елхово': (42.172, 26.567)}),
    ('Арда', 'Кърджали', (41.47, 24.62), {'Рудозем': (41.487, 24.849), 'Кърджали': (41.650, 25.370), 'Маджарово': (41.637, 25.865)}),
    ('Места', 'Якоруда', (42.15, 23.70), {'Якоруда': (42.025, 23.685), 'Хаджидимово': (41.522, 23.869)}),
]


def mpx(lat, lon):
    r = math.radians(lat)
    return (lon + 180) / 360 * N * 256, (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * N * 256


def unpx(x, y):
    lon = x / (N * 256) * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / (N * 256)))))
    return lat, lon


def km(a, b):
    return math.hypot((a[0] - b[0]) * 111.2, (a[1] - b[1]) * 111.2 * math.cos(math.radians(a[0])))


def main():
    x0, y0 = mpx(LAT_MAX, LON_MIN); x1, y1 = mpx(LAT_MIN, LON_MAX)
    x0, y0, x1, y1 = int(x0), int(y0), int(x1) + 1, int(y1) + 1
    dem = np.full((y1 - y0, x1 - x0), np.nan, dtype=np.float64)
    for f in TILES.glob('*.png'):
        tx, ty = map(int, f.stem.split('_'))
        a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float64)
        e = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
        gx, gy = tx * 256, ty * 256
        sx0, sy0 = max(gx, x0), max(gy, y0); sx1, sy1 = min(gx + 256, x1), min(gy + 256, y1)
        if sx0 < sx1 and sy0 < sy1:
            dem[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = e[sy0 - gy:sy1 - gy, sx0 - gx:sx1 - gx]
    assert not np.isnan(dem).any(), 'tiles missing for the crop'
    H, W = dem.shape
    print(f'DEM crop {W}×{H}')

    # 1. priority-flood: from the edges inwards; each cell drains to the cell it was reached from.
    to = np.full(H * W, -1, dtype=np.int64)
    done = np.zeros(H * W, dtype=bool)
    order = []
    pq = []
    flat = dem.ravel()
    for y in range(H):
        for x in (0, W - 1):
            heapq.heappush(pq, (flat[y * W + x], y * W + x)); done[y * W + x] = True
    for x in range(1, W - 1):
        for y in (0, H - 1):
            heapq.heappush(pq, (flat[y * W + x], y * W + x)); done[y * W + x] = True
    filled = flat.copy()
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    while pq:
        h, i = heapq.heappop(pq)
        order.append(i)
        y, x = divmod(i, W)
        for dy, dx in nb:
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W:
                j = yy * W + xx
                if not done[j]:
                    done[j] = True
                    filled[j] = max(flat[j], h + 1e-4)
                    to[j] = i
                    heapq.heappush(pq, (filled[j], j))
    # 2. accumulation, from the last-reached (highest) cells down
    acc = np.ones(H * W)
    for i in reversed(order):
        if to[i] >= 0:
            acc[to[i]] += acc[i]
    # upstream neighbours
    ups = {}
    for i in range(H * W):
        if to[i] >= 0:
            ups.setdefault(int(to[i]), []).append(i)

    # Where a river ends: on the Danube (Natural Earth line, next to the tiles) or on a river traced before it
    # (the Tundzha and the Arda flow into the Maritsa). Without this the walk down would go on along the bigger river.
    ends = set()
    def mark(lonlat_line, r=2):
        for (lo0, la0), (lo1, la1) in zip(lonlat_line, lonlat_line[1:]):
            n = int(math.hypot(*np.subtract(mpx(la1, lo1), mpx(la0, lo0)))) + 2  # one sample per cell
            for t in np.linspace(0, 1, n):
                gx, gy = mpx(la0 + (la1 - la0) * t, lo0 + (lo1 - lo0) * t)
                cx, cy = int(gx) - x0, int(gy) - y0
                for dy in range(-r, r + 1):
                    for dx in range(-r, r + 1):
                        if 0 <= cy + dy < H and 0 <= cx + dx < W:
                            ends.add((cy + dy) * W + cx + dx)
    for f in [f for n in ('ne_10m_rivers_lake_centerlines', 'ne_10m_rivers_europe') for f in json.loads((TILES.parent / f'{n}.geojson').read_text())['features']]:
        if f['properties'].get('name') == 'Danube' and f['geometry']:
            g = f['geometry']
            for ln in ([g['coordinates']] if g['type'] == 'LineString' else g['coordinates']):
                mark(ln, 9)  # ~2 km either side: Natural Earth's Danube is a little off the elevation data

    INTO_DANUBE = {'Искър', 'Вит', 'Осъм'}
    assert len(ends) > 1000, 'the Danube was not found in the Natural Earth files'
    out = []
    for name, anchor, source, towns in RIVERS:
        # snap the anchor town (or, with anchor None, the source) to the biggest stream within ~1.3 km
        ax, ay = mpx(*(towns[anchor] if anchor else source))
        cx, cy = int(ax) - x0, int(ay) - y0
        a = max(((cy + dy) * W + cx + dx for dy in range(-6, 7) for dx in range(-6, 7)), key=lambda j: acc[j])
        # downstream: follow the water until it reaches the Danube, a river traced before it, the sea or the edge
        down = [a]
        while to[down[-1]] >= 0:
            j = int(to[down[-1]])
            # into the Danube: the big jump in water is the Danube (Natural Earth's Danube line is up to ~5 km off the
            # elevation data's floodplain channels, so the line alone lets a river run on along the floodplain)
            joins_danube = name in INTO_DANUBE and acc[j] > 1.6 * acc[down[-1]] + 20000
            if joins_danube or j in ends or flat[j] <= 0:
                down.append(j)
                break
            down.append(j)
        # upstream: always the branch with the most water, until the stream gets small
        up = [a]
        while anchor:  # anchor None: the line starts at the source — the bigger branch upstream is a tributary
            u = ups.get(up[-1])
            if not u:
                break
            nxt = max(u, key=lambda j: acc[j])
            if acc[nxt] < 40:
                break
            up.append(nxt)
        path = list(reversed(down)) + up[1:]  # mouth … source
        line = [unpx(i % W + x0 + 0.5, i // W + y0 + 0.5) for i in path]
        # check: towns on the river
        worst = 0
        for t, ll in towns.items():
            d = min(km(ll, p) for p in line)
            worst = max(worst, d)
            print(f'  {name:6} {t:12} {d:4.1f} km')
        end = line[-1]
        print(f'{name}: {len(line)} cells, upstream end {end[0]:.3f} {end[1]:.3f} ({km(end, source):.1f} km from the source area), worst town {worst:.1f} km')
        assert worst <= 3 and km(end, source) <= 12, f'{name} does not pass its towns or ends far from its source — do not use'
        # the cell-by-cell path is a staircase; a 7-cell moving average makes it a river again (the ends stay put)
        k = 3
        smooth = [line[0]] + [tuple(sum(c) / len(c) for c in zip(*line[max(0, i - k):i + k + 1])) for i in range(1, len(line) - 1)] + [line[-1]]
        worst_s = max(min(km(ll, p) for p in smooth) for ll in towns.values())
        assert worst_s <= 3, f'{name}: smoothing moved the line away from its towns'
        out.append({'name': name, 'line': [[round(lon, 5), round(lat, 5)] for lat, lon in reversed(smooth)]})
        mark([(lon, lat) for lat, lon in line])
    OUT.write_text(json.dumps({'source': 'Terrain Tiles (Mapzen) — traced from elevation', 'rivers': out}, ensure_ascii=False))
    print('→', OUT)


if __name__ == '__main__':
    main()
