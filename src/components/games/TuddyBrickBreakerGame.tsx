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
  Zap,
} from "lucide-react";

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
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
  hp: number;
  isAnswerVault?: boolean;
  letter?: string;
  optionText?: string;
  isCorrect?: boolean;
  powerUp?: "multiball" | "wide" | "laser" | "carrot" | null;
}

interface PowerUpItem {
  x: number;
  y: number;
  vy: number;
  type: "multiball" | "wide" | "laser" | "carrot";
  collected: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alive: boolean;
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
  const [ballsLeft, setBallsLeft] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "round_won" | "game_over">("ready");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el axioma fundamental de ${topic}?`,
    options: ["Ley rigurosa verificada", "Aproximación empírica secundaria", "Hipótesis transitoria"],
    correctAnswer: "Ley rigurosa verificada",
    explanation: `Este principio es la base demostrada para ${topic} en ${subject}.`,
  };

  const paddle = useRef({
    x: 420,
    y: 450,
    w: 120,
    h: 18,
    targetW: 120,
    hasLaser: false,
    laserTimer: 0,
  });

  const balls = useRef<Ball[]>([
    { x: 420, y: 435, vx: 4, vy: -5.5, radius: 8, alive: true },
  ]);

  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const lasersRef = useRef<Array<{ x: number; y: number; vy: number }>>([]);
  const animRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize Bricks for Round
  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    let bId = 1;

    // Shuffle options across the 3 or 4 answer vaults
    const opts = [...currentRound.options].slice(0, 4);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C", "D"];
    const vaultCount = opts.length;
    const vaultW = 160;
    const vaultSpacing = (800 - vaultCount * vaultW) / (vaultCount + 1);

    // Row 0: Answer Vaults (Prominently placed at the top tier behind defenses)
    opts.forEach((opt, idx) => {
      const vx = vaultSpacing + idx * (vaultW + vaultSpacing);
      bricks.push({
        id: bId++,
        x: vx,
        y: 60,
        w: vaultW,
        h: 38,
        color: "#1E293B",
        alive: true,
        hp: 1,
        isAnswerVault: true,
        letter: letters[idx],
        optionText: opt,
        isCorrect: opt === currentRound.correctAnswer,
      });
    });

    // Rows 1 to 3: Protective defense barrier bricks with power-ups
    const rows = 3;
    const cols = 9;
    const bw = 78;
    const bh = 20;
    const startX = 35;
    const startY = 125;
    const rowColors = ["#EF4444", "#F59E0B", "#38BDF8"];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let pUp: "multiball" | "wide" | "laser" | "carrot" | null = null;
        if (Math.random() < 0.22) {
          const types: Array<"multiball" | "wide" | "laser" | "carrot"> = [
            "multiball",
            "wide",
            "laser",
            "carrot",
          ];
          pUp = types[Math.floor(Math.random() * types.length)];
        }

        bricks.push({
          id: bId++,
          x: startX + c * (bw + 8),
          y: startY + r * (bh + 8),
          w: bw,
          h: bh,
          color: rowColors[r % rowColors.length],
          alive: true,
          hp: r === 0 ? 2 : 1, // Top defense has 2 HP
          powerUp: pUp,
        });
      }
    }

    bricksRef.current = bricks;
    powerUpsRef.current = [];
    lasersRef.current = [];
    paddle.current = {
      x: 420,
      y: 450,
      w: 120,
      h: 18,
      targetW: 120,
      hasLaser: false,
      laserTimer: 0,
    };
    balls.current = [{ x: 420, y: 435, vx: 4, vy: -5.5, radius: 8, alive: true }];
    setBallsLeft(3);
    setGameState("ready");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initBricks();
  }, [currentRoundIdx, initBricks]);

  const launchBall = () => {
    if (gameState === "ready") {
      setGameState("playing");
      arcadeAudio.playLaunch();
    }
  };

  const handlePointerMove = (clientX: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const curX = (clientX - rect.left) * scaleX;
    paddle.current.x = Math.max(
      paddle.current.w / 2,
      Math.min(canvasRef.current.width - paddle.current.w / 2, curX)
    );

    if (gameState === "ready" && balls.current[0]) {
      balls.current[0].x = paddle.current.x;
    }
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

      // Background cyber arcade grid
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, width, height);

      // Subtle neon background lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 1. Draw Bricks & Answer Vaults
      bricksRef.current.forEach((b) => {
        if (!b.alive) return;

        ctx.save();
        ctx.translate(b.x, b.y);

        if (b.isAnswerVault) {
          // Large Answer Vault Capsule: identical neutral titanium cyber style to avoid spoilers!
          ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
          ctx.beginPath();
          ctx.roundRect(0, 0, b.w, b.h, 10);
          ctx.fill();
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 3;
          ctx.stroke();

          // Top metallic accent
          ctx.fillStyle = "#0284C7";
          ctx.fillRect(4, 4, b.w - 8, 4);

          // Letter Badge
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.roundRect(8, 11, 24, 20, 5);
          ctx.fill();

          ctx.fillStyle = "#0F172A";
          ctx.font = "black 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`[${b.letter}]`, 20, 25);

          // Option text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "left";
          const shortText = (b.optionText || "").slice(0, 15);
          ctx.fillText(shortText, 38, 25);
        } else {
          // Standard Defense Brick
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.roundRect(0, 0, b.w, b.h, 6);
          ctx.fill();

          // Brick top highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
          ctx.fillRect(2, 2, b.w - 4, 3);

          if (b.hp > 1) {
            // Armor crack icon
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🛡️", b.w / 2, b.h / 2 + 3);
          } else if (b.powerUp) {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("✦", b.w / 2, b.h / 2 + 3);
          }
        }
        ctx.restore();
      });

      // 2. Update & Draw Power-Up Drops
      powerUpsRef.current.forEach((pu) => {
        if (pu.collected) return;
        if (gameState === "playing") pu.y += pu.vy;

        ctx.save();
        ctx.translate(pu.x, pu.y);

        // Rotating power-up pill
        ctx.fillStyle =
          pu.type === "multiball"
            ? "#38BDF8"
            : pu.type === "laser"
            ? "#EF4444"
            : pu.type === "wide"
            ? "#10B981"
            : "#F59E0B";
        ctx.beginPath();
        ctx.roundRect(-14, -14, 28, 28, 8);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const icon =
          pu.type === "multiball"
            ? "⚡"
            : pu.type === "laser"
            ? "🚀"
            : pu.type === "wide"
            ? "↔"
            : "🥕";
        ctx.fillText(icon, 0, 0);

        ctx.restore();

        // Paddle collects power-up
        const p = paddle.current;
        if (
          pu.y >= p.y - 14 &&
          pu.y <= p.y + p.h &&
          pu.x >= p.x - p.w / 2 - 10 &&
          pu.x <= p.x + p.w / 2 + 10
        ) {
          pu.collected = true;
          arcadeAudio.playCoin();
          if (pu.type === "multiball") {
            // Duplicate balls
            const activeBalls = balls.current.filter((b) => b.alive);
            activeBalls.forEach((ab) => {
              balls.current.push({
                x: ab.x,
                y: ab.y,
                vx: -ab.vx,
                vy: ab.vy,
                radius: 8,
                alive: true,
              });
            });
          } else if (pu.type === "wide") {
            p.w = 170; // Widen paddle
          } else if (pu.type === "carrot") {
            setCarrotsEarned((c) => c + 3);
            setScore((s) => s + 50);
          }
        }
      });

      // 3. Update & Draw Lasers
      lasersRef.current.forEach((l, lIdx) => {
        if (gameState === "playing") l.y += l.vy;
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(l.x - 2, l.y - 12, 4, 12);

        // Laser hits brick
        bricksRef.current.forEach((b) => {
          if (!b.alive) return;
          if (l.x > b.x && l.x < b.x + b.w && l.y > b.y && l.y < b.y + b.h) {
            lasersRef.current.splice(lIdx, 1);
            b.hp--;
            if (b.hp <= 0) b.alive = false;
            arcadeAudio.playImpact();
          }
        });
      });

      // 4. Update Balls & Collisions
      if (gameState === "playing") {
        const p = paddle.current;

        balls.current.forEach((ball) => {
          if (!ball.alive) return;

          ball.x += ball.vx;
          ball.y += ball.vy;

          // Side wall bounce
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
            arcadeAudio.playBounce();
          } else if (ball.x + ball.radius >= width) {
            ball.x = width - ball.radius;
            ball.vx = -Math.abs(ball.vx);
            arcadeAudio.playBounce();
          }

          // Top wall bounce
          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
            arcadeAudio.playBounce();
          }

          // Paddle bounce with angle variation
          if (
            ball.y + ball.radius >= p.y &&
            ball.y - ball.radius <= p.y + p.h &&
            ball.x >= p.x - p.w / 2 &&
            ball.x <= p.x + p.w / 2
          ) {
            ball.y = p.y - ball.radius;
            const hitOffset = (ball.x - p.x) / (p.w / 2); // -1 to 1
            ball.vx = hitOffset * 7.5;
            ball.vy = -Math.max(4.5, Math.abs(ball.vy));
            arcadeAudio.playBounce();
          }

          // Brick collisions
          bricksRef.current.forEach((b) => {
            if (!b.alive) return;

            if (
              ball.x + ball.radius > b.x &&
              ball.x - ball.radius < b.x + b.w &&
              ball.y + ball.radius > b.y &&
              ball.y - ball.radius < b.y + b.h
            ) {
              ball.vy *= -1;
              b.hp--;

              if (b.hp <= 0) {
                b.alive = false;
                setScore((s) => s + 25);
                arcadeAudio.playImpact();

                // Drop power-up if assigned
                if (b.powerUp) {
                  powerUpsRef.current.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    vy: 2.2,
                    type: b.powerUp,
                    collected: false,
                  });
                }

                // Check if hit Answer Vault!
                if (b.isAnswerVault) {
                  if (b.isCorrect) {
                    arcadeAudio.playVictory();
                    setGameState("round_won");
                    setScore((s) => s + 250);
                    setCarrotsEarned((c) => c + 35);
                    setFeedback(
                      `¡BÓVEDA DEL SABER DESCIFRADA! Rompiste [${b.letter}]: "${b.optionText}". ${currentRound.explanation}`
                    );
                  } else {
                    arcadeAudio.playWrong();
                    shakeRef.current = 14;
                    setBallsLeft((l) => {
                      const nl = l - 1;
                      if (nl <= 0) {
                        setGameState("game_over");
                        setFeedback(
                          `¡Bóveda incorrecta! Rompiste [${b.letter}]: "${b.optionText}". La respuesta correcta era "${currentRound.correctAnswer}".`
                        );
                      } else {
                        setFeedback(`¡Distractor [${b.letter}] destruido! Te quedan ${nl} esferas para romper la bóveda correcta.`);
                      }
                      return Math.max(0, nl);
                    });
                  }
                }
              }
            }
          });

          // Ball falls below bottom
          if (ball.y > height + 20) {
            ball.alive = false;
          }
        });

        // Check if all balls lost
        const anyBallAlive = balls.current.some((b) => b.alive);
        if (!anyBallAlive) {
          arcadeAudio.playWrong();
          shakeRef.current = 12;
          setBallsLeft((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setGameState("game_over");
              setFeedback(
                `¡Perdiste todas las esferas doradas! La respuesta correcta era "${currentRound.correctAnswer}".`
              );
            } else {
              // Spawn new ball on paddle ready to launch
              balls.current = [
                {
                  x: paddle.current.x,
                  y: paddle.current.y - 15,
                  vx: 4,
                  vy: -5.5,
                  radius: 8,
                  alive: true,
                },
              ];
              setGameState("ready");
            }
            return Math.max(0, next);
          });
        }
      }

      // 5. Draw Paddle with Tuddy Commander
      const p = paddle.current;
      ctx.fillStyle = "#38BDF8";
      ctx.beginPath();
      ctx.roundRect(p.x - p.w / 2, p.y, p.w, p.h, 9);
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tuddy sitting in center of paddle
      drawTuddy(ctx, {
        x: p.x,
        y: p.y - 14,
        radius: 16,
        expression: gameState === "round_won" ? "happy" : gameState === "game_over" ? "dizzy" : "focused",
        pet,
      });

      // 6. Draw Balls
      balls.current.forEach((ball) => {
        if (!ball.alive) return;
        ctx.save();
        ctx.translate(ball.x, ball.y);
        const bGrad = ctx.createRadialGradient(0, -2, 2, 0, 0, ball.radius);
        bGrad.addColorStop(0, "#FEF08A");
        bGrad.addColorStop(0.7, "#F59E0B");
        bGrad.addColorStop(1, "#D97706");
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      });

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
                Arkanoid Breakout
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Brick Breaker 🧱⚡
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1.5 rounded-2xl border border-amber-500/40">
            <span className="text-sm">🟡</span>
            <span className="text-sm font-black text-amber-300">{ballsLeft} esferas</span>
          </div>
          <div className="flex items-center gap-1.5 bg-sky-500/20 px-3 py-1.5 rounded-2xl border border-sky-500/40">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-black text-sky-300">{score} pts</span>
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
              Bóveda del Conocimiento:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mueve la barra con el ratón/táctil • Rompe la bóveda [A, B, C o D] con la respuesta
        </div>
      </div>

      {/* Canvas */}
      <div
        onClick={launchBall}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-pointer"
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          className="w-full max-w-full h-auto touch-none"
        />

        {gameState === "ready" && (
          <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none">
            <div className="bg-slate-900/90 border border-amber-400 text-amber-300 px-5 py-2.5 rounded-2xl font-black text-sm shadow-xl animate-bounce">
              ¡Haz clic o toca para lanzar la esfera dorada! ⚡
            </div>
          </div>
        )}

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
                  <span>Reintentar Nivel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Answer Vaults Quick Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {bricksRef.current
          .filter((b) => b.isAnswerVault)
          .map((vault, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                vault.alive
                  ? "bg-slate-800/60 border-slate-700 text-slate-200"
                  : "bg-slate-800/20 border-slate-800 text-slate-500 line-through"
              }`}
            >
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                {vault.letter}
              </span>
              <span className="font-semibold line-clamp-2">{vault.optionText}</span>
            </div>
          ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner">
              🧱
            </div>
            <h3 className="text-2xl font-black text-white">¡Muro del Conocimiento Destruido!</h3>
            <p className="text-xs text-slate-300">
              Has roto todas las defensas y descifrado las bóvedas en <strong className="text-amber-300">{topic}</strong>.
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
