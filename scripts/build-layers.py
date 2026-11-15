"""
Builds content/map/layers.json — the data layers of the KOREN map — from REAL data, in the app's own projection.

Sources (downloaded once; nothing is fetched while the app runs):
  - Natural Earth 1:10m (public domain) — admin-1 provinces (the 28 oblasti), rivers (+ the Europe supplement), lakes.
    https://github.com/nvkelso/natural-earth-vector/tree/master/geojson
  - OpenStreetMap (© OpenStreetMap contributors, ODbL) via the Overpass API — rivers missing from Natural Earth
    (Iskar, Vit, Osam). Optional file rivers-osm.json in the same folder.

  python3 scripts/build-layers.py <folder with the geojson files>

Bulgarian names, administrative centres, "flows into", capitals of the neighbours and label positions of the ranges are
written below by hand — they are facts to be checked by a teacher (they are standard textbook facts).
"""
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1])

LON0, LON1, LAT1, PHI = 22.0, 29.0, 44.5, 42.7  # must match src/map/projection.ts
COS = math.cos(math.radians(PHI))
K = 1000 / ((LON1 - LON0) * COS)
MAP_W, MAP_H = 1000, 690


def proj(lon, lat):
    return ((lon - LON0) * COS * K, (LAT1 - lat) * K)


def simplify(pts, tol):
    """Douglas–Peucker."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy) or 1e-9
    best, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / norm
        if d > best:
            best, idx = d, i
    if best <= tol:
        return [pts[0], pts[-1]]
    return simplify(pts[: idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def simplify_ring(pts, tol):
    """A closed ring starts and ends at the same point, which would make Douglas–Peucker collapse it:
    split it at the point farthest from the start and simplify the two halves."""
    if len(pts) < 4:
        return pts
    x0, y0 = pts[0]
    k = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - x0, pts[i][1] - y0))
    return simplify(pts[: k + 1], tol)[:-1] + simplify(pts[k:], tol)


def path(rings, closed, tol=0.7):
    out = []
    for ring in rings:
        pts = [proj(x, y) for x, y in ring]
        p = simplify_ring(pts, tol) if closed else simplify(pts, tol)
        if closed and len(p) < 4:
            continue
        if len(p) < 2:
            continue
        out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in p) + ('Z' if closed else ''))
    return ''.join(out)


def inside(px, py, ring):
    c = False
    for i in range(len(ring)):
        (x1, y1), (x2, y2) = ring[i - 1], ring[i]
        if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1:
            c = not c
    return c


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / ((dx * dx + dy * dy) or 1e-9)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def label_point(rings):
    """The point inside the polygon farthest from its edges (a label never sits on a border or in a hole)."""
    outer = rings[0]
    xs = [p[0] for p in outer]; ys = [p[1] for p in outer]
    best, bp = -1, (sum(xs) / len(xs), sum(ys) / len(ys))
    step = max(max(xs) - min(xs), max(ys) - min(ys)) / 40
    y = min(ys)
    while y <= max(ys):
        x = min(xs)
        while x <= max(xs):
            if inside(x, y, outer) and not any(inside(x, y, h) for h in rings[1:]):
                d = min(seg_dist(x, y, *r[i - 1], *r[i]) for r in rings for i in range(len(r)))
                if d > best:
                    best, bp = d, (x, y)
            x += step
        y += step
    return round(bp[0], 1), round(bp[1], 1)


PROVINCES = {  # ISO 3166-2:BG → Bulgarian name, English name, administrative centre (bg/en)
    'BG-01': ('Благоевград', 'Blagoevgrad'), 'BG-02': ('Бургас', 'Burgas'), 'BG-03': ('Варна', 'Varna'),
    'BG-04': ('Велико Търново', 'Veliko Tarnovo'), 'BG-05': ('Видин', 'Vidin'), 'BG-06': ('Враца', 'Vratsa'),
    'BG-07': ('Габрово', 'Gabrovo'), 'BG-08': ('Добрич', 'Dobrich'), 'BG-09': ('Кърджали', 'Kardzhali'),
    'BG-10': ('Кюстендил', 'Kyustendil'), 'BG-11': ('Ловеч', 'Lovech'), 'BG-12': ('Монтана', 'Montana'),
    'BG-13': ('Пазарджик', 'Pazardzhik'), 'BG-14': ('Перник', 'Pernik'), 'BG-15': ('Плевен', 'Pleven'),
    'BG-16': ('Пловдив', 'Plovdiv'), 'BG-17': ('Разград', 'Razgrad'), 'BG-18': ('Русе', 'Ruse'),
    'BG-19': ('Силистра', 'Silistra'), 'BG-20': ('Сливен', 'Sliven'), 'BG-21': ('Смолян', 'Smolyan'),
    'BG-22': ('София (столица)', 'Sofia City'), 'BG-23': ('Софийска област', 'Sofia Province'), 'BG-24': ('Стара Загора', 'Stara Zagora'),
    'BG-25': ('Търговище', 'Targovishte'), 'BG-26': ('Хасково', 'Haskovo'), 'BG-27': ('Шумен', 'Shumen'), 'BG-28': ('Ямбол', 'Yambol'),
}
CENTRE = {code: names for code, names in PROVINCES.items()}
CENTRE['BG-22'] = ('София', 'Sofia')
CENTRE['BG-23'] = ('София', 'Sofia')  # Sofia Province is administered from Sofia

RIVERS = {  # name in the data → id, Bulgarian, English, flows into (bg, en)
    'Danube': ('danube', 'Дунав', 'Danube', 'Черно море', 'the Black Sea'),
    'Iskar': ('iskar', 'Искър', 'Iskar', 'Дунав', 'the Danube'), 'Искър': ('iskar', 'Искър', 'Iskar', 'Дунав', 'the Danube'),
    'Вит': ('vit', 'Вит', 'Vit', 'Дунав', 'the Danube'), 'Осъм': ('osam', 'Осъм', 'Osam', 'Дунав', 'the Danube'),
    'Ogosta': ('ogosta', 'Огоста', 'Ogosta', 'Дунав', 'the Danube'), 'Yantra': ('yantra', 'Янтра', 'Yantra', 'Дунав', 'the Danube'),
    'Maritsa': ('maritsa', 'Марица', 'Maritsa', 'Бяло море', 'the Aegean Sea'), 'Evros': ('maritsa', 'Марица', 'Maritsa', 'Бяло море', 'the Aegean Sea'),
    'Tundzha': ('tundzha', 'Тунджа', 'Tundzha', 'Марица', 'the Maritsa'), 'Arda': ('arda', 'Арда', 'Arda', 'Марица', 'the Maritsa'),
    'Strimonas': ('struma', 'Струма', 'Struma', 'Бяло море', 'the Aegean Sea'), 'Strymnas': ('struma', 'Струма', 'Struma', 'Бяло море', 'the Aegean Sea'),
    'Mesta': ('mesta', 'Места', 'Mesta', 'Бяло море', 'the Aegean Sea'), 'Kamchiya': ('kamchia', 'Камчия', 'Kamchia', 'Черно море', 'the Black Sea'),
}
LAKES = {'Iskar': ('iskar-dam', 'язовир Искър', 'Iskar Reservoir'), 'Batak': ('batak-dam', 'язовир Батак', 'Batak Reservoir'),
         'Jrebchevo': ('zhrebchevo-dam', 'язовир Жребчево', 'Zhrebchevo Reservoir'), 'Mandra': ('mandra', 'езеро Мандра', 'Lake Mandra')}
NEIGHBOURS = [  # label position (lat, lon), name, capital
    ('romania', 44.33, 25.3, ('Румъния', 'Romania'), ('Букурещ', 'Bucharest')),
    ('serbia', 43.05, 22.17, ('Сърбия', 'Serbia'), ('Белград', 'Belgrade')),
    ('north-macedonia', 41.75, 22.2, ('Северна Македония', 'North Macedonia'), ('Скопие', 'Skopje')),
    ('greece', 41.12, 24.4, ('Гърция', 'Greece'), ('Атина', 'Athens')),
    ('turkey', 41.42, 27.25, ('Турция', 'Türkiye'), ('Анкара', 'Ankara')),
]
RANGES = [  # label position (lat, lon) — roughly the middle of each range, checked on the relief
    ('rila', 42.13, 23.55, ('Рила', 'Rila')), ('pirin', 41.72, 23.45, ('Пирин', 'Pirin')),
    ('rhodopes', 41.68, 24.75, ('Родопи', 'Rhodopes')), ('balkan', 42.78, 24.85, ('Стара планина', 'Balkan Mountains')),
    ('vitosha', 42.55, 23.27, ('Витоша', 'Vitosha')), ('sredna-gora', 42.5, 24.45, ('Средна гора', 'Sredna Gora')),
    ('strandzha', 42.07, 27.55, ('Странджа', 'Strandzha')),
]
SEA = ('black-sea', 42.95, 28.55, ('Черно море', 'Black Sea'))


def in_frame(x, y, m=40):
    return -m <= x <= MAP_W + m and -m <= y <= MAP_H + m


def lines_of(geom):
    if geom['type'] == 'LineString':
        return [geom['coordinates']]
    if geom['type'] == 'MultiLineString':
        return geom['coordinates']
    return []


def main():
    # provinces
    a = json.loads((SRC / 'ne_10m_admin_1_states_provinces.geojson').read_text())
    provinces = []
    for f in a['features']:
        p = f['properties']
        if p.get('adm0_a3') != 'BGR':
            continue
        code = p['iso_3166_2']
        polys = [f['geometry']['coordinates']] if f['geometry']['type'] == 'Polygon' else f['geometry']['coordinates']
        rings = [[proj(x, y) for x, y in r] for poly in polys for r in poly]
        biggest = max(polys, key=lambda poly: len(poly[0]))
        lx, ly = label_point([[proj(x, y) for x, y in r] for r in biggest])
        bg, en = PROVINCES[code]
        provinces.append({'id': code, 'name': {'bg': bg, 'en': en}, 'centre': {'bg': CENTRE[code][0], 'en': CENTRE[code][1]},
                          'd': path([r for poly in polys for r in poly], True, 0.6), 'lx': lx, 'ly': ly, '_rings': rings})
    assert len(provinces) == 28, len(provinces)
    # colours: neighbouring provinces never share one (greedy colouring of the "share a border point" graph)
    def touch(p, q):
        qs = {(round(x, 0), round(y, 0)) for r in q['_rings'] for x, y in r}
        return any((round(x, 0), round(y, 0)) in qs for r in p['_rings'] for x, y in r[::3])
    provinces.sort(key=lambda p: p['id'])
    for p in provinces:
        used = {q['color'] for q in provinces if 'color' in q and touch(p, q)}
        p['color'] = next(c for c in range(6) if c not in used)
    for p in provinces:
        del p['_rings']

    # rivers
    rivers = {}
    feats = json.loads((SRC / 'ne_10m_rivers_europe.geojson').read_text())['features'] + json.loads((SRC / 'ne_10m_rivers_lake_centerlines.geojson').read_text())['features']
    osm = SRC / 'rivers-osm.json'
    sources = {'Natural Earth'}
    for f in feats:
        name = f['properties'].get('name')
        if name not in RIVERS or not f['geometry']:
            continue
        for line in lines_of(f['geometry']):
            rivers.setdefault(RIVERS[name][0], (RIVERS[name], []))[1].append(line)
    if osm.exists():
        for e in json.loads(osm.read_text())['elements']:
            name = e['tags'].get('name')
            if name not in RIVERS:
                continue
            rid = RIVERS[name][0]
            if rid in rivers and rid not in ('iskar', 'vit', 'osam'):
                continue  # Natural Earth already has it
            lines = [[(pt['lon'], pt['lat']) for pt in m['geometry']] for m in e.get('members', []) if m.get('type') == 'way' and m.get('role') in ('', 'main_stream') and m.get('geometry')]
            rivers[rid] = (RIVERS[name], lines)
            sources.add('OpenStreetMap')
    out_rivers = []
    for rid, (meta, lines) in rivers.items():
        segs = []
        for line in lines:
            seg = [(x, y) for x, y in line if in_frame(*proj(x, y))]
            if len(seg) > 1:
                segs.append(seg)
        if not segs:
            continue
        pts = [proj(x, y) for s in segs for x, y in s]
        inside_bg = [p for p in pts if 0 <= p[0] <= MAP_W and 0 <= p[1] <= MAP_H]
        mid = inside_bg[len(inside_bg) // 2] if inside_bg else pts[len(pts) // 2]
        out_rivers.append({'id': rid, 'name': {'bg': meta[1], 'en': meta[2]}, 'into': {'bg': meta[3], 'en': meta[4]},
                           'd': path(segs, False, 0.8), 'lx': round(mid[0], 1), 'ly': round(mid[1], 1)})
    out_rivers.sort(key=lambda r: r['id'])

    # lakes (reservoirs)
    lakes = []
    for f in json.loads((SRC / 'ne_10m_lakes_europe.geojson').read_text())['features']:
        name = f['properties'].get('name')
        if name not in LAKES or not f['geometry']:
            continue
        polys = [f['geometry']['coordinates']] if f['geometry']['type'] == 'Polygon' else f['geometry']['coordinates']
        x, y = proj(*polys[0][0][0])
        if not in_frame(x, y, 0):
            continue
        rings = [r for poly in polys for r in poly]
        pts = [proj(*c) for c in rings[0]]
        lid, bg, en = LAKES[name]
        lakes.append({'id': lid, 'name': {'bg': bg, 'en': en}, 'd': path(rings, True, 0.3),
                      'lx': round(sum(p[0] for p in pts) / len(pts), 1), 'ly': round(sum(p[1] for p in pts) / len(pts), 1)})

    pos = lambda lat, lon: [round(v, 1) for v in proj(lon, lat)]
    data = {
        'sources': sorted(sources),
        'provinces': provinces,
        'rivers': out_rivers,
        'lakes': sorted(lakes, key=lambda l: l['id']),
        'neighbours': [{'id': i, 'name': {'bg': n[0], 'en': n[1]}, 'capital': {'bg': c[0], 'en': c[1]}, 'at': pos(la, lo)} for i, la, lo, n, c in NEIGHBOURS],
        'ranges': [{'id': i, 'name': {'bg': n[0], 'en': n[1]}, 'at': pos(la, lo)} for i, la, lo, n in RANGES],
        'sea': {'id': SEA[0], 'name': {'bg': SEA[3][0], 'en': SEA[3][1]}, 'at': pos(SEA[1], SEA[2])},
    }
    out = ROOT / 'content/map/layers.json'
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f"layers.json {out.stat().st_size // 1024} KB · {len(provinces)} provinces · rivers {[r['id'] for r in out_rivers]} · lakes {[l['id'] for l in lakes]} · {sorted(sources)}")


if __name__ == '__main__':
    main()
