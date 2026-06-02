import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANES = 4;
const PLAYER_W = 36;
const PLAYER_H = 58;
const ENEMY_W = 36;
const ENEMY_H = 58;

interface EnemyCar { lane: number; y: number; color: string; }

const CAR_COLORS = ["#ef4444","#3b82f6","#f59e0b","#10b981","#8b5cf6","#ec4899"];

function randomColor() { return CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]; }

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, isPlayer: boolean) {
  const r = 6;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // Windshield
  ctx.fillStyle = isPlayer ? "rgba(200,230,255,0.85)" : "rgba(180,210,240,0.7)";
  if (isPlayer) {
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 8, w - 10, h * 0.28, 3);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(x + 5, y + h * 0.62, w - 10, h * 0.22, 3);
    ctx.fill();
  }

  // Wheels
  ctx.fillStyle = "#1f1f1f";
  [[x - 3, y + 8], [x + w - 5, y + 8], [x - 3, y + h - 16], [x + w - 5, y + h - 16]].forEach(([wx, wy]) => {
    ctx.fillRect(wx, wy, 8, 12);
  });

  // Lights
  if (isPlayer) {
    ctx.fillStyle = "#ffe066";
    [[x + 5, y + h - 7], [x + w - 11, y + h - 7]].forEach(([lx, ly]) => {
      ctx.fillRect(lx, ly, 6, 4);
    });
  } else {
    ctx.fillStyle = "#ff4444";
    [[x + 5, y + 4], [x + w - 11, y + 4]].forEach(([lx, ly]) => {
      ctx.fillRect(lx, ly, 6, 4);
    });
  }
}

export default function CarDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());

  const stateRef = useRef({
    started: false,
    over: false,
    playerLane: 1,
    playerX: 0,
    enemies: [] as EnemyCar[],
    speed: 3,
    score: 0,
    roadOffset: 0,
    spawnTimer: 0,
    highScore: 0,
    laneTransition: 0,
    targetLane: 1,
  });

  const [ui, setUi] = useState({ score: 0, over: false, started: false, highScore: 0 });

  const getLaneX = useCallback((lane: number, laneW: number, roadX: number) => {
    return roadX + lane * laneW + laneW / 2 - PLAYER_W / 2;
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.started = true;
    s.over = false;
    s.playerLane = 1;
    s.targetLane = 1;
    s.laneTransition = 0;
    s.enemies = [];
    s.speed = 3;
    s.score = 0;
    s.roadOffset = 0;
    s.spawnTimer = 0;
    setUi(u => ({ ...u, score: 0, over: false, started: true }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const resize = () => {
      const w = Math.min(container.clientWidth, 400);
      canvas.width = w;
      canvas.height = Math.round(w * 1.5);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);

    const ctx = canvas.getContext("2d")!;
    let lastLaneKey = "";
    let lastScoreTime = 0;

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      const roadW = w * 0.72;
      const roadX = (w - roadW) / 2;
      const laneW = roadW / LANES;

      if (s.started && !s.over) {
        // Score over time
        if (ts - lastScoreTime > 100) {
          s.score += 1;
          lastScoreTime = ts;
        }
        s.speed = 3 + s.score * 0.015;

        // Lane input (debounced)
        const keys = keysRef.current;
        if (keys.has("ArrowLeft") && lastLaneKey !== "ArrowLeft") {
          lastLaneKey = "ArrowLeft";
          s.targetLane = Math.max(0, s.targetLane - 1);
        } else if (keys.has("ArrowRight") && lastLaneKey !== "ArrowRight") {
          lastLaneKey = "ArrowRight";
          s.targetLane = Math.min(LANES - 1, s.targetLane + 1);
        } else if (!keys.has("ArrowLeft") && !keys.has("ArrowRight")) {
          lastLaneKey = "";
        }

        // Smooth lane transition
        const targetX = getLaneX(s.targetLane, laneW, roadX);
        const diff = targetX - s.playerX;
        s.playerX += diff * 0.2;
        s.playerLane = s.targetLane;

        // Road scroll
        s.roadOffset = (s.roadOffset + s.speed * 2) % 80;

        // Spawn enemies
        s.spawnTimer++;
        const spawnInterval = Math.max(30, 90 - s.score * 0.2);
        if (s.spawnTimer >= spawnInterval) {
          s.spawnTimer = 0;
          const usedLanes = s.enemies.filter(e => e.y < 100).map(e => e.lane);
          const freeLanes = [0,1,2,3].filter(l => !usedLanes.includes(l));
          if (freeLanes.length > 0) {
            const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
            s.enemies.push({ lane, y: -ENEMY_H, color: randomColor() });
          }
        }

        // Move enemies
        s.enemies.forEach(e => { e.y += s.speed * 1.5; });
        s.enemies = s.enemies.filter(e => e.y < h + ENEMY_H);

        // Collision
        const playerY = h - PLAYER_H - 20;
        for (const e of s.enemies) {
          const ex = getLaneX(e.lane, laneW, roadX);
          const ey = e.y;
          const overlap = (
            s.playerX < ex + ENEMY_W - 4 &&
            s.playerX + PLAYER_W - 4 > ex + 4 &&
            playerY < ey + ENEMY_H - 4 &&
            playerY + PLAYER_H - 4 > ey + 4
          );
          if (overlap) {
            s.over = true;
            s.highScore = Math.max(s.highScore, s.score);
            setUi({ score: s.score, over: true, started: true, highScore: s.highScore });
            break;
          }
        }

        if (ts - lastScoreTime > 500) setUi(u => ({ ...u, score: s.score }));
      }

      // Draw background
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, w, h);

      // Grass
      ctx.fillStyle = "#1c3a1c";
      ctx.fillRect(0, 0, roadX, h);
      ctx.fillRect(roadX + roadW, 0, roadX, h);

      // Road
      ctx.fillStyle = "#2a2a2a";
      ctx.fillRect(roadX, 0, roadW, h);

      // Road markings
      ctx.strokeStyle = "#f5c518";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(roadX, 0); ctx.lineTo(roadX, h);
      ctx.moveTo(roadX + roadW, 0); ctx.lineTo(roadX + roadW, h);
      ctx.stroke();

      ctx.setLineDash([40, 40]);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      for (let i = 1; i < LANES; i++) {
        const x = roadX + i * laneW;
        ctx.beginPath();
        ctx.moveTo(x, -80 + s.roadOffset);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Enemies
      s.enemies.forEach(e => {
        const ex = getLaneX(e.lane, laneW, roadX);
        drawCar(ctx, ex, e.y, ENEMY_W, ENEMY_H, e.color, false);
      });

      // Player
      if (s.started) {
        const playerY = h - PLAYER_H - 20;
        if (!s.started) s.playerX = getLaneX(1, laneW, roadX);
        if (s.playerX === 0) s.playerX = getLaneX(1, laneW, roadX);
        drawCar(ctx, s.playerX, playerY, PLAYER_W, PLAYER_H, "#e05a1a", true);
      }

      // Score overlay
      if (s.started) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(w - 90, 10, 80, 36);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`Score: ${s.score}`, w - 16, 33);
        ctx.textAlign = "left";
      }
    };

    // Init playerX
    const w = canvas.width;
    const roadW = w * 0.72;
    const roadX = (w - roadW) / 2;
    const laneW = roadW / LANES;
    stateRef.current.playerX = getLaneX(1, laneW, roadX);

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [getLaneX]);

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 max-w-lg">
      <Link href="/minigames" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> All games
      </Link>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Highway Run</h1>
          <p className="text-sm text-muted-foreground mt-1">Arrow Left / Right to change lanes</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {ui.started ? "Restart" : "Start"}
        </Button>
      </div>

      {ui.highScore > 0 && (
        <p className="text-xs font-mono text-muted-foreground mb-3">Best: {ui.highScore}</p>
      )}

      <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
        <canvas ref={canvasRef} className="block w-full" />
        {!ui.started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-white text-xl font-bold mb-4">Highway Run</p>
            <p className="text-white/60 text-sm mb-5">Dodge the oncoming traffic</p>
            <Button onClick={reset}>Start</Button>
          </div>
        )}
        {ui.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <p className="text-white text-2xl font-bold mb-1">Crash!</p>
            <p className="text-white/60 mb-1 text-sm">Score: {ui.score}</p>
            <p className="text-white/40 mb-5 text-xs">Best: {ui.highScore}</p>
            <Button onClick={reset}>Try again</Button>
          </div>
        )}
      </div>
    </div>
  );
}
