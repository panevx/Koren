import type { Game } from '../content/schema'
import { Assemble } from './Assemble'
import { Blitz } from './Blitz'
import { Build } from './Build'
import { Chest } from './Chest'
import { Cipher } from './Cipher'
import { Cook } from './Cook'
import { Fill } from './Fill'
import { Find } from './Find'
import { Guess } from './Guess'
import { MapFind } from './MapFind'
import { Match } from './Match'
import { Memory } from './Memory'
import { Order } from './Order'
import { Paint } from './Paint'
import { Plate } from './Plate'
import { Puzzle } from './Puzzle'
import { Regions } from './Regions'
import { Riddle } from './Riddle'
import { Quiz } from './Quiz'
import { Sort } from './Sort'
import { Trace } from './Trace'
import { TrueFalse } from './TrueFalse'

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
    case 'assemble':
      return <Assemble game={game} onDone={onDone} />
    case 'riddle':
      return <Riddle game={game} onDone={onDone} />
    case 'cook':
      return <Cook game={game} onDone={onDone} />
    case 'paint':
      return <Paint game={game} onDone={onDone} />
    case 'cipher':
      return <Cipher game={game} onDone={onDone} />
    case 'fill':
      return <Fill game={game} onDone={onDone} />
    case 'plate':
      return <Plate game={game} onDone={onDone} />
    case 'truefalse':
      return <TrueFalse game={game} onDone={onDone} />
    case 'blitz':
      return <Blitz game={game} onDone={onDone} />
  }
}
