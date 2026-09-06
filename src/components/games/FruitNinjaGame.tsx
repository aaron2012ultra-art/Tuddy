import React, { useRef, useEffect, useState, useCallback } from "react";
import { PetCustomization } from "../../types";
import { drawTuddy } from "./TuddyCanvasDraw";
import { arcadeAudio } from "./ArcadeAudio";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, HelpCircle, Swords } from "lucide-react";

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

interface FlyingItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  text: string;
  isCorrect: boolean;
  isBomb: boolean;
  sliced: boolean;
  sliceX?: number;
  sliceY?: number;
  type: "carrot" | "scroll" | "bomb";
  radius: number;
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
  const [gameState, setGameState] = useState<"playing" | "round_won" | "bomb_hit">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `Corta el concepto exacto que define ${topic}:`,
    options: ["Concepto Correcto", "Distractor Falso A", "Distractor Falso B"],
    correctAnswer: "Concepto Correcto",
    explanation: `Este concepto es el único riguroso para ${topic}.`,
  };

  const itemsRef = useRef<FlyingItem[]>([]);
  const swipeTrailRef = useRef<SwipePoint[]>([]);
  const isSwipingRef = useRef(false);
  const animRef = useRef<number | null>(null);
  const nextSpawnTime = useRef(0);

  const initRound = useCallback(() => {
    itemsRef.current = [];
    swipeTrailRef.current = [];
    setGameState("playing");
    setFeedback(null);
  }, []);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Pointer event listeners for katana slicing trail
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

    // Limit trail length
    if (swipeTrailRef.current.length > 18) swipeTrailRef.current.shift();

    // Check collision with flying items
    itemsRef.current.forEach((item) => {
      if (item.sliced) return;
      const dist = Math.hypot(x - item.x, y - item.y);
      if (dist < item.radius + 15) {
        // SLICE!
        item.sliced = true;
        item.sliceX = x;
        item.sliceY = y;
        arcadeAudio.playSlice();

        if (item.isBomb) {
          // Sliced a bomb!
          arcadeAudio.playImpact();
          setGameState("bomb_hit");
          setFeedback(`¡Cortaste una Falacia/Bomba! La respuesta correcta era "${currentRound.correctAnswer}".`);
        } else if (item.isCorrect) {
          // Sliced the correct answer!
          arcadeAudio.playVictory();
          setScore((s) => s + 150);
          setCarrotsEarned((c) => c + 30);
          setGameState("round_won");
          setFeedback(`¡CORTE PERFECTO! Rebanaste el concepto exacto: "${item.text}". ${currentRound.explanation}`);
        } else {
          // Sliced wrong concept
          arcadeAudio.playWrong();
          setScore((s) => Math.max(0, s - 20));
        }
      }
    });
  };

  const handlePointerUp = () => {
    isSwipingRef.current = false;
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  // Main canvas animation
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

      // Dark Dojo wooden background
      const dojoGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width / 1.5);
      dojoGrad.addColorStop(0, "#292524");
      dojoGrad.addColorStop(1, "#0C0A09");
      ctx.fillStyle = dojoGrad;
      ctx.fillRect(0, 0, width, height);

      // Dojo wooden planks
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 1. Spawner
      const now = Date.now();
      if (gameState === "playing" && now > nextSpawnTime.current) {
        nextSpawnTime.current = now + 1200 + Math.random() * 800;

        // Pick one option or bomb
        const isBomb = Math.random() < 0.25;
        const optIdx = Math.floor(Math.random() * currentRound.options.length);
        const optText = currentRound.options[optIdx];
        const isCorrect = optText === currentRound.correctAnswer;

        const spawnX = 140 + Math.random() * (width - 280);
        const targetVx = (width / 2 - spawnX) * 0.007 + (Math.random() - 0.5) * 2;
        const targetVy = -12 - Math.random() * 4;

        itemsRef.current.push({
          id: Math.random(),
          x: spawnX,
          y: height + 40,
          vx: targetVx,
          vy: targetVy,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.08,
          text: isBomb ? "💣 FALACIA" : optText,
          isCorrect: !isBomb && isCorrect,
          isBomb,
          sliced: false,
          type: isBomb ? "bomb" : isCorrect ? "carrot" : "scroll",
          radius: isBomb ? 26 : 40,
        });
      }

      // 2. Update and Draw Flying Items
      itemsRef.current.forEach((item, idx) => {
        item.x += item.vx;
        item.y += item.vy;
        item.vy += 0.32; // Gravity
        item.rotation += item.vRot;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.sliced) {
          // Half 1
          ctx.save();
          ctx.translate(-15, 0);
          ctx.fillStyle = item.isBomb ? "#EF4444" : "#F97316";
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI);
          ctx.fill();
          ctx.restore();

          // Half 2
          ctx.save();
          ctx.translate(15, 0);
          ctx.fillStyle = item.isBomb ? "#EF4444" : "#F97316";
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, Math.PI, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          if (item.type === "bomb") {
            // Bomb orb
            ctx.fillStyle = "#18181B";
            ctx.beginPath();
            ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#EF4444";
            ctx.lineWidth = 3;
            ctx.stroke();

            // Fuse
            ctx.fillStyle = "#F59E0B";
            ctx.fillRect(-3, -item.radius - 8, 6, 8);
            ctx.fillStyle = "#EF4444";
            ctx.beginPath();
            ctx.arc(0, -item.radius - 10, 4, 0, Math.PI * 2);
            ctx.fill();

            // Skull or bomb mark
            ctx.fillStyle = "#EF4444";
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("💣", 0, 6);
          } else {
            // Study Carrot or Ancient Knowledge Scroll
            const itemGrad = ctx.createRadialGradient(0, -6, 4, 0, 0, item.radius);
            if (item.type === "carrot") {
              itemGrad.addColorStop(0, "#FDBA74");
              itemGrad.addColorStop(0.7, "#F97316");
              itemGrad.addColorStop(1, "#C2410C");
            } else {
              itemGrad.addColorStop(0, "#FEF08A");
              itemGrad.addColorStop(0.7, "#EAB308");
              itemGrad.addColorStop(1, "#CA8A04");
            }

            ctx.fillStyle = itemGrad;
            ctx.beginPath();
            ctx.roundRect(-item.radius * 1.5, -item.radius * 0.7, item.radius * 3, item.radius * 1.4, 18);
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Concept Text on Item
            ctx.fillStyle = "#0F172A";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(item.text.slice(0, 22), 0, 0);
          }
        }

        ctx.restore();

        // Clean up fell items
        if (item.y > height + 80) itemsRef.current.splice(idx, 1);
      });

      // 3. Draw Katana Swipe Trail
      const trail = swipeTrailRef.current;
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = "#38BDF8";
        ctx.shadowColor = "#38BDF8";
        ctx.shadowBlur = 14;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.stroke();

        // Inner glowing white core
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw Ninja Sensei Tuddy in bottom corner
      drawTuddy(ctx, {
        x: 80,
        y: height - 55,
        radius: 28,
        expression: gameState === "round_won" ? "happy" : gameState === "bomb_hit" ? "dizzy" : "focused",
        pet,
      });

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
                Fruit Ninja Arcade
              </span>
              <span className="text-xs text-rose-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Ninja Slicer: Corta-Saber 🥷
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
      <div className="bg-rose-950/40 rounded-2xl p-4 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión Ninja:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-rose-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Corta el concepto verdadero • ¡NO cortes las bombas! 🗡️
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
              <span className="text-3xl">{gameState === "round_won" ? "⚔️" : "💥"}</span>
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
                  <span>Reintentar Corte</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-4xl shadow-inner">
              🥷
            </div>
            <h3 className="text-2xl font-black text-white">¡Maestro Ninja del Conocimiento!</h3>
            <p className="text-xs text-slate-300">
              Has cortado todas las respuestas correctas de <strong className="text-rose-300">{topic}</strong> sin caer en las bombas de distracción.
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
