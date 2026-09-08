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
  Swords,
  XCircle,
} from "lucide-react";

interface RoundData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface FruitNinjaGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface FlyingFruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  letter: string;
  text: string;
  isCorrect: boolean;
  fruitType: "watermelon" | "orange" | "apple" | "golden_carrot";
  sliced: boolean;
  sliceX?: number;
  sliceY?: number;
  radius: number;
}

interface JuiceSplatter {
  x: number;
  y: number;
  color: string;
  radius: number;
  alpha: number;
}

interface SwipePoint {
  x: number;
  y: number;
  time: number;
}

export const FruitNinjaGame: React.FC<FruitNinjaGameProps> = ({
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
  const [strikes, setStrikes] = useState(0); // 3 strikes like classic Fruit Ninja
  const [gameState, setGameState] = useState<"playing" | "round_won" | "game_over">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `Corta el fruto con el concepto que define ${topic}:`,
    options: ["Fundamento comprobado", "Aproximación empírica", "Hipótesis alternativa"],
    correctAnswer: "Fundamento comprobado",
    explanation: `Este concepto es el único riguroso y verificado para ${topic}.`,
  };

  const fruitsRef = useRef<FlyingFruit[]>([]);
  const splattersRef = useRef<JuiceSplatter[]>([]);
  const swipeTrailRef = useRef<SwipePoint[]>([]);
  const isSwipingRef = useRef(false);
  const animRef = useRef<number | null>(null);
  const nextWaveTime = useRef(0);
  const shakeRef = useRef(0);

  // Initialize Round: spawns waves of fruits
  const initRound = useCallback(() => {
    fruitsRef.current = [];
    splattersRef.current = [];
    swipeTrailRef.current = [];
    setStrikes(0);
    setGameState("playing");
    setFeedback(null);
    nextWaveTime.current = Date.now() + 600; // Launch initial wave quickly
  }, []);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Slicing handlers
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isSwipingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    swipeTrailRef.current = [{ x, y, time: Date.now() }];
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSwipingRef.current || gameState !== "playing") return;
    const { x, y } = getCanvasCoords(e);
    const now = Date.now();
    swipeTrailRef.current.push({ x, y, time: now });

    if (swipeTrailRef.current.length > 20) swipeTrailRef.current.shift();

    // Check katana slice on fruits
    fruitsRef.current.forEach((fruit) => {
      if (fruit.sliced) return;
      const dist = Math.hypot(x - fruit.x, y - fruit.y);
      if (dist < fruit.radius + 18) {
        fruit.sliced = true;
        fruit.sliceX = x;
        fruit.sliceY = y;
        arcadeAudio.playSlice();

        // Splatter juice on dojo wall
        const juiceColors = {
          watermelon: "#EF4444",
          orange: "#F97316",
          apple: "#10B981",
          golden_carrot: "#F59E0B",
        };
        for (let i = 0; i < 6; i++) {
          splattersRef.current.push({
            x: fruit.x + (Math.random() - 0.5) * 40,
            y: fruit.y + (Math.random() - 0.5) * 40,
            color: juiceColors[fruit.fruitType],
            radius: 8 + Math.random() * 14,
            alpha: 0.65,
          });
        }

        if (fruit.isCorrect) {
          // Master slice on correct concept!
          arcadeAudio.playVictory();
          setScore((s) => s + 250);
          setCarrotsEarned((c) => c + 35);
          setGameState("round_won");
          setFeedback(
            `¡CORTE LEGENDARIO! Has rebanado [${fruit.letter}]: "${fruit.text}". ${currentRound.explanation}`
          );
        } else {
          // Sliced a distractor
          arcadeAudio.playWrong();
          shakeRef.current = 12;
          setStrikes((prev) => {
            const next = prev + 1;
            if (next >= 3) {
              setGameState("game_over");
              setFeedback(
                `¡3 Strikes alcanzados! Rebanaste distractores. La respuesta correcta era "${currentRound.correctAnswer}".`
              );
            } else {
              setFeedback(`¡Cuidado! Rebanaste el distractor [${fruit.letter}]. Llevas ${next}/3 faltas.`);
            }
            return next;
          });
        }
      }
    });
  };

  const handlePointerUp = () => {
    isSwipingRef.current = false;
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

      // 1. Dojo Wooden Wall
      const dojoGrad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, width / 1.3);
      dojoGrad.addColorStop(0, "#292524");
      dojoGrad.addColorStop(1, "#0C0A09");
      ctx.fillStyle = dojoGrad;
      ctx.fillRect(0, 0, width, height);

      // Wooden wall planks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1.5;
      for (let y = 0; y < height; y += 42) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Persistent Juice Splatters on Dojo Wall
      splattersRef.current.forEach((sp) => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. Wave Spawner: launches options together in an authentic Fruit Ninja arc!
      const now = Date.now();
      if (gameState === "playing" && now > nextWaveTime.current) {
        nextWaveTime.current = now + 3400; // Next wave interval

        // Prepare wave with all options [A], [B], [C]
        const letters = ["A", "B", "C", "D"];
        const fruitTypes: Array<"watermelon" | "orange" | "apple" | "golden_carrot"> = [
          "watermelon",
          "orange",
          "apple",
          "golden_carrot",
        ];

        currentRound.options.forEach((opt, idx) => {
          const spawnX = 180 + idx * 180 + (Math.random() - 0.5) * 40;
          const targetVx = (width / 2 - spawnX) * 0.006 + (Math.random() - 0.5) * 2;
          const targetVy = -13.5 - Math.random() * 2.5;

          fruitsRef.current.push({
            id: Math.random(),
            x: spawnX,
            y: height + 35,
            vx: targetVx,
            vy: targetVy,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 0.06,
            letter: letters[idx],
            text: opt,
            isCorrect: opt === currentRound.correctAnswer,
            fruitType: fruitTypes[idx % fruitTypes.length],
            sliced: false,
            radius: 46,
          });
        });
      }

      // 4. Update and Draw Flying Fruits
      fruitsRef.current.forEach((fruit) => {
        fruit.x += fruit.vx;
        fruit.y += fruit.vy;
        fruit.vy += 0.31; // Gravity
        fruit.rotation += fruit.vRot;

        ctx.save();
        ctx.translate(fruit.x, fruit.y);
        ctx.rotate(fruit.rotation);

        if (fruit.sliced) {
          // Half 1
          ctx.save();
          ctx.translate(-18, 0);
          ctx.fillStyle = fruit.isCorrect ? "#10B981" : "#F97316";
          ctx.beginPath();
          ctx.arc(0, 0, fruit.radius * 0.85, Math.PI / 2, (Math.PI * 3) / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Half 2
          ctx.save();
          ctx.translate(18, 0);
          ctx.fillStyle = fruit.isCorrect ? "#10B981" : "#F97316";
          ctx.beginPath();
          ctx.arc(0, 0, fruit.radius * 0.85, -Math.PI / 2, Math.PI / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          // Whole Juicy Fruit - All fruits look deliciously polished with their letter badges
          const fGrad = ctx.createRadialGradient(-10, -10, 4, 0, 0, fruit.radius);
          if (fruit.fruitType === "watermelon") {
            fGrad.addColorStop(0, "#86EFAC");
            fGrad.addColorStop(0.7, "#15803D");
            fGrad.addColorStop(1, "#14532D");
          } else if (fruit.fruitType === "orange") {
            fGrad.addColorStop(0, "#FDE047");
            fGrad.addColorStop(0.7, "#EA580C");
            fGrad.addColorStop(1, "#9A3412");
          } else if (fruit.fruitType === "apple") {
            fGrad.addColorStop(0, "#FCA5A5");
            fGrad.addColorStop(0.7, "#DC2626");
            fGrad.addColorStop(1, "#7F1D1D");
          } else {
            fGrad.addColorStop(0, "#FEF08A");
            fGrad.addColorStop(0.7, "#F59E0B");
            fGrad.addColorStop(1, "#B45309");
          }

          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Letter Badge
          ctx.fillStyle = "#0F172A";
          ctx.beginPath();
          ctx.arc(0, -8, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#F59E0B";
          ctx.font = "black 16px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`[${fruit.letter}]`, 0, -8);

          // Option Text Plaque
          ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
          ctx.beginPath();
          ctx.roundRect(-42, 12, 84, 22, 6);
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(fruit.text.slice(0, 11), 0, 26);
        }
        ctx.restore();
      });

      // 5. Draw Glowing Katana Blade Trail
      const trail = swipeTrailRef.current;
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Tuddy Sensei in bottom corner
      drawTuddy(ctx, {
        x: 65,
        y: height - 55,
        radius: 26,
        expression: gameState === "round_won" ? "happy" : gameState === "game_over" ? "dizzy" : "focused",
        pet,
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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-rose-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                Fruit Ninja Dojo
              </span>
              <span className="text-xs text-rose-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Ninja: Corte de Sabiduría 🗡️🍉
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* 3 Strikes Display */}
          <div className="flex items-center gap-1.5 bg-rose-500/20 px-3 py-1.5 rounded-2xl border border-rose-500/40">
            <span className="text-xs font-bold text-rose-300">Faltas:</span>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`text-sm font-black ${
                  s <= strikes ? "text-rose-400" : "text-slate-600"
                }`}
              >
                ❌
              </span>
            ))}
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
      <div className="bg-rose-950/40 rounded-2xl p-4 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión del Dojo Ninja:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-rose-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Arrastra el dedo o ratón para cortar con la katana ⚔️
        </div>
      </div>

      {/* Canvas */}
      <div
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          className="w-full max-w-full h-auto"
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
                  <span>Reintentar Dojo</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Options Reference Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {currentRound.options.slice(0, 3).map((opt, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl border bg-slate-800/60 border-slate-700 text-slate-200 flex items-center gap-2.5"
          >
            <span className="w-6 h-6 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center shrink-0">
              {["A", "B", "C"][idx]}
            </span>
            <span className="font-semibold line-clamp-2">{opt}</span>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-4xl shadow-inner">
              🗡️
            </div>
            <h3 className="text-2xl font-black text-white">¡Maestría Ninja Alcanzada!</h3>
            <p className="text-xs text-slate-300">
              Has cortado con precisión milimétrica todos los conceptos en <strong className="text-rose-300">{topic}</strong>.
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
              className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
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
