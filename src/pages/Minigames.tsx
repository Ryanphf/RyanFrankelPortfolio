import { Link } from 'react-router-dom'
import { ArrowLeft, Gamepad2, ChevronRight } from 'lucide-react'

const GAMES = [
  { id: 'pong',      title: 'Pong',         tag: 'Classic', desc: 'Classic 2D ping-pong. First to 7 wins.',              controls: 'Mouse or W / S keys' },
  { id: 'tetris',    title: 'Tetris',        tag: 'Classic', desc: 'Stack falling pieces to clear lines.',                controls: 'Arrow keys + Space to drop' },
  { id: 'car-dodge', title: 'Highway Run',   tag: 'Cars',    desc: 'Weave through traffic on a busy highway.',            controls: 'Arrow Left / Right' },
]

export default function Minigames() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 pb-28">
      <Link to="/about" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to About
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-4">Mini-games</p>
      <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2">Play a round</h1>
      <p className="text-stone-500 mb-10">A few games to take a break with.</p>
      <div className="flex flex-col gap-3">
        {GAMES.map(g => (
          <Link key={g.id} to={`/minigames/${g.id}`}>
            <div className="group flex items-center gap-5 p-6 rounded-lg border border-stone-200 bg-white hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              <div className="w-12 h-12 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold group-hover:text-primary transition-colors">{g.title}</p>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-500 rounded-sm">{g.tag}</span>
                </div>
                <p className="text-sm text-stone-500 mb-1">{g.desc}</p>
                <p className="text-xs font-mono text-stone-400">{g.controls}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
