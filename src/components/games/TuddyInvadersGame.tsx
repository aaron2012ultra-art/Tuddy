import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle } from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TuddyInvadersGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface Alien {
  x: number;
  y: number;
  w: number;
  h: number;
  optionIndex: number;
  optionText: string;
  isCorrect: boolean;
  hp: number;
  alive: boolean;
  color: string;
}

interface Laser {
  x: number;
  y: number;
  vy: number;
}

export const TuddyInvadersGame: React.FC<TuddyInvadersGameProps> = ({
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
  const [gameState, setGameState] = useState<"playing" | "round_won" | "game_over">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Qué propiedad define a ${topic}?`,
    options: ["Respuesta Correcta", "Distractor A", "Distractor B", "Distractor C"],
    correctAnswer: "Respuesta Correcta",
    explanation: `Esta propiedad es medular para resolver problemas en ${subject}.`,
  };

  // Player ship position
  const player = useRef({
    x: 420,
    y: 430,
    speed: 7,
  });

  const aliensRef = useRef<Alien[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const keysPressed = useRef<{ left: boolean; right: boolean; space: boolean }>({
    left: false,
    right: false,
    space: false,
  });
  const animRef = useRef<number | null>(null);
  const lastShotTime = useRef(0);

  const initRound = useCallback(() => {
    player.current.x = 420;
    lasersRef.current = [];

    const aliens: Alien[] = [];
    const colors = ["#F43F5E", "#38BDF8", "#F59E0B", "#A855F7"];
    const startX = 140;
    const spacing = 160;

    currentRound.options.forEach((opt, idx) => {
      aliens.push({
        x: startX + idx * spacing,
        y: 120,
        w: 120,
        h: 56,
        optionIndex: idx,
        optionText: opt,
        isCorrect: opt === currentRound.correctAnswer,
        hp: 1,
        alive: true,
        color: colors[idx % colors.length],
      });
    });

    aliensRef.current = aliens;
    setGameState("playing");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Fire laser
  const fireLaser = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current < 250) return;
    lastShotTime.current = now;

    lasersRef.current.push({
      x: player.current.x,
      y: player.current.y - 28,
      vy: -9,
    });
    arcadeAudio.playLaser();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysPressed.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysPressed.current.right = true;
      if (e.code === "Space") {
        e.preventDefault();
        fireLaser();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysPressed.current.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysPressed.current.right = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [fireLaser]);

  // Mouse / Touch aiming
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const scaleX = canvasRef.current.width / rect.width;
    player.current.x = Math.max(50, Math.min(canvasRef.current.width - 50, (clientX - rect.left) * scaleX));
  };

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    let alienDirection = 1;
    let alienDropTimer = 0;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Deep Space Background with twinkling stars
      ctx.fillStyle = "#090D16";
      ctx.fillRect(0, 0, width, height);

      // Starfield
      ctx.fillStyle = "#FFFFFF";
      for (let i = 0; i < 35; i++) {
        const sx = (i * 73 + (Date.now() * 0.02)) % width;
        const sy = (i * 137) % height;
        ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
      }

      // 2. Move Player by Keyboard
      if (keysPressed.current.left) player.current.x = Math.max(50, player.current.x - player.current.speed);
      if (keysPressed.current.right) player.current.x = Math.min(width - 50, player.current.x + player.current.speed);

      // 3. Update & Draw Aliens
      if (gameState === "playing") {
        alienDropTimer++;
        // Gentle horizontal sway
        let minX = width;
        let maxX = 0;

        aliensRef.current.forEach((a) => {
          if (!a.alive) return;
          a.x += alienDirection * 0.85;
          minX = Math.min(minX, a.x - a.w / 2);
          maxX = Math.max(maxX, a.x + a.w / 2);
        });

        if (maxX >= width - 30 || minX <= 30) {
          alienDirection *= -1;
          aliensRef.current.forEach((a) => {
            a.y += 18;
          });
        }
      }

      // Draw each alien
      aliensRef.current.forEach((a) => {
        if (!a.alive) return;

        ctx.save();
        ctx.translate(a.x, a.y);

        // Retro Space Invader UFO Box
        ctx.fillStyle = a.color;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        ctx.strokeRect(-a.w / 2, -a.h / 2, a.w, a.h);

        // Alien antennae
        ctx.fillStyle = "#FDE047";
        ctx.beginPath();
        ctx.arc(-a.w / 3, -a.h / 2 - 6, 5, 0, Math.PI * 2);
        ctx.arc(a.w / 3, -a.h / 2 - 6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Option letter & short text
        const letter = ["A", "B", "C", "D"][a.optionIndex];
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`[${letter}] ${a.optionText.slice(0, 14)}`, 0, 0);

        ctx.restore();

        // If alien invades defense line
        if (a.y >= player.current.y - 40 && gameState === "playing") {
          setGameState("game_over");
          setFeedback(`¡Los invasores llegaron a la base! La respuesta correcta era "${currentRound.correctAnswer}".`);
          arcadeAudio.playWrong();
        }
      });

      // 4. Update & Draw Lasers
      lasersRef.current.forEach((laser, lIdx) => {
        laser.y += laser.vy;

        // Laser beam
        ctx.fillStyle = "#38BDF8";
        ctx.shadowColor = "#38BDF8";
        ctx.shadowBlur = 10;
        ctx.fillRect(laser.x - 2.5, laser.y, 5, 16);
        ctx.shadowBlur = 0;

        // Collision with Aliens
        aliensRef.current.forEach((alien) => {
          if (!alien.alive) return;
          if (
            laser.x > alien.x - alien.w / 2 &&
            laser.x < alien.x + alien.w / 2 &&
            laser.y > alien.y - alien.h / 2 &&
            laser.y < alien.y + alien.h / 2
          ) {
            // Hit alien!
            lasersRef.current.splice(lIdx, 1);
            alien.alive = false;
            arcadeAudio.playImpact();

            if (alien.isCorrect) {
              // Direct hit on correct answer!
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 100);
              setCarrotsEarned((c) => c + 25);
              setFeedback(`¡BLANCO DESTRUIDO! ¡Acertaste a la respuesta correcta! ${currentRound.explanation}`);
            } else {
              // Wrong alien blasted
              arcadeAudio.playWrong();
              setGameState("game_over");
              setFeedback(`¡Cuidado! Destruiste un distractor ("${alien.optionText}"). La respuesta correcta era "${currentRound.correctAnswer}".`);
            }
          }
        });

        // Remove off-screen lasers
        if (laser.y < 0) lasersRef.current.splice(lIdx, 1);
      });

      // 5. Draw Player Carrot Spaceship with Tuddy
      ctx.save();
      ctx.translate(player.current.x, player.current.y);

      // Carrot Spaceship Hull
      ctx.fillStyle = "#F97316";
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(32, 18);
      ctx.lineTo(-32, 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Green thruster leaves
      ctx.fillStyle = "#16A34A";
      ctx.beginPath();
      ctx.ellipse(-14, 24, 6, 12, -0.3, 0, Math.PI * 2);
      ctx.ellipse(14, 24, 6, 12, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Rocket flame
      ctx.fillStyle = "#FDE047";
      ctx.beginPath();
      ctx.arc(0, 24 + Math.random() * 6, 7, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit Bubble with Tuddy inside
      ctx.fillStyle = "rgba(186, 230, 253, 0.4)";
      ctx.beginPath();
      ctx.arc(0, -6, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Tuddy pilot head
      drawTuddy(ctx, {
        x: 0,
        y: -4,
        radius: 14,
        expression: gameState === "round_won" ? "happy" : gameState === "game_over" ? "dizzy" : "focused",
        pet,
      });

      ctx.restore();

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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-emerald-500/30 flex flex-col gap-4 select-none">
      {/* Header */}
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                Space Invaders Arcade
              </span>
              <span className="text-xs text-emerald-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Invaders: Semillas Láser 🚀
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
      <div className="bg-emerald-950/40 rounded-2xl p-4 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Objetivo de Disparo:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-emerald-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mover: Flechas / Ratón • Disparar: ESPACIO / Clic 💥
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={fireLaser}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextRound();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente Nivel</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    initRound();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Invasores</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl shadow-inner">
              🚀
            </div>
            <h3 className="text-2xl font-black text-white">¡Galaxia del Saber Salvada!</h3>
            <p className="text-xs text-slate-300">
              Has derrotado a todas las naves alienígenas de <strong className="text-emerald-300">{topic}</strong> con Tuddy.
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
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
