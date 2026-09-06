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

interface TuddyBrickBreakerGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
  text?: string;
  isTargetAnswer?: boolean;
}

export const TuddyBrickBreakerGame: React.FC<TuddyBrickBreakerGameProps> = ({
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
  const [gameState, setGameState] = useState<"ready" | "playing" | "round_won" | "lost_ball">("ready");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Qué término describe el fenómeno en ${topic}?`,
    options: ["Término Principal", "Distractor 1", "Distractor 2"],
    correctAnswer: "Término Principal",
    explanation: `Este concepto es clave para estructurar ${topic}.`,
  };

  // Paddle & Ball
  const paddle = useRef({ x: 420, y: 440, w: 120, h: 20 });
  const ball = useRef({ x: 420, y: 420, vx: 4, vy: -5, radius: 9 });
  const bricksRef = useRef<Brick[]>([]);
  const animRef = useRef<number | null>(null);

  const initBricks = useCallback(() => {
    paddle.current.x = 420;
    ball.current = { x: 420, y: 420, vx: 4, vy: -5, radius: 9 };

    const bricks: Brick[] = [];
    const rows = 4;
    const cols = 8;
    const bw = 90;
    const bh = 24;
    const startX = 60;
    const startY = 70;
    const colors = ["#F59E0B", "#F43F5E", "#38BDF8", "#10B981"];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Special target bricks displaying the correct answer keywords
        const isSpecial = r === 1 && (c === 3 || c === 4);
        bricks.push({
          x: startX + c * (bw + 8),
          y: startY + r * (bh + 8),
          w: bw,
          h: bh,
          color: isSpecial ? "#FDE047" : colors[r % colors.length],
          alive: true,
          isTargetAnswer: isSpecial,
        });
      }
    }

    bricksRef.current = bricks;
    setGameState("ready");
    setFeedback(null);
  }, []);

  useEffect(() => {
    initBricks();
  }, [currentRoundIdx, initBricks]);

  const launchBall = () => {
    if (gameState === "ready") {
      setGameState("playing");
      arcadeAudio.playLaunch();
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const scaleX = canvasRef.current.width / rect.width;
    paddle.current.x = Math.max(paddle.current.w / 2, Math.min(canvasRef.current.width - paddle.current.w / 2, (clientX - rect.left) * scaleX));

    if (gameState === "ready") {
      ball.current.x = paddle.current.x;
    }
  };

  // Main game loop
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

      // Background arcade grid
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Update & Draw Bricks
      let remainingBricks = 0;
      bricksRef.current.forEach((b) => {
        if (!b.alive) return;
        remainingBricks++;

        ctx.fillStyle = b.color;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeRect(b.x, b.y, b.w, b.h);

        // Brick 3D highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(b.x, b.y, b.w, 4);

        if (b.isTargetAnswer) {
          ctx.fillStyle = "#000000";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("★ SABER ★", b.x + b.w / 2, b.y + b.h / 2 + 3);
        }
      });

      // Update Ball Physics
      if (gameState === "playing") {
        ball.current.x += ball.current.vx;
        ball.current.y += ball.current.vy;

        // Wall collisions
        if (ball.current.x - ball.current.radius <= 0) {
          ball.current.x = ball.current.radius;
          ball.current.vx *= -1;
          arcadeAudio.playBounce();
        }
        if (ball.current.x + ball.current.radius >= width) {
          ball.current.x = width - ball.current.radius;
          ball.current.vx *= -1;
          arcadeAudio.playBounce();
        }
        if (ball.current.y - ball.current.radius <= 0) {
          ball.current.y = ball.current.radius;
          ball.current.vy *= -1;
          arcadeAudio.playBounce();
        }

        // Paddle collision with angle reflection
        const p = paddle.current;
        if (
          ball.current.y + ball.current.radius >= p.y &&
          ball.current.y - ball.current.radius <= p.y + p.h &&
          ball.current.x >= p.x - p.w / 2 &&
          ball.current.x <= p.x + p.w / 2
        ) {
          ball.current.y = p.y - ball.current.radius;
          const hitOffset = (ball.current.x - p.x) / (p.w / 2); // -1 to 1
          ball.current.vx = hitOffset * 7;
          ball.current.vy = -Math.abs(ball.current.vy);
          arcadeAudio.playBounce();
        }

        // Brick collision detection
        bricksRef.current.forEach((b) => {
          if (!b.alive) return;
          if (
            ball.current.x + ball.current.radius > b.x &&
            ball.current.x - ball.current.radius < b.x + b.w &&
            ball.current.y + ball.current.radius > b.y &&
            ball.current.y - ball.current.radius < b.y + b.h
          ) {
            b.alive = false;
            ball.current.vy *= -1;
            setScore((s) => s + 20);
            arcadeAudio.playImpact();

            if (b.isTargetAnswer) {
              setCarrotsEarned((c) => c + 15);
              arcadeAudio.playCoin();
            }
          }
        });

        // Ball lost
        if (ball.current.y > height + 20) {
          setGameState("lost_ball");
          setFeedback(`¡Se cayó la esfera dorada! La respuesta correcta era "${currentRound.correctAnswer}".`);
          arcadeAudio.playWrong();
        }

        // All bricks cleared or level cleared
        if (remainingBricks <= 10) {
          setGameState("round_won");
          setScore((s) => s + 150);
          setCarrotsEarned((c) => c + 25);
          setFeedback(`¡BLOQUES DESTRUIDOS! Has descifrado: "${currentRound.correctAnswer}". ${currentRound.explanation}`);
          arcadeAudio.playVictory();
        }
      }

      // Draw Ball (Golden Carrot Orb)
      ctx.save();
      ctx.translate(ball.current.x, ball.current.y);
      const bGrad = ctx.createRadialGradient(0, -3, 2, 0, 0, ball.current.radius);
      bGrad.addColorStop(0, "#FEF08A");
      bGrad.addColorStop(0.6, "#F59E0B");
      bGrad.addColorStop(1, "#D97706");
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(0, 0, ball.current.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Draw Paddle with Tuddy driving it
      const p = paddle.current;
      ctx.fillStyle = "#F97316";
      ctx.fillRect(p.x - p.w / 2, p.y, p.w, p.h);
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(p.x - p.w / 2, p.y, p.w, p.h);

      // Tuddy holding the paddle center
      drawTuddy(ctx, {
        x: p.x,
        y: p.y - 14,
        radius: 16,
        expression: gameState === "round_won" ? "happy" : gameState === "lost_ball" ? "dizzy" : "normal",
        pet,
      });

      // Ready message
      if (gameState === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(width / 2 - 160, height / 2 - 40, 320, 60);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡Haz clic o toca para lanzar la esfera!", width / 2, height / 2 - 8);
        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("Destruye los bloques de la lección 🧱✨", width / 2, height / 2 + 14);
      }

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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-amber-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                Arkanoid Arcade
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Rompebloques: Esfera de Oro 🧱
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
      <div className="bg-amber-950/40 rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Reto Rompebloques:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mueve la pala con el ratón / dedo para rebotar 🏓
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={launchBall}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-ew-resize"
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
                    initBricks();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Bloques</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner">
              🧱
            </div>
            <h3 className="text-2xl font-black text-white">¡Muro del Saber Conquistado!</h3>
            <p className="text-xs text-slate-300">
              Has roto todos los bloques y desbloqueado la maestría de <strong className="text-amber-300">{topic}</strong> con Tuddy.
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
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
