import type { Game } from '../content/schema'
import { Build } from './Build'
import { Chest } from './Chest'
import { Find } from './Find'
import { Guess } from './Guess'
import { MapFind } from './MapFind'
import { Match } from './Match'
import { Memory } from './Memory'
import { Order } from './Order'
import { Puzzle } from './Puzzle'
import { Regions } from './Regions'
import { Quiz } from './Quiz'
import { Sort } from './Sort'
import { Trace } from './Trace'

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
    case 'find':
      return <Find game={game} onDone={onDone} />
    case 'sort':
      return <Sort game={game} onDone={onDone} />
    case 'memory':
      return <Memory game={game} onDone={onDone} />
    case 'chest':
      return <Chest game={game} onDone={onDone} />
    case 'build':
      return <Build game={game} onDone={onDone} />
    case 'guess':
      return <Guess game={game} onDone={onDone} />
    case 'trace':
      return <Trace game={game} onDone={onDone} />
    case 'regions':
      return <Regions game={game} onDone={onDone} />
  }
}
