import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowL,
  ArrowRight as ArrowR,
  Heart,
} from "lucide-react";

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

interface AnswerOrb {
  letter: string;
  text: string;
  isCorrect: boolean;
  col: number;
  row: number;
  collected: boolean;
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
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"playing" | "round_won" | "game_over">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el postulado central de ${topic}?`,
    options: ["Principio Verificado", "Concepto Falso", "Teoría Descartada"],
    correctAnswer: "Principio Verificado",
    explanation: `Este postulado fundamenta ${topic} en ${subject}.`,
  };

  // Pac-Man Maze Grid Dimensions: 21 cols x 13 rows
  const COLS = 21;
  const ROWS = 13;
  const TILE = 36;

  // 1 = Wall, 0 = Dot, 2 = Power Pellet, 3 = Empty, 4 = Answer Orb Spawn
  const BASE_MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 2, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 2, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 3, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 3, 3, 3, 3, 3, 0, 1, 0, 1, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 1, 0, 1, 0, 3, 3, 3, 3, 3, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 4, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const mazeRef = useRef<number[][]>([]);
  const answerOrbsRef = useRef<AnswerOrb[]>([]);

  // Tuddy Pac-Man State
  const tuddyPos = useRef({
    x: 10 * TILE + TILE / 2,
    y: 9 * TILE + TILE / 2,
    dirX: 0,
    dirY: 0,
    nextDirX: 0,
    nextDirY: 0,
    mouthAngle: 0.2,
    mouthDir: 1,
    invulnerableUntil: 0,
  });

  // Authentic 4 Classic Ghosts
  const ghostsRef = useRef([
    { x: 10 * TILE + TILE / 2, y: 5 * TILE + TILE / 2, color: "#EF4444", name: "Blinky (Duda)", frightened: false },
    { x: 9 * TILE + TILE / 2, y: 7 * TILE + TILE / 2, color: "#38BDF8", name: "Inky (Olvido)", frightened: false },
    { x: 11 * TILE + TILE / 2, y: 7 * TILE + TILE / 2, color: "#F472B6", name: "Pinky (Despiste)", frightened: false },
  ]);

  const powerTimerRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize Round: places answers in the 4 corner orbs
  const initRound = useCallback(() => {
    mazeRef.current = BASE_MAZE.map((row) => [...row]);
    setLives(3);

    tuddyPos.current = {
      x: 10 * TILE + TILE / 2,
      y: 9 * TILE + TILE / 2,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      mouthAngle: 0.2,
      mouthDir: 1,
      invulnerableUntil: 0,
    };

    ghostsRef.current = [
      { x: 10 * TILE + TILE / 2, y: 5 * TILE + TILE / 2, color: "#EF4444", name: "Blinky", frightened: false },
      { x: 9 * TILE + TILE / 2, y: 7 * TILE + TILE / 2, color: "#38BDF8", name: "Inky", frightened: false },
      { x: 11 * TILE + TILE / 2, y: 7 * TILE + TILE / 2, color: "#F472B6", name: "Pinky", frightened: false },
    ];

    // 4 Corner positions: Top-Left (1,1), Top-Right (19,1), Bottom-Left (1,11), Bottom-Right (19,11)
    const cornerCoords = [
      { col: 1, row: 1 },
      { col: 19, row: 1 },
      { col: 1, row: 11 },
      { col: 19, row: 11 },
    ];

    const opts = [...currentRound.options];
    // Fill up to 4 options if only 3
    while (opts.length < 4) {
      opts.push("Opción complementaria de repaso");
    }

    // Shuffle options across corners
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C", "D"];
    answerOrbsRef.current = opts.slice(0, 4).map((opt, idx) => ({
      letter: letters[idx],
      text: opt,
      isCorrect: opt === currentRound.correctAnswer,
      col: cornerCoords[idx].col,
      row: cornerCoords[idx].row,
      collected: false,
    }));

    setGameState("playing");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  const setDirection = useCallback((dx: number, dy: number) => {
    tuddyPos.current.nextDirX = dx;
    tuddyPos.current.nextDirY = dy;
  }, []);

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

  // Main canvas animation loop
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
      const maze = mazeRef.current;
      if (!maze.length) return;

      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.82;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // Dark classic arcade background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Maze Walls & Pellets
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const type = maze[r][c];
          const tx = c * TILE;
          const ty = r * TILE;

          if (type === 1) {
            // Iconic Pac-Man Blue Neon Maze Walls
            ctx.fillStyle = "#0B1528";
            ctx.fillRect(tx, ty, TILE, TILE);
            ctx.strokeStyle = "#1D4ED8";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(tx + 2, ty + 2, TILE - 4, TILE - 4);
          } else if (type === 0) {
            // Golden Pac-Dot
            ctx.fillStyle = "#F59E0B";
            ctx.beginPath();
            ctx.arc(tx + TILE / 2, ty + TILE / 2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (type === 2) {
            // Flashing Super Power Pellet
            const pulse = Math.sin(Date.now() * 0.009) * 3;
            ctx.fillStyle = "#FEF08A";
            ctx.beginPath();
            ctx.arc(tx + TILE / 2, ty + TILE / 2, 7 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#F59E0B";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      // 2. Draw 4 Corner Answer Orbs [A], [B], [C], [D]
      answerOrbsRef.current.forEach((orb) => {
        if (orb.collected) return;
        const ox = orb.col * TILE + TILE / 2;
        const oy = orb.row * TILE + TILE / 2;

        ctx.save();
        ctx.translate(ox, oy);

        // Rotating outer diamond halo - identical sleek cyan/gold for all orbs to avoid spoilers!
        ctx.save();
        ctx.rotate(Date.now() * 0.002);
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 2;
        ctx.strokeRect(-16, -16, 32, 32);
        ctx.restore();

        // Glowing crystal sphere
        const orbGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 14);
        orbGrad.addColorStop(0, "#FEF08A");
        orbGrad.addColorStop(0.7, "#0284C7");
        orbGrad.addColorStop(1, "#0369A1");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Letter [A], [B], [C], [D]
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "black 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(orb.letter, 0, 1);

        ctx.restore();
      });

      // 3. Update Tuddy in Maze
      const tp = tuddyPos.current;
      if (gameState === "playing") {
        const col = Math.floor(tp.x / TILE);
        const row = Math.floor(tp.y / TILE);
        const offsetX = tp.x - (col * TILE + TILE / 2);
        const offsetY = tp.y - (row * TILE + TILE / 2);

        // Turn when aligned with tile center
        if (Math.abs(offsetX) < 4 && Math.abs(offsetY) < 4) {
          const nextCol = col + tp.nextDirX;
          const nextRow = row + tp.nextDirY;
          if (maze[nextRow] && maze[nextRow][nextCol] !== 1) {
            tp.dirX = tp.nextDirX;
            tp.dirY = tp.nextDirY;
            tp.x = col * TILE + TILE / 2;
            tp.y = row * TILE + TILE / 2;
          }
        }

        // Move forward if no wall
        const forwardCol = col + tp.dirX;
        const forwardRow = row + tp.dirY;
        if (!maze[forwardRow] || maze[forwardRow][forwardCol] !== 1 || Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
          tp.x += tp.dirX * speed;
          tp.y += tp.dirY * speed;
        }

        // Tunnel warp (left and right edges)
        if (tp.x < 0) tp.x = width;
        if (tp.x > width) tp.x = 0;

        // Eat dot
        const currentTileCol = Math.floor(tp.x / TILE);
        const currentTileRow = Math.floor(tp.y / TILE);
        if (maze[currentTileRow] && maze[currentTileRow][currentTileCol] === 0) {
          maze[currentTileRow][currentTileCol] = 3;
          setScore((s) => s + 10);
          arcadeAudio.playBounce();
        } else if (maze[currentTileRow] && maze[currentTileRow][currentTileCol] === 2) {
          // Eat Power Pellet!
          maze[currentTileRow][currentTileCol] = 3;
          setScore((s) => s + 50);
          powerTimerRef.current = Date.now() + 7500;
          ghostsRef.current.forEach((g) => (g.frightened = true));
          arcadeAudio.playCoin();
        }

        // Power timer check
        if (Date.now() > powerTimerRef.current && ghostsRef.current[0].frightened) {
          ghostsRef.current.forEach((g) => (g.frightened = false));
        }

        // Check eating Answer Orb
        answerOrbsRef.current.forEach((orb) => {
          if (orb.collected) return;
          const ox = orb.col * TILE + TILE / 2;
          const oy = orb.row * TILE + TILE / 2;
          const dist = Math.hypot(tp.x - ox, tp.y - oy);

          if (dist < 18) {
            orb.collected = true;
            if (orb.isCorrect) {
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 250);
              setCarrotsEarned((c) => c + 2);
              setFeedback(
                `¡ORBE DEL SABER OBTENIDO! Elegiste [${orb.letter}]: "${orb.text}". ${currentRound.explanation}`
              );
            } else {
              arcadeAudio.playWrong();
              shakeRef.current = 14;
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState("game_over");
                  setFeedback(
                    `¡Agotaste tus vidas! La respuesta correcta era "${currentRound.correctAnswer}". ${currentRound.explanation}`
                  );
                } else {
                  tp.invulnerableUntil = Date.now() + 2000;
                  tp.x = 10 * TILE + TILE / 2;
                  tp.y = 9 * TILE + TILE / 2;
                  tp.dirX = 0;
                  tp.dirY = 0;
                  setFeedback(`¡Distractor [${orb.letter}] consumido! Te quedan ${nl} vida(s) para buscar el orbe correcto.`);
                }
                return Math.max(0, nl);
              });
            }
          }
        });

        // 4. Update Ghosts AI
        ghostsRef.current.forEach((g) => {
          const gCol = Math.floor(g.x / TILE);
          const gRow = Math.floor(g.y / TILE);
          const dx = tp.x - g.x;
          const dy = tp.y - g.y;
          const gSpeed = g.frightened ? 1.0 : 1.5;

          const stepX = (dx > 0 ? 1 : -1) * (g.frightened ? -1 : 1);
          const stepY = (dy > 0 ? 1 : -1) * (g.frightened ? -1 : 1);

          if (Math.abs(dx) > Math.abs(dy)) {
            if (maze[gRow] && maze[gRow][gCol + stepX] !== 1) g.x += stepX * gSpeed;
            else if (maze[gRow + stepY] && maze[gRow + stepY][gCol] !== 1) g.y += stepY * gSpeed;
          } else {
            if (maze[gRow + stepY] && maze[gRow + stepY][gCol] !== 1) g.y += stepY * gSpeed;
            else if (maze[gRow] && maze[gRow][gCol + stepX] !== 1) g.x += stepX * gSpeed;
          }

          // Check Ghost collision with Tuddy
          const dist = Math.hypot(tp.x - g.x, tp.y - g.y);
          if (dist < 18) {
            if (g.frightened) {
              // Tuddy eats frightened ghost!
              g.x = 10 * TILE + TILE / 2;
              g.y = 5 * TILE + TILE / 2;
              g.frightened = false;
              setScore((s) => s + 200);
              arcadeAudio.playVictory();
            } else if (Date.now() > tp.invulnerableUntil) {
              // Ghost catches Tuddy
              tp.invulnerableUntil = Date.now() + 2000;
              shakeRef.current = 14;
              arcadeAudio.playWrong();
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState("game_over");
                  setFeedback(
                    `¡Un fantasma te atrapó! La respuesta correcta para resolver el nivel era "${currentRound.correctAnswer}".`
                  );
                } else {
                  // Respawn in center
                  tp.x = 10 * TILE + TILE / 2;
                  tp.y = 9 * TILE + TILE / 2;
                  tp.dirX = 0;
                  tp.dirY = 0;
                  setFeedback(`¡Cuidado con los fantasmas! Te quedan ${nl} vidas.`);
                }
                return Math.max(0, nl);
              });
            }
          }
        });
      }

      // 5. Draw Ghosts
      ghostsRef.current.forEach((g) => {
        ctx.save();
        ctx.translate(g.x, g.y);

        const bodyColor = g.frightened ? (powerTimerRef.current - Date.now() < 2000 && Math.floor(Date.now() / 150) % 2 === 0 ? "#FFFFFF" : "#1D4ED8") : g.color;

        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(0, -2, 13, Math.PI, 0, false);
        ctx.lineTo(13, 11);
        // Tentacle wavy base
        ctx.lineTo(7, 7);
        ctx.lineTo(0, 11);
        ctx.lineTo(-7, 7);
        ctx.lineTo(-13, 11);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(-4, -2, 4, 0, Math.PI * 2);
        ctx.arc(4, -2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = g.frightened ? "#F87171" : "#0F172A";
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 6. Draw Pac-Tuddy
      const isInvuln = Date.now() < tp.invulnerableUntil;
      ctx.save();
      if (isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      drawTuddy(ctx, {
        x: tp.x,
        y: tp.y,
        radius: 17,
        expression: gameState === "round_won" ? "happy" : gameState === "game_over" ? "dizzy" : "focused",
        pet,
      });
      ctx.restore();

      ctx.restore(); // Restore shake
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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-blue-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Pac-Man Arcade
              </span>
              <span className="text-xs text-blue-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Pac-Tuddy: El Laberinto de Conceptos 🟡👻
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 bg-rose-500/20 px-3 py-1.5 rounded-2xl border border-rose-500/40">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span className="text-sm font-black text-rose-300">{lives}/3</span>
          </div>
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
      <div className="bg-blue-950/50 rounded-2xl p-4 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión del Laberinto:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-blue-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Come el Orbe [A, B, C o D] con la respuesta correcta • Flechas o WASD
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={756}
          height={468}
          className="w-full max-w-full h-auto touch-none"
        />

        {/* In-game warning banner */}
        {feedback && gameState === "playing" && (
          <div className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-amber-950/85 border border-amber-500/60 backdrop-blur-md shadow-lg flex items-center justify-center gap-2 text-amber-200 text-xs font-bold pointer-events-none">
            <span>⚠️</span>
            <span>{feedback}</span>
          </div>
        )}

        {/* Game over / round won modal */}
        {feedback && (gameState === "round_won" || gameState === "game_over") && (
          <div
            className={`absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border ${
              gameState === "round_won"
                ? "bg-emerald-950/85 border-emerald-500/60 text-emerald-100"
                : "bg-rose-950/85 border-rose-500/60 text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{gameState === "round_won" ? "🎉" : "💥"}</span>
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

      {/* D-Pad Controls for Touch & Mobile */}
      <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
        <div className="text-xs text-slate-300 font-medium hidden sm:block">
          Usa los orbes de poder grandes para asustar y devorar a los fantasmas de la duda 🔵
        </div>

        <div className="flex items-center justify-center gap-1.5 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={() => setDirection(-1, 0)}
            className="p-2.5 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white rounded-xl cursor-pointer"
          >
            <ArrowL className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setDirection(0, -1)}
              className="p-2.5 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white rounded-xl cursor-pointer"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setDirection(0, 1)}
              className="p-2.5 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white rounded-xl cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDirection(1, 0)}
            className="p-2.5 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white rounded-xl cursor-pointer"
          >
            <ArrowR className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Option Orbs Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {answerOrbsRef.current.map((orb, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              orb.collected
                ? "bg-slate-800/30 border-slate-800 text-slate-500 opacity-60"
                : "bg-slate-800/60 border-slate-700 text-slate-200"
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-blue-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              {orb.letter}
            </span>
            <span className="font-semibold line-clamp-2">{orb.text}</span>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-4xl shadow-inner">
              🟡
            </div>
            <h3 className="text-2xl font-black text-white">¡Laberinto del Saber Superado!</h3>
            <p className="text-xs text-slate-300">
              Has derrotado a los fantasmas de la duda y devorado todos los orbes de <strong className="text-blue-300">{topic}</strong>.
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
              className="w-full py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
