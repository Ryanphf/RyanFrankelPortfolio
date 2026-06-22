import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const COLS = 10;
const ROWS = 20;
const COLORS = ["", "#e05a1a", "#4a9eff", "#ffd166", "#06d6a0", "#ef476f", "#b388ff", "#26c6da"];

const PIECES = [
  [[1,1,1,1]],
  [[2,0],[2,0],[2,2]],
  [[0,3],[0,3],[3,3]],
  [[4,4],[4,4]],
  [[0,5,5],[5,5,0]],
  [[0,6,0],[6,6,6]],
  [[7,7,0],[0,7,7]],
];

function rotate(p: number[][]): number[][] {
  return p[0].map((_, c) => p.map(r => r[c]).reverse());
}

interface Piece { shape: number[][]; x: number; y: number; }

function newPiece(): Piece {
  const shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function fits(board: number[][], piece: Piece, dx = 0, dy = 0, shape?: number[][]): boolean {
  const s = shape ?? piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function lock(board: number[][], piece: Piece): number[][] {
  const b = board.map(r => [...r]);
  piece.shape.forEach((row, r) => row.forEach((v, c) => {
    if (v) b[piece.y + r][piece.x + c] = v;
  }));
  return b;
}

function clearLines(board: number[][]): { board: number[][]; cleared: number } {
  const kept = board.filter(r => r.some(v => !v));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(0));
  return { board: [...empty, ...kept], cleared };
}

const SCORE_TABLE = [0, 100, 300, 500, 800];

export default function Tetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boardRef = useRef<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const pieceRef = useRef<Piece>(newPiece());
  const nextRef = useRef<Piece>(newPiece());
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const linesRef = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const lastDropRef = useRef(0);
  const rafRef = useRef(0);
  const [uiState, setUiState] = useState({ score: 0, level: 1, lines: 0, over: false, started: false });

  const cellSize = useRef(30);

  const resetGame = useCallback(() => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    pieceRef.current = newPiece();
    nextRef.current = newPiece();
    scoreRef.current = 0;
    levelRef.current = 1;
    linesRef.current = 0;
    gameOverRef.current = false;
    pausedRef.current = false;
    lastDropRef.current = 0;
    setUiState({ score: 0, level: 1, lines: 0, over: false, started: true });
  }, []);

  const hardDrop = useCallback(() => {
    let dy = 0;
    while (fits(boardRef.current, pieceRef.current, 0, dy + 1)) dy++;
    pieceRef.current.y += dy;
    const locked = lock(boardRef.current, pieceRef.current);
    const { board, cleared } = clearLines(locked);
    boardRef.current = board;
    linesRef.current += cleared;
    scoreRef.current += SCORE_TABLE[cleared] * levelRef.current + dy * 2;
    levelRef.current = Math.floor(linesRef.current / 10) + 1;
    const next = nextRef.current;
    nextRef.current = newPiece();
    pieceRef.current = next;
    if (!fits(boardRef.current, pieceRef.current)) gameOverRef.current = true;
    setUiState(u => ({ ...u, score: scoreRef.current, level: levelRef.current, lines: linesRef.current, over: gameOverRef.current }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement!;
    const resize = () => {
      const maxW = Math.min(container.clientWidth, 340);
      cellSize.current = Math.floor(maxW / COLS);
      canvas.width = cellSize.current * COLS;
      canvas.height = cellSize.current * ROWS;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const onKey = (e: KeyboardEvent) => {
      if (!uiState.started || gameOverRef.current) return;
      const p = pieceRef.current;
      if (e.key === "ArrowLeft" && fits(boardRef.current, p, -1, 0)) { e.preventDefault(); p.x--; }
      if (e.key === "ArrowRight" && fits(boardRef.current, p, 1, 0)) { e.preventDefault(); p.x++; }
      if (e.key === "ArrowDown") { e.preventDefault(); if (fits(boardRef.current, p, 0, 1)) p.y++; }
      if (e.key === "ArrowUp" || e.key === "z" || e.key === "Z") {
        e.preventDefault();
        const rotated = rotate(p.shape);
        if (fits(boardRef.current, p, 0, 0, rotated)) p.shape = rotated;
      }
      if (e.key === " ") { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener("keydown", onKey);

    const ctx = canvas.getContext("2d")!;

    const drawCell = (x: number, y: number, color: string, alpha = 1) => {
      const cs = cellSize.current;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x * cs + 1, y * cs + 1, cs - 2, cs - 2);
      ctx.globalAlpha = 1;
    };

    const drawGhost = () => {
      const p = pieceRef.current;
      let dy = 0;
      while (fits(boardRef.current, p, 0, dy + 1)) dy++;
      p.shape.forEach((row, r) => row.forEach((v, c) => {
        if (v) drawCell(p.x + c, p.y + r + dy, COLORS[v], 0.2);
      }));
    };

    let lastTs = 0;
    const loop = (ts: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (gameOverRef.current || !uiState.started) {
        // Just render current state
      } else if (!pausedRef.current) {
        const interval = Math.max(100, 800 - (levelRef.current - 1) * 70);
        if (ts - lastDropRef.current > interval) {
          lastDropRef.current = ts;
          const p = pieceRef.current;
          if (fits(boardRef.current, p, 0, 1)) {
            p.y++;
          } else {
            const locked = lock(boardRef.current, p);
            const { board, cleared } = clearLines(locked);
            boardRef.current = board;
            linesRef.current += cleared;
            scoreRef.current += SCORE_TABLE[cleared] * levelRef.current;
            levelRef.current = Math.floor(linesRef.current / 10) + 1;
            const next = nextRef.current;
            nextRef.current = newPiece();
            pieceRef.current = next;
            if (!fits(boardRef.current, pieceRef.current)) {
              gameOverRef.current = true;
              setUiState(u => ({ ...u, score: scoreRef.current, level: levelRef.current, lines: linesRef.current, over: true }));
            } else {
              setUiState(u => ({ ...u, score: scoreRef.current, level: levelRef.current, lines: linesRef.current }));
            }
          }
        }
      }

      const cs = cellSize.current;
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, canvas.height); ctx.stroke(); }
      for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * cs); ctx.lineTo(canvas.width, r * cs); ctx.stroke(); }

      // Board
      boardRef.current.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(c, r, COLORS[v]); }));

      // Ghost
      drawGhost();

      // Current piece
      const p = pieceRef.current;
      p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) drawCell(p.x + c, p.y + r, COLORS[v]); }));

      lastTs = ts;
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, [uiState.started, hardDrop]);

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 max-w-2xl">
      <Link to="/minigames" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> All games
      </Link>

      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold">Tetris</h1>
              <p className="text-sm text-muted-foreground mt-1">Arrows to move · Up/Z rotate · Space drop</p>
            </div>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {uiState.started ? "Restart" : "Start"}
            </Button>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
            <canvas ref={canvasRef} className="block" />
            {!uiState.started && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
                <p className="text-white text-xl font-bold mb-4">Tetris</p>
                <Button onClick={resetGame}>Start Game</Button>
              </div>
            )}
            {uiState.over && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <p className="text-white text-2xl font-bold mb-1">Game Over</p>
                <p className="text-white/60 mb-5 text-sm">Score: {uiState.score}</p>
                <Button onClick={resetGame}>Play again</Button>
              </div>
            )}
          </div>
        </div>

        <div className="w-28 flex flex-col gap-4 mt-12 shrink-0">
          {[
            { label: "Score", value: uiState.score },
            { label: "Level", value: uiState.level },
            { label: "Lines", value: uiState.lines },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card border border-border rounded-lg p-3 text-center">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
