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

interface FlappyTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface PortalGate {
  letter: string;
  optionText: string;
  isCorrect: boolean;
  minY: number;
  maxY: number;
  centerY: number;
}

interface GateWall {
  x: number;
  width: number;
  passed: boolean;
  portals: PortalGate[];
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
  const [gameState, setGameState] = useState<"ready" | "flying" | "crashed" | "round_won">("ready");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el axioma principal de ${topic}?`,
    options: ["Respuesta Verdadera", "Distractor 1", "Distractor 2"],
    correctAnswer: "Respuesta Verdadera",
    explanation: `Este principio es la base para comprender ${topic}.`,
  };

  // Tuddy Physics
  const tuddy = useRef({
    x: 140,
    y: 220,
    vy: 0,
    gravity: 0.36,
    flapStrength: -6.8,
    angle: 0,
  });

  const gateWallRef = useRef<GateWall | null>(null);
  const animRef = useRef<number | null>(null);

  // Initialize Portals for the current question: 3 vertical parallel tiers
  const initPipes = useCallback(() => {
    tuddy.current = {
      x: 140,
      y: 220,
      vy: 0,
      gravity: 0.36,
      flapStrength: -6.8,
      angle: 0,
    };

    // Shuffle options so they are randomly distributed across heights [A], [B], [C]
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C"];
    const portalH = 110;
    const spacing = 18; // divider beam height

    // 3 vertically accessible parallel portals at the SAME X distance
    // Portal A: High (y: 30 to 140)
    // Portal B: Mid  (y: 158 to 268)
    // Portal C: Low  (y: 286 to 396)
    const portals: PortalGate[] = opts.map((opt, idx) => {
      const minY = 30 + idx * (portalH + spacing);
      const maxY = minY + portalH;
      return {
        letter: letters[idx],
        optionText: opt,
        isCorrect: opt === currentRound.correctAnswer,
        minY,
        maxY,
        centerY: (minY + maxY) / 2,
      };
    });

    gateWallRef.current = {
      x: 740,
      width: 140,
      passed: false,
      portals,
    };

    setGameState("ready");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initPipes();
  }, [currentRoundIdx, initPipes]);

  // Flap jump
  const flap = useCallback(() => {
    if (gameState === "ready") {
      setGameState("flying");
      tuddy.current.vy = tuddy.current.flapStrength;
      arcadeAudio.playLaunch();
    } else if (gameState === "flying") {
      tuddy.current.vy = tuddy.current.flapStrength;
      arcadeAudio.playLaunch();
    }
  }, [gameState]);

  // Keyboard controls (Space / ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap]);

  // Canvas render loop
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

      // 1. Sky & Landscape
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#38BDF8"); // Light blue
      skyGrad.addColorStop(0.7, "#BAE6FD");
      skyGrad.addColorStop(1, "#86EFAC");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      [
        { x: 100, y: 80, r: 24 },
        { x: 130, y: 70, r: 32 },
        { x: 420, y: 110, r: 28 },
        { x: 455, y: 100, r: 38 },
        { x: 740, y: 75, r: 25 },
      ].forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Vertical Portals Wall
      const wall = gateWallRef.current;
      if (wall) {
        if (gameState === "flying") {
          wall.x -= 2.0;
        }

        // Draw structural vertical gate tower
        ctx.save();

        // Background dark frame behind portals
        ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
        ctx.fillRect(wall.x - 10, 20, wall.width + 20, groundY - 20);

        // Draw each portal tier
        wall.portals.forEach((portal) => {
          const isSelected = wall.passed && gameState === "round_won" && portal.isCorrect;
          const isWrongSelected = wall.passed && gameState === "crashed";

          // Aperture glow & frame
          ctx.fillStyle = isSelected
            ? "rgba(16, 185, 129, 0.45)"
            : isWrongSelected
            ? "rgba(239, 68, 68, 0.35)"
            : "rgba(15, 23, 42, 0.82)";

          ctx.strokeStyle = isSelected
            ? "#10B981"
            : isWrongSelected
            ? "#EF4444"
            : "#0284C7";
          ctx.lineWidth = 3;

          const pH = portal.maxY - portal.minY;
          ctx.beginPath();
          ctx.roundRect(wall.x, portal.minY, wall.width, pH, 12);
          ctx.fill();
          ctx.stroke();

          // Left and Right Energetic Pylons
          ctx.fillStyle = "#38BDF8";
          ctx.fillRect(wall.x - 6, portal.minY + 8, 6, pH - 16);
          ctx.fillRect(wall.x + wall.width, portal.minY + 8, 6, pH - 16);

          // Letter Badge Pill
          ctx.fillStyle = isSelected ? "#10B981" : "#F59E0B";
          ctx.beginPath();
          ctx.roundRect(wall.x + 10, portal.centerY - 22, 34, 44, 10);
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#0F172A";
          ctx.font = "bold 17px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(portal.letter, wall.x + 27, portal.centerY + 1);

          // Option text
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";

          // Split into 2 lines if needed
          const words = portal.optionText.split(" ");
          let line1 = "";
          let line2 = "";
          for (const w of words) {
            if ((line1 + " " + w).length < 18) line1 = (line1 + " " + w).trim();
            else line2 = (line2 + " " + w).trim();
          }

          if (line2) {
            ctx.fillText(line1, wall.x + 50, portal.centerY - 8);
            ctx.fillText(line2.slice(0, 18), wall.x + 50, portal.centerY + 10);
          } else {
            ctx.fillText(portal.optionText.slice(0, 19), wall.x + 50, portal.centerY);
          }
        });

        // Draw structural divider bars between portals
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#64748B";
        ctx.lineWidth = 2;
        // Divider 1 (between A and B)
        ctx.fillRect(wall.x - 8, 140, wall.width + 16, 18);
        ctx.strokeRect(wall.x - 8, 140, wall.width + 16, 18);
        // Divider 2 (between B and C)
        ctx.fillRect(wall.x - 8, 268, wall.width + 16, 18);
        ctx.strokeRect(wall.x - 8, 268, wall.width + 16, 18);

        ctx.restore();

        // Check Collision with Wall and Portals
        if (gameState === "flying") {
          const tuddyX = tuddy.current.x;
          const tuddyY = tuddy.current.y;
          const tuddyR = 18;

          // When Tuddy reaches the gate entrance
          if (tuddyX + tuddyR >= wall.x && tuddyX - tuddyR <= wall.x + wall.width) {
            // Check if colliding with divider beams
            const hitDivider1 = tuddyY + tuddyR > 140 && tuddyY - tuddyR < 158;
            const hitDivider2 = tuddyY + tuddyR > 268 && tuddyY - tuddyR < 286;

            if (hitDivider1 || hitDivider2) {
              setGameState("crashed");
              setFeedback("¡Tuddy rozó el divisor entre compuertas! Mantén la altura en el centro del portal.");
              arcadeAudio.playImpact();
            }
          }

          // Crossing through the portal midpoint
          if (!wall.passed && tuddyX > wall.x + wall.width * 0.4) {
            wall.passed = true;
            // Identify which portal Tuddy entered
            const entered = wall.portals.find((p) => tuddyY >= p.minY && tuddyY <= p.maxY);

            if (entered) {
              if (entered.isCorrect) {
                arcadeAudio.playVictory();
                setScore((s) => s + 150);
                setCarrotsEarned((c) => c + 25);
                setGameState("round_won");
                setFeedback(`¡PORTAL CORRECTO! Cruzaste [${entered.letter}]: "${entered.optionText}". ${currentRound.explanation}`);
              } else {
                arcadeAudio.playWrong();
                setGameState("crashed");
                setFeedback(`¡Compuerta incorrecta! Cruzaste [${entered.letter}]: "${entered.optionText}". La respuesta correcta era "${currentRound.correctAnswer}".`);
              }
            } else {
              setGameState("crashed");
              setFeedback("¡No atravesaste ninguna compuerta limpiamente! Inténtalo ajustando tu altitud.");
              arcadeAudio.playWrong();
            }
          }
        }
      }

      // 3. Ground
      ctx.fillStyle = "#16A34A";
      ctx.fillRect(0, groundY, width, 16);
      ctx.fillStyle = "#D97706";
      ctx.fillRect(0, groundY + 16, width, height - (groundY + 16));

      // 4. Update Tuddy Physics
      if (gameState === "flying") {
        tuddy.current.vy += tuddy.current.gravity;
        tuddy.current.y += tuddy.current.vy;
        tuddy.current.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, tuddy.current.vy * 0.08));

        // Ground crash
        if (tuddy.current.y >= groundY - 20) {
          tuddy.current.y = groundY - 20;
          setGameState("crashed");
          setFeedback("¡Tuddy cayó al suelo! Inténtalo de nuevo manteniendo la altura.");
          arcadeAudio.playWrong();
        }

        // Ceiling bound
        if (tuddy.current.y <= 24) {
          tuddy.current.y = 24;
          tuddy.current.vy = 0;
        }
      } else if (gameState === "ready") {
        // Gentle bobbing hover
        tuddy.current.y = 220 + Math.sin(Date.now() * 0.005) * 8;
        tuddy.current.angle = 0;
      }

      // 5. Draw Tuddy
      drawTuddy(ctx, {
        x: tuddy.current.x,
        y: tuddy.current.y,
        radius: 22,
        angle: tuddy.current.angle,
        expression:
          gameState === "round_won"
            ? "happy"
            : gameState === "crashed"
            ? "dizzy"
            : gameState === "flying"
            ? "flying"
            : "normal",
        pet,
      });

      // Prompt in ready state
      if (gameState === "ready") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(width / 2 - 160, height / 2 - 45, 320, 70);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("¡Haz clic o pulsa ESPACIO para volar!", width / 2, height / 2 - 15);
        ctx.fillStyle = "#FDE047";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("Cruza la puerta con la respuesta correcta 🚪✨", width / 2, height / 2 + 12);
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
                Flappy Bird Arcade
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
          Control: Clic / Barra Espaciadora 🚀
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
                    initPipes();
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

      {/* Completion */}
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
