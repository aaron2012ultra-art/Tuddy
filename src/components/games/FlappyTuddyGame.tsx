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
  Heart,
} from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface FlappyTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface CloudRing {
  id: number;
  x: number;
  y: number;
  letter: string;
  optionText: string;
  isCorrect: boolean;
  radius: number;
  passed: boolean;
}

export const FlappyTuddyGame: React.FC<FlappyTuddyGameProps> = ({
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
  const [gameState, setGameState] = useState<"ready" | "flying" | "crashed" | "round_won">("ready");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el axioma principal de ${topic}?`,
    options: ["Respuesta Verdadera", "Distractor Conceptual", "Alternativa Secundaria"],
    correctAnswer: "Respuesta Verdadera",
    explanation: `Este principio es la base demostrada para comprender ${topic}.`,
  };

  // Tuddy Physics - Authentic Flappy Bird smooth gravity and rotation
  const tuddy = useRef({
    x: 170,
    y: 220,
    vy: 0,
    angle: 0,
    invulnerableUntil: 0,
  });

  const ringsRef = useRef<CloudRing[]>([]);
  const coinsRef = useRef<Array<{ x: number; y: number; collected: boolean }>>([]);
  const animRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize round: 3 spacious sky rings with comfortable spacing
  const initRound = useCallback(() => {
    tuddy.current = {
      x: 170,
      y: 220,
      vy: 0,
      angle: 0,
      invulnerableUntil: 0,
    };
    setLives(3);

    // Shuffle options across heights [A], [B], [C]
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C"];
    // 3 generous sky rings arranged at comfortable, distinct elevations with plenty of room
    const targetElevations = [120, 240, 350];
    ringsRef.current = opts.map((opt, idx) => ({
      id: idx,
      x: 880 + idx * 25, // Form a clean visible sky fleet
      y: targetElevations[idx],
      letter: letters[idx],
      optionText: opt,
      isCorrect: opt === currentRound.correctAnswer,
      radius: 54, // Wide, forgiving entry ring
      passed: false,
    }));

    // Floating carrot coins to collect on the way
    const coins: Array<{ x: number; y: number; collected: boolean }> = [];
    for (let x = 320; x < 840; x += 110) {
      coins.push({
        x,
        y: 180 + Math.sin(x * 0.02) * 80,
        collected: false,
      });
    }
    coinsRef.current = coins;

    setGameState("ready");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Flap jump
  const flap = useCallback(() => {
    if (gameState === "ready") {
      setGameState("flying");
      tuddy.current.vy = -6.2;
      arcadeAudio.playLaunch();
    } else if (gameState === "flying") {
      tuddy.current.vy = -6.2;
      arcadeAudio.playLaunch();
    }
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        flap();
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        // Soft dive
        tuddy.current.vy = Math.min(6, tuddy.current.vy + 2.5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap]);

  // Main canvas animation loop
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
      const groundY = height - 50;

      ctx.save();
      // Screen shake on hit
      if (shakeRef.current > 0) {
        ctx.translate((Math.random() - 0.5) * shakeRef.current, (Math.random() - 0.5) * shakeRef.current);
        shakeRef.current *= 0.82;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // 1. Classic Flappy Blue Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, "#4ec0ca"); // Iconic Flappy Cyan
      skyGrad.addColorStop(0.7, "#70c5ce");
      skyGrad.addColorStop(1, "#cce8ea");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant retro green hills
      ctx.fillStyle = "#5ee270";
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      for (let x = 0; x <= width; x += 120) {
        ctx.quadraticCurveTo(x + 60, groundY - 45, x + 120, groundY);
      }
      ctx.fill();

      // Pixel fluffy clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      const cloudOffset = (Date.now() * 0.02) % 200;
      [
        { x: 80 - cloudOffset, y: 70, w: 90, h: 40 },
        { x: 380 - cloudOffset, y: 55, w: 120, h: 45 },
        { x: 680 - cloudOffset, y: 80, w: 100, h: 38 },
      ].forEach((c) => {
        ctx.beginPath();
        ctx.ellipse(c.x < -100 ? c.x + width + 200 : c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Move Clouds Rings & Floating Coins
      const scrollSpeed = gameState === "flying" ? 2.2 : 0;

      // Update and draw floating carrot coins
      coinsRef.current.forEach((coin) => {
        if (gameState === "flying") coin.x -= scrollSpeed;
        if (coin.collected || coin.x < -30) return;

        // Draw golden carrot coin
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FEF08A";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "black 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🥕", coin.x, coin.y + 4);

        // Collect check
        const dist = Math.hypot(tuddy.current.x - coin.x, tuddy.current.y - coin.y);
        if (dist < 32) {
          coin.collected = true;
          setScore((s) => s + 25);
          arcadeAudio.playCoin();
        }
      });

      // Update and draw Sky Ring Portals [A], [B], [C]
      ringsRef.current.forEach((ring) => {
        if (gameState === "flying") {
          ring.x -= scrollSpeed;
          // If missed, loop unpassed ring back to give the player another chance
          if (ring.x < -160 && !ring.passed) {
            ring.x = width + 120;
          }
        }

        ctx.save();
        ctx.translate(ring.x, ring.y);

        const isRoundWon = gameState === "round_won" && ring.isCorrect;
        const isCrashedRing = gameState === "crashed" && ring.passed;

        // Outer Ring - All rings look identically sleek and neutral cyan/golden to prevent spoilers!
        ctx.lineWidth = 6;
        ctx.strokeStyle = isRoundWon ? "#10B981" : isCrashedRing ? "#EF4444" : "#0284C7";
        ctx.fillStyle = isRoundWon
          ? "rgba(16, 185, 129, 0.25)"
          : isCrashedRing
          ? "rgba(239, 68, 68, 0.25)"
          : "rgba(15, 23, 42, 0.65)";
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner glowing ring halo
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isRoundWon ? "#34D399" : "#38BDF8";
        ctx.beginPath();
        ctx.arc(0, 0, ring.radius - 8, 0, Math.PI * 2);
        ctx.stroke();

        // Option Banner Plaque
        const badgeW = 160;
        const badgeH = 46;
        ctx.fillStyle = isRoundWon ? "rgba(16, 185, 129, 0.95)" : "rgba(15, 23, 42, 0.92)";
        ctx.strokeStyle = isRoundWon ? "#34D399" : "#38BDF8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2, ring.radius + 6, badgeW, badgeH, 10);
        ctx.fill();
        ctx.stroke();

        // Letter [A], [B], [C]
        ctx.fillStyle = isRoundWon ? "#10B981" : "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2 + 6, ring.radius + 12, 28, 34, 6);
        ctx.fill();

        ctx.fillStyle = "#0F172A";
        ctx.font = "black 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ring.letter, -badgeW / 2 + 20, ring.radius + 34);

        // Option Text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "left";
        const shortText = ring.optionText.length > 17 ? ring.optionText.slice(0, 16) + "…" : ring.optionText;
        ctx.fillText(shortText, -badgeW / 2 + 40, ring.radius + 33);

        ctx.restore();

        // Ring Collision & Fly-Through Detection
        if (gameState === "flying" && !ring.passed && Date.now() > tuddy.current.invulnerableUntil) {
          const dx = tuddy.current.x - ring.x;
          const dy = tuddy.current.y - ring.y;
          const dist = Math.hypot(dx, dy);

          // If Tuddy passes right through the ring center!
          if (dist < ring.radius + 12) {
            ring.passed = true;
            if (ring.isCorrect) {
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 100);
              setCarrotsEarned((c) => c + 2);
              setFeedback(
                `¡ANILLO CELESTE ACERTADO! Volaste a través de [${ring.letter}]: "${ring.optionText}". ${currentRound.explanation}`
              );
            } else {
              arcadeAudio.playWrong();
              shakeRef.current = 14;
              tuddy.current.invulnerableUntil = Date.now() + 1800;
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState("crashed");
                  setFeedback(
                    `¡Agotaste tus vidas! Volaste hacia [${ring.letter}]: "${ring.optionText}". La respuesta correcta era "${currentRound.correctAnswer}". ${currentRound.explanation}`
                  );
                } else {
                  setFeedback(`¡Distractor [${ring.letter}] tocado! Te quedan ${nl} vida(s). ¡Ajusta tu vuelo hacia el anillo correcto!`);
                }
                return Math.max(0, nl);
              });
            }
          }
        }
      });

      // 3. Iconic Flappy Striped Ground
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = "#73bf2e";
      ctx.fillRect(0, groundY, width, 14);

      // Moving diagonal ground stripe pattern
      const gOffset = (Date.now() * 0.15) % 24;
      ctx.fillStyle = "#9de64e";
      for (let x = -24 + gOffset; x < width + 24; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 12, groundY);
        ctx.lineTo(x, groundY + 14);
        ctx.lineTo(x - 12, groundY + 14);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Update Tuddy Physics
      if (gameState === "flying") {
        tuddy.current.vy += 0.28; // Gravity
        if (tuddy.current.vy > 6.5) tuddy.current.vy = 6.5; // Max fall speed
        tuddy.current.y += tuddy.current.vy;

        // Angle tilts with velocity
        tuddy.current.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, tuddy.current.vy * 0.09));

        // Floor bounce with safe cushion
        if (tuddy.current.y >= groundY - 24) {
          tuddy.current.y = groundY - 24;
          tuddy.current.vy = -3.5;
          arcadeAudio.playBounce();
        }
        // Ceiling bound
        if (tuddy.current.y < 35) {
          tuddy.current.y = 35;
          tuddy.current.vy = 1;
        }
      } else if (gameState === "ready") {
        // Floating idle bob
        tuddy.current.y = 220 + Math.sin(Date.now() * 0.006) * 10;
        tuddy.current.angle = 0;
      }

      // 5. Draw Tuddy Flapper
      const isInvuln = Date.now() < tuddy.current.invulnerableUntil;
      ctx.save();
      if (isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }
      drawTuddy(ctx, {
        x: tuddy.current.x,
        y: tuddy.current.y,
        radius: 25,
        angle: tuddy.current.angle,
        expression:
          gameState === "round_won"
            ? "happy"
            : gameState === "crashed"
            ? "dizzy"
            : "normal",
        pet,
      });
      ctx.restore();

      // Ready prompt overlay
      if (gameState === "ready") {
        ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
        ctx.beginPath();
        ctx.roundRect(width / 2 - 200, height / 2 - 45, 400, 80, 16);
        ctx.fill();
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡Toca la pantalla o ESPACIO para aletear!", width / 2, height / 2 - 14);
        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("Vuela hacia el anillo con la respuesta correcta 🪽✨", width / 2, height / 2 + 16);
      }

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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-sky-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500 text-white px-2 py-0.5 rounded-full">
                Flappy Retro Arcade
              </span>
              <span className="text-xs text-sky-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Flappy Tuddy: Vuelo del Saber 🪽
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hearts / Lives */}
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
      <div className="bg-sky-950/50 rounded-2xl p-4 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión de Vuelo:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-sky-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Aletear: Espacio / Clic / ⬆️ • Descender: ⬇️
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={flap}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          className="w-full max-w-full h-auto touch-none"
        />

        {/* In-flight warning banner */}
        {feedback && gameState === "flying" && (
          <div className="absolute top-4 left-4 right-4 p-3 rounded-2xl bg-amber-950/85 border border-amber-500/60 backdrop-blur-md shadow-lg flex items-center justify-center gap-2 text-amber-200 text-xs font-bold pointer-events-none">
            <span>⚠️</span>
            <span>{feedback}</span>
          </div>
        )}

        {/* Game over / round won modal */}
        {feedback && (gameState === "round_won" || gameState === "crashed") && (
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
                  <span>Reintentar Vuelo</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Flight Control Buttons & Option Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {ringsRef.current.map((ring, idx) => (
          <div
            key={idx}
            onClick={() => {
              // Guide Tuddy towards altitude of this ring smoothly
              tuddy.current.vy = (ring.y - tuddy.current.y) * 0.08;
              arcadeAudio.playBounce();
            }}
            className="p-2.5 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-300 hover:border-sky-500 flex items-center gap-2.5 cursor-pointer transition-all"
          >
            <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              {ring.letter}
            </span>
            <span className="font-semibold line-clamp-2">{ring.optionText}</span>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-4xl shadow-inner">
              🪽
            </div>
            <h3 className="text-2xl font-black text-white">¡Vuelo de Maestría Superado!</h3>
            <p className="text-xs text-slate-300">
              Has pilotado a Tuddy cruzando todas las compuertas de <strong className="text-sky-300">{topic}</strong>.
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
              className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
