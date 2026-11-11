# Поръчки за ChatGPT — графика за KOREN v0.3

## Как се работи (важно)
1. **Към всяка заявка прикачи** `design/characters/01_koren_front.png` и `05_raya_front.png` като референция.
2. **Една картинка на заявка.** Не искай 6 неща наведнъж — стилът се разпада.
3. **Копирай стиловия блок отдолу в началото на всяка заявка**, после конкретната поръчка.
4. **Провери прозрачността**, преди да качиш: отвори PNG-то върху тъмен фон. ChatGPT понякога *рисува* сиво-бяла шахматна дъска вместо истински прозрачен фон — такава картинка не става.
5. **Без текст в картинките.** Нито букви, нито надписи, нито години. Всеки текст го слагаме в приложението (за да се превежда).
6. Качи готовите файлове в `design/characters/v2/` с имената от таблиците. Аз ги оптимизирам и вкарвам.

## Стилов блок (копира се всеки път)
```
Style: KOREN children's book illustration. Warm, friendly cartoon style matching the attached
character references exactly (same faces, hair, costumes, proportions). Clean dark-brown outlines,
soft painterly shading. Palette: forest green #0B6B3E, red #C62828, gold #F4B400, warm white.
Historically accurate Bulgarian folk costume details. NO text, NO letters, NO numbers anywhere.
TRANSPARENT background (real alpha channel, not a drawn checkerboard). PNG.
```

## 1. Герои в цял ръст — за историите в мисиите (най-важно)
Размер: **1024 × 1536**, прозрачен фон, целият герой се вижда (с обувките), без сянка на земята.

| Файл | Поръчка (след стиловия блок) |
|---|---|
| `koren_wave.png` | `Koren, full body, front view, smiling and waving with his right hand.` |
| `koren_point.png` | `Koren, full body, three-quarter view, pointing forward with excitement, as if showing the way.` |
| `koren_think.png` | `Koren, full body, front view, hand on chin, thinking.` |
| `raya_wave.png` | `Raya, full body, front view, smiling and waving with her right hand.` |
| `raya_point.png` | `Raya, full body, three-quarter view, pointing forward, explaining something kindly.` |
| `raya_think.png` | `Raya, full body, front view, hand on chin, thinking.` |

## 2. Лица — същите 5 емоции, но с прозрачен фон
Размер: **1024 × 1024**, глава и рамене, центрирани, прозрачен фон.
Емоции: `joy`, `surprise`, `thoughtful`, `determination`, `laughter` → 10 файла:
`koren_joy.png` … `raya_laughter.png`.

```
Koren, head and shoulders portrait, centered, expression: [joy / surprise / thoughtful / determination / laughter].
```

## 3. Иконки за 6-те плочки в хъба (един комплект)
Размер: **1024 × 1024**, прозрачен фон, предметът запълва ~80% от кадъра, лек изглед отгоре-отпред. Всички 6 в **един и същ стил и осветление**.

| Файл | Плочка | Поръчка |
|---|---|---|
| `tile_discover.png` | Открий България | `A folded paper map of green hills with a river and a big red location pin on it.` |
| `tile_history.png` | История | `A medieval Bulgarian stone fortress tower with a small red-white-green flag.` |
| `tile_culture.png` | Култура и традиции | `A martenitsa: red and white woven tassels joined by a twisted red-white cord.` |
| `tile_language.png` | Български език | `An open old primer book with blank pages, a feather quill and an ink pot beside it.` |
| `tile_missions.png` | Мисии и игри | `A brown leather adventurer's backpack with a rolled blanket on top.` |
| `tile_collection.png` | Значки и колекции | `A gold medal with a white-green-red striped ribbon and an embroidered rose in the centre.` |

(Буквите „АБВ“ на книгата ги добавям аз в кода — ChatGPT изкривява кирилицата.)

## 4. Иконки за трите възрастови нива
Размер: **1024 × 1024**, прозрачен фон, същият стил като плочките.

| Файл | Ниво | Поръчка |
|---|---|---|
| `level_small.png` | 4–6 „Малки откриватели“ | `A cute soft brown teddy bear wearing a tiny red-white embroidered scarf.` |
| `level_young.png` | 7–10 „Млади пътешественици“ | `A brass explorer's compass, open, with a red needle.` |
| `level_guard.png` | 11–14 „Пазители на историята“ | `A medieval Bulgarian warrior helmet with a small red plume.` |

## Какво НЕ поръчваме от ChatGPT
- **Логото** — генераторът не прави чист вектор. Ще го прерисувам като SVG по вашия `40_koren_logo.png`.
- **Профилните картички** — правим ги в приложението като истински текст, **без години** на героите.
- **Картата на България** — генерираните карти имат грешни граници; ползваме SVG от обществено достояние (v0.4).
