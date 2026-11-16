/**
 * The Playful 3D objects that belong to the INTERFACE (rewards, game pieces, the adventure path).
 * Mission-specific pictures are named in the mission JSON instead. Exported from design/v4 by
 * scripts/export-world.py. tests/assets.test.ts checks that every file exists.
 */
export const ART = {
  /** v0.21: the blank number plate (the code and digits are text on top). */
  plate: 'places/car-license-plate.svg',
  /** v0.22: days of adventure, coins. */
  streak: 'places/daily-streak.webp',
  coins: 'currency/coin-bag.webp',
  coin: 'currency/gold-coin.webp',
  pendar: 'currency/pendar.webp',
  yes: 'game/true-false-true.svg',
  no: 'game/true-false-false.svg',
  timer: 'game/timer.webp',
  star: 'world/correct-star.webp',
  heart: 'world/try-again-heart.webp',
  lantern: 'world/hint-lantern.webp',
  orb: 'world/question-orb.webp',
  card: 'world/matching-card.webp',
  burst: 'world/level-up-burst.webp',
  chestOpen: 'world/treasure-chest-open.webp',
  chestClosed: 'world/treasure-chest-closed.webp',
  scroll: 'world/old-scroll.webp',
  gemGreen: 'world/progress-gem-green.webp',
  gemBlue: 'world/progress-gem-blue.webp',
  sortBox: 'world/sorting-box.webp',
  key: 'world/mission-key.webp',
  balloon: 'world/hot-air-balloon.webp',
  sign: 'world/wooden-sign.webp',
  arrow: 'world/direction-arrow.webp',
  stamp: 'world/passport-stamp.webp',
  magnifier: 'world/discovery-magnifier.webp',
  trophy: 'world/achievement-trophy.webp',
  gold: 'world/gold-medal.webp',
  silver: 'world/silver-medal.webp',
  bronze: 'world/bronze-medal.webp',
} as const

export type ArtId = keyof typeof ART

/** A small picture for each kind of game (shown on the adventure path so a child sees what awaits). */
export const GAME_ART: Record<string, string> = {
  quiz: ART.orb,
  map: ART.arrow,
  match: 'world/puzzle-piece-green.webp',
  order: ART.sign,
  puzzle: 'world/puzzle-piece-yellow.webp',
  find: ART.magnifier,
  sort: ART.sortBox,
  memory: ART.card,
  chest: ART.chestClosed,
  build: 'world/bridge.webp',
  guess: ART.lantern,
  trace: 'minigame/river-route.webp',
  regions: 'game/puzzle-blue.webp',
  assemble: 'minigame/fortress-tower.webp',
  riddle: 'game/letter-tile.webp',
  cook: 'minigame/cooking-pot.webp',
  paint: 'game/paintbrush.webp',
  cipher: 'world/old-scroll.webp',
  fill: 'game/word-tile.webp',
  plate: 'places/transport-corridor.webp',
  truefalse: 'game/true-false-true.svg',
  blitz: 'game/timer.webp',
}
