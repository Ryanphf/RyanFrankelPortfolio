import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const WINNING_SCORE = 7;
const PADDLE_H = 80;
const PADDLE_W = 12;
const BALL_R = 8;
const AI_SPEED = 3.2;

interface State {
  ball: { x: number; y: number; vx: number; vy: number };
  player: { y: number };
  ai: { y: number };
  score: { player: number; ai: number };
  phase: "idle" | "playing" | "scored" | "won";
  winner: "player" | "ai" | null;
}

function makeState(w: number, h: number): State {
  const speed = 5;
  const angle = (Math.random() * 0.8 - 0.4);
  const dir = Math.random() > 0.5 ? 1 : -1;
  return {
    ball: { x: w / 2, y: h / 2, vx: dir * speed * Math.cos(angle), vy: speed * Math.sin(angle) },
    player: { y: h / 2 - PADDLE_H / 2 },
    ai: { y: h / 2 - PADDLE_H / 2 },
    score: { player: 0, ai: 0 },
    phase: "idle",
    winner: null,
  };
}

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State | null>(null);
  const rafRef = useRef<number>(0);
  const mouseYRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [display, setDisplay] = useState<{ score: { player: number; ai: number }; phase: State["phase"]; winner: State["winner"] }>({ score: { player: 0, ai: 0 }, phase: "idle", winner: null });

  const reset = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    stateRef.current = makeState(canvas.width, canvas.height);
    stateRef.current.phase = "playing";
    setDisplay({ score: { player: 0, ai: 0 }, phase: "playing", winner: null });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement!;
    const resize = () => {
      const w = Math.min(container.clientWidth, 700);
      const h = Math.round(w * 0.6);
      canvas.width = w;
      canvas.height = h;
      if (!stateRef.current || stateRef.current.phase === "idle") {
        stateRef.current = makeState(w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseYRef.current = (e.clientY - rect.top) * (canvas.height / rect.height);
    };
    const onTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseYRef.current = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","w","s","W","S"].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);

    const ctx = canvas.getContext("2d")!;
    let scored = false;

    const draw = () => {
      const s = stateRef.current!;
      const w = canvas.width;
      const h = canvas.height;

      // Move player paddle
      if (mouseYRef.current !== null) {
        s.player.y = Math.max(0, Math.min(h - PADDLE_H, mouseYRef.current - PADDLE_H / 2));
      } else {
        const keys = keysRef.current;
        const spd = 6;
        if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) s.player.y = Math.max(0, s.player.y - spd);
        if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) s.player.y = Math.min(h - PADDLE_H, s.player.y + spd);
      }

      if (s.phase === "playing") {
        // Move AI
        const aiCenter = s.ai.y + PADDLE_H / 2;
        if (aiCenter < s.ball.y - 4) s.ai.y = Math.min(h - PADDLE_H, s.ai.y + AI_SPEED);
        else if (aiCenter > s.ball.y + 4) s.ai.y = Math.max(0, s.ai.y - AI_SPEED);

        // Move ball
        s.ball.x += s.ball.vx;
        s.ball.y += s.ball.vy;

        // Wall bounce
        if (s.ball.y - BALL_R < 0) { s.ball.y = BALL_R; s.ball.vy *= -1; }
        if (s.ball.y + BALL_R > h) { s.ball.y = h - BALL_R; s.ball.vy *= -1; }

        // Player paddle collision
        const px = PADDLE_W + 4;
        if (s.ball.x - BALL_R < px && s.ball.vx < 0 &&
            s.ball.y > s.player.y && s.ball.y < s.player.y + PADDLE_H) {
          s.ball.x = px + BALL_R;
          const rel = (s.ball.y - (s.player.y + PADDLE_H / 2)) / (PADDLE_H / 2);
          const angle = rel * 1.1;
          const speed = Math.min(Math.hypot(s.ball.vx, s.ball.vy) * 1.05, 14);
          s.ball.vx = Math.abs(Math.cos(angle) * speed);
          s.ball.vy = Math.sin(angle) * speed;
        }

        // AI paddle collision
        const ax = w - PADDLE_W - 4;
        if (s.ball.x + BALL_R > ax && s.ball.vx > 0 &&
            s.ball.y > s.ai.y && s.ball.y < s.ai.y + PADDLE_H) {
          s.ball.x = ax - BALL_R;
          const rel = (s.ball.y - (s.ai.y + PADDLE_H / 2)) / (PADDLE_H / 2);
          const angle = rel * 1.1;
          const speed = Math.min(Math.hypot(s.ball.vx, s.ball.vy) * 1.05, 14);
          s.ball.vx = -Math.abs(Math.cos(angle) * speed);
          s.ball.vy = Math.sin(angle) * speed;
        }

        // Score
        if (!scored) {
          if (s.ball.x < 0) {
            scored = true;
            s.score.ai++;
            s.phase = s.score.ai >= WINNING_SCORE ? "won" : "scored";
            if (s.phase === "won") s.winner = "ai";
            setDisplay({ score: { ...s.score }, phase: s.phase, winner: s.winner });
            if (s.phase === "scored") setTimeout(() => {
              const ns = makeState(w, h);
              ns.score = { ...s.score };
              ns.phase = "playing";
              stateRef.current = ns;
              scored = false;
              setDisplay({ score: { ...ns.score }, phase: "playing", winner: null });
            }, 800);
          } else if (s.ball.x > w) {
            scored = true;
            s.score.player++;
            s.phase = s.score.player >= WINNING_SCORE ? "won" : "scored";
            if (s.phase === "won") s.winner = "player";
            setDisplay({ score: { ...s.score }, phase: s.phase, winner: s.winner });
            if (s.phase === "scored") setTimeout(() => {
              const ns = makeState(w, h);
              ns.score = { ...s.score };
              ns.phase = "playing";
              stateRef.current = ns;
              scored = false;
              setDisplay({ score: { ...ns.score }, phase: "playing", winner: null });
            }, 800);
          }
        }
      }

      // Render
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, w, h);

      // Center line
      ctx.setLineDash([8, 12]);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      const pR = 6;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(4, s.player.y, PADDLE_W, PADDLE_H, pR);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(w - PADDLE_W - 4, s.ai.y, PADDLE_W, PADDLE_H, pR);
      ctx.fill();

      // Ball
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "#e05a1a";
      ctx.fill();

      // Score
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = `bold ${Math.round(w * 0.06)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${s.score.player}`, w * 0.3, h * 0.12);
      ctx.fillText(`${s.score.ai}`, w * 0.7, h * 0.12);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 max-w-3xl">
      <Link to="/minigames" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> All games
      </Link>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Pong</h1>
          <p className="text-sm text-muted-foreground mt-1">Move mouse or use W/S — first to {WINNING_SCORE} wins</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          {display.phase === "idle" ? "Start" : "Restart"}
        </Button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-border shadow-lg w-full">
        <canvas ref={canvasRef} className="block w-full" />
        {display.phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <p className="text-white text-xl font-bold mb-4">Ready to play?</p>
            <Button onClick={reset}>Start Game</Button>
          </div>
        )}
        {display.phase === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
            <p className="text-white text-2xl font-bold mb-2">
              {display.winner === "player" ? "You win!" : "AI wins"}
            </p>
            <p className="text-white/60 mb-5 text-sm">{display.score.player} – {display.score.ai}</p>
            <Button onClick={reset}>Play again</Button>
          </div>
        )}
      </div>
    </div>
  );
}
