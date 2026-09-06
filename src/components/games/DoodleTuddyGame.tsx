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

interface DoodleTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  isCorrect: boolean;
  broken: boolean;
  type: "normal" | "spring" | "answer";
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
  const [gameState, setGameState] = useState<"playing" | "round_won" | "fallen">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Qué fundamento eleva el conocimiento en ${topic}?`,
    options: ["Fundamento Real", "Error Conceptual A", "Error Conceptual B"],
    correctAnswer: "Fundamento Real",
    explanation: `Este fundamento eleva la precisión de todo el estudio de ${topic}.`,
  };

  const tuddy = useRef({
    x: 240,
    y: 400,
    vx: 0,
    vy: -10,
    radius: 18,
  });

  const platformsRef = useRef<Platform[]>([]);
  const animRef = useRef<number | null>(null);
  const keysPressed = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const initRound = useCallback(() => {
    tuddy.current = {
      x: 240,
      y: 400,
      vx: 0,
      vy: -10,
      radius: 18,
    };

    const plats: Platform[] = [
      { x: 180, y: 500, w: 120, h: 18, text: "Base", isCorrect: false, broken: false, type: "normal" },
      { x: 80, y: 390, w: 110, h: 18, text: "Impulso", isCorrect: false, broken: false, type: "spring" },
      { x: 290, y: 290, w: 110, h: 18, text: "Salto", isCorrect: false, broken: false, type: "normal" },
    ];

    // Shuffle options across answer platforms
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C"];
    opts.forEach((opt, idx) => {
      const isCorrect = opt === currentRound.correctAnswer;
      plats.push({
        x: 35 + idx * 145,
        y: 130 - (idx % 2) * 30,
        w: 135,
        h: 30,
        text: `[${letters[idx]}] ${opt}`,
        isCorrect,
        broken: false,
        type: "answer",
      });
    });

    platformsRef.current = plats;
    setGameState("playing");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Controls
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

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const scaleX = canvasRef.current.width / rect.width;
    tuddy.current.x = (clientX - rect.left) * scaleX;
  };

  // Main canvas loop
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

      // Graph paper notebook background (Doodle Jump style!)
      ctx.fillStyle = "#FDFBF7";
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = "#E2E8F0";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Physics update
      if (gameState === "playing") {
        if (keysPressed.current.left) tuddy.current.x -= 6;
        if (keysPressed.current.right) tuddy.current.x += 6;

        // Wrap around screen edges
        if (tuddy.current.x < 0) tuddy.current.x = width;
        if (tuddy.current.x > width) tuddy.current.x = 0;

        tuddy.current.vy += 0.38; // gravity
        tuddy.current.y += tuddy.current.vy;

        // Check bounce on platforms (only when falling down)
        if (tuddy.current.vy > 0) {
          platformsRef.current.forEach((p) => {
            if (p.broken) return;
            if (
              tuddy.current.x + tuddy.current.radius > p.x &&
              tuddy.current.x - tuddy.current.radius < p.x + p.w &&
              tuddy.current.y + tuddy.current.radius >= p.y &&
              tuddy.current.y + tuddy.current.radius <= p.y + p.h + 10
            ) {
              // Bounced on platform!
              if (p.type === "spring") {
                tuddy.current.vy = -14;
                arcadeAudio.playLaunch();
              } else if (p.type === "answer") {
                if (p.isCorrect) {
                  // Reached and bounced on correct answer platform!
                  tuddy.current.vy = -15;
                  arcadeAudio.playVictory();
                  setGameState("round_won");
                  setScore((s) => s + 150);
                  setCarrotsEarned((c) => c + 25);
                  setFeedback(`¡CIMA ALCANZADA! Aterrizaste en el fundamento correcto: "${p.text}". ${currentRound.explanation}`);
                } else {
                  // Landed on fake/distractor platform, breaks under Tuddy!
                  p.broken = true;
                  arcadeAudio.playWrong();
                  tuddy.current.vy = 2;
                }
              } else {
                tuddy.current.vy = -10.5;
                arcadeAudio.playBounce();
              }
            }
          });
        }

        // Fallen down bottom
        if (tuddy.current.y > height + 40) {
          setGameState("fallen");
          setFeedback(`¡Tuddy cayó al vacío! Debías impulsarte hacia "${currentRound.correctAnswer}".`);
          arcadeAudio.playWrong();
        }
      }

      // Draw Platforms
      platformsRef.current.forEach((p) => {
        if (p.broken) return;

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === "answer") {
          // Glow answer banner: neutral indigo so answer is not revealed before jumping!
          const isSelectedWon = gameState === "round_won" && p.isCorrect;
          ctx.fillStyle = isSelectedWon ? "#10B981" : "#6366F1";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 8);
          ctx.fill();
          ctx.strokeStyle = isSelectedWon ? "#34D399" : "#A5B4FC";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(p.text.slice(0, 18), p.w / 2, p.h / 2 + 4);
        } else if (p.type === "spring") {
          ctx.fillStyle = "#38BDF8";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 6);
          ctx.fill();
          ctx.strokeStyle = "#0284C7";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Spring coil
          ctx.fillStyle = "#F59E0B";
          ctx.fillRect(p.w / 2 - 10, -8, 20, 8);
        } else {
          ctx.fillStyle = "#84CC16";
          ctx.beginPath();
          ctx.roundRect(0, 0, p.w, p.h, 6);
          ctx.fill();
          ctx.strokeStyle = "#4D7C0F";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw Tuddy Jumper
      drawTuddy(ctx, {
        x: tuddy.current.x,
        y: tuddy.current.y,
        radius: 20,
        expression: gameState === "round_won" ? "happy" : gameState === "fallen" ? "dizzy" : "flying",
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
    <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 text-white max-w-5xl mx-auto shadow-2xl border-4 border-lime-500/30 flex flex-col gap-4 select-none">
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
              <span className="text-[10px] font-black uppercase tracking-wider bg-lime-500 text-slate-950 px-2 py-0.5 rounded-full">
                Doodle Jump Arcade
              </span>
              <span className="text-xs text-lime-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Doodle Tuddy: Salto a la Cima 🦘
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
      <div className="bg-lime-950/40 rounded-2xl p-4 border border-lime-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-lime-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión de Altura:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-lime-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Mueve a Tuddy a la plataforma con la respuesta correcta 🦘
        </div>
      </div>

      {/* Canvas */}
      <div
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-white shadow-2xl flex justify-center max-w-lg mx-auto"
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={540}
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
              <span className="text-3xl">{gameState === "round_won" ? "🏔️" : "💥"}</span>
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

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-lime-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-lime-500/20 border-2 border-lime-400 flex items-center justify-center text-4xl shadow-inner">
              🦘
            </div>
            <h3 className="text-2xl font-black text-white">¡Cima Alcanzada con Éxito!</h3>
            <p className="text-xs text-slate-300">
              Has saltado sobre todas las plataformas verdaderas de <strong className="text-lime-300">{topic}</strong> con Tuddy.
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
