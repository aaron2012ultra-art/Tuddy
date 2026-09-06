import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle, Flame, Zap } from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface GenericArcadeEngineProps {
  gameId: string;
  gameTitle: string;
  gameCategory: string;
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

export const GenericArcadeEngine: React.FC<GenericArcadeEngineProps> = ({
  gameId,
  gameTitle,
  gameCategory,
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
  const [gameState, setGameState] = useState<"playing" | "round_won" | "lost">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el axioma clave en ${topic}?`,
    options: ["Opción Correcta", "Distractor 1", "Distractor 2"],
    correctAnswer: "Opción Correcta",
    explanation: `Este principio es fundamental en ${subject}.`,
  };

  // Generic Game state storage
  const stateRef = useRef({
    // Player pos
    x: 400,
    y: 380,
    vx: 0,
    vy: 0,
    angle: 0,
    // Secondary entities (projectiles, enemies, notes, targets)
    entities: [] as Array<{
      x: number;
      y: number;
      vx?: number;
      vy?: number;
      text?: string;
      isCorrect?: boolean;
      active?: boolean;
      hp?: number;
      type?: string;
    }>,
    snakeBody: [] as Array<{ x: number; y: number }>,
    snakeDir: { x: 1, y: 0 },
    lastTick: 0,
    rhythmTracks: [180, 320, 460, 600],
    bossHp: 100,
    tuddyHp: 100,
  });

  const animRef = useRef<number | null>(null);

  // Initialize Game Logic based on gameId
  const initGame = useCallback(() => {
    const s = stateRef.current;
    s.x = 400;
    s.y = 380;
    s.vx = 0;
    s.vy = 0;
    s.angle = 0;
    s.entities = [];
    s.bossHp = 100;
    s.tuddyHp = 100;

    if (gameId === "tuddy_snake") {
      s.snakeBody = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      s.snakeDir = { x: 1, y: 0 };
      // Spawn answer food pellets
      currentRound.options.forEach((opt, idx) => {
        s.entities.push({
          x: 4 + idx * 5,
          y: 4 + (idx % 2) * 6,
          text: opt,
          isCorrect: opt === currentRound.correctAnswer,
          active: true,
        });
      });
    } else if (gameId === "bubble_tuddy") {
      // Bubble rows at top
      currentRound.options.forEach((opt, idx) => {
        s.entities.push({
          x: 180 + idx * 140,
          y: 80,
          text: opt,
          isCorrect: opt === currentRound.correctAnswer,
          active: true,
          type: "bubble",
        });
      });
    } else if (gameId === "tuddy_pong") {
      s.x = 80; // Player paddle X
      s.y = 240; // Player paddle Y
      s.entities = [
        { x: 400, y: 240, vx: 5, vy: 3, type: "ball" },
        { x: 740, y: 240, type: "enemy_paddle" },
      ];
    } else if (gameId === "whack_a_tuddy") {
      // 6 holes with popping options
      currentRound.options.forEach((opt, idx) => {
        s.entities.push({
          x: 200 + (idx % 3) * 200,
          y: 160 + Math.floor(idx / 3) * 160,
          text: opt,
          isCorrect: opt === currentRound.correctAnswer,
          active: true,
        });
      });
    } else if (gameId === "tuddy_titan_brawler") {
      s.x = 240;
      s.y = 350;
      s.entities = [{ x: 580, y: 350, type: "boss", hp: 100 }];
    } else {
      // General arcade fallback (Kart, Asteroids, Super Tuddy, etc.)
      currentRound.options.forEach((opt, idx) => {
        s.entities.push({
          x: 180 + idx * 180,
          y: 120,
          vx: (Math.random() - 0.5) * 2,
          vy: 0,
          text: opt,
          isCorrect: opt === currentRound.correctAnswer,
          active: true,
        });
      });
    }

    setGameState("playing");
    setFeedback(null);
  }, [gameId, currentRound]);

  useEffect(() => {
    initGame();
  }, [currentRoundIdx, initGame]);

  // General click/tap interaction depending on game
  const handleAction = (param?: any) => {
    if (gameState !== "playing") return;
    const s = stateRef.current;

    if (gameId === "bubble_tuddy") {
      // Shoot bubble upwards
      s.entities.push({
        x: s.x,
        y: s.y - 20,
        vy: -9,
        type: "projectile",
      });
      arcadeAudio.playLaunch();
    } else if (gameId === "tuddy_titan_brawler") {
      // Attack boss!
      arcadeAudio.playImpact();
      s.bossHp = Math.max(0, s.bossHp - 25);
      if (s.bossHp <= 0) {
        arcadeAudio.playVictory();
        setGameState("round_won");
        setScore((sc) => sc + 180);
        setCarrotsEarned((c) => c + 35);
        setFeedback(`¡K.O.! Has derrotado al Titán demostrando: "${currentRound.correctAnswer}". ${currentRound.explanation}`);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (gameId === "tuddy_snake") {
        if (e.code === "ArrowUp" && s.snakeDir.y === 0) s.snakeDir = { x: 0, y: -1 };
        if (e.code === "ArrowDown" && s.snakeDir.y === 0) s.snakeDir = { x: 0, y: 1 };
        if (e.code === "ArrowLeft" && s.snakeDir.x === 0) s.snakeDir = { x: -1, y: 0 };
        if (e.code === "ArrowRight" && s.snakeDir.x === 0) s.snakeDir = { x: 1, y: 0 };
      } else {
        if (e.code === "ArrowLeft" || e.code === "KeyA") s.x = Math.max(60, s.x - 20);
        if (e.code === "ArrowRight" || e.code === "KeyD") s.x = Math.min(740, s.x + 20);
        if (e.code === "ArrowUp" || e.code === "KeyW") s.y = Math.max(60, s.y - 20);
        if (e.code === "ArrowDown" || e.code === "KeyS") s.y = Math.min(420, s.y + 20);
        if (e.code === "Space") {
          e.preventDefault();
          handleAction();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gameId]);

  // Click on target items (Whack a mole, or direct click on option cards)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || gameState !== "playing") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvasRef.current.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvasRef.current.height;

    const s = stateRef.current;

    // Check hit on entities
    s.entities.forEach((item) => {
      if (!item.active || !item.text) return;
      const dist = Math.hypot(clickX - item.x, clickY - item.y);
      if (dist < 45) {
        // Clicked entity!
        arcadeAudio.playImpact();
        if (item.isCorrect) {
          arcadeAudio.playVictory();
          setGameState("round_won");
          setScore((sc) => sc + 150);
          setCarrotsEarned((c) => c + 30);
          setFeedback(`¡ACIERTO TOTAL! Elegiste correctamente: "${item.text}". ${currentRound.explanation}`);
        } else {
          arcadeAudio.playWrong();
          setGameState("lost");
          setFeedback(`¡Error! Elegiste "${item.text}". La respuesta correcta era "${currentRound.correctAnswer}".`);
        }
      }
    });

    handleAction();
  };

  // Main Canvas Render Loop
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
      const s = stateRef.current;

      // Arcade Retro Cyber Grid Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#0F172A");
      bgGrad.addColorStop(1, "#020617");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Snake Mode
      if (gameId === "tuddy_snake") {
        const cellSize = 22;
        const now = Date.now();
        if (now - s.lastTick > 140 && gameState === "playing") {
          s.lastTick = now;
          const head = s.snakeBody[0];
          const newHead = { x: head.x + s.snakeDir.x, y: head.y + s.snakeDir.y };

          // Wall collision
          if (newHead.x < 0 || newHead.x > 32 || newHead.y < 0 || newHead.y > 18) {
            setGameState("lost");
            arcadeAudio.playWrong();
            setFeedback(`¡Tuddy chocó con el borde! La respuesta correcta era "${currentRound.correctAnswer}".`);
          } else {
            s.snakeBody.unshift(newHead);

            // Check eating target
            let ate = false;
            s.entities.forEach((item) => {
              if (item.active && Math.abs(newHead.x - item.x) < 2 && Math.abs(newHead.y - item.y) < 2) {
                ate = true;
                item.active = false;
                if (item.isCorrect) {
                  arcadeAudio.playVictory();
                  setGameState("round_won");
                  setScore((sc) => sc + 160);
                  setCarrotsEarned((c) => c + 30);
                  setFeedback(`¡DELICIOSA RESPUESTA! Tuddy devoró: "${item.text}". ${currentRound.explanation}`);
                } else {
                  arcadeAudio.playWrong();
                  setGameState("lost");
                  setFeedback(`¡Respuesta errónea! Comiste "${item.text}". La respuesta correcta era "${currentRound.correctAnswer}".`);
                }
              }
            });

            if (!ate) s.snakeBody.pop();
          }
        }

        // Draw Snake
        s.snakeBody.forEach((seg, idx) => {
          if (idx === 0) {
            drawTuddy(ctx, {
              x: seg.x * cellSize + 11,
              y: seg.y * cellSize + 11,
              radius: 12,
              expression: "happy",
              pet,
            });
          } else {
            ctx.fillStyle = "#F97316";
            ctx.beginPath();
            ctx.arc(seg.x * cellSize + 11, seg.y * cellSize + 11, 8, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw food letters
        s.entities.forEach((item) => {
          if (!item.active) return;
          ctx.fillStyle = item.isCorrect ? "#10B981" : "#F59E0B";
          ctx.beginPath();
          ctx.arc(item.x * cellSize + 11, item.y * cellSize + 11, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText((item.text || "").slice(0, 10), item.x * cellSize + 11, item.y * cellSize + 15);
        });
      } else if (gameId === "tuddy_titan_brawler") {
        // Health bars
        ctx.fillStyle = "#EF4444";
        ctx.fillRect(width / 2 + 50, 40, (s.bossHp / 100) * 260, 20);
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeRect(width / 2 + 50, 40, 260, 20);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`TITÁN DE ${subject.toUpperCase()}: ${s.bossHp}%`, width / 2 + 50, 32);

        // Draw Boss Monster
        ctx.fillStyle = "#DC2626";
        ctx.beginPath();
        ctx.arc(580, 340, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("👹", 568, 348);

        // Draw Tuddy Brawler
        drawTuddy(ctx, {
          x: s.x,
          y: s.y,
          radius: 30,
          expression: "focused",
          pet,
        });

        // Click to attack prompt
        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡PULSA EN EL TITÁN PARA ASIGNAR EL GOLPE DE CONOCIMIENTO!", width / 2, height - 30);
      } else {
        // Draw General Option Targets / Cards
        s.entities.forEach((item) => {
          if (!item.active || !item.text) return;

          ctx.save();
          ctx.translate(item.x, item.y);

          // Card box
          ctx.fillStyle = item.isCorrect ? "#065F46" : "#1E293B";
          ctx.strokeStyle = item.isCorrect ? "#10B981" : "#64748B";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(-75, -28, 150, 56, 12);
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.text.slice(0, 18), 0, 4);

          ctx.restore();
        });

        // Draw Tuddy Hero
        drawTuddy(ctx, {
          x: s.x,
          y: s.y,
          radius: 26,
          expression: gameState === "round_won" ? "happy" : gameState === "lost" ? "dizzy" : "normal",
          pet,
        });
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, gameId, pet, currentRound]);

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
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500 text-slate-950 px-2 py-0.5 rounded-full">
                {gameCategory}
              </span>
              <span className="text-xs text-sky-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              {gameTitle} 🕹️
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
      <div className="bg-sky-950/40 rounded-2xl p-4 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión Arcade:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-sky-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Toca la respuesta correcta o usa las flechas 🕹️
        </div>
      </div>

      {/* Interactive Canvas */}
      <div
        onClick={handleCanvasClick}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-pointer"
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
                    initGame();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-sky-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-4xl shadow-inner">
              🎮
            </div>
            <h3 className="text-2xl font-black text-white">¡Nivel Arcade Completado!</h3>
            <p className="text-xs text-slate-300">
              Has superado todos los desafíos de <strong className="text-sky-300">{topic}</strong> en {gameTitle}.
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
