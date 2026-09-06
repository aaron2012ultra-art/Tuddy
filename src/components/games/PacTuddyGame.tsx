import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle, ArrowUp, ArrowDown, ArrowLeft as ArrowL, ArrowRight } from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface PacTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

export const PacTuddyGame: React.FC<PacTuddyGameProps> = ({
  rounds,
  topic,
  subject,
  pet,
  onFinish,
  onBack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [carrotsEarned, setCarrotsEarned] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [gameState, setGameState] = useState<"playing" | "round_won" | "caught">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el postulado central de ${topic}?`,
    options: ["Principio Verificado", "Concepto Falso", "Teoría Descartada"],
    correctAnswer: "Principio Verificado",
    explanation: `Este postulado fundamenta ${topic} en ${subject}.`,
  };

  // Pac-Man Maze Grid Dimensions: 19 cols x 13 rows
  const COLS = 19;
  const ROWS = 13;
  const TILE = 36;

  // 1 = Wall, 0 = Dot/Carrot, 2 = Power Pellet, 3 = Empty/Spawn
  const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,2,1],
    [1,0,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,3,1,1,0,1,0,1,1,0,1],
    [0,0,0,0,0,1,0,1,3,3,3,1,0,1,0,0,0,0,0],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,0,1],
    [1,2,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const mazeRef = useRef<number[][]>([]);
  const tuddyPos = useRef({ col: 9, row: 8, x: 9 * TILE + TILE / 2, y: 8 * TILE + TILE / 2, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0 });
  const ghostsRef = useRef([
    { x: 9 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#EF4444", name: "Duda", frightened: false },
    { x: 8 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#38BDF8", name: "Olvido", frightened: false },
    { x: 10 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#F472B6", name: "Despiste", frightened: false },
  ]);

  const powerTimerRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const initRound = useCallback(() => {
    mazeRef.current = MAZE_TEMPLATE.map((row) => [...row]);
    tuddyPos.current = {
      col: 9,
      row: 8,
      x: 9 * TILE + TILE / 2,
      y: 8 * TILE + TILE / 2,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
    };
    ghostsRef.current = [
      { x: 9 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#EF4444", name: "Duda", frightened: false },
      { x: 8 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#38BDF8", name: "Olvido", frightened: false },
      { x: 10 * TILE + TILE / 2, y: 6 * TILE + TILE / 2, color: "#F472B6", name: "Despiste", frightened: false },
    ];
    powerTimerRef.current = 0;
    setGameState("playing");
    setFeedback(null);
  }, []);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Direction setter
  const setDirection = useCallback((dx: number, dy: number) => {
    tuddyPos.current.nextDirX = dx;
    tuddyPos.current.nextDirY = dy;
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") setDirection(0, -1);
      if (e.code === "ArrowDown" || e.code === "KeyS") setDirection(0, 1);
      if (e.code === "ArrowLeft" || e.code === "KeyA") setDirection(-1, 0);
      if (e.code === "ArrowRight" || e.code === "KeyD") setDirection(1, 0);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setDirection]);

  // Main canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    const speed = 2.4;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // Dark retro background
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, width, height);

      const maze = mazeRef.current;
      if (!maze.length) return;

      // Draw Maze Walls & Pellets
      let dotsLeft = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const type = maze[r][c];
          const tx = c * TILE;
          const ty = r * TILE;

          if (type === 1) {
            // Neon blue classic maze wall
            ctx.fillStyle = "#1E293B";
            ctx.fillRect(tx, ty, TILE, TILE);
            ctx.strokeStyle = "#38BDF8";
            ctx.lineWidth = 2;
            ctx.strokeRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
          } else if (type === 0) {
            // Little carrot / dot
            dotsLeft++;
            ctx.fillStyle = "#F97316";
            ctx.beginPath();
            ctx.arc(tx + TILE / 2, ty + TILE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 2) {
            // Super Knowledge Carrot (Power Pellet)
            dotsLeft++;
            ctx.fillStyle = "#FDE047";
            ctx.beginPath();
            ctx.arc(tx + TILE / 2, ty + TILE / 2, 7 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#F59E0B";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      // Update Tuddy Position in Maze
      if (gameState === "playing") {
        const tp = tuddyPos.current;

        // Try changing direction if aligned with tile
        const col = Math.floor(tp.x / TILE);
        const row = Math.floor(tp.y / TILE);
        const offsetX = tp.x - (col * TILE + TILE / 2);
        const offsetY = tp.y - (row * TILE + TILE / 2);

        if (Math.abs(offsetX) < 3 && Math.abs(offsetY) < 3) {
          // Check if next direction is walkable
          const nextCol = col + tp.nextDirX;
          const nextRow = row + tp.nextDirY;
          if (maze[nextRow] && maze[nextRow][nextCol] !== 1) {
            tp.dirX = tp.nextDirX;
            tp.dirY = tp.nextDirY;
            tp.x = col * TILE + TILE / 2;
            tp.y = row * TILE + TILE / 2;
          }
        }

        // Move forward if no wall in front
        const forwardCol = col + tp.dirX;
        const forwardRow = row + tp.dirY;
        if (!maze[forwardRow] || maze[forwardRow][forwardCol] !== 1 || Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
          tp.x += tp.dirX * speed;
          tp.y += tp.dirY * speed;
        }

        // Eat dot / carrot
        const currentTileCol = Math.floor(tp.x / TILE);
        const currentTileRow = Math.floor(tp.y / TILE);
        if (maze[currentTileRow] && maze[currentTileRow][currentTileCol] === 0) {
          maze[currentTileRow][currentTileCol] = 3;
          setScore((s) => s + 10);
          setCarrotsEarned((c) => c + 1);
          arcadeAudio.playBounce();
        } else if (maze[currentTileRow] && maze[currentTileRow][currentTileCol] === 2) {
          // Power Pellet!
          maze[currentTileRow][currentTileCol] = 3;
          setScore((s) => s + 50);
          powerTimerRef.current = Date.now() + 8000;
          ghostsRef.current.forEach((g) => (g.frightened = true));
          arcadeAudio.playCoin();
        }

        // Power timer expiration
        if (Date.now() > powerTimerRef.current && ghostsRef.current[0].frightened) {
          ghostsRef.current.forEach((g) => (g.frightened = false));
        }

        // Update Ghosts
        ghostsRef.current.forEach((g) => {
          const gCol = Math.floor(g.x / TILE);
          const gRow = Math.floor(g.y / TILE);
          // Simple wandering AI towards or away from Tuddy
          const dx = tp.x - g.x;
          const dy = tp.y - g.y;
          const gSpeed = g.frightened ? 1.1 : 1.7;

          const stepX = (dx > 0 ? 1 : -1) * (g.frightened ? -1 : 1);
          const stepY = (dy > 0 ? 1 : -1) * (g.frightened ? -1 : 1);

          if (Math.abs(dx) > Math.abs(dy)) {
            if (maze[gRow] && maze[gRow][gCol + stepX] !== 1) g.x += stepX * gSpeed;
            else if (maze[gRow + stepY] && maze[gRow + stepY][gCol] !== 1) g.y += stepY * gSpeed;
          } else {
            if (maze[gRow + stepY] && maze[gRow + stepY][gCol] !== 1) g.y += stepY * gSpeed;
            else if (maze[gRow] && maze[gRow][gCol + stepX] !== 1) g.x += stepX * gSpeed;
          }

          // Check Collision with Tuddy
          const dist = Math.hypot(tp.x - g.x, tp.y - g.y);
          if (dist < 20) {
            if (g.frightened) {
              // Tuddy eats the doubt ghost!
              g.x = 9 * TILE + TILE / 2;
              g.y = 6 * TILE + TILE / 2;
              g.frightened = false;
              setScore((s) => s + 200);
              arcadeAudio.playVictory();
            } else {
              // Ghost caught Tuddy
              setGameState("caught");
              setFeedback(`¡Un Fantasma de la Duda te atrapó! La respuesta para avanzar era "${currentRound.correctAnswer}".`);
              arcadeAudio.playWrong();
            }
          }
        });

        // Win when dots cleared
        if (dotsLeft <= 20) {
          setGameState("round_won");
          setScore((s) => s + 250);
          setCarrotsEarned((c) => c + 30);
          setFeedback(`¡LABERINTO DOMINADO! Has consolidado: "${currentRound.correctAnswer}". ${currentRound.explanation}`);
          arcadeAudio.playVictory();
        }
      }

      // Draw Ghosts
      ghostsRef.current.forEach((g) => {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.fillStyle = g.frightened ? "#3B82F6" : g.color;

        // Ghost dome body
        ctx.beginPath();
        ctx.arc(0, -2, 13, Math.PI, 0);
        ctx.lineTo(13, 11);
        // Wavy bottom
        ctx.lineTo(8, 7);
        ctx.lineTo(4, 11);
        ctx.lineTo(0, 7);
        ctx.lineTo(-4, 11);
        ctx.lineTo(-8, 7);
        ctx.lineTo(-13, 11);
        ctx.closePath();
        ctx.fill();

        // Ghost eyes
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(-5, -4, 4, 0, Math.PI * 2);
        ctx.arc(5, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0F172A";
        ctx.beginPath();
        ctx.arc(-4, -4, 2, 0, Math.PI * 2);
        ctx.arc(6, -4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw Tuddy Player in Maze
      drawTuddy(ctx, {
        x: tuddyPos.current.x,
        y: tuddyPos.current.y,
        radius: 15,
        expression: gameState === "round_won" ? "happy" : gameState === "caught" ? "dizzy" : "normal",
        pet,
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, pet, currentRound]);

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < rounds.length) {
      setCurrentRoundIdx((r) => r + 1);
    } else {
      setIsCompleted(true);
      onFinish(score, carrotsEarned);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-yellow-500/30 flex flex-col gap-4 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full">
                Pac-Man Arcade
              </span>
              <span className="text-xs text-yellow-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Pac-Tuddy: Laberinto de Zanahorias 👻
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-2xl border border-amber-500/40">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-300">{score} pts</span>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-500/20 px-3 py-1.5 rounded-2xl border border-orange-500/40">
            <span className="text-sm">🥕</span>
            <span className="text-sm font-black text-orange-300">+{carrotsEarned}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextState = arcadeAudio.toggleSound();
              setSoundOn(nextState);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Question Banner */}
      <div className="bg-yellow-950/40 rounded-2xl p-4 border border-yellow-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-yellow-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión del Laberinto:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-yellow-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Come las zanahorias y huye de las Dudas 🥕👻
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={684}
          height={468}
          className="w-full max-w-full h-auto touch-none"
        />

        {feedback && (
          <div
            className={`absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border ${
              gameState === "round_won"
                ? "bg-emerald-950/85 border-emerald-500/60 text-emerald-100"
                : "bg-rose-950/85 border-rose-500/60 text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gameState === "round_won" ? "🏆" : "💥"}</span>
              <p className="font-bold text-sm leading-relaxed">{feedback}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {gameState === "round_won" ? (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente Nivel</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={initRound}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Laberinto</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Pad Controls */}
      <div className="flex justify-center gap-2 sm:hidden py-1">
        <div className="grid grid-cols-3 gap-2 w-48">
          <div />
          <button
            type="button"
            onClick={() => setDirection(0, -1)}
            className="p-3 bg-slate-800 rounded-xl flex items-center justify-center text-white active:bg-yellow-500 active:text-black"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => setDirection(-1, 0)}
            className="p-3 bg-slate-800 rounded-xl flex items-center justify-center text-white active:bg-yellow-500 active:text-black"
          >
            <ArrowL className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setDirection(0, 1)}
            className="p-3 bg-slate-800 rounded-xl flex items-center justify-center text-white active:bg-yellow-500 active:text-black"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setDirection(1, 0)}
            className="p-3 bg-slate-800 rounded-xl flex items-center justify-center text-white active:bg-yellow-500 active:text-black"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-4xl shadow-inner">
              👑
            </div>
            <h3 className="text-2xl font-black text-white">¡Laberinto del Conocimiento Conquistado!</h3>
            <p className="text-xs text-slate-300">
              Has derrotado a las dudas y devorado todas las zanahorias de <strong className="text-yellow-300">{topic}</strong> con Tuddy.
            </p>
            <div className="grid grid-cols-2 gap-3 w-full my-2">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Puntuación</div>
                <div className="text-2xl font-black text-amber-400">{score} pts</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
                <div className="text-[10px] uppercase font-bold text-slate-400">Zanahorias</div>
                <div className="text-2xl font-black text-orange-400">+{carrotsEarned} 🥕</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Ver Más Videojuegos de Tuddy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
