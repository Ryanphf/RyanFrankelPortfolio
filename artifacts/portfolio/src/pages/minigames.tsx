import { Link } from "wouter";
import { ArrowLeft, Gamepad2, ChevronRight } from "lucide-react";

const GAMES = [
  {
    id: "pong",
    title: "Pong",
    description: "Classic 2D ping-pong. First to 7 wins. Move your paddle to deflect the ball.",
    controls: "Mouse or W / S keys",
    tag: "Classic",
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Stack falling pieces to clear lines. Speed increases as your score climbs.",
    controls: "Arrow keys + Space to hard drop",
    tag: "Classic",
  },
  {
    id: "car-dodge",
    title: "Highway Run",
    description: "Weave through oncoming traffic on a busy highway. How long can you last?",
    controls: "Arrow Left / Right",
    tag: "Cars",
  },
];

export default function Minigames() {
  return (
    <div className="container mx-auto px-4 pt-10 pb-16 md:pt-20 md:pb-28 max-w-3xl">
      <Link href="/about" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to About
      </Link>

      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">Mini-games</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Play a round</h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          A few games to take a break with. Classic arcade and a couple built around real interests.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {GAMES.map((game) => (
          <Link key={game.id} href={`/minigames/${game.id}`}>
            <div
              data-testid={`card-game-${game.id}`}
              className="group flex items-center gap-5 p-6 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold group-hover:text-primary transition-colors">{game.title}</p>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-secondary text-secondary-foreground">{game.tag}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{game.description}</p>
                <p className="text-xs font-mono text-muted-foreground/70">{game.controls}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
