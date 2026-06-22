import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy, Medal } from 'lucide-react'
import { useLeaderboard } from '@/lib/queries'

const RANK_COLORS = ['#f5c518', '#c0c0c0', '#cd7f32']
const RANK_LABELS = ['1st', '2nd', '3rd']
const RANK_CLS    = [
  'border-yellow-400/40 bg-yellow-400/5',
  'border-slate-400/30 bg-slate-400/5',
  'border-amber-600/30 bg-amber-600/5',
]

export default function Leaderboard() {
  const { data: entries, isLoading } = useLeaderboard('highway-run')

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="mx-auto max-w-lg px-5 pt-10 pb-20">
      <Link to="/minigames/car-dodge" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Highway Run
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-3">Highway Run</p>
      <h1 className="text-4xl font-display font-bold tracking-tight mb-1 flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary" /> Leaderboard
      </h1>
      <p className="text-sm text-stone-500 mb-8">Top 10 all-time scores</p>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_,i) => <div key={i} className="h-14 rounded-lg bg-stone-100 animate-pulse" />)}
        </div>
      ) : !entries?.length ? (
        <div className="text-center py-16 text-stone-400">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No scores yet — be the first!</p>
          <Link to="/minigames/car-dodge" className="text-primary text-sm hover:underline mt-2 inline-block">Play now</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-lg border ${i < 3 ? RANK_CLS[i] : 'border-stone-200 bg-white'}`}
            >
              <div className="w-8 text-center shrink-0">
                {i < 3
                  ? <Medal className="w-5 h-5 mx-auto" style={{ color: RANK_COLORS[i] }} />
                  : <span className="text-sm font-mono text-stone-400">{i+1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{entry.playerName}</p>
                <p className="text-xs font-mono text-stone-400">{fmt(entry.createdAt)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold font-mono" style={i<3?{color:RANK_COLORS[i]}:undefined}>{entry.score}</p>
                {i < 3 && <p className="text-[10px] font-mono uppercase tracking-widest" style={{color:RANK_COLORS[i]}}>{RANK_LABELS[i]}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
        <Link to="/minigames/car-dodge">
          <button className="px-5 py-2.5 rounded border border-stone-200 text-sm font-semibold hover:bg-stone-50 transition-colors">
            Play to add your score
          </button>
        </Link>
      </div>
    </div>
  )
}
