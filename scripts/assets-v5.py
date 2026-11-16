"""
The 300 KOREN assets of v0.14 (design/v5, ChatGPT + data-derived SVG): one decision per file, in one place.

  python3 scripts/assets-v5.py            # writes content/assets/manifest.json and exports the WebP files

Every original in design/v5 gets exactly one status:
  used       — exported to public/img and shown by the app now (`usedIn` says where)
  ready      — exported to public/img for a later stage (`stage`); not downloaded by anyone until a screen uses it
  source     — kept as an original only: data to be re-projected into the app's own map (stage 2), or an SVG game base
  duplicate  — the same picture already ships (`same`); not exported twice
  review     — NOT published until checked (`check` says what): unknown source, invented letters, faces of living people
`check` on a used/ready asset = what a teacher/historian must confirm before the mission leaves draft.

Export: alpha < 8% cleared, trimmed, objects centred on a square (320 px; 192 px for small UI icons),
hero poses keep their shape at 900 px height, wide scenes 640 px wide. WebP q82, must stay ≤ 150 KB (tests/assets.test.ts).
"""
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'design/v5'
PUB = ROOT / 'public/img'
OUT_JSON = ROOT / 'content/assets/manifest.json'

# Where each kind of asset lives in public/img (existing folders are reused where they mean the same thing).
FOLDER = {
    'animal': 'animals', 'avatar': 'avatar', 'city': 'city', 'currency': 'currency', 'food': 'food', 'ingredient': 'food',
    'game': 'game', 'hero': 'people', 'history': 'history', 'lake': 'geo', 'mountain': 'geo', 'peak': 'geo', 'river': 'geo',
    'terrain': 'geo', 'nature': 'nature', 'plant': 'nature', 'landmark': 'landmarks', 'minigame': 'minigame', 'science': 'science',
    'space': 'space', 'tradition': 'culture', 'ui': 'ui', 'world': 'places', 'reward': 'rewards', 'map': 'map',
}

# ── decisions ────────────────────────────────────────────────────────────────────────────────────────────────
DUPLICATE = {  # same picture already in the app → keep the one in use
    'animal-black-sea-dolphin': 'animals/dolphin.webp', 'animal-brown-bear': 'animals/bear.webp', 'animal-chamois': 'animals/chamois.webp',
    'animal-dalmatian-pelican': 'animals/pelican.webp', 'animal-golden-eagle': 'animals/eagle.webp', 'animal-hedgehog': 'animals/hedgehog.webp',
    'animal-lynx': 'animals/lynx.webp', 'animal-otter': 'animals/otter.webp', 'animal-red-deer': 'animals/red-deer.webp',
    'animal-red-fox': 'animals/fox.webp', 'animal-roe-deer': 'animals/roe-deer.webp', 'animal-tortoise': 'animals/tortoise.webp',
    'animal-white-stork': 'animals/stork.webp', 'animal-wild-boar': 'animals/boar.webp', 'animal-wolf': 'animals/wolf.webp',
    'game-key': 'world/mission-key.webp', 'game-magnifier': 'world/discovery-magnifier.webp', 'game-matching-card': 'world/matching-card.webp',
    'game-puzzle-green': 'world/puzzle-piece-green.webp', 'game-puzzle-yellow': 'world/puzzle-piece-yellow.webp', 'game-stamp': 'world/passport-stamp.webp',
    'game-treasure-chest': 'world/treasure-chest-closed.webp', 'game-treasure-chest-open': 'world/treasure-chest-open.webp',
    'hero-feather-ink': 'world/quill-ink.webp', 'history-medieval-book': 'world/medieval-book.webp', 'history-medieval-crown': 'world/simeon-crown.webp',
    'history-medieval-scroll': 'world/old-scroll.webp', 'history-medieval-shield': 'world/asparuh-shield.webp', 'history-pliska': 'world/pliska.webp',
    'lake-seven-rila': 'world/seven-rila-lakes.webp', 'landmark-alexander-nevsky': 'world/alexander-nevsky.webp',
    'landmark-belogradchik': 'world/belogradchik-rocks.webp', 'landmark-rila-monastery': 'world/rila-monastery.webp',
    'landmark-shipka': 'world/shipka-monument.webp', 'landmark-tsarevets': 'world/tsarevets-fortress.webp', 'nature-rose-valley': 'world/rose-valley.webp',
    'reward-bronze-medal': 'world/bronze-medal.webp', 'reward-gold-medal': 'world/gold-medal.webp', 'reward-silver-medal': 'world/silver-medal.webp',
    'reward-trophy': 'world/achievement-trophy.webp', 'reward-star': 'world/correct-star.webp', 'reward-level-up': 'world/level-up-burst.webp',
    'science-rose-oil': 'world/rose-oil-bottle.webp', 'tradition-baba-marta': 'world/martenitsa-pizho-penda.webp',
    'tradition-embroidery': 'world/bulgarian-embroidery.webp', 'ui-map': 'tiles/discover.webp', 'ui-missions': 'tiles/missions.webp',
    'ui-compass': 'levels/young.webp', 'ui-collection': 'tiles/collection.webp',
}

REVIEW = {  # not published until checked
    'map-bulgaria-relief': 'Няма записан източник. Релефът се прави от данни (SRTM/Copernicus) в проекцията на картата — етап 2.',
    'science-cyrillic': 'Буквите в картинката са рисувани от генератора — проверка буква по буква; иначе азбуката се показва като текст.',
    'science-glagolitic': 'Глаголическите знаци са рисувани от генератора — вероятно неточни. Глаголицата ще е шрифт (Noto Sans Glagolitic, OFL).',
    'minigame-glagolitic-scroll': 'Знаците върху свитъка вероятно са измислени — да се провери или да се ползва празен свитък + шрифт.',
    'minigame-bulgaria-coat-of-arms': 'Държавен символ: да се сравни детайл по детайл с официалното описание (Закон за държавния герб).',
    'space-aleksandar-aleksandrov': 'Лице на жив човек — нужно е решение (право на образ) и сравнение със снимка.',
    'space-georgi-ivanov': 'Лице на реален човек — нужно е решение (право на образ) и сравнение със снимка.',
}

SOURCE = {  # data, re-projected into KOREN's own map in stage 2 (the app's map uses its own projection)
    'map-bulgaria-borders': 'Natural Earth 1:10m (public domain)',
    'map-bulgaria-cities': 'Natural Earth 1:10m (public domain)',
    'map-bulgaria-mountains': 'Natural Earth + GeoNames (CC BY 4.0 — изисква атрибуция)',
    'map-bulgaria-neighbors': 'Natural Earth 1:10m (public domain)',
    'map-bulgaria-regions': 'geoBoundaries gbOpen BGR ADM1 (лиценз по geoboundaries.org — атрибуция), 28 области',
    'map-bulgaria-rivers': 'Natural Earth 1:10m (public domain)',
    'map-bulgaria-roads': 'Natural Earth 1:10m (public domain)',
    'map-bulgaria-tourism': 'Natural Earth + GeoNames (CC BY 4.0 — изисква атрибуция)',
    'minigame-bulgaria-regions': 'geoBoundaries gbOpen BGR ADM1 — основа за „Пъзел с 28-те области“ (етап 3)',
    'map-bulgaria-historical': 'James Samuelson, „Bulgaria Past and Present“ (1888), карта след 1885 г. — обществено достояние (Wikimedia Commons)',
}

# Used now: asset → where. (The JSON/places edits that use them are made in the same commit.)
USED = {
    'koren-celebrate': 'истории на мисиите (поза celebrate)', 'raya-celebrate': 'истории на мисиите (поза celebrate)',
    'koren-chef': 'мисия „Погача за гости“', 'raya-chef': 'мисия „Погача за гости“',
    'koren-compass': 'мисии с ориентиране', 'raya-compass': 'мисии с ориентиране',
    'koren-encourage': 'истории (последната реплика преди играта)', 'raya-encourage': 'истории (последната реплика преди играта)',
    'koren-explorer': 'географски мисии', 'raya-explorer': 'географски мисии',
    'koren-map': 'мисии с карта', 'raya-map': 'мисии с карта',
    'koren-nature': 'мисии за животни и природа', 'raya-nature': 'мисии за животни и природа',
    'koren-reading': 'мисии за история и език', 'raya-reading': 'мисии за история и език',
    'koren-treasure': 'мисии със съкровища', 'raya-treasure': 'мисии със съкровища',
    'koren-winter': 'мисия „Баба Марта“', 'raya-winter': 'мисия „Баба Марта“',
    'city-plovdiv': 'карта: Пловдив', 'city-burgas': 'карта: Бургас', 'city-varna': 'карта: Варна; Черно море (история)', 'city-sofia': 'Катедралата в София (история)',
    'landmark-nessebar': 'карта: Несебър; Черно море (история)', 'history-preslav': 'карта: Велики Преслав; Цар Симеон (история)',
    'peak-musala': 'карта: Мусала; Рила (история)', 'lake-srebarna': 'карта: Сребърна; Край водата (история)',
    'history-asparuh': 'Хан Аспарух (история)', 'history-simeon': 'Цар Симеон (история)', 'history-medieval-throne': 'Царевец (история)',
    'history-medieval-fortress': 'Короната на царя (история)', 'mountain-rila': 'Рила; Приятелите от Рила (история)', 'mountain-balkan': 'Шипка (история)',
    'nature-black-sea': 'Черно море (история)', 'terrain-river': 'Пътят на реката (история)', 'terrain-lake': 'Край езерцето (история)',
    'hero-paisiy': 'Паисий (история)', 'hero-kliment-ohridski': 'Азбуката на Кирил и Методий (история)',
    'science-rose-distillation': 'Долината на розите (история)', 'tradition-bulgarian-costume': 'Копривщица и носията; Облечи носията (история)',
}

STAGE = {  # ready → which stage uses it
    'animal': 4, 'avatar': 9, 'city': 2, 'currency': 9, 'food': 6, 'ingredient': 6, 'game': 9, 'hero': 5, 'history': 5,
    'lake': 3, 'mountain': 3, 'peak': 3, 'river': 3, 'terrain': 3, 'nature': 4, 'plant': 4, 'landmark': 2, 'minigame': 6,
    'science': 8, 'space': 8, 'tradition': 6, 'ui': 9, 'world': 2,
}
STAGE_OVERRIDE = {
    'minigame-beach-trash': 4, 'minigame-recycling-bin': 4, 'minigame-river-route': 3, 'minigame-fortress-gate': 5, 'minigame-fortress-tower': 5,
    'minigame-fortress-wall': 5, 'minigame-fairytale-flute': 7, 'minigame-fairytale-golden-apple': 7, 'minigame-hidden-object-scene': 7,
    'minigame-bulgaria-flag': 3, 'world-panagyurishte-treasure': 5, 'world-rogozen-treasure': 5, 'world-valchitran-treasure': 5,
    'world-sports-football': 8, 'world-sports-high-jump': 8, 'world-sports-tennis': 8, 'world-sports-weightlifting': 8,
    'world-car-license-plate': 8, 'world-transport-corridor': 8, 'world-border-crossing': 8, 'world-customs': 8,
    'world-daily-streak': 9, 'world-name-day-calendar': 6, 'world-bulgaria-granary': 3, 'game-word-tile': 7, 'game-letter-tile': 7,
    'game-paint-bucket': 6, 'game-paintbrush': 6, 'game-true-false-true': 9, 'game-true-false-false': 9, 'game-timer': 9,
    'hero-budenie-book': 5, 'hero-old-school': 5, 'animal-imperial-eagle': 4, 'nature-danube-plain': 3, 'nature-thracian-lowland': 3,
    'landmark-baba-vida': 5, 'landmark-madara-rider': 5, 'ui-calendar': 6, 'ui-language': 7, 'ui-music': 6,
}
CHECK = {  # things a specialist must confirm before the asset appears in a published (non-draft) mission
    **{k: 'Условен образ — сравни чертите със запазен портрет/снимка (историк).' for k in [
        'hero-elin-pelin', 'hero-georgi-rakovski', 'hero-hristo-botev', 'hero-ivan-vazov', 'hero-lyuben-karavelov', 'hero-neofit-rilski',
        'hero-petar-beron', 'hero-rayna-knyaginya', 'hero-sofroniy', 'hero-vasil-levski', 'hero-yordan-yovkov', 'hero-zahari-stoyanov',
        'science-john-atanasoff']},
    **{k: 'Няма достоверен портрет — образът е условен (иконографски). Да се каже в текста.' for k in [
        'hero-kiril', 'hero-metodiy', 'hero-kliment-ohridski', 'hero-naum', 'hero-paisiy', 'history-asparuh', 'history-boris-first',
        'history-ivan-asen-second', 'history-ivan-shishman', 'history-kaloyan', 'history-krum', 'history-omurtag', 'history-petar-first',
        'history-samuil', 'history-simeon']},
    **{k: 'Формата да се сравни със снимка на истинския предмет (музей).' for k in [
        'world-panagyurishte-treasure', 'world-rogozen-treasure', 'world-valchitran-treasure', 'landmark-madara-rider', 'science-atanasoff-computer']},
    **{k: 'Силуетът на върха да се сравни със снимка.' for k in ['peak-musala', 'peak-vihren', 'peak-botev']},
    'minigame-bulgaria-flag': 'Цветовете да се сравнят с официалните (бяло, зелено #00966E, червено #D62612).',
    'tradition-nestinarstvo': 'Чувствителна тема (огън, религиозен обичай) — текстът се проверява от учител.',
}
SMALL_UI = re.compile(r'^(ui-|game-(drag-handle|drop-target|timer|paintbrush|paint-bucket))')


def export(src: Path, out: Path, name: str) -> tuple[int, int]:
    out.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix == '.svg':
        out.write_bytes(src.read_bytes())
        return (0, 0)
    im = Image.open(src).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 0 if v < 20 else v)
    im.putalpha(a)
    im = im.crop(a.getbbox())
    if name.startswith(('koren-', 'raya-')):  # full-body pose, like public/img/poses
        h = 900
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    elif im.width > im.height * 1.25:  # wide scene / landscape object
        w = 640
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    else:
        side = round(max(im.size) * 1.04)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
        size = 192 if SMALL_UI.match(name) else 320
        im = sq.resize((size, size), Image.LANCZOS)
    for q in (82, 74, 66):
        im.save(out, 'WEBP', quality=q, method=6)
        if out.stat().st_size <= 150 * 1024:
            break
    return im.size


# Pictures that hold several things are cut into one picture per thing (v0.17): the parts go into the games,
# the whole picture stays "ready" unless something shows it as it is. Parts are cut at the empty columns between the things.
PARTS = {
    'minigame/beach-trash.webp': ['minigame/trash-bottle.webp', 'minigame/trash-can.webp', 'minigame/trash-wrapper.webp'],
    'minigame/recycling-bin.webp': ['minigame/bin-yellow.webp', 'minigame/bin-green.webp', 'minigame/bin-blue.webp'],
}


def cut_parts(whole: str, parts: list[str]) -> None:
    im = Image.open(PUB / whole).convert('RGBA')
    alpha = im.getchannel('A')
    cols = [any(alpha.getpixel((x, y)) > 20 for y in range(0, im.height, 2)) for x in range(im.width)]
    runs, start = [], None
    for x, on in enumerate(cols + [False]):
        if on and start is None:
            start = x
        elif not on and start is not None:
            if x - start > im.width * 0.08:  # ignore specks
                runs.append((start, x))
            start = None
    if len(runs) == 1 and len(parts) > 1:
        # the things touch (the three bins stand side by side): equal slices, each trimmed to its own picture
        x0, x1 = runs[0]
        w = (x1 - x0) / len(parts)
        runs = [(round(x0 + i * w + (w * 0.03 if i else 0)), round(x0 + (i + 1) * w - (w * 0.03 if i < len(parts) - 1 else 0))) for i in range(len(parts))]  # a thin margin: no sliver of the neighbour
    assert len(runs) == len(parts), f'{whole}: found {len(runs)} things, expected {len(parts)}'
    for (x0, x1), part in zip(runs, parts):
        piece = im.crop((x0, 0, x1, im.height))
        piece = piece.crop(piece.getchannel('A').getbbox())
        side = round(max(piece.size) * 1.08)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.alpha_composite(piece, ((side - piece.width) // 2, (side - piece.height) // 2))
        sq.resize((256, 256), Image.LANCZOS).save(PUB / part, 'WEBP', quality=82, method=6)


def referenced() -> set[str]:
    """Every image path the content shows (missions, map places) — what really counts as "used"."""
    files = sorted((ROOT / 'content/missions').glob('*.json'))
    text = ''.join(f.read_text() for f in files) + (ROOT / 'content/map/places.json').read_text() + (ROOT / 'content/fame.json').read_text()
    out = set(re.findall(r'"([a-z0-9/_-]+\.(?:webp|png|svg))"', text))
    # pictures the code itself names (e.g. the Discover map: src/map/art.ts)
    for f in (ROOT / 'src').rglob('*.ts*'):
        out |= set(re.findall(r"'([a-z0-9/_-]+\.(?:webp|png|svg))'", f.read_text()))
    for f in files:  # story lines name a hero and a pose, not a path
        for level in json.loads(f.read_text())['levels'].values():
            out |= {f"poses/{line['hero']}-{line.get('pose', 'point')}.webp" for line in level['story']}
    return out


def public_path(prefix: str, name: str, ext: str) -> str:
    if prefix in ('koren', 'raya'):
        return f'poses/{name}.{ext}'
    return f'{FOLDER[prefix]}/{name[len(prefix) + 1:]}.{ext}'


def main() -> None:
    entries = []
    shown = referenced()
    for src in sorted(SRC.rglob('*')):
        if not src.is_file() or src.suffix not in ('.png', '.svg'):
            continue
        name, prefix = src.stem, src.parent.name
        e = {'id': name, 'original': str(src.relative_to(ROOT)), 'category': prefix}
        ext = 'svg' if src.suffix == '.svg' else 'webp'
        if name in DUPLICATE:
            e |= {'status': 'duplicate', 'same': DUPLICATE[name]}
            assert (PUB / DUPLICATE[name]).exists(), name
        elif name in REVIEW:
            e |= {'status': 'review', 'check': REVIEW[name]}
        elif name in SOURCE:
            e |= {'status': 'source', 'stage': 2 if name.startswith('map-') else 3, 'license': SOURCE[name]}
        else:
            path = public_path(prefix, name, ext)
            # "used" is decided by the content, not by hand: a picture counts only if a mission or the map shows it.
            used = path in shown
            e |= {'status': 'used' if used else 'ready', 'path': path}
            if used:
                e['usedIn'] = USED.get(name, 'мисии')
            else:
                e['stage'] = STAGE_OVERRIDE.get(name, 5 if prefix in ('koren', 'raya') else STAGE[prefix])
            out = PUB / path
            if out.exists() and out.stat().st_mtime > src.stat().st_mtime:
                if out.suffix == '.webp':
                    e['size'] = 'x'.join(map(str, Image.open(out).size))
            else:
                w, h = export(src, out, name)
                if w:
                    e['size'] = f'{w}x{h}'
        if name in ('hero-kiril', 'hero-metodiy'):
            e['composite'] = 'history/kiril-metodiy.webp (показва се в „Азбуката на Кирил и Методий“)'
        if name in CHECK:
            e['check'] = CHECK[name]
        entries.append(e)

    # Composite made from two originals (one picture for "the brothers Cyril and Methodius").
    def figure(path: str, h: int) -> Image.Image:
        im = Image.open(PUB / path).convert('RGBA')
        im = im.crop(im.getchannel('A').getbbox())
        return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    kiril, metodiy = figure('people/kiril.webp', 300), figure('people/metodiy.webp', 300)
    gap = -round(min(kiril.width, metodiy.width) * 0.12)  # a little overlap: the brothers stand together
    canvas = Image.new('RGBA', (kiril.width + metodiy.width + gap, 300), (0, 0, 0, 0))
    canvas.alpha_composite(metodiy, (kiril.width + gap, 0))
    canvas.alpha_composite(kiril, (0, 0))
    (PUB / 'history').mkdir(exist_ok=True)
    canvas.save(PUB / 'history/kiril-metodiy.webp', 'WEBP', quality=82, method=6)

    for whole, parts in PARTS.items():
        cut_parts(whole, parts)

    paths = [e['path'] for e in entries if 'path' in e]
    assert len(paths) == len(set(paths)), 'two assets export to the same file'
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    summary = {s: sum(1 for e in entries if e['status'] == s) for s in ('used', 'ready', 'source', 'duplicate', 'review')}
    OUT_JSON.write_text(json.dumps({'version': 'v5', 'total': len(entries), 'summary': summary, 'composites': {'history/kiril-metodiy.webp': ['hero-kiril', 'hero-metodiy']}, 'parts': PARTS, 'assets': entries}, ensure_ascii=False, indent=1) + '\n')
    write_doc(entries, summary)
    print(len(entries), summary)


def write_doc(entries: list, summary: dict) -> None:
    """docs/expansion/KOREN_ASSET_MANIFEST.md — the same decisions as a readable table."""
    names = {'used': 'В приложението сега', 'ready': 'Готови за следващ етап', 'source': 'Данни (оригинал за препроектиране)',
             'duplicate': 'Дубликати на съществуващи картинки', 'review': 'Чакат проверка (не се публикуват)'}
    o = ['# KOREN — регистър на 300-те ресурса v5', '',
         '> Генерира се от `python3 scripts/assets-v5.py` заедно с `content/assets/manifest.json`. Не редактирай на ръка.', '',
         '| Статус | Брой |', '|---|---:|'] + [f'| {names[k]} (`{k}`) | {v} |' for k, v in summary.items()] + ['| **Общо** | **300** |', '']
    for status in names:
        rows = [e for e in entries if e['status'] == status]
        o += [f'## {names[status]} — {len(rows)}', '', '| ID | Оригинал | Път в `public/img` / същото като | Етап | Бележка / проверка |', '|---|---|---|---|---|']
        for e in rows:
            where = e.get('path') or (f"= `{e['same']}`" if 'same' in e else '—')
            note = ' · '.join(x for x in (e.get('usedIn'), e.get('license'), e.get('composite'), e.get('check')) if x)
            o.append(f"| `{e['id']}` | `{e['original']}` | {('`' + where + '`') if e.get('path') else where} | {e.get('stage', '')} | {note} |")
        o.append('')
    (ROOT / 'docs/expansion/KOREN_ASSET_MANIFEST.md').write_text('\n'.join(o) + '\n')


if __name__ == '__main__':
    main()
