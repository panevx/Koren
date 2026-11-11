import type { Game } from '../content/schema'
import { MapFind } from './MapFind'
import { Quiz } from './Quiz'

/**
 * Game templates by type. Adding a template = a component here + a schema entry
 * in src/content/schema.ts. The mission screen never changes.
 */
export function GameView({ game, onDone }: { game: Game; onDone: () => void }) {
  switch (game.type) {
    case 'quiz':
      return <Quiz questions={game.questions} onDone={onDone} />
    case 'map':
      return <MapFind game={game} onDone={onDone} />
  }
}
