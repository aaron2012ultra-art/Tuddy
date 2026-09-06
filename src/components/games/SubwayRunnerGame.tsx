import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle, ArrowLeft as ArrowL, ArrowRight as ArrowR, ArrowUp } from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface SubwayRunnerGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface LaneSign {
  z: number;
  lane: number; // 0 = Left, 1 = Center, 2 = Right
  text: string;
  isCorrect: boolean;
  passed: boolean;
}

export const SubwayRunnerGame: React.FC<SubwayRunnerGameProps> = ({
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
  const [gameState, setGameState] = useState<"running" | "round_won" | "crashed">("running");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el camino de deducción correcto en ${topic}?`,
    options: ["Vía Verificada", "Ruta Falaz", "Desvío Incorrecto"],
    correctAnswer: "Vía Verificada",
    explanation: `Esta vía es la demostrada formalmente para ${topic}.`,
  };

  // Player position: current lane (0, 1, 2), current visual X, jump Y
  const player = useRef({
    lane: 1, // Start center
    visualX: 420,
    jumpY: 0,
    jumpVy: 0,
    isJumping: false,
  });

  const signsRef = useRef<LaneSign[]>([]);
  const animRef = useRef<number | null>(null);

  const initRound = useCallback(() => {
    player.current.lane = 1;
    player.current.visualX = 420;
    player.current.jumpY = 0;
    player.current.jumpVy = 0;
    player.current.isJumping = false;

    // Spawn 3 signs, one in each lane, randomly shuffled
    const signs: LaneSign[] = [];
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    opts.forEach((opt, idx) => {
      signs.push({
        z: 900, // Distance away
        lane: idx % 3,
        text: opt,
        isCorrect: opt === currentRound.correctAnswer,
        passed: false,
      });
    });

    signsRef.current = signs;
    setGameState("running");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Controls: Change lane or jump
  const moveLeft = useCallback(() => {
    if (player.current.lane > 0) {
      player.current.lane -= 1;
      arcadeAudio.playBounce();
    }
  }, []);

  const moveRight = useCallback(() => {
    if (player.current.lane < 2) {
      player.current.lane += 1;
      arcadeAudio.playBounce();
    }
  }, []);

  const jump = useCallback(() => {
    if (!player.current.isJumping) {
      player.current.isJumping = true;
      player.current.jumpVy = -9.5;
      arcadeAudio.playLaunch();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") moveLeft();
      if (e.code === "ArrowRight" || e.code === "KeyD") moveRight();
      if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLeft, moveRight, jump]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    const laneTargets = [240, 420, 600];

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;

      // 1. Sky & Horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      skyGrad.addColorStop(0, "#0284C7");
      skyGrad.addColorStop(1, "#38BDF8");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Distant city skyline silhouettes
      ctx.fillStyle = "#0369A1";
      for (let i = 0; i < 14; i++) {
        const bx = i * 65;
        const bw = 50;
        const bh = 50 + (i % 4) * 35;
        ctx.fillRect(bx, height * 0.45 - bh, bw, bh);
      }

      // 2. 3D Track Perspective Ground
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(width * 0.35, height * 0.45);
      ctx.lineTo(width * 0.65, height * 0.45);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Subway Tracks & Rails
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 3;
      // Lane dividers
      const vanishX = width / 2;
      const vanishY = height * 0.45;

      [180, 340, 500, 660].forEach((bottomX) => {
        ctx.beginPath();
        ctx.moveTo(vanishX + (bottomX - vanishX) * 0.1, vanishY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      });

      // Track sleepers (moving down for speed sensation)
      if (gameState === "running") {
        const offset = (Date.now() * 0.3) % 40;
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        for (let y = height * 0.45 + offset; y < height; y += 40) {
          const t = (y - vanishY) / (height - vanishY);
          const leftX = vanishX - (vanishX - 80) * t;
          const rightX = vanishX + (760 - vanishX) * t;
          ctx.beginPath();
          ctx.moveTo(leftX, y);
          ctx.lineTo(rightX, y);
          ctx.stroke();
        }
      }

      // 3. Update & Draw Incoming Answer Arches
      const speed = gameState === "running" ? 6.5 : 0;
      signsRef.current.forEach((sign) => {
        if (gameState === "running") {
          sign.z -= speed;
        }

        // Project 3D coordinate (Z: 900 -> 0)
        const t = Math.max(0, Math.min(1, (900 - sign.z) / 900));
        const signY = vanishY + (height - vanishY) * (t * 0.85);
        const signScale = 0.3 + t * 0.9;
        const laneCenterX = laneTargets[sign.lane];
        const projX = vanishX + (laneCenterX - vanishX) * t;

        // Draw Portal Banner for the lane
        ctx.save();
        ctx.translate(projX, signY);
        ctx.scale(signScale, signScale);

        const bannerW = 160;
        const bannerH = 76;
        const isSelectedWon = sign.passed && gameState === "round_won" && sign.isCorrect;
        const isSelectedCrashed = sign.passed && gameState === "crashed" && player.current.lane === sign.lane;

        // Neutral dark cyan cyber archway prior to passing - never give away the answer!
        ctx.fillStyle = isSelectedWon
          ? "rgba(16, 185, 129, 0.92)"
          : isSelectedCrashed
          ? "rgba(239, 68, 68, 0.92)"
          : "rgba(15, 23, 42, 0.88)";

        ctx.strokeStyle = isSelectedWon
          ? "#10B981"
          : isSelectedCrashed
          ? "#EF4444"
          : "#38BDF8";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(-bannerW / 2, -bannerH, bannerW, bannerH, 10);
        ctx.fill();
        ctx.stroke();

        // Top energetic arch accent bar
        ctx.fillStyle = isSelectedWon ? "#10B981" : isSelectedCrashed ? "#EF4444" : "#0284C7";
        ctx.fillRect(-bannerW / 2 + 4, -bannerH + 4, bannerW - 8, 6);

        // Track Pillars
        ctx.fillStyle = "#64748B";
        ctx.fillRect(-bannerW / 2, 0, 8, 50);
        ctx.fillRect(bannerW / 2 - 8, 0, 8, 50);

        // Letter Badge Pill
        const letter = ["A", "B", "C"][sign.lane];
        ctx.fillStyle = isSelectedWon ? "#10B981" : "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(-22, -bannerH + 16, 44, 22, 6);
        ctx.fill();

        ctx.fillStyle = "#0F172A";
        ctx.font = "black 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`[${letter}]`, 0, -bannerH + 32);

        // Option text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sign.text.slice(0, 18), 0, -bannerH + 56);

        ctx.restore();

        // Check if Tuddy passes this sign (Z ~ 80)
        if (sign.z <= 90 && !sign.passed && gameState === "running") {
          sign.passed = true;
          if (player.current.lane === sign.lane) {
            if (sign.isCorrect) {
              // Hit the correct lane!
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 150);
              setCarrotsEarned((c) => c + 25);
              setFeedback(`¡CARRIL ACERTADO! Elegiste la vía correcta: "${sign.text}". ${currentRound.explanation}`);
            } else {
              // Collided with wrong answer barrier
              arcadeAudio.playWrong();
              setGameState("crashed");
              setFeedback(`¡Vía Bloqueada! Elegiste el carril con distractor ("${sign.text}"). La respuesta correcta era "${currentRound.correctAnswer}".`);
            }
          }
        }
      });

      // 4. Update Tuddy Jump & Smooth Lane Transition
      const targetX = laneTargets[player.current.lane];
      player.current.visualX += (targetX - player.current.visualX) * 0.22;

      if (player.current.isJumping) {
        player.current.jumpVy += 0.55; // gravity
        player.current.jumpY += player.current.jumpVy;
        if (player.current.jumpY >= 0) {
          player.current.jumpY = 0;
          player.current.isJumping = false;
        }
      }

      // Draw Tuddy Runner
      const tuddyBaseY = height - 70 + player.current.jumpY;
      drawTuddy(ctx, {
        x: player.current.visualX,
        y: tuddyBaseY,
        radius: 26,
        expression: gameState === "round_won" ? "happy" : gameState === "crashed" ? "dizzy" : "focused",
        pet,
      });

      // Speed shadow under Tuddy
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(player.current.visualX, height - 42, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

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
                Subway Surfers Arcade
              </span>
              <span className="text-xs text-indigo-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Subway Tuddy: Carrera de Vías 🏃💨
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
      <div className="bg-indigo-950/40 rounded-2xl p-4 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión en la Vía:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-indigo-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Cambiar Carril: ◄ / ► • Saltar: ▲ / Espacio 🚀
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
              <span className="text-3xl">{gameState === "round_won" ? "🏁" : "💥"}</span>
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
                  <span>Reintentar Carrera</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Direct Lane Selection & Jump Controls */}
      <div className="flex flex-wrap justify-center gap-2.5 py-2">
        <button
          type="button"
          onClick={() => {
            player.current.lane = 0;
            arcadeAudio.playBounce();
          }}
          className="px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-indigo-600 border border-slate-700 cursor-pointer shadow-sm"
        >
          <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">A</span>
          <span>Carril Izq</span>
        </button>

        <button
          type="button"
          onClick={() => {
            player.current.lane = 1;
            arcadeAudio.playBounce();
          }}
          className="px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-indigo-600 border border-slate-700 cursor-pointer shadow-sm"
        >
          <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">B</span>
          <span>Carril Centro</span>
        </button>

        <button
          type="button"
          onClick={() => {
            player.current.lane = 2;
            arcadeAudio.playBounce();
          }}
          className="px-4 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-indigo-600 border border-slate-700 cursor-pointer shadow-sm"
        >
          <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">C</span>
          <span>Carril Der</span>
        </button>

        <button
          type="button"
          onClick={jump}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl flex items-center gap-1.5 font-black text-xs shadow-md transition-transform hover:scale-105 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Saltar</span>
        </button>
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-4xl shadow-inner">
              🏃💨
            </div>
            <h3 className="text-2xl font-black text-white">¡Carrera del Saber Concluida!</h3>
            <p className="text-xs text-slate-300">
              Has navegado todos los carriles correctos de <strong className="text-indigo-300">{topic}</strong> con Tuddy a máxima velocidad.
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
