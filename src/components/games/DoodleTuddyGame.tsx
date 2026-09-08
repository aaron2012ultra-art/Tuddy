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
  Heart,
} from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface DoodleTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface Platform {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: "normal" | "spring" | "moving" | "cloud_answer";
  letter?: string;
  text?: string;
  isCorrect?: boolean;
  broken?: boolean;
  vx?: number;
}

export const DoodleTuddyGame: React.FC<DoodleTuddyGameProps> = ({
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
  const [gameState, setGameState] = useState<"playing" | "round_won" | "fallen">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `Asciende y salta en la nube con la respuesta de ${topic}:`,
    options: ["Fundamento Comprobado", "Aproximación Secundaria", "Hipótesis Descuidada"],
    correctAnswer: "Fundamento Comprobado",
    explanation: `Este principio es la base matemática y conceptual de ${topic}.`,
  };

  const tuddy = useRef({
    x: 270,
    y: 380,
    vx: 0,
    vy: -10,
    radius: 18,
  });

  const platformsRef = useRef<Platform[]>([]);
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const animRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize Round Platforms
  const initRound = useCallback(() => {
    tuddy.current = {
      x: 270,
      y: 380,
      vx: 0,
      vy: -11,
      radius: 18,
    };
    setLives(3);

    // Bouncing platform steps leading up
    const plats: Platform[] = [
      // Base safety trampoline
      { id: 1, x: 200, y: 460, w: 140, h: 18, type: "spring" },
      { id: 2, x: 70, y: 370, w: 100, h: 16, type: "normal" },
      { id: 3, x: 370, y: 350, w: 100, h: 16, type: "moving", vx: 1.6 },
      { id: 4, x: 210, y: 260, w: 110, h: 18, type: "spring" },
      { id: 5, x: 80, y: 190, w: 95, h: 16, type: "normal" },
      { id: 6, x: 360, y: 170, w: 95, h: 16, type: "normal" },
    ];

    // Shuffle options across the 3 Cloud Answer Platforms at the summit
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C"];
    const cloudXs = [40, 205, 370];
    opts.forEach((opt, idx) => {
      plats.push({
        id: 10 + idx,
        x: cloudXs[idx],
        y: 85,
        w: 130,
        h: 36,
        type: "cloud_answer",
        letter: letters[idx],
        text: opt,
        isCorrect: opt === currentRound.correctAnswer,
        broken: false,
      });
    });

    platformsRef.current = plats;
    setGameState("playing");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") keysPressed.current.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keysPressed.current.right = true;
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
  }, []);

  const handlePointerMove = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const targetX = (clientX - rect.left) * scaleX;
    tuddy.current.vx = (targetX - tuddy.current.x) * 0.15;
  };

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

      // 1. Classic Doodle Jump Yellowish Graph Notebook Paper
      ctx.fillStyle = "#FBF7DC"; // Iconic Doodle notebook color
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = "rgba(180, 210, 230, 0.45)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 22) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Update Moving Platforms
      platformsRef.current.forEach((p) => {
        if (p.type === "moving" && p.vx) {
          p.x += p.vx;
          if (p.x <= 20 || p.x + p.w >= width - 20) {
            p.vx *= -1;
          }
        }
      });

      // 3. Update Tuddy Physics
      if (gameState === "playing") {
        if (keysPressed.current.left) tuddy.current.vx = -5.8;
        else if (keysPressed.current.right) tuddy.current.vx = 5.8;
        else tuddy.current.vx *= 0.88;

        tuddy.current.x += tuddy.current.vx;
        tuddy.current.vy += 0.38; // Gravity
        tuddy.current.y += tuddy.current.vy;

        // Screen wrap (left to right)
        if (tuddy.current.x < -10) tuddy.current.x = width + 10;
        if (tuddy.current.x > width + 10) tuddy.current.x = -10;

        // Landing bounce on platforms (only when falling downwards)
        if (tuddy.current.vy > 0) {
          platformsRef.current.forEach((p) => {
            if (p.broken) return;

            if (
              tuddy.current.x >= p.x - 12 &&
              tuddy.current.x <= p.x + p.w + 12 &&
              tuddy.current.y + tuddy.current.radius >= p.y &&
              tuddy.current.y + tuddy.current.radius <= p.y + p.h + 12
            ) {
              if (p.type === "spring") {
                tuddy.current.vy = -14.5; // Big spring boing!
                arcadeAudio.playLaunch();
              } else if (p.type === "cloud_answer") {
                if (p.isCorrect) {
                  arcadeAudio.playVictory();
                  setGameState("round_won");
                  setScore((s) => s + 250);
                  setCarrotsEarned((c) => c + 35);
                  setFeedback(
                    `¡CIMA ALCANZADA! Aterrizaste en la nube [${p.letter}]: "${p.text}". ${currentRound.explanation}`
                  );
                } else {
                  p.broken = true;
                  arcadeAudio.playWrong();
                  shakeRef.current = 14;
                  tuddy.current.vy = 2; // Sinks down
                  setLives((l) => {
                    const nl = l - 1;
                    if (nl <= 0) {
                      setGameState("fallen");
                      setFeedback(
                        `¡Distractor [${p.letter}] se quebró! La respuesta correcta era "${currentRound.correctAnswer}".`
                      );
                    } else {
                      setFeedback(`¡Nube distractora [${p.letter}]! Te quedan ${nl} vidas para saltar a la correcta.`);
                    }
                    return Math.max(0, nl);
                  });
                }
              } else {
                tuddy.current.vy = -10.5; // Normal platform bounce
                arcadeAudio.playBounce();
              }
            }
          });
        }

        // Trampoline safety net at bottom (bounce back up!)
        if (tuddy.current.y > height - 10) {
          shakeRef.current = 12;
          arcadeAudio.playBounce();
          setLives((l) => {
            const nl = l - 1;
            if (nl <= 0) {
              setGameState("fallen");
              setFeedback(`¡Tuddy cayó al vacío! La respuesta correcta era "${currentRound.correctAnswer}".`);
            } else {
              // Trampoline bounce back up
              tuddy.current.y = height - 30;
              tuddy.current.vy = -14;
              setFeedback(`¡El trampolín de emergencia te salvó! Te quedan ${nl} vidas.`);
            }
            return Math.max(0, nl);
          });
        }
      }

      // 4. Draw Platforms
      platformsRef.current.forEach((p) => {
        if (p.broken) return;

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === "cloud_answer") {
          // Cloud Summit Platform - All clouds look identically stylish and fluffy to avoid spoilers!
          ctx.fillStyle = "#38BDF8";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 12);
          ctx.fill();
          ctx.strokeStyle = "#0284C7";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Letter Badge
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.roundRect(6, 6, 24, 24, 6);
          ctx.fill();

          ctx.fillStyle = "#0F172A";
          ctx.font = "black 13px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`[${p.letter}]`, 18, 23);

          // Option Text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "left";
          const shortText = (p.text || "").slice(0, 13);
          ctx.fillText(shortText, 34, 22);
        } else if (p.type === "spring") {
          // Green bouncy platform with metallic spring
          ctx.fillStyle = "#84CC16";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 8);
          ctx.fill();
          ctx.strokeStyle = "#4D7C0F";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Spring coils on top
          ctx.fillStyle = "#64748B";
          ctx.fillRect(p.w / 2 - 10, -6, 20, 6);
          ctx.fillStyle = "#EF4444";
          ctx.fillRect(p.w / 2 - 12, -10, 24, 4);
        } else if (p.type === "moving") {
          // Blue moving platform
          ctx.fillStyle = "#38BDF8";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 8);
          ctx.fill();
          ctx.strokeStyle = "#0284C7";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Normal iconic green doodle platform
          ctx.fillStyle = "#22C55E";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 8);
          ctx.fill();
          ctx.strokeStyle = "#15803D";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 5. Draw Doodle Tuddy
      ctx.save();
      // Rotate Tuddy depending on horizontal velocity
      const angle = tuddy.current.vx * 0.05;
      drawTuddy(ctx, {
        x: tuddy.current.x,
        y: tuddy.current.y,
        radius: 20,
        angle,
        expression: gameState === "round_won" ? "happy" : gameState === "fallen" ? "dizzy" : "focused",
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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-lime-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-lime-500 text-slate-950 px-2 py-0.5 rounded-full">
                Doodle Jump Arcade
              </span>
              <span className="text-xs text-lime-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Doodle Tuddy: Salto a la Cumbre 🦘📝
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
      <div className="bg-lime-950/40 rounded-2xl p-4 border border-lime-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-lime-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión de Salto:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-lime-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mover: ⬅️/➡️ o mueve el ratón • Aterriza en la nube [A, B o C] correcta
        </div>
      </div>

      {/* Canvas */}
      <div
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={540}
          height={500}
          className="w-full max-w-md h-auto touch-none"
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
                  <span>Reintentar Salto</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Options Quick Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {currentRound.options.slice(0, 3).map((opt, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-200 flex items-center gap-2.5"
          >
            <span className="w-6 h-6 rounded-lg bg-lime-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              {["A", "B", "C"][idx]}
            </span>
            <span className="font-semibold line-clamp-2">{opt}</span>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-lime-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-lime-500/20 border-2 border-lime-400 flex items-center justify-center text-4xl shadow-inner">
              🦘
            </div>
            <h3 className="text-2xl font-black text-white">¡Cumbre del Conocimiento Alcanzada!</h3>
            <p className="text-xs text-slate-300">
              Has escalado todas las plataformas dominando cada postulado en <strong className="text-lime-300">{topic}</strong>.
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
              className="w-full py-3 rounded-2xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
