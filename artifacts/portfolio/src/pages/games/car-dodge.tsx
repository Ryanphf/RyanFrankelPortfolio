import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitScore } from "@workspace/api-client-react";

const LANES = 4;
const PLAYER_W = 38;
const PLAYER_H = 64;
const ENEMY_W = 38;
const ENEMY_H = 64;

const ENEMY_COLORS = [
  { body: "#3b82f6", roof: "#1d4ed8", glass: "#bfdbfe" },
  { body: "#ef4444", roof: "#b91c1c", glass: "#fecaca" },
  { body: "#10b981", roof: "#047857", glass: "#a7f3d0" },
  { body: "#f59e0b", roof: "#b45309", glass: "#fde68a" },
  { body: "#8b5cf6", roof: "#6d28d9", glass: "#ddd6fe" },
  { body: "#ec4899", roof: "#be185d", glass: "#fbcfe8" },
  { body: "#14b8a6", roof: "#0f766e", glass: "#99f6e4" },
];

function randomEnemyColor() {
  return ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)];
}

interface EnemyCar {
  lane: number;
  y: number;
  color: { body: string; roof: string; glass: string };
}

function drawCar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  bodyColor: string, roofColor: string, glassColor: string,
  isPlayer: boolean
) {
  const r = 7;

  // Shadow
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();

  // Side stripes / panels
  ctx.fillStyle = isPlayer ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.10)";
  ctx.fillRect(x + 4, y + h * 0.3, 4, h * 0.35);
  ctx.fillRect(x + w - 8, y + h * 0.3, 4, h * 0.35);

  // Roof
  const roofInset = w * 0.15;
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.roundRect(x + roofInset, y + h * 0.2, w - roofInset * 2, h * 0.45, 5);
  ctx.fill();

  // Windshield
  ctx.fillStyle = glassColor;
  ctx.globalAlpha = 0.88;
  if (isPlayer) {
    ctx.beginPath();
    ctx.roundRect(x + roofInset + 3, y + h * 0.22, w - roofInset * 2 - 6, h * 0.2, 3);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(x + roofInset + 3, y + h * 0.44, w - roofInset * 2 - 6, h * 0.18, 3);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Rear window
  ctx.fillStyle = glassColor;
  ctx.globalAlpha = 0.65;
  if (isPlayer) {
    ctx.beginPath();
    ctx.roundRect(x + roofInset + 3, y + h * 0.44, w - roofInset * 2 - 6, h * 0.16, 3);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.roundRect(x + roofInset + 3, y + h * 0.24, w - roofInset * 2 - 6, h * 0.16, 3);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Wheels
  const wheelW = 8, wheelH = 14, wheelR = 3;
  ctx.fillStyle = "#111";
  [
    [x - 3, y + h * 0.15],
    [x + w - wheelW + 3, y + h * 0.15],
    [x - 3, y + h * 0.65],
    [x + w - wheelW + 3, y + h * 0.65],
  ].forEach(([wx, wy]) => {
    ctx.beginPath();
    ctx.roundRect(wx, wy, wheelW, wheelH, wheelR);
    ctx.fill();
    // Rim
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.roundRect(wx + 1.5, wy + 2, 5, 10, 2);
    ctx.fill();
    ctx.fillStyle = "#111";
  });

  // Headlights / taillights
  if (isPlayer) {
    // Taillights (red, at bottom)
    ctx.fillStyle = "#ff2222";
    ctx.shadowColor = "#ff2222";
    ctx.shadowBlur = 6;
    [[x + 4, y + h - 10], [x + w - 10, y + h - 10]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.roundRect(lx, ly, 6, 5, 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    // Headlights (yellow, at top)
    ctx.fillStyle = "#ffe566";
    ctx.shadowColor = "#ffe566";
    ctx.shadowBlur = 8;
    [[x + 4, y + 5], [x + w - 10, y + 5]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.roundRect(lx, ly, 6, 5, 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  } else {
    // Headlights at bottom (facing player)
    ctx.fillStyle = "#ffe566";
    ctx.shadowColor = "#ffe566";
    ctx.shadowBlur = 10;
    [[x + 4, y + h - 10], [x + w - 10, y + h - 10]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.roundRect(lx, ly, 6, 5, 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    // Taillights at top
    ctx.fillStyle = "#ff2222";
    [[x + 4, y + 5], [x + w - 10, y + 5]].forEach(([lx, ly]) => {
      ctx.beginPath();
      ctx.roundRect(lx, ly, 6, 5, 2);
      ctx.fill();
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
    targetLane: 1,
    playerX: 0,
    enemies: [] as EnemyCar[],
    score: 0,
    roadOffset: 0,
    spawnTimer: 0,
    highScore: 0,
    laneTransition: 0,
  });

  const [ui, setUi] = useState({ score: 0, over: false, started: false, highScore: 0 });
  const [nameInput, setNameInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitScoreMutation = useSubmitScore();

  const getLaneX = useCallback((lane: number, laneW: number, roadX: number) => {
    return roadX + lane * laneW + laneW / 2 - PLAYER_W / 2;
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.started = true;
    s.over = false;
    s.targetLane = 1;
    s.enemies = [];
    s.score = 0;
    s.roadOffset = 0;
    s.spawnTimer = 0;
    setSubmitted(false);
    setNameInput("");
    setUi(u => ({ ...u, score: 0, over: false, started: true }));
  }, []);

  const handleSubmitScore = useCallback(async () => {
    if (!nameInput.trim()) return;
    await submitScoreMutation.mutateAsync({
      data: { playerName: nameInput.trim(), score: stateRef.current.score, game: "highway-run" },
    });
    setSubmitted(true);
  }, [nameInput, submitScoreMutation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const resize = () => {
      const w = Math.min(container.clientWidth, 420);
      canvas.width = w;
      canvas.height = Math.round(w * 1.55);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
        e.preventDefault();
        const mapped = (e.key === "a" || e.key === "A") ? "ArrowLeft"
                     : (e.key === "d" || e.key === "D") ? "ArrowRight"
                     : e.key;
        keysRef.current.add(mapped);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const mapped = (e.key === "a" || e.key === "A") ? "ArrowLeft"
                   : (e.key === "d" || e.key === "D") ? "ArrowRight"
                   : e.key;
      keysRef.current.delete(mapped);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);

    const ctx = canvas.getContext("2d")!;
    let lastLaneKey = "";
    let lastScoreTime = 0;
    let lastFrameTime = 0;

    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      const dt = Math.min((ts - lastFrameTime) / 16.67, 3); // delta normalized to ~60fps
      lastFrameTime = ts;

      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      const roadW = w * 0.74;
      const roadX = (w - roadW) / 2;
      const laneW = roadW / LANES;

      if (s.started && !s.over) {
        // Score over time
        if (ts - lastScoreTime > 100) {
          s.score += 1;
          lastScoreTime = ts;
        }

        // Smooth difficulty ramp:
        // speed 2→10 over 0→400 score
        const speed = Math.min(2 + s.score * 0.018, 10) * dt;

        // Lane input (debounced per key press)
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
        s.playerX += (targetX - s.playerX) * 0.22 * dt;

        // Road scroll
        s.roadOffset = (s.roadOffset + speed * 2.2) % 80;

        // Spawn enemies — fewer at start, more as score grows
        s.spawnTimer += dt;
        const spawnInterval = Math.max(28, 90 - s.score * 0.18);
        if (s.spawnTimer >= spawnInterval) {
          s.spawnTimer = 0;
          // Ensure minimum safe gap: don't spawn in a lane with a car in the top 30% of screen
          const busyLanes = s.enemies.filter(e => e.y < h * 0.3).map(e => e.lane);
          const freeLanes = [0, 1, 2, 3].filter(l => !busyLanes.includes(l));
          if (freeLanes.length > 0) {
            const lane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
            s.enemies.push({ lane, y: -ENEMY_H - Math.random() * 60, color: randomEnemyColor() });
          }
        }

        // Move enemies
        const enemySpeed = speed * 1.6;
        s.enemies.forEach(e => { e.y += enemySpeed; });
        s.enemies = s.enemies.filter(e => e.y < h + ENEMY_H);

        // Collision
        const playerY = h - PLAYER_H - 20;
        for (const e of s.enemies) {
          const ex = getLaneX(e.lane, laneW, roadX);
          const margin = 5;
          const overlap = (
            s.playerX + margin < ex + ENEMY_W - margin &&
            s.playerX + PLAYER_W - margin > ex + margin &&
            playerY + margin < e.y + ENEMY_H - margin &&
            playerY + PLAYER_H - margin > e.y + margin
          );
          if (overlap) {
            s.over = true;
            s.highScore = Math.max(s.highScore, s.score);
            setUi({ score: s.score, over: true, started: true, highScore: s.highScore });
            break;
          }
        }

        if (!s.over && ts - lastScoreTime < 200) setUi(u => u.score !== s.score ? { ...u, score: s.score } : u);
      }

      // ─── Draw ────────────────────────────────────────────────
      // Sky/background
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, w, h);

      // Grass shoulders
      ctx.fillStyle = "#14321a";
      ctx.fillRect(0, 0, roadX, h);
      ctx.fillRect(roadX + roadW, 0, w - roadX - roadW, h);

      // Grass texture lines
      ctx.strokeStyle = "#1a4022";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const gx = (roadX / 6) * i;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      // Road base
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(roadX, 0, roadW, h);

      // Road texture (subtle)
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      for (let i = 0; i < 3; i++) {
        const ty = (s.roadOffset * 3 + i * 120) % h;
        ctx.fillRect(roadX, ty, roadW, 60);
      }

      // Yellow edge lines
      ctx.strokeStyle = "#f5c518";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(roadX + 1, 0);
      ctx.lineTo(roadX + 1, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(roadX + roadW - 1, 0);
      ctx.lineTo(roadX + roadW - 1, h);
      ctx.stroke();

      // White dashed lane dividers
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 2;
      ctx.setLineDash([36, 44]);
      for (let i = 1; i < LANES; i++) {
        const lx = roadX + i * laneW;
        ctx.beginPath();
        ctx.moveTo(lx, -80 + s.roadOffset);
        ctx.lineTo(lx, h + 80);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw enemies
      s.enemies.forEach(e => {
        const ex = getLaneX(e.lane, laneW, roadX);
        drawCar(ctx, ex, e.y, ENEMY_W, ENEMY_H, e.color.body, e.color.roof, e.color.glass, false);
      });

      // Live score overlay
      if (s.started && !s.over) {
        const scoreText = String(s.score);
        ctx.font = "bold 28px 'Space Mono', monospace";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillText(scoreText, w - 14, 16);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(scoreText, w - 16, 14);
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
      }

      // Draw player
      if (s.started) {
        if (s.playerX === 0) s.playerX = getLaneX(1, laneW, roadX);
        const playerY = h - PLAYER_H - 20;
        drawCar(ctx, s.playerX, playerY, PLAYER_W, PLAYER_H, "#e05a1a", "#b84010", "#fed7aa", true);
      }
    };

    // Init playerX
    const w0 = canvas.width;
    const roadW0 = w0 * 0.74;
    const roadX0 = (w0 - roadW0) / 2;
    stateRef.current.playerX = getLaneX(1, roadW0 / LANES, roadX0);

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
          <p className="text-sm text-muted-foreground mt-1">← → or A / D to change lanes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/minigames/leaderboard">
            <Button variant="ghost" size="sm">
              <Trophy className="w-4 h-4 mr-1" /> Scores
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {ui.started ? "Restart" : "Start"}
          </Button>
        </div>
      </div>

      {ui.highScore > 0 && (
        <p className="text-xs font-mono text-muted-foreground mb-3">Personal best: {ui.highScore}</p>
      )}

      <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
        <canvas ref={canvasRef} className="block w-full" />
        {!ui.started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-white text-xl font-bold mb-2">Highway Run</p>
            <p className="text-white/60 text-sm mb-5">Dodge the oncoming traffic</p>
            <Button onClick={reset}>Start</Button>
          </div>
        )}
        {ui.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-6">
            <p className="text-white text-2xl font-bold mb-1">Crash!</p>
            <p className="text-white/70 mb-1 text-lg font-mono">Score: {ui.score}</p>
            <p className="text-white/40 mb-5 text-xs">Best: {ui.highScore}</p>

            {!submitted ? (
              <div className="flex flex-col items-center gap-2 w-full max-w-xs mb-4">
                <p className="text-white/70 text-sm">Save your score to the leaderboard</p>
                <div className="flex gap-2 w-full">
                  <Input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value.slice(0, 20))}
                    placeholder="Your name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
                    onKeyDown={e => e.key === "Enter" && handleSubmitScore()}
                    maxLength={20}
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmitScore}
                    disabled={!nameInput.trim() || submitScoreMutation.isPending}
                  >
                    {submitScoreMutation.isPending ? "..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
                <Trophy className="w-4 h-4" /> Score saved!
              </div>
            )}

            <Button onClick={reset}>Play again</Button>
          </div>
        )}
      </div>
    </div>
  );
}
