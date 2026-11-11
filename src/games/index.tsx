import type { Game } from '../content/schema'
import { MapFind } from './MapFind'
import { Match } from './Match'
import { Order } from './Order'
import { Puzzle } from './Puzzle'
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
    case 'match':
      return <Match game={game} onDone={onDone} />
    case 'order':
      return <Order game={game} onDone={onDone} />
    case 'puzzle':
      return <Puzzle game={game} onDone={onDone} />
  }
}
