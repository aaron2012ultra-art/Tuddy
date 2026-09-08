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
  ArrowLeft as ArrowL,
  ArrowRight as ArrowR,
  Shield,
  Heart,
} from "lucide-react";

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

interface AlienShip {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  letter: string;
  optionText: string;
  isCorrect: boolean;
  alive: boolean;
}

interface Bunker {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
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
  const [shields, setShields] = useState(3);
  const [gameState, setGameState] = useState<"playing" | "round_won" | "game_over">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el postulado central de ${topic}?`,
    options: ["Fundamento riguroso", "Distractor secundario", "Teoría descartada"],
    correctAnswer: "Fundamento riguroso",
    explanation: `Este principio es la base científica y analítica para dominar ${topic}.`,
  };

  const player = useRef({
    x: 420,
    y: 435,
    speed: 7,
    invulnerableUntil: 0,
  });

  const aliensRef = useRef<AlienShip[]>([]);
  const bunkersRef = useRef<Bunker[]>([]);
  const lasersRef = useRef<Array<{ x: number; y: number; vy: number }>>([]);
  const alienLasersRef = useRef<Array<{ x: number; y: number; vy: number }>>([]);
  const ufoRef = useRef<{ x: number; y: number; vx: number; active: boolean }>({
    x: -50,
    y: 45,
    vx: 3,
    active: false,
  });

  const armadaDir = useRef(1);
  const animRef = useRef<number | null>(null);
  const lastShotTime = useRef(0);
  const shakeRef = useRef(0);
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Initialize round: 3 or 4 Alien Command Ships + 3 Bunkers
  const initRound = useCallback(() => {
    player.current = {
      x: 420,
      y: 435,
      speed: 7,
      invulnerableUntil: 0,
    };
    setShields(3);
    lasersRef.current = [];
    alienLasersRef.current = [];
    armadaDir.current = 1;

    // 3 Bunkers across the screen
    bunkersRef.current = [
      { x: 140, y: 370, w: 80, h: 36, hp: 4 },
      { x: 380, y: 370, w: 80, h: 36, hp: 4 },
      { x: 620, y: 370, w: 80, h: 36, hp: 4 },
    ];

    // Shuffle options across the Alien Command Ships
    const opts = [...currentRound.options].slice(0, 4);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C", "D"];
    const count = opts.length;
    const shipW = 160;
    const spacing = (800 - count * shipW) / (count + 1);

    aliensRef.current = opts.map((opt, idx) => ({
      id: idx,
      x: spacing + idx * (shipW + spacing) + shipW / 2,
      y: 110,
      w: shipW,
      h: 52,
      letter: letters[idx],
      optionText: opt,
      isCorrect: opt === currentRound.correctAnswer,
      alive: true,
    }));

    setGameState("playing");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Fire laser
  const fireLaser = useCallback(() => {
    if (gameState !== "playing") return;
    const now = Date.now();
    if (now - lastShotTime.current < 280) return;
    lastShotTime.current = now;

    lasersRef.current.push({
      x: player.current.x,
      y: player.current.y - 25,
      vy: -10,
    });
    arcadeAudio.playLaser();
  }, [gameState]);

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

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.82;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // Deep space starry background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Starfield twinkle
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137) + Date.now() * 0.01) % width;
        const sy = (i * 97) % height;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // 1. Move Player
      if (gameState === "playing") {
        if (keysPressed.current.left && player.current.x > 35) {
          player.current.x -= player.current.speed;
        }
        if (keysPressed.current.right && player.current.x < width - 35) {
          player.current.x += player.current.speed;
        }
      }

      // 2. Move Armada side-to-side
      if (gameState === "playing") {
        const activeAliens = aliensRef.current.filter((a) => a.alive);
        let hitWall = false;
        activeAliens.forEach((a) => {
          a.x += armadaDir.current * 0.9;
          if (a.x - a.w / 2 <= 20 || a.x + a.w / 2 >= width - 20) {
            hitWall = true;
          }
        });

        if (hitWall) {
          armadaDir.current *= -1;
          activeAliens.forEach((a) => {
            a.y = Math.min(240, a.y + 12);
          });
        }

        // Alien shooting logic
        if (Math.random() < 0.03 && activeAliens.length > 0) {
          const shooter = activeAliens[Math.floor(Math.random() * activeAliens.length)];
          alienLasersRef.current.push({
            x: shooter.x,
            y: shooter.y + shooter.h / 2,
            vy: 4.5,
          });
        }

        // Mystery Flying Saucer UFO
        const ufo = ufoRef.current;
        if (!ufo.active && Math.random() < 0.005) {
          ufo.active = true;
          ufo.x = -40;
        }
        if (ufo.active) {
          ufo.x += ufo.vx;
          if (ufo.x > width + 50) ufo.active = false;
        }
      }

      // Draw UFO Saucer
      const ufo = ufoRef.current;
      if (ufo.active) {
        ctx.fillStyle = "#EC4899";
        ctx.beginPath();
        ctx.ellipse(ufo.x, ufo.y, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FDE047";
        ctx.beginPath();
        ctx.arc(ufo.x, ufo.y - 4, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Bunkers / Defensive Shields
      bunkersRef.current.forEach((b) => {
        if (b.hp <= 0) return;
        ctx.fillStyle = b.hp > 2 ? "#10B981" : b.hp > 1 ? "#F59E0B" : "#EF4444";
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`ESCUDO ${b.hp}`, b.x + b.w / 2, b.y + b.h / 2 + 4);
      });

      // 4. Draw Alien Command Ships [A], [B], [C], [D]
      aliensRef.current.forEach((a) => {
        if (!a.alive) return;

        ctx.save();
        ctx.translate(a.x, a.y);

        // Mothership Hull - All alien ships have identical sleek dark-purple chrome to avoid spoilers!
        ctx.fillStyle = "#1E1B4B";
        ctx.beginPath();
        ctx.roundRect(-a.w / 2, -a.h / 2, a.w, a.h, 10);
        ctx.fill();
        ctx.strokeStyle = "#818CF8";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Neon Top Thrusters
        ctx.fillStyle = "#6366F1";
        ctx.fillRect(-a.w / 2 + 10, -a.h / 2 + 4, a.w - 20, 4);

        // Letter Pill
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(-a.w / 2 + 8, -a.h / 2 + 12, 26, 26, 6);
        ctx.fill();

        ctx.fillStyle = "#0F172A";
        ctx.font = "black 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(a.letter, -a.w / 2 + 21, -a.h / 2 + 29);

        // Option Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        const shortText = a.optionText.slice(0, 16);
        ctx.fillText(shortText, -a.w / 2 + 38, -a.h / 2 + 28);

        ctx.restore();
      });

      // 5. Update & Draw Player Lasers
      lasersRef.current.forEach((l, lIdx) => {
        if (gameState === "playing") l.y += l.vy;
        ctx.fillStyle = "#38BDF8";
        ctx.fillRect(l.x - 2, l.y - 14, 4, 14);

        // Check hit with UFO
        if (ufo.active && Math.hypot(l.x - ufo.x, l.y - ufo.y) < 24) {
          ufo.active = false;
          lasersRef.current.splice(lIdx, 1);
          setScore((s) => s + 150);
          setCarrotsEarned((c) => c + 5);
          arcadeAudio.playVictory();
        }

        // Check hit with Alien Ships
        aliensRef.current.forEach((a) => {
          if (!a.alive) return;
          if (
            l.x >= a.x - a.w / 2 &&
            l.x <= a.x + a.w / 2 &&
            l.y >= a.y - a.h / 2 &&
            l.y <= a.y + a.h / 2
          ) {
            lasersRef.current.splice(lIdx, 1);
            a.alive = false;
            arcadeAudio.playImpact();

            if (a.isCorrect) {
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 250);
              setCarrotsEarned((c) => c + 35);
              setFeedback(
                `¡NAVE NODRIZA DESTRUIDA! Acertaste a [${a.letter}]: "${a.optionText}". ${currentRound.explanation}`
              );
            } else {
              arcadeAudio.playWrong();
              shakeRef.current = 14;
              setShields((s) => {
                const ns = s - 1;
                if (ns <= 0) {
                  setGameState("game_over");
                  setFeedback(
                    `¡Escudos agotados! Destruiste un distractor. La respuesta correcta era "${currentRound.correctAnswer}".`
                  );
                } else {
                  setFeedback(`¡Distractor [${a.letter}] derribado! Te quedan ${ns} escudos para destruir la nave correcta.`);
                }
                return Math.max(0, ns);
              });
            }
          }
        });

        // Check hit with Bunkers
        bunkersRef.current.forEach((b) => {
          if (b.hp <= 0) return;
          if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
            lasersRef.current.splice(lIdx, 1);
          }
        });
      });

      // 6. Update & Draw Alien Lasers
      alienLasersRef.current.forEach((al, alIdx) => {
        if (gameState === "playing") al.y += al.vy;
        ctx.fillStyle = "#F43F5E";
        ctx.fillRect(al.x - 2, al.y, 4, 12);

        // Hit bunker
        bunkersRef.current.forEach((b) => {
          if (b.hp <= 0) return;
          if (al.x >= b.x && al.x <= b.x + b.w && al.y >= b.y && al.y <= b.y + b.h) {
            alienLasersRef.current.splice(alIdx, 1);
            b.hp--;
            arcadeAudio.playBounce();
          }
        });

        // Hit Player
        if (
          Math.abs(al.x - player.current.x) < 26 &&
          Math.abs(al.y - player.current.y) < 22
        ) {
          alienLasersRef.current.splice(alIdx, 1);
          if (Date.now() > player.current.invulnerableUntil) {
            player.current.invulnerableUntil = Date.now() + 1800;
            shakeRef.current = 14;
            arcadeAudio.playWrong();
            setShields((s) => {
              const ns = s - 1;
              if (ns <= 0) {
                setGameState("game_over");
                setFeedback(
                  `¡Tu nave fue destruida por el rayo alienígena! La respuesta era "${currentRound.correctAnswer}".`
                );
              } else {
                setFeedback(`¡Impacto directo! Tus escudos absorbieron el golpe. Te quedan ${ns} escudos.`);
              }
              return Math.max(0, ns);
            });
          }
        }
      });

      // 7. Draw Player Carrot Spaceship
      const isInvuln = Date.now() < player.current.invulnerableUntil;
      ctx.save();
      if (isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      ctx.translate(player.current.x, player.current.y);

      // Carrot Spaceship Hull
      ctx.fillStyle = "#F97316";
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(28, 16);
      ctx.lineTo(-28, 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Green thrusters
      ctx.fillStyle = "#16A34A";
      ctx.fillRect(-8, 16, 16, 6);

      // Tuddy Pilot in Cockpit
      drawTuddy(ctx, {
        x: 0,
        y: -4,
        radius: 14,
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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-indigo-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                Space Invaders Arcade
              </span>
              <span className="text-xs text-indigo-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Invaders: Batalla Cósmica 👾🚀
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 bg-indigo-500/20 px-3 py-1.5 rounded-2xl border border-indigo-500/40">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-black text-indigo-300">{shields}/3 Escudos</span>
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
      <div className="bg-indigo-950/50 rounded-2xl p-4 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Objetivo de Disparo:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-indigo-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mover: ⬅️/➡️ • Disparar: Barra Espaciadora o botón Disparar
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center">
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
                  <span>Reintentar Invasión</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch & Shoot Controls */}
      <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => (keysPressed.current.left = true)}
            onPointerUp={() => (keysPressed.current.left = false)}
            onPointerLeave={() => (keysPressed.current.left = false)}
            className="p-3 bg-slate-700 hover:bg-slate-600 active:bg-indigo-600 text-white rounded-xl cursor-pointer"
          >
            <ArrowL className="w-6 h-6" />
          </button>
          <button
            type="button"
            onPointerDown={() => (keysPressed.current.right = true)}
            onPointerUp={() => (keysPressed.current.right = false)}
            onPointerLeave={() => (keysPressed.current.right = false)}
            className="p-3 bg-slate-700 hover:bg-slate-600 active:bg-indigo-600 text-white rounded-xl cursor-pointer"
          >
            <ArrowR className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={fireLaser}
          className="px-8 py-3 bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-2"
        >
          <span>🔥 DISPARAR LÁSER</span>
        </button>
      </div>

      {/* Option Aliens Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {aliensRef.current.map((alien, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              alien.alive
                ? "bg-slate-800/60 border-slate-700 text-slate-200"
                : "bg-slate-800/20 border-slate-800 text-slate-500 line-through"
            }`}
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-black flex items-center justify-center shrink-0">
              {alien.letter}
            </span>
            <span className="font-semibold line-clamp-2">{alien.optionText}</span>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-4xl shadow-inner">
              👾
            </div>
            <h3 className="text-2xl font-black text-white">¡Invasión Repelida con Éxito!</h3>
            <p className="text-xs text-slate-300">
              Has defendido la galaxia y dominado todos los conceptos en <strong className="text-indigo-300">{topic}</strong>.
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
              className="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
