# Връщане към предишната версия (rollback)

Публичният сайт е клонът `gh-pages`, публикуван от `.github/workflows/deploy.yml` при push в `claude/web-app-v0-2-pj7074`.

Последната стабилна версия преди редизайна v0.26 (двата commit-а остават завинаги в историята):

| какво | commit |
|---|---|
| изходният код | `879325f9008fe47bb165298f6271eba870d89527` (клон `claude/web-app-v0-2-pj7074`) |
| публикуваният сайт | `0e99869f2fcb2f6acd91cecd2d1e9605e8781f54` (клон `gh-pages`) |

## Най-бързо (около 1 минута, без build)
Връща самия публикуван сайт; кодът в клона остава новият:

```bash
git fetch origin gh-pages
git push --force origin 0e99869f2fcb2f6acd91cecd2d1e9605e8781f54:gh-pages
```

## Окончателно (кодът също се връща; deploy-ът минава тестовете и публикува)
```bash
git fetch origin
git checkout claude/web-app-v0-2-pj7074
git revert --no-edit 879325f9008fe47bb165298f6271eba870d89527..HEAD
git push origin claude/web-app-v0-2-pj7074
```

Офлайн: инсталираното приложение показва банер „Има нови мисии!“ при следващото отваряне с интернет и се обновява,
когато детето го докосне — никога по време на мисия. Прогресът (localStorage) не се губи при връщане назад.
