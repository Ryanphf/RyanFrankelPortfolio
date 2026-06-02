import { Link } from "wouter";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { format } from "date-fns";

const RANK_COLORS = ["#f5c518", "#c0c0c0", "#cd7f32"];
const RANK_LABELS = ["1st", "2nd", "3rd"];

export default function Leaderboard() {
  const { data: entries, isLoading } = useGetLeaderboard("highway-run");

  return (
    <div className="container mx-auto px-4 pt-10 pb-16 max-w-xl">
      <Link href="/minigames/car-dodge" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Highway Run
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Highway Run</p>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Top 10 all-time scores</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !entries || entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No scores yet — be the first!</p>
          <Link href="/minigames/car-dodge">
            <span className="text-primary text-sm hover:underline cursor-pointer mt-2 inline-block">Play now</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border ${
                i === 0 ? "border-yellow-500/40 bg-yellow-500/5" :
                i === 1 ? "border-slate-400/30 bg-slate-400/5" :
                i === 2 ? "border-amber-600/30 bg-amber-600/5" :
                "border-border bg-card"
              }`}
            >
              <div className="w-10 text-center shrink-0">
                {i < 3 ? (
                  <Medal className="w-5 h-5 mx-auto" style={{ color: RANK_COLORS[i] }} />
                ) : (
                  <span className="text-sm font-mono text-muted-foreground">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{entry.playerName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {format(new Date(entry.createdAt), "MMM d, yyyy")}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xl font-bold font-mono" style={{ color: i < 3 ? RANK_COLORS[i] : undefined }}>
                  {entry.score}
                </p>
                {i < 3 && (
                  <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: RANK_COLORS[i] }}>
                    {RANK_LABELS[i]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/minigames/car-dodge">
          <Button variant="outline" size="sm">Play to add your score</Button>
        </Link>
      </div>
    </div>
  );
}
