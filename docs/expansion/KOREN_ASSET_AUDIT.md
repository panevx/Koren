# KOREN — одит на съществуващите ресурси

> Фаза 0, 15.11.2026. Проверени са ВСИЧКИ файлове в repository (без node_modules и dist). Всяко изображение в `public/img`
> е разгледано визуално (контактни листове), не само по името. „Къде се ползва“ е изведено с търсене в `src/` и `content/`.

## 1. Какво има — цифри

| Вид ресурс | Брой | Бележка |
|---|---:|---|
| Изображения за приложението (`public/img`) | 127 | 119 растерни + 4 SVG + 4 PNG иконки; общо ~2,5 MB; всички ≤ 150 KB |
| Оригинали за дизайн (`design/`) | 207 | v1 (2D, бял фон), v2 (2D прозрачен), v3 (3D — в употреба), v4 (50 обекта), animals (25), logo (18) |
| SVG в кода | — | карта на България и Балканите (Natural Earth), 6 фона на сцени, иконки на интерфейса (16), знаме, глифове на места |
| Шрифтове | 1 | Nunito Variable (npm `@fontsource-variable/nunito`, само кирилица + латиница), OFL |
| Звук | 0 файла | звуците се синтезират в `src/sound.ts` (Web Audio) |
| Анимации (Lottie/GIF/видео) | 0 | всичко е Motion + CSS (само transform/opacity) |
| 3D модели (GLB/GLTF) | 0 | „3D“ навсякъде е рендерирана картинка |
| AVIF / GIF | 0 | — |
| Мисии | 50 | всичките чернови; 17 за всички възрасти (3 нива) + 33 само за 4–6 г. |
| Места на картата | 17 | 13 видими, 10 с 3D забележителност |
| Епохи на линията на времето | 12 | схематични граници (чернова) |
| Преводни ключове | 299 + 299 | bg / en, тест за пълнота |

**Неизползвани файлове в `public/img`: 0.** (9 файла изглеждат неизползвани при търсене по име, но пътят им се сглобява от променлива — `poses/${hero}-${pose}`, `heroes/${hero}-${mood}`.)

**Дубликати:** `design/characters/v2/` и `v3/` съдържат едни и същи имена (лица, пози, плочки, нива) — v3 е в употреба, v2 е архив. `design/characters/` (v1, 45 файла) е изцяло заменен от v3 — може да се архивира, не се ползва.
`world/mountain-peak.webp` се ползва за два смисъла (Мусала на картата и „планина“) — новите маркери ги разделят.

## 2. Стил — какво е еталон

| Група | Стил | Съответства на Playful 3D? |
|---|---|---|
| `world/*` (v4) | глина/мек винил, заоблено, топла светлина | **Да — еталон.** MASTER STYLE е изведен от тях. |
| `heroes/*`, `poses/*`, `tiles/*`, `levels/*`, `badges/*` (v3) | Pixar-подобен 3D, релеф | Да |
| `animals/*` | по-реалистичен 3D (детайл на козина) | Частично — запазваме ги, новите животни в същия стил |
| `puzzles/*` | v2/v3 ранни, с небе на фон | Приемливо за пъзел |
| `ornaments/*`, `logo/*`, икони | плоско 2D | Да — графични елементи, не обекти |
| `design/characters/*` (v1) | 2D анимационен с контури | Не — не се ползва, остава като архив |

## 3. Лицензи и ограничения

- Всички растерни картинки са генерирани с ChatGPT за проекта → може да се ползват свободно в KOREN. Нямат реални лица на хора.
- Картите: Natural Earth (public domain) чрез `world-atlas`; скриптове `scripts/build-map.mjs`, `scripts/build-balkans.mjs`. Дунав източно от Силистра е изрязан, Дунав извън България — схематичен.
- Границите в линията на времето са **схематични** и са чернова — не са данни.
- Nunito — SIL OFL 1.1.
- Бюджет: `tests/assets.test.ts` (≤ 150 KB на файл), `tests/offline.test.ts` (всяка картинка трябва да е в списъка за офлайн). При разширение с ~200 картинки (+3–5 MB) офлайн изтеглянето трябва да стане **по светове** (виж плана).

## 4. Пълен списък (public)


### `world/` — 50 файла

50 обекта от design/v4 (ChatGPT, 1024 px → WebP 192/320). Глина/винил, топла светлина отгоре-вляво, прозрачен фон.  
**Стил:** ДА — това е еталонът „Playful 3D“.  
**Преизползване:** Висока: всеки е общ символ. `river.webp` е плосък и слаб като „река“ — за реките ползваме данни (линия), не тази картинка.

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `world/achievement-trophy.webp` | webp | 320x320 RGBA | 20KB | златна купа със звезда | world.ts |
| `world/alexander-nevsky.webp` | webp | 320x320 RGBA | 24KB | катедралата „Ал. Невски“ | content/map/places.json, mission×3 |
| `world/asparuh-shield.webp` | webp | 320x320 RGBA | 18KB | кръгъл дървен щит | mission×3, screens/Adventure.tsx |
| `world/belogradchik-rocks.webp` | webp | 320x320 RGBA | 25KB | Белоградчишките скали | content/map/places.json, mission×4 |
| `world/bird.webp` | webp | 320x320 RGBA | 17KB | синьо птиче | mission×8, screens/Adventure.tsx |
| `world/black-sea-lighthouse.webp` | webp | 320x320 RGBA | 13KB | фар | content/map/places.json, mission×9, screens/Adventure.tsx |
| `world/bridge.webp` | webp | 320x320 RGBA | 17KB | дървено мостче | mission×3, screens/Adventure.tsx, world.ts |
| `world/bronze-medal.webp` | webp | 320x320 RGBA | 14KB | бронзов медал | world.ts |
| `world/bulgarian-embroidery.webp` | webp | 320x320 RGBA | 37KB | квадрат шевица | mission×3, screens/Adventure.tsx |
| `world/butterfly.webp` | webp | 320x320 RGBA | 21KB | пеперуда | mission×11, screens/Adventure.tsx |
| `world/correct-star.webp` | webp | 192x192 RGBA | 7KB | жълта звезда | world.ts |
| `world/direction-arrow.webp` | webp | 192x192 RGBA | 5KB | дървена стрелка | world.ts |
| `world/discovery-magnifier.webp` | webp | 192x192 RGBA | 6KB | лупа | world.ts |
| `world/forest-bush.webp` | webp | 320x320 RGBA | 12KB | храст | mission×13, screens/Adventure.tsx |
| `world/gold-medal.webp` | webp | 320x320 RGBA | 15KB | златен медал | world.ts |
| `world/hint-lantern.webp` | webp | 192x192 RGBA | 8KB | фенер | world.ts |
| `world/hot-air-balloon.webp` | webp | 320x320 RGBA | 17KB | балон | mission×4, world.ts |
| `world/koprivshtitsa-house.webp` | webp | 320x320 RGBA | 22KB | възрожденска къща | content/map/places.json, mission×4 |
| `world/level-up-burst.webp` | webp | 320x320 RGBA | 23KB | звезда с лъчи | world.ts |
| `world/martenitsa-pizho-penda.webp` | webp | 320x320 RGBA | 31KB | мартеници Пижо и Пенда | mission×2, screens/Adventure.tsx |
| `world/matching-card.webp` | webp | 320x320 RGBA | 9KB | празна карта | world.ts |
| `world/medieval-book.webp` | webp | 320x320 RGBA | 17KB | кожена книга | mission×5, screens/Adventure.tsx |
| `world/mission-key.webp` | webp | 192x192 RGBA | 7KB | златен ключ | mission×4, world.ts |
| `world/mountain-peak.webp` | webp | 320x320 RGBA | 14KB | планински масив със сняг и ели | content/map/places.json, mission×6, screens/Adventure.tsx |
| `world/mushroom.webp` | webp | 320x320 RGBA | 17KB | гъба | mission×7, screens/Adventure.tsx |
| `world/old-scroll.webp` | webp | 320x320 RGBA | 15KB | свитък | mission×3, screens/Adventure.tsx, world.ts |
| `world/passport-stamp.webp` | webp | 192x192 RGBA | 7KB | печат | world.ts |
| `world/pliska.webp` | webp | 320x320 RGBA | 14KB | Плиска (макет) | content/map/places.json, mission×2 |
| `world/progress-gem-blue.webp` | webp | 192x192 RGBA | 6KB | син скъпоценен камък | world.ts |
| `world/progress-gem-green.webp` | webp | 192x192 RGBA | 6KB | зелен скъпоценен камък | mission×1, world.ts |
| `world/puzzle-piece-green.webp` | webp | 192x192 RGBA | 7KB | зелено парче пъзел | world.ts |
| `world/puzzle-piece-yellow.webp` | webp | 192x192 RGBA | 8KB | жълто парче пъзел | world.ts |
| `world/question-orb.webp` | webp | 192x192 RGBA | 6KB | синьо кълбо | world.ts |
| `world/quill-ink.webp` | webp | 320x320 RGBA | 12KB | перо и мастилница | mission×3 |
| `world/rila-monastery.webp` | webp | 320x320 RGBA | 28KB | Рилски манастир | content/map/places.json, mission×3 |
| `world/river.webp` | webp | 320x320 RGBA | 11KB | синя „река“ (плоска) | mission×5, screens/Adventure.tsx |
| `world/rose-oil-bottle.webp` | webp | 320x320 RGBA | 14KB | шишенце розово масло | mission×2 |
| `world/rose-valley.webp` | webp | 320x320 RGBA | 24KB | розова градина с кошница | content/map/places.json, mission×5 |
| `world/seven-rila-lakes.webp` | webp | 320x320 RGBA | 27KB | Седемте езера | content/map/places.json, mission×5 |
| `world/shipka-monument.webp` | webp | 320x320 RGBA | 18KB | паметникът на Шипка | content/map/places.json, mission×1 |
| `world/silver-medal.webp` | webp | 320x320 RGBA | 14KB | сребърен медал | world.ts |
| `world/simeon-crown.webp` | webp | 320x320 RGBA | 20KB | корона | mission×6 |
| `world/sorting-box.webp` | webp | 320x320 RGBA | 16KB | кутия с отделения | mission×1, world.ts |
| `world/traditional-belt.webp` | webp | 320x320 RGBA | 27KB | тъкан колан | mission×2 |
| `world/traditional-bread.webp` | webp | 320x320 RGBA | 20KB | обредна пита | mission×2, screens/Adventure.tsx |
| `world/treasure-chest-closed.webp` | webp | 320x320 RGBA | 16KB | затворен сандък | mission×2, world.ts |
| `world/treasure-chest-open.webp` | webp | 320x320 RGBA | 18KB | отворен сандък | mission×2, world.ts |
| `world/try-again-heart.webp` | webp | 192x192 RGBA | 6KB | сърце | world.ts |
| `world/tsarevets-fortress.webp` | webp | 320x320 RGBA | 21KB | Царевец | content/map/places.json, mission×5 |
| `world/wooden-sign.webp` | webp | 320x320 RGBA | 14KB | дървена табела | world.ts |

### `animals/` — 25 файла

25 животни (design/animals, 1024 → 256 px).  
**Стил:** ЧАСТИЧНО — по-реалистичен мек 3D (козина, пера). Сами по себе си са последователни.  
**Преизползване:** Висока. НЕ ги заменяме: новите животни се правят в СЪЩИЯ стил (вижда се като „енциклопедия“).

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `animals/badger.webp` | webp | 256x256 RGBA | 12KB | виж името (визуално проверено) | mission×2 |
| `animals/bear.webp` | webp | 256x256 RGBA | 15KB | виж името (визуално проверено) | mission×6 |
| `animals/boar.webp` | webp | 256x256 RGBA | 19KB | виж името (визуално проверено) | mission×4 |
| `animals/chamois.webp` | webp | 256x256 RGBA | 17KB | виж името (визуално проверено) | mission×4 |
| `animals/dolphin.webp` | webp | 256x256 RGBA | 7KB | виж името (визуално проверено) | mission×4 |
| `animals/eagle.webp` | webp | 256x256 RGBA | 18KB | виж името (визуално проверено) | mission×5 |
| `animals/fox.webp` | webp | 256x256 RGBA | 13KB | виж името (визуално проверено) | mission×6 |
| `animals/frog.webp` | webp | 256x256 RGBA | 12KB | виж името (визуално проверено) | mission×5 |
| `animals/hare.webp` | webp | 256x256 RGBA | 12KB | виж името (визуално проверено) | mission×3 |
| `animals/hedgehog.webp` | webp | 256x256 RGBA | 18KB | виж името (визуално проверено) | mission×5 |
| `animals/lizard.webp` | webp | 256x256 RGBA | 25KB | виж името (визуално проверено) | mission×2 |
| `animals/lynx.webp` | webp | 256x256 RGBA | 21KB | виж името (визуално проверено) | mission×1 |
| `animals/mouflon.webp` | webp | 256x256 RGBA | 24KB | виж името (визуално проверено) | mission×3 |
| `animals/otter.webp` | webp | 256x256 RGBA | 9KB | виж името (визуално проверено) | mission×3 |
| `animals/owl.webp` | webp | 256x256 RGBA | 12KB | виж името (визуално проверено) | mission×4 |
| `animals/pelican.webp` | webp | 256x256 RGBA | 11KB | виж името (визуално проверено) | content/map/places.json, mission×6 |
| `animals/pheasant.webp` | webp | 256x256 RGBA | 20KB | виж името (визуално проверено) | mission×2 |
| `animals/red-deer.webp` | webp | 256x256 RGBA | 11KB | виж името (визуално проверено) | mission×1 |
| `animals/roe-deer.webp` | webp | 256x256 RGBA | 14KB | виж името (визуално проверено) | mission×5 |
| `animals/squirrel.webp` | webp | 256x256 RGBA | 14KB | виж името (визуално проверено) | mission×4 |
| `animals/stork.webp` | webp | 256x256 RGBA | 7KB | виж името (визуално проверено) | mission×4 |
| `animals/swallow.webp` | webp | 256x256 RGBA | 9KB | виж името (визуално проверено) | mission×4 |
| `animals/tortoise.webp` | webp | 256x256 RGBA | 11KB | виж името (визуално проверено) | mission×2 |
| `animals/wolf.webp` | webp | 256x256 RGBA | 14KB | виж името (визуално проверено) | mission×1 |
| `animals/woodpecker.webp` | webp | 256x256 RGBA | 10KB | виж името (визуално проверено) | mission×4 |

### `badges/` — 12 файла

12 медальона (design/characters/v3), 320 px. Златен ръб + шевица, релефен център.  
**Стил:** ДА.  
**Преизползване:** Шаблон за всички нови значки. Мисиите без медальон ползват `BadgeArt` (рамка от код).

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `badges/asparuh.webp` | webp | 320x320 RGBA | 24KB | виж името (визуално проверено) | mission×1 |
| `badges/azbuka.webp` | webp | 320x320 RGBA | 18KB | виж името (визуално проверено) | mission×1 |
| `badges/baba-marta.webp` | webp | 320x320 RGBA | 21KB | виж името (визуално проверено) | mission×1 |
| `badges/belogradchik.webp` | webp | 320x320 RGBA | 20KB | виж името (визуално проверено) | mission×1 |
| `badges/black-sea.webp` | webp | 320x320 RGBA | 19KB | виж името (визуално проверено) | mission×1 |
| `badges/koprivshtitsa.webp` | webp | 320x320 RGBA | 25KB | виж името (визуално проверено) | mission×1 |
| `badges/paisiy.webp` | webp | 320x320 RGBA | 20KB | виж името (визуално проверено) | mission×1 |
| `badges/rila.webp` | webp | 320x320 RGBA | 22KB | виж името (визуално проверено) | mission×1 |
| `badges/roses.webp` | webp | 320x320 RGBA | 21KB | виж името (визуално проверено) | mission×1 |
| `badges/simeon.webp` | webp | 320x320 RGBA | 22KB | виж името (визуално проверено) | mission×1 |
| `badges/tarnovo.webp` | webp | 320x320 RGBA | 23KB | виж името (визуално проверено) | mission×1 |
| `badges/words.webp` | webp | 320x320 RGBA | 19KB | виж името (визуално проверено) | mission×1 |

### `heroes/` — 12 файла

Лица на Корен и Рая — 5 емоции × 2 (192 px) + `*-wave` в цял ръст за хъба (240 px).  
**Стил:** ДА (Pixar-подобен 3D).  
**Преизползване:** Висока — реакции във всички игри.

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `heroes/koren-determination.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/koren-joy.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/koren-laughter.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/koren-surprise.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/koren-thoughtful.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/koren-wave.webp` | webp | 240x507 RGBA | 23KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-determination.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-joy.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-laughter.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-surprise.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-thoughtful.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |
| `heroes/raya-wave.webp` | webp | 240x502 RGBA | 27KB | виж името (визуално проверено) | components/BottomNav.tsx, components/Brand.tsx, content/sheet/missions.csv, games/Match.tsx, index.html, mission×2, offline/assets.ts, vite.config.ts (име от променлива) |

### `poses/` — 6 файла

Цял ръст: wave / point / think × 2 (450–475 × 900 px, 57–75 KB).  
**Стил:** ДА.  
**Преизползване:** Липсват „радва се“ и „държи карта“ (пакет 10).

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `poses/koren-point.webp` | webp | 450x900 RGBA | 67KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |
| `poses/koren-think.webp` | webp | 336x900 RGBA | 57KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |
| `poses/koren-wave.webp` | webp | 426x900 RGBA | 66KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |
| `poses/raya-point.webp` | webp | 475x900 RGBA | 75KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |
| `poses/raya-think.webp` | webp | 359x900 RGBA | 64KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |
| `poses/raya-wave.webp` | webp | 430x900 RGBA | 73KB | виж името (визуално проверено) | offline/assets.ts, screens/Mission.tsx (име от променлива) |

### `tiles/` — 6 файла

6 иконки на раздели (192 px), комплект.  
**Стил:** ДА.  
**Преизползване:** Новите светове (Природа, Кухня, Приказки, Постижения) трябва да са в същия комплект.

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `tiles/collection.webp` | webp | 192x192 RGBA | 7KB | виж името (визуално проверено) | components/BottomNav.tsx, components/ProfileAvatar.tsx, content/sheet/missions.csv |
| `tiles/culture.webp` | webp | 192x192 RGBA | 11KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/sheet/missions.csv, content/sheet/ПРИМЕР-баба-марта.csv |
| `tiles/discover.webp` | webp | 192x192 RGBA | 8KB | виж името (визуално проверено) | components/BottomNav.tsx, content/sheet/missions.csv |
| `tiles/history.webp` | webp | 192x192 RGBA | 8KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/schema.ts, content/sheet/missions.csv |
| `tiles/language.webp` | webp | 192x192 RGBA | 8KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/sheet/missions.csv |
| `tiles/missions.webp` | webp | 192x192 RGBA | 10KB | виж името (визуално проверено) | components/BottomNav.tsx, components/ProfileAvatar.tsx, content/sheet/missions.csv |

### `levels/` — 3 файла

3 иконки на нивата: мече, компас, шлем (160 px). Ползват се и като „знак“ на детето.  
**Стил:** ДА.  
**Преизползване:** Аватарите на децата днес са тези 8 предмета (не човечета).

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `levels/guard.webp` | webp | 160x160 RGBA | 6KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/sheet/missions.csv |
| `levels/small.webp` | webp | 160x160 RGBA | 5KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/sheet/missions.csv |
| `levels/young.webp` | webp | 160x160 RGBA | 5KB | виж името (визуално проверено) | components/ProfileAvatar.tsx, content/sheet/missions.csv |

### `puzzles/` — 4 файла

4 непрозрачни квадрата 640 px за шаблона `puzzle`.  
**Стил:** ДА за 3; `koren-raya` е по-стара рисунка от v3 периода — приемливо.  
**Преизползване:** Нови пъзели се правят от сцени/забележителности.

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `puzzles/journal.webp` | webp | 640x640 RGB | 18KB | виж името (визуално проверено) | content/sheet/missions.csv, mission×1 |
| `puzzles/koren-raya.webp` | webp | 640x640 RGB | 44KB | виж името (визуално проверено) | content/sheet/missions.csv, mission×2 |
| `puzzles/martenitsa.webp` | webp | 640x640 RGB | 20KB | виж името (визуално проверено) | content/sheet/missions.csv, content/sheet/ПРИМЕР-баба-марта.csv, mission×2 |
| `puzzles/rose.webp` | webp | 640x640 RGB | 17KB | виж името (визуално проверено) | content/sheet/missions.csv, mission×2 |

### `logo/` — 3 файла

3 SVG варианта, пребоядисани в новата палитра.  
**Стил:** ДА (плосък знак).  
**Преизползване:** —

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `logo/koren-compact.svg` | svg | vb 58 92 389 330 | 1KB | виж името (визуално проверено) | components/Brand.tsx, offline/assets.ts |
| `logo/koren-white.svg` | svg | vb 194 73 632 336 | 1KB | виж името (визуално проверено) | offline/assets.ts, screens/Passport.tsx |
| `logo/koren.svg` | svg | vb 194 73 632 336 | 1KB | виж името (визуално проверено) | components/Brand.tsx, offline/assets.ts |

### `ornaments/` — 2 файла

Две шевици 56 px (PNG).  
**Стил:** ДА (2D, декоративни).  
**Преизползване:** Шевиците за оцветяване ще са SVG в код.

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `ornaments/left.png` | png | 56x57 RGBA | 4KB | виж името (визуално проверено) | components/Brand.tsx, offline/assets.ts |
| `ornaments/right.png` | png | 56x56 RGBA | 4KB | виж името (визуално проверено) | components/Brand.tsx, offline/assets.ts, screens/Passport.tsx |

### `icons/` — 4 файла

Иконки на приложението (PNG, непрозрачни).  
**Стил:** ДА.  
**Преизползване:** —

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|
| `icons/apple-touch-icon.png` | png | 180x180 RGB | 4KB | виж името (визуално проверено) | index.html |
| `icons/icon-192.png` | png | 192x192 RGB | 4KB | виж името (визуално проверено) | vite.config.ts |
| `icons/icon-512.png` | png | 512x512 RGB | 13KB | виж името (визуално проверено) | vite.config.ts |
| `icons/icon-maskable-512.png` | png | 512x512 RGB | 10KB | виж името (визуално проверено) | vite.config.ts |

### `root/` — 0 файла

favicon.svg  
**Стил:** ДА.  
**Преизползване:** —

| Файл | Формат | Размер | Тегло | Изобразява | Къде се ползва |
|---|---|---|---|---|---|

## 5. Оригинали в `design/` (не се публикуват)

| Папка | Файлове | Съдържание | Статус |
|---|---:|---|---|
| `design/characters/` | 45 | v1: 2D герои (4 изгледа), 10 емоции, сезонни дрехи, раница, дневник, компас, мартеница, роза, палитри, лого, карти „профил“ с текст | архив; **зимни/летни дрехи** са полезна референция за носиите |
| `design/characters/v2/` | 29 | по-ранна серия със същите имена като v3 (визуално — също 3D, по-стари версии) | заменени от v3 |
| `design/characters/v3/` | 39 | 3D герои, пози, лица, плочки, нива, 12 значки, дневник, роза, сезонни Корен/Рая | **в употреба** — референции за всички нови герои |
| `design/v4/` | 50 | 50 обекта (виж `world/`) | в употреба |
| `design/animals/` | 25 | животни 1024 px | в употреба |
| `design/logo/` | 18 | 8 варианта SVG+PNG + 2 PNG | в употреба (пребоядисани копия) |
| `design/chatgpt-prompts.md` | 1 | prompts за v1–v3 и значките | основа за новия prompt файл |

## 6. Код, който е ресурс сам по себе си

| Ресурс | Файл | Преизползване |
|---|---|---|
| 11 игрови шаблона | `src/games/*` | всички нови игри стъпват на тях (виж GAME_DESIGN) |
| Влачене / докосни-после-докосни | `src/games/drag.ts` | всички drag игри |
| Карта с pinch-zoom, маркери, раздалечаване | `src/map/BulgariaMap.tsx` | основа за всички режими на картата |
| Проекция + граници | `src/map/projection.ts, geo.ts` | слоеве (области, реки, релеф) — със същата проекция |
| Широка карта на Балканите | `src/map/balkans.ts, wide.ts` | исторически карти, „съседни държави“ |
| Фонове на сцени (6) | `src/components/Scene.tsx` | нови сцени, където стига код |
| Дизайн система | `src/components/ds.tsx, MissionNode, RewardModal` | всички нови екрани |
| Прогрес и отключване | `src/content/progress.ts` | жълтиците, пътните дни |
| Звуци (синтез) | `src/sound.ts` | ритъм игра „Хорото“ без аудио файлове |
| Схема на мисиите | `src/content/schema.ts` | нови шаблони = нов запис в `Game` |
