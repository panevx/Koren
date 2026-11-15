# KOREN — prompts за генериране на изображения

> Начин на работа — същият като в `design/chatgpt-prompts.md`, който вече даде добри резултати:
> 1. Отваряш нов разговор в генератора и поставяш **СЕСИЯ: ПРАВИЛА + MASTER STYLE + NEGATIVE** (по-долу) веднъж.
> 2. Прикачваш референциите, посочени за пакета.
> 3. Пращаш prompt-овете ЕДИН ПО ЕДИН. След всеки проверяваш и пишеш „следваща“ или „поправи: …“.
> 4. Записваш файла с точното име и го качваш в посочената папка.

## СЕСИЯ: ПРАВИЛА (постави веднъж в началото на разговора)

```
You are the illustrator of KOREN, an educational game about Bulgaria for children aged 4–14.
We make game assets ONE AT A TIME. After each image STOP and wait for me to write "next" or "fix: ...".
Never put text, letters, numbers, logos, watermarks or signatures in an image.
Every asset must look like it belongs to the same game as the attached reference images.
Before showing an image, check it yourself: real transparent background (no checkerboard, no white box),
the whole object visible and not cut by the edge, no text, same style and lighting as the references.
```

## MASTER STYLE PROMPT

Изведен от 50-те обекта в `public/img/world/` (design/v4) — те са най-чистият пример за „Playful 3D“ в проекта.
Не въвеждаме нов стил: продължаваме този.

```
KOREN MASTER STYLE:
Playful 3D game asset that looks like a handmade clay / soft matte vinyl toy.
Chunky simplified shapes, every edge rounded and soft, no thin fragile parts, slightly oversized "cute" proportions.
Matte clay surfaces with a gentle satin highlight; metal and gold are glossy but still soft and toy-like.
Lighting: soft warm studio key light from the top-left, gentle fill from the right, soft ambient occlusion in creases,
no harsh speculars, no dramatic shadows. No cast shadow on the ground (the app adds its own soft shadow).
Color palette: rich but harmonious and slightly warm — forest green #138B50, coral red #FF655C, sunny yellow #FFD35A,
sky blue #72C8F5, cream #F8F5ED, warm wood browns, terracotta, stone beige. Avoid neon and muddy greys.
Bulgarian details (embroidery, costumes, buildings) are simplified but authentic: red-white-black/green geometric embroidery,
terracotta roofs, whitewashed walls, carved wood.
Readable as a silhouette at 64 pixels. One clear subject, centered.
Transparent background (real alpha channel) unless the prompt says "scene".
```

## NEGATIVE PROMPT

```
NEGATIVE: photorealism, realistic skin pores or fur strands (except the animal set), sharp or hard edges, thin spiky parts,
grunge, dirt, scary or aggressive expressions, blood, weapons pointed at anyone, horror, sad or crying,
text, letters, numbers, Cyrillic or Latin characters, logos, brand names, real company products, UNESCO emblem,
flags or coats of arms (unless explicitly requested), watermark, signature, frame, border, checkerboard pattern,
white or colored background box, drop shadow on the floor, cropped object, multiple unrelated objects,
inconsistent perspective (no top-down flat icons, no extreme fisheye), flat 2D vector style, line-art outlines,
pixel art, anime, glossy plastic look, metallic chrome everywhere, overly detailed small ornaments, busy background.
```

## Правила за конкретни групи

| Група | Допълнение към стила |
|---|---|
| Маркери за картата (`marker`) | Всички стоят върху **еднаква** кръгла тревна основа (70% от ширината) — разпознават се като комплект. Символът е над основата, висок и ясен. |
| Медальони (`badge`) | Точно като 12-те съществуващи значки: дебел златен ръб с тънка червено-бяла шевица, кремав релефен център. **Без лица на реални хора.** |
| Животни (`animal`) | Продължават набора от 25 животни (по-детайлен мек 3D, не глина). Прикачи 2 съществуващи животни за референция. |
| Герои (`figure`) | Корен и Рая — САМО с прикачената референция от `design/characters/v3/`. Лицето, косата и пропорциите не се променят. |
| Етапи на изделие (`stage`) | Една и съща камера, мащаб и позиция за всички етапи — картинките се сменят на място. Генерирай етап 1 и после „същото, но…“. |
| Сцени (`scene`) | Мек фон, средата е празна и спокойна; обектите в играта са отделни картинки. |
| Исторически предмети | Формата трябва да съвпада със снимката на истинския предмет (прикачи я). Илюстрация „по мотиви“, не копие. Минава проверка от историк. |


---

## Пакет 01 — Карта и география (маркери, релеф като понятия, Дунав)

**Прикачи като референция:** world/mountain-peak.webp, world/koprivshtitsa-house.webp, world/forest-bush.webp (от `public/img/world/`) — за материала и основата.

**Качи оригиналите в:** `design/v5/01-map/`

### `MAP-CITY` — Град (P0) → `map-city.png`

```
KOREN asset MAP-CITY — City. Size 1024×1024. Transparent background (real alpha channel).
Subject: Three small chubby houses with cream walls, terracotta red rounded roofs and tiny square windows, grouped tightly, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-CAPITAL` — Столица (P1) → `map-capital.png`

```
KOREN asset MAP-CAPITAL — Capital. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cluster of four cream houses with terracotta roofs around one taller building with a single golden dome, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width. The dome is the brightest element.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-PEAK` — Връх (P0) → `map-peak.png`

```
KOREN asset MAP-PEAK — Peak. Size 1024×1024. Transparent background (real alpha channel).
Subject: One sharp but rounded grey rock peak with a thick white snow cap, a tiny plain red pennant flag on a thin pole at the very top (no symbols on the flag), standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-CAVE` — Пещера (P1) → `map-cave.png`

```
KOREN asset MAP-CAVE — Cave. Size 1024×1024. Transparent background (real alpha channel).
Subject: A rounded mound of beige-grey rock with a dark arched cave entrance, three small stalactites hanging inside the entrance, moss on top, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-SPRING` — Минерален извор (P1) → `map-spring.png`

```
KOREN asset MAP-SPRING — Mineral spring. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small round stone basin filled with turquoise warm water, three soft white curls of steam rising, two smooth pebbles beside it, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-SKI` — Ски курорт (P1) → `map-ski.png`

```
KOREN asset MAP-SKI — Ski resort. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small snowy slope with two crossed red skis stuck upright in the snow and one tiny chairlift pole with a single chair, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width covered with snow instead of grass.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-WATERFALL` — Водопад (P2) → `map-waterfall.png`

```
KOREN asset MAP-WATERFALL — Waterfall. Size 1024×1024. Transparent background (real alpha channel).
Subject: A short rounded cliff of grey rock with a smooth sky-blue waterfall ribbon falling into a small pool with white foam, ferns on the sides, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-LAKE` — Езеро (P2) → `map-lake.png`

```
KOREN asset MAP-LAKE — Lake. Size 1024×1024. Transparent background (real alpha channel).
Subject: One small oval mountain lake of glossy sky-blue water surrounded by rounded grey stones and two tiny pine trees, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-SOURCE` — Извор на река (P0) → `map-source.png`

```
KOREN asset MAP-SOURCE — River source. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cluster of mossy rounded rocks with a thin trickle of clear sky-blue water springing out between them and starting a tiny stream, a few small droplets in the air, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-MOUTH` — Устие (P0) → `map-mouth.png`

```
KOREN asset MAP-MOUTH — River mouth. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small sky-blue river widening into a fan shape and flowing into a deeper blue sea edge with one gentle wave, sandy banks on both sides, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-CHECKPOINT` — Граничен пункт (P1) → `map-checkpoint.png`

```
KOREN asset MAP-CHECKPOINT — Border checkpoint. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small booth with a cream wall and a flat roof next to a lifted barrier boom painted in red and white stripes, a short strip of grey road passes under it, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width. No text, no flags, no emblems.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-ROAD` — Магистрала (P2) → `map-road.png`

```
KOREN asset MAP-ROAD — Motorway. Size 1024×1024. Transparent background (real alpha channel).
Subject: A short curved piece of dark grey road with a dashed yellow center line, a small green road-side bush, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width. No signs, no text.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-PORT` — Пристанище (P2) → `map-port.png`

```
KOREN asset MAP-PORT — Port. Size 1024×1024. Transparent background (real alpha channel).
Subject: A short wooden pier on blue water with a chubby small cargo ship (red hull, white cabin, one funnel), standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width replaced by water on one side.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-MONASTERY` — Манастир (P1) → `map-monastery.png`

```
KOREN asset MAP-MONASTERY — Monastery. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small generic Orthodox church with cream stone walls, a terracotta tiled roof and one rounded dark-green dome with a small golden cross, a tiny bell tower beside it, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-RUIN` — Крепост (руини) (P1) → `map-ruin.png`

```
KOREN asset MAP-RUIN — Fortress ruins. Size 1024×1024. Transparent background (real alpha channel).
Subject: A short broken stone fortress wall with one rounded square tower, a few fallen stone blocks, warm beige stone, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-HERITAGE` — Световно наследство (P1) → `map-heritage.png`

```
KOREN asset MAP-HERITAGE — World heritage. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small classical stone temple front with four columns inside a golden laurel wreath, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width. Do NOT draw any real logo or emblem.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-PARK` — Национален парк (P0) → `map-park.png`

```
KOREN asset MAP-PARK — National park. Size 1024×1024. Transparent background (real alpha channel).
Subject: A tall rounded dark-green pine tree, a smaller beech tree and a fern, a small blank wooden ranger sign on a post (no text), standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MAP-FIELD` — Житно поле (P1) → `map-field.png`

```
KOREN asset MAP-FIELD — Wheat field. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small square field of golden wheat stalks with one tall sunflower in the corner, standing on a small round clay base of soft green grass with a rounded edge, the base is 70% of the image width.
Camera: three-quarter front view from slightly above (about 25 degrees), centered, the whole base visible, filling about 85% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `DANUBE-EMBLEM` — Дунав (P0) → `danube-emblem.png`

```
KOREN asset DANUBE-EMBLEM — The Danube. Size 1024×1024. Transparent background (real alpha channel).
Subject: A wide glossy sky-blue river ribbon curving from left to right like a road seen from above, on it a chubby white paddle steamer with a red paddle wheel and one black funnel with a thin red band, small green banks with two willow trees. No text, no flags.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-PLAIN` — Равнина (P1) → `relief-plain.png`

```
KOREN asset RELIEF-PLAIN — Plain. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing a flat wide green meadow with tiny rounded crop rows and one small tree, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-LOWLAND` — Низина (P1) → `relief-lowland.png`

```
KOREN asset RELIEF-LOWLAND — Lowland. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing a very low flat wet green land with a slow sky-blue river, reeds and a small pond, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-BASIN` — Котловина (P1) → `relief-basin.png`

```
KOREN asset RELIEF-BASIN — Basin. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing a round low green valley in the middle surrounded on all sides by a ring of rounded hills, a tiny village in the center, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-PLATEAU` — Плато (P1) → `relief-plateau.png`

```
KOREN asset RELIEF-PLATEAU — Plateau. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing a high table-shaped land with a perfectly flat green top and steep rocky sides, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-PASS` — Проход (P1) → `relief-pass.png`

```
KOREN asset RELIEF-PASS — Mountain pass. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing two rounded mountains with a low saddle between them and a small winding road crossing the saddle, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RELIEF-GORGE` — Пролом (P1) → `relief-gorge.png`

```
KOREN asset RELIEF-GORGE — Gorge. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama tile showing a narrow deep cut between two tall rock walls with a sky-blue river flowing through the bottom, built on a thick round slice of earth showing brown soil layers on the edge (like a cut cake).
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 02 — Реки, планини, море

**Прикачи като референция:** world/mountain-peak.webp; за морските обитатели: animals/dolphin.webp и animals/pelican.webp (стилът на животните).

**Качи оригиналите в:** `design/v5/02-nature-water/`

### `PEAK-VIHREN` — Вихрен (P1) → `peak-vihren.png`

```
KOREN asset PEAK-VIHREN — Vihren. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay mountain model: a tall sharp pyramid-shaped peak of pale grey-white marble rock with snow streaks, a small glacial lake at its foot, on a round base. Stylized but recognizable silhouette.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PEAK-MUSALA` — Мусала (P1) → `peak-musala.png`

```
KOREN asset PEAK-MUSALA — Musala. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay mountain model: a broad rounded rocky summit with a small square stone weather station building with a little round dome on top, snow patches, on a round base. Stylized but recognizable silhouette.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PEAK-BOTEV` — Ботев връх (P1) → `peak-botev.png`

```
KOREN asset PEAK-BOTEV — Botev Peak. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay mountain model: a long grassy rounded ridge summit with a tall thin metal antenna tower on top, green slopes and grey rocks, on a round base. Stylized but recognizable silhouette.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PEAK-CHERNI-VRAH` — Черни връх (P1) → `peak-cherni-vrah.png`

```
KOREN asset PEAK-CHERNI-VRAH — Cherni Vrah. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay mountain model: a gentle wide rounded summit covered with dark granite boulders (stone rivers) and low grass, a small cabin, on a round base. Stylized but recognizable silhouette.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MTN-RHODOPES` — Родопи (гориста планина) (P1) → `mtn-rhodopes.png`

```
KOREN asset MTN-RHODOPES — Rhodope type. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama of soft rounded forested hills (dark-green pines), a tiny village with white houses and grey stone roofs on a slope, a winding stream, on a round base.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MTN-BALKAN` — Стара планина (дълъг хребет) (P1) → `mtn-balkan.png`

```
KOREN asset MTN-BALKAN — Balkan range type. Size 1024×1024. Transparent background (real alpha channel).
Subject: A cute clay diorama of one long horizontal mountain ridge with rounded tops, light-green beech forest on the lower slopes, a small road crossing a low point, on an oval base.
Camera: isometric three-quarter view from above (about 35 degrees), centered, the whole round base visible.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `DROPLET` — Капчица (водач) (P1) → `droplet.png`

```
KOREN asset DROPLET — Little Drop (guide). Size 1024×1024. Transparent background (real alpha channel).
Subject: A friendly chubby water droplet character, glossy translucent sky-blue clay, big round dark eyes with white highlights, small happy smile, tiny arms, no legs, slight bounce pose.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-JELLYFISH` — Медуза (P1) → `sea-jellyfish.png`

```
KOREN asset SEA-JELLYFISH — Jellyfish. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round translucent pale-pink moon jellyfish with four soft rings on the bell and short frilly tentacles.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-TURBOT` — Калкан (P1) → `sea-turbot.png`

```
KOREN asset SEA-TURBOT — Turbot. Size 1024×1024. Transparent background (real alpha channel).
Subject: a flat round turbot fish lying sideways, sandy-brown with small bumps, both eyes on top.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-GOBY` — Попче (P1) → `sea-goby.png`

```
KOREN asset SEA-GOBY — Goby. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small chubby goby fish, brown-beige with darker spots, big friendly eyes.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-SEAHORSE` — Морско конче (P1) → `sea-seahorse.png`

```
KOREN asset SEA-SEAHORSE — Seahorse. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small curled seahorse, warm yellow-brown, standing upright.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-CRAB` — Рак (P1) → `sea-crab.png`

```
KOREN asset SEA-CRAB — Crab. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small rounded brown-red shore crab with raised claws.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEA-MUSSEL` — Мида (P1) → `sea-mussel.png`

```
KOREN asset SEA-MUSSEL — Mussel. Size 1024×1024. Transparent background (real alpha channel).
Subject: two dark blue-black mussel shells, one slightly open.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 03 — История, будители, съкровища

**Прикачи като референция:** badges/paisiy.webp и badges/simeon.webp за медальоните; world/rose-oil-bottle.webp и world/simeon-crown.webp за предметите. За съкровищата и Мадарския конник — И СНИМКА НА ИСТИНСКИЯ ПРЕДМЕТ от музея (само като референция за форма).

**Качи оригиналите в:** `design/v5/03-history/`

### `BADGE-LEVSKI` — Васил Левски — медальон (P0) → `badge-levski.png`

```
KOREN asset BADGE-LEVSKI — Levski medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a rearing golden lion in front of an open handwritten letter and a quill. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-BOTEV` — Христо Ботев — медальон (P0) → `badge-botev.png`

```
KOREN asset BADGE-BOTEV — Botev medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a chubby paddle steamer on the Danube in front of an open notebook of poems and a quill. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-VAZOV` — Иван Вазов — медальон (P0) → `badge-vazov.png`

```
KOREN asset BADGE-VAZOV — Vazov medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a thick open book with blank pages and a small two-storey Revival house with a red roof behind it. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-SOFRONIY` — Софроний Врачански — медальон (P1) → `badge-sofroniy.png`

```
KOREN asset BADGE-SOFRONIY — Sofroniy medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: an old leather book with a golden clasp and a bishop staff with a curled top. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-BERON` — Петър Берон — медальон (P1) → `badge-beron.png`

```
KOREN asset BADGE-BERON — Beron medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a small old primer book with a blue dolphin on its cover and a school slate board. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-NEOFIT` — Неофит Рилски — медальон (P1) → `badge-neofit.png`

```
KOREN asset BADGE-NEOFIT — Neofit Rilski medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: an open grammar book, an ink pot and a small arched monastery window behind. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-KRUM` — Хан Крум — медальон (P1) → `badge-krum.png`

```
KOREN asset BADGE-KRUM — Khan Krum medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a round shield with a horse-tail standard and a stone tablet with carved lines (no letters). Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-IVAN-ASEN` — Цар Иван Асен II — медальон (P1) → `badge-ivan-asen.png`

```
KOREN asset BADGE-IVAN-ASEN — Ivan Asen II medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a golden crown above a stone column with carved lines (no letters) and a fortress gate. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-REVIVAL` — Възраждане — медальон (P1) → `badge-revival.png`

```
KOREN asset BADGE-REVIVAL — Revival medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: a small school building with a bell and an open book in front. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `BADGE-CYRIL-METHODIUS` — Кирил и Методий / 24 май — медальон (P0) → `badge-cyril-methodius.png`

```
KOREN asset BADGE-CYRIL-METHODIUS — Cyril & Methodius medallion. Size 1024×1024. Transparent background (real alpha channel).
Subject: A round medallion in the exact style of the existing KOREN badges: thick golden rim with a thin red-and-white embroidery pattern, cream embossed clay center. In the center: two crossed quills over an open book, a wreath of small spring flowers around. Soft relief, no faces, no text, no letters.
Camera: straight front view, the medallion fills about 90% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-PANAGYURISHTE` — Панагюрско съкровище (ритон) (P1) → `hist-panagyurishte.png`

```
KOREN asset HIST-PANAGYURISHTE — Panagyurishte treasure. Size 1024×1024. Transparent background (real alpha channel).
Subject: one golden drinking horn (rhyton) ending in the front half of a deer, smooth polished gold with simple relief bands. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-VALCHITRAN` — Вълчитрънско съкровище (P1) → `hist-valchitran.png`

```
KOREN asset HIST-VALCHITRAN — Valchitran treasure. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wide shallow golden vessel with two handles and a round golden lid, smooth with simple ribbed bands. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-ROGOZEN` — Рогозенско съкровище (P1) → `hist-rogozen.png`

```
KOREN asset HIST-ROGOZEN — Rogozen treasure. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small silver jug with one handle and a round silver bowl with simple relief, soft silver shine. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-MADARA` — Мадарски конник (P1) → `hist-madara.png`

```
KOREN asset HIST-MADARA — Madara Rider. Size 1024×1024. Transparent background (real alpha channel).
Subject: a vertical rock cliff with a shallow carved relief of a horseman, a dog and a lion, warm beige stone. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-BABA-VIDA` — Крепост „Баба Вида“ (P1) → `hist-baba-vida.png`

```
KOREN asset HIST-BABA-VIDA — Baba Vida fortress. Size 1024×1024. Transparent background (real alpha channel).
Subject: a compact square medieval stone fortress with round corner towers on the bank of a blue river. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-CANNON` — Черешово топче (P1) → `hist-cannon.png`

```
KOREN asset HIST-CANNON — Cherry-wood cannon. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wooden cannon made from a cherry tree trunk bound with iron rings, on a small wooden cart. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-THRACIAN-TOMB` — Казанлъшка гробница (P1) → `hist-thracian-tomb.png`

```
KOREN asset HIST-THRACIAN-TOMB — Kazanlak tomb. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small round grassy mound with a stone entrance corridor, an arched doorway. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `HIST-CELL-SCHOOL` — Килийно училище (P1) → `hist-cell-school.png`

```
KOREN asset HIST-CELL-SCHOOL — Cell school. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small room in clay style: a low wooden table, a sand tray for writing and a wooden pointer, a small window. Stylized like a toy model, proportions and silhouette must stay faithful to the real object.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 04 — Природа, Червена книга, отпадъци

**Прикачи като референция:** animals/eagle.webp, animals/lynx.webp (стил на животните); world/forest-bush.webp, world/butterfly.webp (растения); world/sorting-box.webp (контейнери).

**Качи оригиналите в:** `design/v5/04-nature/`

### `PLANT-EDELWEISS` — Еделвайс (P1) → `plant-edelweiss.png`

```
KOREN asset PLANT-EDELWEISS — Edelweiss. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small edelweiss flower: woolly white star-shaped bracts with a yellow center, grey-green leaves, in a clump of rock. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-HABERLEA` — Родопски силивряк (P1) → `plant-haberlea.png`

```
KOREN asset PLANT-HABERLEA — Haberlea. Size 1024×1024. Transparent background (real alpha channel).
Subject: a rosette of dark-green crinkled leaves on a mossy rock with several pale lilac bell-shaped flowers. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-PIRIN-TEA` — Пирински чай (P1) → `plant-pirin-tea.png`

```
KOREN asset PLANT-PIRIN-TEA — Pirin tea. Size 1024×1024. Transparent background (real alpha channel).
Subject: a clump of silvery-green fuzzy stems with spikes of small pale-yellow flowers. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-PRIMULA` — Рилска иглика (P1) → `plant-primula.png`

```
KOREN asset PLANT-PRIMULA — Rila primrose. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small clump of rounded leaves with a few violet-purple primrose flowers on short stems. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-SNOWDROP` — Кокиче (P1) → `plant-snowdrop.png`

```
KOREN asset PLANT-SNOWDROP — Snowdrop. Size 1024×1024. Transparent background (real alpha channel).
Subject: three white snowdrops with drooping bell flowers and thin green leaves coming out of a tiny patch of snow. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-BEECH` — Бук (P2) → `plant-beech.png`

```
KOREN asset PLANT-BEECH — Beech tree. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round fluffy light-green beech tree with a smooth grey trunk. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PLANT-OAK` — Дъб (P2) → `plant-oak.png`

```
KOREN asset PLANT-OAK — Oak tree. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wide rounded dark-green oak tree with a thick brown trunk and a few acorns at its foot. Botanically recognizable shape and colors, simplified into soft clay forms.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ANIMAL-VULTURE` — Египетски лешояд (P1) → `animal-vulture.png`

```
KOREN asset ANIMAL-VULTURE — Egyptian vulture. Size 1024×1024. Transparent background (real alpha channel).
Subject: an Egyptian vulture standing: white-cream feathers, black wing tips, bare yellow face, slim hooked beak. SAME rendering style as the existing KOREN animal set (attached reference): soft 3D, gentle fur/feather detail, full body.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ANIMAL-STURGEON` — Есетра (P1) → `animal-sturgeon.png`

```
KOREN asset ANIMAL-STURGEON — Sturgeon. Size 1024×1024. Transparent background (real alpha channel).
Subject: a long sturgeon fish with a pointed snout, rows of bony plates along its grey-brown back. SAME rendering style as the existing KOREN animal set (attached reference): soft 3D, gentle fur/feather detail, full body.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ANIMAL-SOUSLIK` — Лалугер (P1) → `animal-souslik.png`

```
KOREN asset ANIMAL-SOUSLIK — European souslik. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small sandy-brown ground squirrel standing upright on its hind legs, tiny ears. SAME rendering style as the existing KOREN animal set (attached reference): soft 3D, gentle fur/feather detail, full body.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ANIMAL-MONK-SEAL` — Средиземноморски тюлен (P1) → `animal-monk-seal.png`

```
KOREN asset ANIMAL-MONK-SEAL — Monk seal. Size 1024×1024. Transparent background (real alpha channel).
Subject: a chubby grey-brown monk seal resting on a rock. SAME rendering style as the existing KOREN animal set (attached reference): soft 3D, gentle fur/feather detail, full body.
Camera: three-quarter side view, full body visible, centered, about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BIN-YELLOW` — Жълт контейнер (P1) → `waste-bin-yellow.png`

```
KOREN asset WASTE-BIN-YELLOW — Yellow bin. Size 1024×1024. Transparent background (real alpha channel).
Subject: a chubby rounded wheelie recycling bin painted sunny yellow with a rounded lid. No text, no recycling symbols. All four bins must be identical in shape and angle, only the color differs.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BIN-BLUE` — Син контейнер (P1) → `waste-bin-blue.png`

```
KOREN asset WASTE-BIN-BLUE — Blue bin. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same chubby rounded wheelie recycling bin painted sky blue. No text, no recycling symbols. All four bins must be identical in shape and angle, only the color differs.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BIN-GREEN` — Зелен контейнер (P1) → `waste-bin-green.png`

```
KOREN asset WASTE-BIN-GREEN — Green bin. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same chubby rounded wheelie recycling bin painted green, round opening on the lid. No text, no recycling symbols. All four bins must be identical in shape and angle, only the color differs.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BIN-BROWN` — Кафяв контейнер (био) (P1) → `waste-bin-brown.png`

```
KOREN asset WASTE-BIN-BROWN — Brown bin. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same chubby rounded wheelie bin painted brown. No text, no recycling symbols. All four bins must be identical in shape and angle, only the color differs.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BOTTLE` — Пластмасова бутилка (P1) → `waste-bottle.png`

```
KOREN asset WASTE-BOTTLE — Plastic bottle. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty crumpled clear plastic bottle with a blue cap. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-CAN` — Метална кутийка (P1) → `waste-can.png`

```
KOREN asset WASTE-CAN — Can. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty slightly dented aluminum can, plain silver with a red band, no logo. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-PAPER` — Вестник (P1) → `waste-paper.png`

```
KOREN asset WASTE-PAPER — Newspaper. Size 1024×1024. Transparent background (real alpha channel).
Subject: a folded newspaper with grey lines instead of text. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BOX` — Картонена кутия (P1) → `waste-box.png`

```
KOREN asset WASTE-BOX — Cardboard box. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small flattened brown cardboard box. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-JAR` — Стъклен буркан (P1) → `waste-jar.png`

```
KOREN asset WASTE-JAR — Glass jar. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty clear glass jar without a lid. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-PEEL` — Бананова кора (P1) → `waste-peel.png`

```
KOREN asset WASTE-PEEL — Banana peel. Size 1024×1024. Transparent background (real alpha channel).
Subject: a yellow banana peel. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-APPLE` — Огризка (P1) → `waste-apple.png`

```
KOREN asset WASTE-APPLE — Apple core. Size 1024×1024. Transparent background (real alpha channel).
Subject: an apple core with two brown seeds. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-BAG` — Найлонова торбичка (P1) → `waste-bag.png`

```
KOREN asset WASTE-BAG — Plastic bag. Size 1024×1024. Transparent background (real alpha channel).
Subject: a crumpled white plastic bag (for the sea rescue game). Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `WASTE-NET` — Изгубена рибарска мрежа (P1) → `waste-net.png`

```
KOREN asset WASTE-NET — Ghost net. Size 1024×1024. Transparent background (real alpha channel).
Subject: a tangled piece of green fishing net. Clean and friendly, not dirty or disgusting.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 05 — Традиции, занаяти и кухня

**Прикачи като референция:** world/traditional-bread.webp, world/rose-oil-bottle.webp, world/martenitsa-pizho-penda.webp.

**Качи оригиналите в:** `design/v5/05-traditions-food/`

### `FOOD-BANITSA` — Баница (P1) → `food-banitsa.png`

```
KOREN asset FOOD-BANITSA — Banitsa. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round baked banitsa pastry in a shallow tray, golden flaky spiral layers, one slice cut out showing white cheese. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-TARATOR` — Таратор (P1) → `food-tarator.png`

```
KOREN asset FOOD-TARATOR — Tarator. Size 1024×1024. Transparent background (real alpha channel).
Subject: a clay bowl of cold white yogurt soup with cucumber cubes, chopped dill and walnut pieces on top. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-SHOPSKA` — Шопска салата (P1) → `food-shopska.png`

```
KOREN asset FOOD-SHOPSKA — Shopska salad. Size 1024×1024. Transparent background (real alpha channel).
Subject: a bowl with tomato and cucumber pieces, roasted pepper, onion rings, covered with a white mound of grated cheese. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-LYUTENITSA` — Лютеница (P1) → `food-lyutenitsa.png`

```
KOREN asset FOOD-LYUTENITSA — Lyutenitsa. Size 1024×1024. Transparent background (real alpha channel).
Subject: a glass jar of thick red-orange pepper and tomato spread with a cloth cap tied with string. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-PATATNIK` — Родопски пататник (P1) → `food-patatnik.png`

```
KOREN asset FOOD-PATATNIK — Patatnik. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round golden-brown potato pie in a black round pan, crispy edge. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-KOZUNAK` — Козунак (P2) → `food-kozunak.png`

```
KOREN asset FOOD-KOZUNAK — Kozunak. Size 1024×1024. Transparent background (real alpha channel).
Subject: a braided sweet Easter bread, shiny golden top with sugar crystals. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-SARMI` — Сарми (P2) → `food-sarmi.png`

```
KOREN asset FOOD-SARMI — Sarmi. Size 1024×1024. Transparent background (real alpha channel).
Subject: small rolled cabbage leaf rolls in a clay pot. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `FOOD-YOGURT` — Кисело мляко (P1) → `food-yogurt.png`

```
KOREN asset FOOD-YOGURT — Bulgarian yogurt. Size 1024×1024. Transparent background (real alpha channel).
Subject: a traditional brown clay pot of thick white yogurt with a wooden spoon. Appetizing, warm, simple.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-EGGS` — Яйца (P1) → `ing-eggs.png`

```
KOREN asset ING-EGGS — Eggs. Size 1024×1024. Transparent background (real alpha channel).
Subject: three white-brown eggs in a small heap. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-CHEESE` — Сирене (P1) → `ing-cheese.png`

```
KOREN asset ING-CHEESE — White cheese. Size 1024×1024. Transparent background (real alpha channel).
Subject: a white block of brined cheese with small holes. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-FILO` — Кори за баница (P1) → `ing-filo.png`

```
KOREN asset ING-FILO — Filo sheets. Size 1024×1024. Transparent background (real alpha channel).
Subject: a stack of thin pale filo pastry sheets, slightly wavy edges. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-CUCUMBER` — Краставица (P1) → `ing-cucumber.png`

```
KOREN asset ING-CUCUMBER — Cucumber. Size 1024×1024. Transparent background (real alpha channel).
Subject: one green cucumber and two round slices. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-TOMATO` — Домат (P1) → `ing-tomato.png`

```
KOREN asset ING-TOMATO — Tomato. Size 1024×1024. Transparent background (real alpha channel).
Subject: one big red tomato with a green star-shaped stem. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-PEPPER` — Печена чушка (P1) → `ing-pepper.png`

```
KOREN asset ING-PEPPER — Roasted pepper. Size 1024×1024. Transparent background (real alpha channel).
Subject: one long red roasted pepper with slightly charred skin. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-ONION` — Лук (P1) → `ing-onion.png`

```
KOREN asset ING-ONION — Onion. Size 1024×1024. Transparent background (real alpha channel).
Subject: one brown onion and one red onion half. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-POTATO` — Картоф (P1) → `ing-potato.png`

```
KOREN asset ING-POTATO — Potato. Size 1024×1024. Transparent background (real alpha channel).
Subject: two brown potatoes. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-WALNUT` — Орех (P1) → `ing-walnut.png`

```
KOREN asset ING-WALNUT — Walnut. Size 1024×1024. Transparent background (real alpha channel).
Subject: three walnuts, one cracked. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-DILL` — Копър (P1) → `ing-dill.png`

```
KOREN asset ING-DILL — Dill. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small bunch of feathery green dill. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-GARLIC` — Чесън (P1) → `ing-garlic.png`

```
KOREN asset ING-GARLIC — Garlic. Size 1024×1024. Transparent background (real alpha channel).
Subject: one white garlic head and one clove. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-FLOUR` — Брашно (P1) → `ing-flour.png`

```
KOREN asset ING-FLOUR — Flour. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small cloth sack of white flour, open, with a scoop. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-OIL` — Олио (P1) → `ing-oil.png`

```
KOREN asset ING-OIL — Sunflower oil. Size 1024×1024. Transparent background (real alpha channel).
Subject: a plain golden bottle of sunflower oil, no label. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ING-SALT` — Сол (P1) → `ing-salt.png`

```
KOREN asset ING-SALT — Salt. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small wooden bowl of white salt. Same scale feel as the other ingredients.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-BOWL` — Глинена купа (P1) → `kitchen-bowl.png`

```
KOREN asset KITCHEN-BOWL — Clay bowl. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty wide brown glazed clay bowl seen slightly from above.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-TRAY` — Тава (P1) → `kitchen-tray.png`

```
KOREN asset KITCHEN-TRAY — Baking tray. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty round metal baking tray.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-ROLLING-PIN` — Точилка (P1) → `kitchen-rolling-pin.png`

```
KOREN asset KITCHEN-ROLLING-PIN — Rolling pin. Size 1024×1024. Transparent background (real alpha channel).
Subject: a long thin wooden rolling pin (Bulgarian oklagia).
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-SPOON` — Дървена лъжица (P1) → `kitchen-spoon.png`

```
KOREN asset KITCHEN-SPOON — Wooden spoon. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wooden spoon.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-POT` — Тенджера (P1) → `kitchen-pot.png`

```
KOREN asset KITCHEN-POT — Pot. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round copper pot with two handles.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `KITCHEN-OVEN` — Пещ (P1) → `kitchen-oven.png`

```
KOREN asset KITCHEN-OVEN — Oven. Size 1024×1024. Transparent background (real alpha channel).
Subject: a rounded traditional clay bread oven with an arched opening and a soft warm glow inside.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-KUKER-MASK` — Кукерска маска (P1) → `custom-kuker-mask.png`

```
KOREN asset CUSTOM-KUKER-MASK — Kuker mask. Size 1024×1024. Transparent background (real alpha channel).
Subject: a big kuker mask made of fluffy colorful wool tassels and long black-and-white goat fur, two small horns, round mirror pieces, friendly not scary, with big brass bells hanging below.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-SURVACHKA` — Сурвачка (P1) → `custom-survachka.png`

```
KOREN asset CUSTOM-SURVACHKA — Survachka. Size 1024×1024. Transparent background (real alpha channel).
Subject: a bent dogwood branch decorated with popcorn strings, red wool threads, dried fruit and a coin.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-LAZARKA` — Венец на лазарка (P1) → `custom-lazarka.png`

```
KOREN asset CUSTOM-LAZARKA — Lazarki wreath. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round wreath of spring flowers and green leaves with colorful ribbons hanging down, and a small woven basket.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-KOLEDAR` — Коледарска тояга и кравай (P1) → `custom-koledar.png`

```
KOREN asset CUSTOM-KOLEDAR — Koledari staff. Size 1024×1024. Transparent background (real alpha channel).
Subject: a carved wooden staff decorated with a round ring-shaped bread (kravai), red threads and popcorn.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-NESTINAR` — Жарава (нестинарство) (P2) → `custom-nestinar.png`

```
KOREN asset CUSTOM-NESTINAR — Nestinarstvo embers. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round circle of glowing orange embers on the ground with a small icon on a wooden stand beside it, no people.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-EASTER-EGGS` — Великденски яйца (P1) → `custom-easter-eggs.png`

```
KOREN asset CUSTOM-EASTER-EGGS — Easter eggs. Size 1024×1024. Transparent background (real alpha channel).
Subject: three dyed eggs: red, yellow and blue, one with a simple white flower pattern, in a small basket.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-GERGYOVDEN` — Гергьовден (люлка и венец) (P2) → `custom-gergyovden.png`

```
KOREN asset CUSTOM-GERGYOVDEN — St. George day. Size 1024×1024. Transparent background (real alpha channel).
Subject: a green meadow swing hanging from a tree branch decorated with a wreath of green leaves and flowers.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CUSTOM-BUDNIK` — Бъдник (P2) → `custom-budnik.png`

```
KOREN asset CUSTOM-BUDNIK — Budnik log. Size 1024×1024. Transparent background (real alpha channel).
Subject: a thick oak log with a small flame starting at one end, a few sparks.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-POTTERY-1` — Грънчарство — етап 1: buca глина на колелото (P1) → `craft-pottery-1.png`

```
KOREN asset CRAFT-POTTERY-1 — Pottery stage 1. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round lump of wet brown clay on a turning wooden potter wheel. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-POTTERY-2` — Грънчарство — етап 2: издигната глина (P1) → `craft-pottery-2.png`

```
KOREN asset CRAFT-POTTERY-2 — Pottery stage 2. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same clay pulled up into a short cylinder on the wheel. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-POTTERY-3` — Грънчарство — етап 3: оформена кана (P1) → `craft-pottery-3.png`

```
KOREN asset CRAFT-POTTERY-3 — Pottery stage 3. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same clay shaped into a round jug with a narrow neck, still wet. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-POTTERY-4` — Грънчарство — етап 4: изпечена шарена кана (P1) → `craft-pottery-4.png`

```
KOREN asset CRAFT-POTTERY-4 — Pottery stage 4. Size 1024×1024. Transparent background (real alpha channel).
Subject: the finished jug fired and painted with green and brown Troyan style drips. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TOOL-WHEEL` — Грънчарско колело (P1) → `tool-wheel.png`

```
KOREN asset TOOL-WHEEL — Wheel. Size 1024×1024. Transparent background (real alpha channel).
Subject: an empty wooden potter wheel with a round top.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-WOODCARVING-1` — Дърворезба — етап 1: дъсчица (P2) → `craft-woodcarving-1.png`

```
KOREN asset CRAFT-WOODCARVING-1 — Woodcarving stage 1. Size 1024×1024. Transparent background (real alpha channel).
Subject: a flat square plank of light wood. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-WOODCARVING-2` — Дърворезба — етап 2: скица (P2) → `craft-woodcarving-2.png`

```
KOREN asset CRAFT-WOODCARVING-2 — Woodcarving stage 2. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same plank with a round rosette shape lightly carved. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-WOODCARVING-3` — Дърворезба — етап 3: резба наполовина (P2) → `craft-woodcarving-3.png`

```
KOREN asset CRAFT-WOODCARVING-3 — Woodcarving stage 3. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same plank with half of a flower rosette deeply carved. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-WOODCARVING-4` — Дърворезба — етап 4: готова розета (P2) → `craft-woodcarving-4.png`

```
KOREN asset CRAFT-WOODCARVING-4 — Woodcarving stage 4. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same plank with a finished carved Tryavna style sun rosette, polished. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TOOL-CHISEL` — Длето и чукче (P2) → `tool-chisel.png`

```
KOREN asset TOOL-CHISEL — Chisel. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wooden mallet and a chisel.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-SMITHY-1` — Ковачество — етап 1: студено желязо (P2) → `craft-smithy-1.png`

```
KOREN asset CRAFT-SMITHY-1 — Smithy stage 1. Size 1024×1024. Transparent background (real alpha channel).
Subject: a dull grey straight iron bar on an anvil. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-SMITHY-2` — Ковачество — етап 2: нажежено (P2) → `craft-smithy-2.png`

```
KOREN asset CRAFT-SMITHY-2 — Smithy stage 2. Size 1024×1024. Transparent background (real alpha channel).
Subject: the same iron bar glowing orange. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-SMITHY-3` — Ковачество — етап 3: огънато (P2) → `craft-smithy-3.png`

```
KOREN asset CRAFT-SMITHY-3 — Smithy stage 3. Size 1024×1024. Transparent background (real alpha channel).
Subject: the glowing bar bent into a U shape on the anvil. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CRAFT-SMITHY-4` — Ковачество — етап 4: подкова (P2) → `craft-smithy-4.png`

```
KOREN asset CRAFT-SMITHY-4 — Smithy stage 4. Size 1024×1024. Transparent background (real alpha channel).
Subject: a finished dark iron horseshoe with nail holes. Exactly the same camera angle, scale and position as the other stages of this craft so the images can be swapped in place.
Camera: fixed three-quarter front view from slightly above, centered, identical framing for every stage.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TOOL-ANVIL` — Наковалня и чук (P2) → `tool-anvil.png`

```
KOREN asset TOOL-ANVIL — Anvil. Size 1024×1024. Transparent background (real alpha channel).
Subject: a black iron anvil with a hammer leaning on it.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TOOL-BELLOWS` — Духало (P2) → `tool-bellows.png`

```
KOREN asset TOOL-BELLOWS — Bellows. Size 1024×1024. Transparent background (real alpha channel).
Subject: a leather bellows.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MUSIC-GAIDA` — Гайда (P2) → `music-gaida.png`

```
KOREN asset MUSIC-GAIDA — Bagpipe. Size 1024×1024. Transparent background (real alpha channel).
Subject: a Bulgarian gaida bagpipe: a soft goat-skin bag, a carved wooden chanter and a long drone pipe with red tassels.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MUSIC-KAVAL` — Кавал (P2) → `music-kaval.png`

```
KOREN asset MUSIC-KAVAL — Kaval. Size 1024×1024. Transparent background (real alpha channel).
Subject: a long thin wooden kaval flute with carved rings and holes.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MUSIC-TAPAN` — Тъпан (P2) → `music-tapan.png`

```
KOREN asset MUSIC-TAPAN — Tapan drum. Size 1024×1024. Transparent background (real alpha channel).
Subject: a large double-headed tapan drum with a thick stick and a thin stick.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `MUSIC-GADULKA` — Гъдулка (P2) → `music-gadulka.png`

```
KOREN asset MUSIC-GADULKA — Gadulka. Size 1024×1024. Transparent background (real alpha channel).
Subject: a pear-shaped wooden gadulka with a bow.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 06 — Език, приказки и фолклор

**Прикачи като референция:** heroes/koren-joy.webp + design/characters/v3/koren_wave.png (за лице и пропорции на човешки герой в стила); world/old-scroll.webp.

**Качи оригиналите в:** `design/v5/06-folklore/`

### `CHAR-HITAR-PETAR` — Хитър Петър (P1) → `char-hitar-petar.png`

```
KOREN asset CHAR-HITAR-PETAR — Clever Peter. Size 1024×1536. Transparent background (real alpha channel).
Subject: A cheerful clever peasant man in clay style: thin moustache, sly friendly smile, brown fur kalpak hat, white shirt with red embroidery, brown wool vest, red sash, standing with one finger raised as if he has an idea. Full body.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CHAR-HITAR-PEEK` — Хитър Петър — надничa (P1) → `char-hitar-peek.png`

```
KOREN asset CHAR-HITAR-PEEK — Clever Peter peeking. Size 1024×1024. Transparent background (real alpha channel).
Subject: The same Clever Peter character, only his head with the fur hat and one hand, peeking from the right edge as if from behind a wall.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `CHAR-GOLDEN-GIRL` — Златното момиче (P2) → `char-golden-girl.png`

```
KOREN asset CHAR-GOLDEN-GIRL — The Golden Girl. Size 1024×1536. Transparent background (real alpha channel).
Subject: A kind village girl in clay style with long dark braids, a simple dress, covered with soft golden sparkles as if dusted with gold, holding a small spindle. Full body.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TALE-MITTEN` — Ръкавичка („Дядовата ръкавичка“) (P1) → `tale-mitten.png`

```
KOREN asset TALE-MITTEN — The mitten. Size 1024×1024. Transparent background (real alpha channel).
Subject: a big knitted red-and-white mitten lying on the snow with tiny animal ears peeking out of it.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TALE-SPINDLE` — Златно вретено (P1) → `tale-spindle.png`

```
KOREN asset TALE-SPINDLE — Golden spindle. Size 1024×1024. Transparent background (real alpha channel).
Subject: a golden spindle with golden thread.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TALE-BLACKBIRD` — Кос с ботушки (P2) → `tale-blackbird.png`

```
KOREN asset TALE-BLACKBIRD — Blackbird with boots. Size 1024×1024. Transparent background (real alpha channel).
Subject: a black blackbird with an orange beak wearing tiny red boots (for the tale „Косе Босе“ — verify the tale before use).
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TALE-MAGIC-BAG` — Вълшебна торбичка (P1) → `tale-magic-bag.png`

```
KOREN asset TALE-MAGIC-BAG — Magic pouch. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small embroidered cloth pouch tied with a red cord, a few sparkles.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SEAL-LETTER` — Тайно писмо с печат (P1) → `seal-letter.png`

```
KOREN asset SEAL-LETTER — Secret letter. Size 1024×1024. Transparent background (real alpha channel).
Subject: A folded cream parchment letter closed with a round red wax seal pressed with a simple flower, a few blank lines visible on the paper, no letters.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 07 — Български постижения и космос

**Прикачи като референция:** world/hot-air-balloon.webp, world/discovery-magnifier.webp.

**Качи оригиналите в:** `design/v5/07-achievements/`

### `ACH-COMPUTER` — Първият електронен компютър (Атанасов) (P1) → `ach-computer.png`

```
KOREN asset ACH-COMPUTER — ABC computer. Size 1024×1024. Transparent background (real alpha channel).
Subject: a chunky stylized early electronic computer: a wide wooden-and-metal cabinet with a large rotating drum of small capacitors and rows of glowing vacuum tubes.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-YOGURT-MICROBE` — Лактобацилус булгарикус (P1) → `ach-yogurt-microbe.png`

```
KOREN asset ACH-YOGURT-MICROBE — L. bulgaricus. Size 1024×1024. Transparent background (real alpha channel).
Subject: a friendly cute rod-shaped bacterium character, soft cream-white with a small smile, next to a clay pot of yogurt.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-ROCKET` — Ракета (P1) → `ach-rocket.png`

```
KOREN asset ACH-ROCKET — Rocket. Size 1024×1024. Transparent background (real alpha channel).
Subject: a chubby white rocket with a rounded nose, three short fins, a soft orange flame, no flags, no text.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-CAPSULE` — Космическа капсула (P2) → `ach-capsule.png`

```
KOREN asset ACH-CAPSULE — Space capsule. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round bell-shaped space capsule with a small round window and solar panels.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-GREENHOUSE` — Космическа оранжерия (P1) → `ach-greenhouse.png`

```
KOREN asset ACH-GREENHOUSE — Space greenhouse. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small box-shaped greenhouse module with a transparent window showing tiny green wheat sprouts under a soft light, floating.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-EARTH` — Земята от космоса (P1) → `ach-earth.png`

```
KOREN asset ACH-EARTH — Earth. Size 1024×1024. Transparent background (real alpha channel).
Subject: the planet Earth as a soft glossy clay ball, blue oceans, green and beige land, white clouds, Europe facing the viewer.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-HELMET` — Шлем на космонавт (P1) → `ach-helmet.png`

```
KOREN asset ACH-HELMET — Space helmet. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round white space helmet with a golden reflective visor.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-HIGH-JUMP` — Висок скок (P1) → `ach-high-jump.png`

```
KOREN asset ACH-HIGH-JUMP — High jump. Size 1024×1024. Transparent background (real alpha channel).
Subject: a high-jump bar on two stands above a big blue landing mat.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-FOOTBALL` — Футбол (P1) → `ach-football.png`

```
KOREN asset ACH-FOOTBALL — Football. Size 1024×1024. Transparent background (real alpha channel).
Subject: a classic black-and-white football and one football boot.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-TENNIS` — Тенис (P1) → `ach-tennis.png`

```
KOREN asset ACH-TENNIS — Tennis. Size 1024×1024. Transparent background (real alpha channel).
Subject: a tennis racket and a bright yellow tennis ball.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-WEIGHTS` — Вдигане на тежести (P1) → `ach-weights.png`

```
KOREN asset ACH-WEIGHTS — Weightlifting. Size 1024×1024. Transparent background (real alpha channel).
Subject: a barbell with big round red and blue plates on a wooden platform.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACH-FILM` — Анимация (P2) → `ach-film.png`

```
KOREN asset ACH-FILM — Animation. Size 1024×1024. Transparent background (real alpha channel).
Subject: a film reel and a small clapperboard without text.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 08 — Общи игрови обекти и сцени

**Прикачи като референция:** world/treasure-chest-open.webp (предмети); за сцените — design/characters/29_sunset.png само за настроение, НЕ за стил на рисуване.

**Качи оригиналите в:** `design/v5/08-games/`

### `SCENE-KITCHEN` — Кухня (фон) (P1) → `scene-kitchen.png`

```
KOREN asset SCENE-KITCHEN — Kitchen scene. Size 1536×1024. Full opaque scene background, landscape.
Subject: a cozy traditional Bulgarian village kitchen: whitewashed walls, a wooden table in the front center left EMPTY for game objects, shelves with clay pots and copper pans, a hanging string of red peppers, a window with green shutters. Soft, slightly blurred depth, not busy.
Camera: front view with a slight top-down angle, wide shot, the center third kept calm and empty for game objects.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SCENE-WORKSHOP` — Работилница (фон) (P1) → `scene-workshop.png`

```
KOREN asset SCENE-WORKSHOP — Workshop scene. Size 1536×1024. Full opaque scene background, landscape.
Subject: a warm craftsman workshop: wooden beams, a work table in the front center left EMPTY, tool racks on the walls, a small window with sunlight. Soft, slightly blurred depth, not busy.
Camera: front view with a slight top-down angle, wide shot, the center third kept calm and empty for game objects.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SCENE-SEABED` — Морско дъно (фон) (P1) → `scene-seabed.png`

```
KOREN asset SCENE-SEABED — Seabed scene. Size 1536×1024. Full opaque scene background, landscape.
Subject: a calm Black Sea underwater scene: soft blue water with light rays, sandy bottom with smooth stones and green seagrass on the sides, the center left open. Soft, slightly blurred depth, not busy.
Camera: front view with a slight top-down angle, wide shot, the center third kept calm and empty for game objects.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `SCENE-DIG-SITE` — Археологически разкопки (фон) (P1) → `scene-dig-site.png`

```
KOREN asset SCENE-DIG-SITE — Dig site scene. Size 1536×1024. Full opaque scene background, landscape.
Subject: an archaeological dig site from slightly above: a square pit with layered brown soil walls, string grid lines, a few tools on the edge, the pit floor left EMPTY. Soft, slightly blurred depth, not busy.
Camera: front view with a slight top-down angle, wide shot, the center third kept calm and empty for game objects.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-BRUSH` — Четка на археолог (P2) → `game-brush.png`

```
KOREN asset GAME-BRUSH — Archaeology brush. Size 1024×1024. Transparent background (real alpha channel).
Subject: a soft wide brush with a wooden handle.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-TROWEL` — Мистрия (P2) → `game-trowel.png`

```
KOREN asset GAME-TROWEL — Trowel. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small pointed trowel with a wooden handle.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-TOKEN-YES` — Жетон „Вярно“ (P1) → `game-token-yes.png`

```
KOREN asset GAME-TOKEN-YES — True token. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round chubby green token with a white check mark relief.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-TOKEN-NO` — Жетон „Не е вярно“ (P1) → `game-token-no.png`

```
KOREN asset GAME-TOKEN-NO — False token. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round chubby sky-blue token with a white cross relief (sky blue, NOT red).
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-PAINT-POT` — Гърне с боя (P2) → `game-paint-pot.png`

```
KOREN asset GAME-PAINT-POT — Paint pot. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small clay pot filled with glossy paint (paint color will be changed by code: draw it in neutral white).
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `GAME-ROPE-FLAG` — Връх — знаме на финала (P2) → `game-rope-flag.png`

```
KOREN asset GAME-ROPE-FLAG — Summit flag. Size 1024×1024. Transparent background (real alpha channel).
Subject: a wooden pole with a plain red pennant stuck into a small pile of stones.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 09 — Жълтици, магазин и аватари

**Прикачи като референция:** world/gold-medal.webp (злато), world/treasure-chest-closed.webp (дърво); за носиите — design/characters/v3/koren_wave.png, raya_wave.png, koren_winter.png, raya_winter.png.

**Качи оригиналите в:** `design/v5/09-economy/`

### `COIN` — Жълтица (P0) → `coin.png`

```
KOREN asset COIN — Gold coin. Size 1024×1024. Transparent background (real alpha channel).
Subject: One thick round gold coin seen slightly from the front-left, glossy polished gold, a raised rim, in the center an embossed rose with two leaves, a ring of small dots along the edge. No numbers, no letters.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `COIN-STACK` — Купчинка жълтици (P0) → `coin-stack.png`

```
KOREN asset COIN-STACK — Coin stack. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small neat stack of five of the same gold coins with two coins leaning in front of it.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `PURSE` — Кесия (P1) → `purse.png`

```
KOREN asset PURSE — Coin purse. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small round cloth purse with red-and-white embroidery, tied with a red cord, two gold coins peeking out.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `STALL` — Сергия (магазин) (P0) → `stall.png`

```
KOREN asset STALL — Market stall. Size 1024×1024. Transparent background (real alpha channel).
Subject: A wooden village market stall with a striped red-and-cream fabric awning, an EMPTY wooden counter and two empty shelves (items will be placed by code), small hanging lanterns.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `RAKLA` — Ракла (гардероб) (P1) → `rakla.png`

```
KOREN asset RAKLA — Dowry chest. Size 1024×1024. Transparent background (real alpha channel).
Subject: A traditional carved wooden dowry chest (rakla) with painted flower decoration, the lid slightly open with a soft glow inside.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `STREAK` — Пътни дни (стъпки) (P0) → `streak.png`

```
KOREN asset STREAK — Journey days. Size 1024×1024. Transparent background (real alpha channel).
Subject: A small trail of three footprints in soft green clay leading to a little golden star, on a round cream base.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-KALPAK` — Калпак (P1) → `acc-kalpak.png`

```
KOREN asset ACC-KALPAK — Fur hat. Size 1024×1024. Transparent background (real alpha channel).
Subject: a tall brown sheepskin kalpak hat, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-KERCHIEF` — Забрадка (P1) → `acc-kerchief.png`

```
KOREN asset ACC-KERCHIEF — Headscarf. Size 1024×1024. Transparent background (real alpha channel).
Subject: a red headscarf with small white flowers, tied, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-WREATH` — Венец от цветя (P1) → `acc-wreath.png`

```
KOREN asset ACC-WREATH — Flower wreath. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round wreath of small spring flowers and leaves, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-COIN-HEADDRESS` — Прочелник с пендари (P1) → `acc-coin-headdress.png`

```
KOREN asset ACC-COIN-HEADDRESS — Coin headdress. Size 1024×1024. Transparent background (real alpha channel).
Subject: a headband of small gold coins and red beads, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-FEATHER-HAT` — Шапка с перо (P1) → `acc-feather-hat.png`

```
KOREN asset ACC-FEATHER-HAT — Hat with feather. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small black felt hat with a red-white feather, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-SCARF` — Плетен шал (P1) → `acc-scarf.png`

```
KOREN asset ACC-SCARF — Knitted scarf. Size 1024×1024. Transparent background (real alpha channel).
Subject: a knitted red-and-white scarf, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-BELT` — Колан с пафти (P1) → `acc-belt.png`

```
KOREN asset ACC-BELT — Belt buckle. Size 1024×1024. Transparent background (real alpha channel).
Subject: a belt with two big oval silver buckles (paftas), shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `ACC-BAG` — Торба (шарена) (P1) → `acc-bag.png`

```
KOREN asset ACC-BAG — Woven bag. Size 1024×1024. Transparent background (real alpha channel).
Subject: a woven bag with red geometric patterns and a fringe, shown alone, front view, as if waiting on a shop shelf.
Camera: three-quarter front view from slightly above (about 20 degrees), object centered, filling about 80% of the frame.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-SHOPP-KOREN` — Корен — шопска носия (P2) → `outfit-shopp-koren.png`

```
KOREN asset OUTFIT-SHOPP-KOREN — Koren Shopp outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Shopp region: белодрешна шопска носия: бял сукман/бяла риза, черни елементи, червени колани. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-SHOPP-RAYA` — Рая — шопска носия (P2) → `outfit-shopp-raya.png`

```
KOREN asset OUTFIT-SHOPP-RAYA — Raya Shopp outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Shopp region: белодрешна шопска носия: бял сукман/бяла риза, черни елементи, червени колани. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-THRACE-KOREN` — Корен — тракийска носия (P2) → `outfit-thrace-koren.png`

```
KOREN asset OUTFIT-THRACE-KOREN — Koren Thrace outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Thrace region: тракийска носия: тъмен сукман, богато везмо, червена престилка. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-THRACE-RAYA` — Рая — тракийска носия (P2) → `outfit-thrace-raya.png`

```
KOREN asset OUTFIT-THRACE-RAYA — Raya Thrace outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Thrace region: тракийска носия: тъмен сукман, богато везмо, червена престилка. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-RHODOPE-KOREN` — Корен — родопска носия (P2) → `outfit-rhodope-koren.png`

```
KOREN asset OUTFIT-RHODOPE-KOREN — Koren Rhodope outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Rhodope region: родопска носия: пъстри вълнени тъкани, шарени престилки. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-RHODOPE-RAYA` — Рая — родопска носия (P2) → `outfit-rhodope-raya.png`

```
KOREN asset OUTFIT-RHODOPE-RAYA — Raya Rhodope outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Rhodope region: родопска носия: пъстри вълнени тъкани, шарени престилки. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-DOBRUDZHA-KOREN` — Корен — добруджанска носия (P2) → `outfit-dobrudzha-koren.png`

```
KOREN asset OUTFIT-DOBRUDZHA-KOREN — Koren Dobrudzha outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Dobrudzha region: добруджанска носия: светли тонове, сукман с везмо. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-DOBRUDZHA-RAYA` — Рая — добруджанска носия (P2) → `outfit-dobrudzha-raya.png`

```
KOREN asset OUTFIT-DOBRUDZHA-RAYA — Raya Dobrudzha outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Dobrudzha region: добруджанска носия: светли тонове, сукман с везмо. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-PIRIN-KOREN` — Корен — пиринска носия (P2) → `outfit-pirin-koren.png`

```
KOREN asset OUTFIT-PIRIN-KOREN — Koren Pirin outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Pirin region: пиринска носия: тъмни сукмани, червени шевици. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-PIRIN-RAYA` — Рая — пиринска носия (P2) → `outfit-pirin-raya.png`

```
KOREN asset OUTFIT-PIRIN-RAYA — Raya Pirin outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the Pirin region: пиринска носия: тъмни сукмани, червени шевици. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-NORTH-KOREN` — Корен — северняшка носия (P2) → `outfit-north-koren.png`

```
KOREN asset OUTFIT-NORTH-KOREN — Koren North outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the North region: северняшка носия: бяла риза с червени шевици, вълнена пола/потури. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `OUTFIT-NORTH-RAYA` — Рая — северняшка носия (P2) → `outfit-north-raya.png`

```
KOREN asset OUTFIT-NORTH-RAYA — Raya North outfit. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached character reference (same face, hair, body, proportions), standing in front view, waving, now dressed in a regional Bulgarian folk costume from the North region: северняшка носия: бяла риза с червени шевици, вълнена пола/потури. Only the clothes change.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```


---

## Пакет 10 — Интерфейс: светове, герои, състояния

**Прикачи като референция:** tiles/history.webp, tiles/culture.webp, tiles/discover.webp (ЗАДЪЛЖИТЕЛНО — плочките са комплект); за позите — design/characters/v3/*_wave.png и *_point.png.

**Качи оригиналите в:** `design/v5/10-ui/`

### `TILE-NATURE` — Природа (P0) → `tile-nature.png`

```
KOREN asset TILE-NATURE — Nature. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small rounded green hill with a fluffy beech tree, an edelweiss flower in front and a butterfly. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TILE-CUISINE` — Кухня (P0) → `tile-cuisine.png`

```
KOREN asset TILE-CUISINE — Cuisine. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round golden banitsa in a tray with a small clay pot of yogurt beside it. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TILE-FOLKLORE` — Приказки (P0) → `tile-folklore.png`

```
KOREN asset TILE-FOLKLORE — Folk tales. Size 1024×1024. Transparent background (real alpha channel).
Subject: an open old storybook with a small golden spindle and a red mitten coming out of the pages. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TILE-ACHIEVE` — Постижения (P0) → `tile-achieve.png`

```
KOREN asset TILE-ACHIEVE — Achievements. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small white rocket taking off next to a golden laurel wreath. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TILE-SHOP` — Пазар (P1) → `tile-shop.png`

```
KOREN asset TILE-SHOP — Market. Size 1024×1024. Transparent background (real alpha channel).
Subject: a small wooden market stall with a striped awning and a gold coin in front. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `TILE-CALENDAR` — Календар (P1) → `tile-calendar.png`

```
KOREN asset TILE-CALENDAR — Calendar. Size 1024×1024. Transparent background (real alpha channel).
Subject: a round wooden wall calendar wheel with a red martenitsa and an Easter egg attached, no numbers. MUST match the existing six KOREN tile icons exactly in style, lighting and scale (attach tile_history.png and tile_culture.png as reference).
Camera: three-quarter front view from slightly above (about 20 degrees), centered, about 80% of the frame, same scale as the reference tiles.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `POSE-KOREN-CHEER` — Корен — радва се (ръце горе) (P1) → `pose-koren-cheer.png`

```
KOREN asset POSE-KOREN-CHEER — Koren cheer. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached reference (same face, hair, costume, proportions), full body, cheering, both arms up, jumping slightly.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `POSE-RAYA-CHEER` — Рая — радва се (ръце горе) (P1) → `pose-raya-cheer.png`

```
KOREN asset POSE-RAYA-CHEER — Raya cheer. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached reference (same face, hair, costume, proportions), full body, cheering, both arms up, jumping slightly.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `POSE-KOREN-MAP` — Корен — държи карта (P1) → `pose-koren-map.png`

```
KOREN asset POSE-KOREN-MAP — Koren map. Size 1024×1536. Transparent background (real alpha channel).
Subject: Koren exactly as in the attached reference (same face, hair, costume, proportions), full body, holding an open folded paper map with both hands, looking at the viewer.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

### `POSE-RAYA-MAP` — Рая — държи карта (P1) → `pose-raya-map.png`

```
KOREN asset POSE-RAYA-MAP — Raya map. Size 1024×1536. Transparent background (real alpha channel).
Subject: Raya exactly as in the attached reference (same face, hair, costume, proportions), full body, holding an open folded paper map with both hands, looking at the viewer.
Camera: straight front view, full body from hair to shoes, centered, feet near the bottom edge.
Follow the KOREN MASTER STYLE and NEGATIVE rules from this session.
```

