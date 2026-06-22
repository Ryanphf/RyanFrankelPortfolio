import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react'
import { useSubmitScore } from '@/lib/queries'

const LANES = 4, PW = 38, PH = 64, EW = 38, EH = 64

const ENEMY_COLORS = [
  { body:'#3b82f6', roof:'#1d4ed8', glass:'#bfdbfe' },
  { body:'#ef4444', roof:'#b91c1c', glass:'#fecaca' },
  { body:'#10b981', roof:'#047857', glass:'#a7f3d0' },
  { body:'#f59e0b', roof:'#b45309', glass:'#fde68a' },
  { body:'#8b5cf6', roof:'#6d28d9', glass:'#ddd6fe' },
  { body:'#ec4899', roof:'#be185d', glass:'#fbcfe8' },
]

interface EnemyCar { lane: number; y: number; color: typeof ENEMY_COLORS[0] }

function drawCar(ctx: CanvasRenderingContext2D, x:number, y:number, w:number, h:number, body:string, roof:string, glass:string, isPlayer:boolean) {
  const r=7
  ctx.save(); ctx.globalAlpha=.22; ctx.fillStyle='#000'
  ctx.beginPath(); ctx.ellipse(x+w/2,y+h+4,w*.4,5,0,0,Math.PI*2); ctx.fill(); ctx.restore()
  ctx.fillStyle=body; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill()
  ctx.fillStyle='rgba(0,0,0,.1)'; ctx.fillRect(x+4,y+h*.3,4,h*.35); ctx.fillRect(x+w-8,y+h*.3,4,h*.35)
  const ri=w*.15
  ctx.fillStyle=roof; ctx.beginPath(); ctx.roundRect(x+ri,y+h*.2,w-ri*2,h*.45,5); ctx.fill()
  ctx.fillStyle=glass; ctx.globalAlpha=.88
  ctx.beginPath(); ctx.roundRect(x+ri+3,y+h*(isPlayer?.22:.44),w-ri*2-6,h*.2,3); ctx.fill()
  ctx.globalAlpha=.65; ctx.beginPath(); ctx.roundRect(x+ri+3,y+h*(isPlayer?.44:.24),w-ri*2-6,h*.16,3); ctx.fill()
  ctx.globalAlpha=1; ctx.fillStyle='#111'
  ;[[x-3,y+h*.15],[x+w-11,y+h*.15],[x-3,y+h*.65],[x+w-11,y+h*.65]].forEach(([wx,wy])=>{
    ctx.beginPath(); ctx.roundRect(wx,wy,8,14,3); ctx.fill()
    ctx.fillStyle='#555'; ctx.beginPath(); ctx.roundRect(wx+1.5,wy+2,5,10,2); ctx.fill(); ctx.fillStyle='#111'
  })
  if(isPlayer){
    ctx.fillStyle='#ff2222'; ctx.shadowColor='#ff2222'; ctx.shadowBlur=6
    ;[[x+4,y+h-10],[x+w-10,y+h-10]].forEach(([lx,ly])=>{ctx.beginPath();ctx.roundRect(lx,ly,6,5,2);ctx.fill()})
    ctx.shadowBlur=0; ctx.fillStyle='#ffe566'; ctx.shadowColor='#ffe566'; ctx.shadowBlur=8
    ;[[x+4,y+5],[x+w-10,y+5]].forEach(([lx,ly])=>{ctx.beginPath();ctx.roundRect(lx,ly,6,5,2);ctx.fill()})
    ctx.shadowBlur=0
  } else {
    ctx.fillStyle='#ffe566'; ctx.shadowColor='#ffe566'; ctx.shadowBlur=10
    ;[[x+4,y+h-10],[x+w-10,y+h-10]].forEach(([lx,ly])=>{ctx.beginPath();ctx.roundRect(lx,ly,6,5,2);ctx.fill()})
    ctx.shadowBlur=0; ctx.fillStyle='#ff2222'
    ;[[x+4,y+5],[x+w-10,y+5]].forEach(([lx,ly])=>{ctx.beginPath();ctx.roundRect(lx,ly,6,5,2);ctx.fill()})
  }
}

export default function CarDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)
  const keysRef   = useRef<Set<string>>(new Set())
  const stateRef  = useRef({ started:false, over:false, targetLane:1, playerX:0, enemies:[] as EnemyCar[], score:0, roadOffset:0, spawnTimer:0, highScore:0 })
  const [ui, setUi] = useState({ score:0, over:false, started:false, highScore:0 })
  const [nameInput, setNameInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const submitScore = useSubmitScore()

  const getLaneX = useCallback((lane:number, lw:number, rx:number) => rx+lane*lw+lw/2-PW/2, [])

  const reset = useCallback(() => {
    const s = stateRef.current
    s.started=true; s.over=false; s.targetLane=1; s.enemies=[]; s.score=0; s.roadOffset=0; s.spawnTimer=0
    setSubmitted(false); setNameInput('')
    setUi(u => ({...u, score:0, over:false, started:true}))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!nameInput.trim()) return
    await submitScore.mutateAsync({ playerName: nameInput.trim(), score: stateRef.current.score, game: 'highway-run' })
    setSubmitted(true)
  }, [nameInput, submitScore])

  useEffect(() => {
    const canvas = canvasRef.current!
    const parent = canvas.parentElement!
    const resize = () => { const w=Math.min(parent.clientWidth,420); canvas.width=w; canvas.height=Math.round(w*1.55) }
    resize(); const ro = new ResizeObserver(resize); ro.observe(parent)
    const onKey = (e: KeyboardEvent) => {
      const m = e.key==='a'||e.key==='A'?'ArrowLeft':e.key==='d'||e.key==='D'?'ArrowRight':e.key
      if(['ArrowLeft','ArrowRight'].includes(m)){e.preventDefault();keysRef.current.add(m)}
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const m = e.key==='a'||e.key==='A'?'ArrowLeft':e.key==='d'||e.key==='D'?'ArrowRight':e.key
      keysRef.current.delete(m)
    }
    window.addEventListener('keydown',onKey); window.addEventListener('keyup',onKeyUp)
    const ctx = canvas.getContext('2d')!
    let lastLane='', lastScoreTime=0, lastFrame=0
    const loop = (ts:number) => {
      rafRef.current=requestAnimationFrame(loop)
      const dt=Math.min((ts-lastFrame)/16.67,3); lastFrame=ts
      const s=stateRef.current, w=canvas.width, h=canvas.height
      const rw=w*.74, rx=(w-rw)/2, lw=rw/LANES
      if(s.started&&!s.over){
        if(ts-lastScoreTime>100){s.score++;lastScoreTime=ts}
        const speed=Math.min(2+s.score*.018,10)*dt
        if(keysRef.current.has('ArrowLeft')&&lastLane!=='ArrowLeft'){lastLane='ArrowLeft';s.targetLane=Math.max(0,s.targetLane-1)}
        else if(keysRef.current.has('ArrowRight')&&lastLane!=='ArrowRight'){lastLane='ArrowRight';s.targetLane=Math.min(LANES-1,s.targetLane+1)}
        else if(!keysRef.current.has('ArrowLeft')&&!keysRef.current.has('ArrowRight'))lastLane=''
        const tx=getLaneX(s.targetLane,lw,rx); s.playerX+=(tx-s.playerX)*.22*dt
        s.roadOffset=(s.roadOffset+speed*2.2)%80; s.spawnTimer+=dt
        const si=Math.max(28,90-s.score*.18)
        if(s.spawnTimer>=si){
          s.spawnTimer=0
          const busy=s.enemies.filter(e=>e.y<h*.3).map(e=>e.lane)
          const free=[0,1,2,3].filter(l=>!busy.includes(l))
          if(free.length){const lane=free[Math.floor(Math.random()*free.length)];s.enemies.push({lane,y:-EH-Math.random()*60,color:ENEMY_COLORS[Math.floor(Math.random()*ENEMY_COLORS.length)]})}
        }
        s.enemies.forEach(e=>e.y+=speed*1.6); s.enemies=s.enemies.filter(e=>e.y<h+EH)
        const py=h-PH-20,mg=5
        for(const e of s.enemies){
          const ex=getLaneX(e.lane,lw,rx)
          if(s.playerX+mg<ex+EW-mg&&s.playerX+PW-mg>ex+mg&&py+mg<e.y+EH-mg&&py+PH-mg>e.y+mg){
            s.over=true; s.highScore=Math.max(s.highScore,s.score)
            setUi({score:s.score,over:true,started:true,highScore:s.highScore}); break
          }
        }
        setUi(u=>u.score!==s.score?{...u,score:s.score}:u)
      }
      ctx.fillStyle='#111827'; ctx.fillRect(0,0,w,h)
      ctx.fillStyle='#14321a'; ctx.fillRect(0,0,rx,h); ctx.fillRect(rx+rw,0,w-rx-rw,h)
      ctx.fillStyle='#1f2937'; ctx.fillRect(rx,0,rw,h)
      ctx.fillStyle='rgba(255,255,255,.015)'
      for(let i=0;i<3;i++){const ty=(s.roadOffset*3+i*120)%h;ctx.fillRect(rx,ty,rw,60)}
      ctx.strokeStyle='#f5c518'; ctx.lineWidth=3; ctx.setLineDash([])
      ctx.beginPath();ctx.moveTo(rx+1,0);ctx.lineTo(rx+1,h);ctx.stroke()
      ctx.beginPath();ctx.moveTo(rx+rw-1,0);ctx.lineTo(rx+rw-1,h);ctx.stroke()
      ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=2; ctx.setLineDash([36,44])
      for(let i=1;i<LANES;i++){const lx=rx+i*lw;ctx.beginPath();ctx.moveTo(lx,-80+s.roadOffset);ctx.lineTo(lx,h+80);ctx.stroke()}
      ctx.setLineDash([])
      s.enemies.forEach(e=>drawCar(ctx,getLaneX(e.lane,lw,rx),e.y,EW,EH,e.color.body,e.color.roof,e.color.glass,false))
      if(s.started&&!s.over){
        ctx.font="bold 24px 'Space Mono',monospace"; ctx.textAlign='right'; ctx.textBaseline='top'
        ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillText(String(s.score),w-14,16)
        ctx.fillStyle='rgba(255,255,255,.92)'; ctx.fillText(String(s.score),w-16,14)
        ctx.textAlign='left'; ctx.textBaseline='alphabetic'
      }
      if(s.started){
        if(s.playerX===0)s.playerX=getLaneX(1,lw,rx)
        drawCar(ctx,s.playerX,h-PH-20,PW,PH,'#e05a1a','#b84010','#fed7aa',true)
      }
    }
    const w0=canvas.width,rw0=w0*.74,rx0=(w0-rw0)/2
    stateRef.current.playerX=getLaneX(1,rw0/LANES,rx0)
    rafRef.current=requestAnimationFrame(loop)
    return ()=>{ cancelAnimationFrame(rafRef.current); ro.disconnect(); window.removeEventListener('keydown',onKey); window.removeEventListener('keyup',onKeyUp) }
  },[getLaneX])

  return (
    <div className="mx-auto max-w-lg px-5 pt-8 pb-16">
      <Link to="/minigames" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> All games
      </Link>
      <div className="flex items-center justify-between mb-3">
        <div><h1 className="text-3xl font-display font-bold">Highway Run</h1><p className="text-sm text-stone-500 mt-1">← → or A/D to change lanes</p></div>
        <div className="flex gap-2">
          <Link to="/minigames/leaderboard">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors">
              <Trophy className="w-4 h-4" /> Scores
            </button>
          </Link>
          <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-stone-200 text-sm font-medium hover:bg-stone-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> {ui.started ? 'Restart' : 'Start'}
          </button>
        </div>
      </div>
      {ui.highScore > 0 && <p className="text-xs font-mono text-stone-400 mb-3">Personal best: {ui.highScore}</p>}
      <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-lg">
        <canvas ref={canvasRef} className="block w-full" />
        {!ui.started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-white text-xl font-bold mb-2">Highway Run</p>
            <p className="text-white/60 text-sm mb-5">Dodge the oncoming traffic</p>
            <button onClick={reset} className="px-6 py-2.5 rounded bg-primary text-white font-semibold text-sm">Start</button>
          </div>
        )}
        {ui.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6">
            <p className="text-white text-2xl font-bold mb-1">Crash!</p>
            <p className="text-white/70 mb-1 text-lg font-mono">Score: {ui.score}</p>
            <p className="text-white/40 mb-4 text-xs">Best: {ui.highScore}</p>
            {!submitted ? (
              <div className="flex flex-col items-center gap-2 w-full max-w-xs mb-4">
                <p className="text-white/70 text-sm">Save score to leaderboard</p>
                <div className="flex gap-2 w-full">
                  <input value={nameInput} onChange={e=>setNameInput(e.target.value.slice(0,20))} placeholder="Your name" maxLength={20}
                    onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                    className="flex-1 px-3 py-2 rounded text-sm bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                  <button onClick={handleSubmit} disabled={!nameInput.trim()||submitScore.isPending}
                    className="px-4 py-2 rounded bg-primary text-white text-sm font-semibold disabled:opacity-50">
                    {submitScore.isPending?'…':'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
                <Trophy className="w-4 h-4" /> Score saved!
              </div>
            )}
            <button onClick={reset} className="px-6 py-2.5 rounded bg-primary text-white font-semibold text-sm">Play again</button>
          </div>
        )}
      </div>
    </div>
  )
}
