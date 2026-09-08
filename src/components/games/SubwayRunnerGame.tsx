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
  ArrowUp,
  ArrowDown,
  Shield,
  Heart,
} from "lucide-react";

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

interface TrackItem {
  id: number;
  z: number;
  lane: number; // 0: Left, 1: Center, 2: Right
  type: "coin" | "hurdle" | "barrier_low";
  collected?: boolean;
}

interface OverheadSign {
  lane: number;
  letter: string;
  text: string;
  isCorrect: boolean;
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
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"running" | "round_won" | "crashed">("running");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el postulado principal de ${topic}?`,
    options: [
      `Fundamento principal de ${topic}`,
      `Modelo alternativo de aproximación`,
      `Principio complementario derivado`,
    ],
    correctAnswer: `Fundamento principal de ${topic}`,
    explanation: `Este principio es la base rigurosa demostrada para ${topic}.`,
  };

  // Player state: lane (0, 1, 2), jump, slide, invulnerability
  const player = useRef({
    lane: 1,
    visualX: 420,
    jumpY: 0,
    jumpVy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    invulnerableUntil: 0,
  });

  const gantryZ = useRef(1400); // Station Gantry starts further away for plenty of reaction time
  const signsRef = useRef<OverheadSign[]>([]);
  const itemsRef = useRef<TrackItem[]>([]);
  const animRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize round
  const initRound = useCallback(() => {
    player.current = {
      lane: 1,
      visualX: 420,
      jumpY: 0,
      jumpVy: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      invulnerableUntil: 0,
    };
    gantryZ.current = 1500;
    setLives(3);

    // Shuffle 3 options across lanes
    const opts = [...currentRound.options].slice(0, 3);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }

    const letters = ["A", "B", "C"];
    signsRef.current = opts.map((opt, idx) => ({
      lane: idx,
      letter: letters[idx],
      text: opt,
      isCorrect: opt === currentRound.correctAnswer,
    }));

    // Spawn track items along the subway
    const items: TrackItem[] = [];
    let itemId = 1;
    for (let z = 300; z < 1400; z += 120) {
      // Golden coins in random lanes
      const coinLane = Math.floor(Math.random() * 3);
      items.push({ id: itemId++, z, lane: coinLane, type: "coin" });

      // Occasional dodgeable hurdle (never in the correct lane right near the finish!)
      if (z % 240 === 0 && z < 1100) {
        const hurdleLane = (coinLane + 1) % 3;
        items.push({
          id: itemId++,
          z: z + 50,
          lane: hurdleLane,
          type: Math.random() > 0.5 ? "hurdle" : "barrier_low",
        });
      }
    }
    itemsRef.current = items;

    setGameState("running");
    setFeedback(null);
  }, [currentRound.options, currentRound.correctAnswer]);

  useEffect(() => {
    initRound();
  }, [currentRoundIdx, initRound]);

  // Actions
  const moveLeft = useCallback(() => {
    if (gameState !== "running") return;
    if (player.current.lane > 0) {
      player.current.lane -= 1;
      arcadeAudio.playBounce();
    }
  }, [gameState]);

  const moveRight = useCallback(() => {
    if (gameState !== "running") return;
    if (player.current.lane < 2) {
      player.current.lane += 1;
      arcadeAudio.playBounce();
    }
  }, [gameState]);

  const jump = useCallback(() => {
    if (gameState !== "running") return;
    if (!player.current.isJumping && !player.current.isSliding) {
      player.current.isJumping = true;
      player.current.jumpVy = -9.2;
      arcadeAudio.playLaunch();
    }
  }, [gameState]);

  const slide = useCallback(() => {
    if (gameState !== "running") return;
    if (!player.current.isSliding) {
      player.current.isSliding = true;
      player.current.slideTimer = 35; // Frames of slide
      if (player.current.isJumping) {
        player.current.jumpVy = 8; // Fast fall downward roll
      }
      arcadeAudio.playLaser();
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") moveLeft();
      if (e.code === "ArrowRight" || e.code === "KeyD") moveRight();
      if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
        e.preventDefault();
        jump();
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        slide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLeft, moveRight, jump, slide]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    const laneXTargets = [240, 420, 600];

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const vanishX = width / 2;
      const vanishY = height * 0.42;

      ctx.save();
      // Screen shake on hit
      if (shakeRef.current > 0) {
        const sx = (Math.random() - 0.5) * shakeRef.current;
        const sy = (Math.random() - 0.5) * shakeRef.current;
        ctx.translate(sx, sy);
        shakeRef.current *= 0.85;
        if (shakeRef.current < 0.5) shakeRef.current = 0;
      }

      // 1. Neon Cyber Subway Sky & Tunnel Arch
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vanishY);
      skyGrad.addColorStop(0, "#080E1A");
      skyGrad.addColorStop(0.6, "#0F172A");
      skyGrad.addColorStop(1, "#1E293B");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, vanishY);

      // Tunnel neon lights on side walls
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, vanishY - 60);
      ctx.lineTo(vanishX - 80, vanishY);
      ctx.lineTo(vanishX + 80, vanishY);
      ctx.lineTo(width, vanishY - 60);
      ctx.stroke();

      // Distant tunnel mouth
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.ellipse(vanishX, vanishY, 90, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Track Ballast Ground
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.moveTo(vanishX - 90, vanishY);
      ctx.lineTo(vanishX + 90, vanishY);
      ctx.lineTo(width + 40, height);
      ctx.lineTo(-40, height);
      ctx.closePath();
      ctx.fill();

      // Subway Rails (4 steel rails defining 3 lanes)
      const trackBaseXs = [170, 335, 505, 670];
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 3.5;
      trackBaseXs.forEach((bx) => {
        ctx.beginPath();
        ctx.moveTo(vanishX + (bx - vanishX) * 0.12, vanishY);
        ctx.lineTo(bx, height);
        ctx.stroke();
      });

      // Moving Sleepers (Ties) for high-speed sensation
      const runSpeed = gameState === "running" ? 6.8 : 0;
      const sleeperOffset = (Date.now() * 0.35) % 45;
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;
      for (let y = vanishY + sleeperOffset; y < height; y += 45) {
        const t = (y - vanishY) / (height - vanishY);
        const lx = vanishX - (vanishX - 100) * t;
        const rx = vanishX + (740 - vanishX) * t;
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.lineTo(rx, y);
        ctx.stroke();
      }

      // 3. Move items & Gantry
      if (gameState === "running") {
        gantryZ.current -= runSpeed;
        itemsRef.current.forEach((it) => {
          it.z -= runSpeed;
        });

        // Slide timer
        if (player.current.isSliding) {
          player.current.slideTimer--;
          if (player.current.slideTimer <= 0) {
            player.current.isSliding = false;
          }
        }
      }

      // Draw Coins & Obstacles
      itemsRef.current.forEach((it) => {
        if (it.z < 20 || it.z > 1400 || it.collected) return;
        const t = (1400 - it.z) / 1400;
        const py = vanishY + (height - vanishY) * (t * 0.9);
        const laneX = laneXTargets[it.lane];
        const px = vanishX + (laneX - vanishX) * t;
        const scale = 0.3 + t * 0.8;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scale, scale);

        if (it.type === "coin") {
          // Golden floating coin
          ctx.fillStyle = "#F59E0B";
          ctx.beginPath();
          ctx.arc(0, -16, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#FEF08A";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "black 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("✦", 0, -12);
        } else if (it.type === "hurdle") {
          // Yellow striped jumping hurdle
          ctx.fillStyle = "#DC2626";
          ctx.fillRect(-26, -24, 52, 18);
          ctx.fillStyle = "#FEF08A";
          ctx.fillRect(-22, -22, 10, 14);
          ctx.fillRect(-6, -22, 10, 14);
          ctx.fillRect(10, -22, 10, 14);

          ctx.fillStyle = "#334155";
          ctx.fillRect(-26, -6, 6, 20);
          ctx.fillRect(20, -6, 6, 20);
        } else if (it.type === "barrier_low") {
          // Overhead low signal bar: must slide under!
          ctx.fillStyle = "#EA580C";
          ctx.fillRect(-32, -50, 64, 16);
          ctx.fillStyle = "#FDE047";
          ctx.font = "bold 9px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("▼ AGACHARSE ▼", 0, -38);

          ctx.fillStyle = "#64748B";
          ctx.fillRect(-32, -34, 5, 45);
          ctx.fillRect(27, -34, 5, 45);
        }
        ctx.restore();

        // Player collision with item (z: 80 - 130)
        if (it.z > 70 && it.z < 120 && it.lane === player.current.lane && !it.collected) {
          if (it.type === "coin") {
            it.collected = true;
            setScore((s) => s + 20);
            arcadeAudio.playCoin();
          } else if (it.type === "hurdle") {
            // Must be jumping to clear!
            if (!player.current.isJumping || player.current.jumpY > -15) {
              it.collected = true;
              if (Date.now() > player.current.invulnerableUntil) {
                player.current.invulnerableUntil = Date.now() + 1800;
                shakeRef.current = 15;
                arcadeAudio.playWrong();
                setLives((l) => {
                  const n = l - 1;
                  if (n <= 0) {
                    setGameState("crashed");
                    setFeedback(
                      `¡Agotaste tus vidas en la vía! La respuesta correcta era "${currentRound.correctAnswer}". ${currentRound.explanation}`
                    );
                  } else {
                    setFeedback(`¡Tropiezo con la valla! Debes saltar con ⬆️. Te quedan ${n} vida(s).`);
                  }
                  return Math.max(0, n);
                });
              }
            }
          } else if (it.type === "barrier_low") {
            // Must be sliding to roll under!
            if (!player.current.isSliding) {
              it.collected = true;
              if (Date.now() > player.current.invulnerableUntil) {
                player.current.invulnerableUntil = Date.now() + 1800;
                shakeRef.current = 15;
                arcadeAudio.playWrong();
                setLives((l) => {
                  const n = l - 1;
                  if (n <= 0) {
                    setGameState("crashed");
                    setFeedback(
                      `¡Agotaste tus vidas con la señal alta! La respuesta correcta era "${currentRound.correctAnswer}". ${currentRound.explanation}`
                    );
                  } else {
                    setFeedback(`¡Cuidado con la señal alta! Deslízate con ⬇️. Te quedan ${n} vida(s).`);
                  }
                  return Math.max(0, n);
                });
              }
            }
          }
        }
      });

      // 4. Overhead Subway Station Gantry with [A], [B], [C] Options
      const gZ = gantryZ.current;
      if (gZ > 0 && gZ < 1500) {
        const gt = Math.max(0, Math.min(1, (1500 - gZ) / 1500));
        const gantryY = vanishY + (height - vanishY) * (gt * 0.88);
        const gantryScale = 0.32 + gt * 0.95;

        ctx.save();
        ctx.translate(vanishX, gantryY);
        ctx.scale(gantryScale, gantryScale);

        // Huge Truss Beam across all 3 tracks
        ctx.fillStyle = "#0F172A";
        ctx.strokeStyle = "#38BDF8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-390, -120, 780, 50, 12);
        ctx.fill();
        ctx.stroke();

        // Gantry Station Pillars
        ctx.fillStyle = "#334155";
        ctx.fillRect(-390, -70, 16, 170);
        ctx.fillRect(374, -70, 16, 170);

        // Header label
        ctx.fillStyle = "#38BDF8";
        ctx.font = "black 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ESTACIÓN CENTRAL DE CONCEPTOS • ELIGE LA VÍA CORRECTA", 0, -92);

        // 3 Track illuminated portal signs
        const signXs = [-250, 0, 250];
        signsRef.current.forEach((sign, idx) => {
          const sx = signXs[idx];
          const isPlayerInLane = player.current.lane === sign.lane;
          const isRoundWon = gameState === "round_won" && sign.isCorrect;
          const isWrongCrashed = gameState === "crashed" && isPlayerInLane;

          // Portal Sign Box: neutral sleek dark cyber cyan for all options - zero spoilers!
          ctx.fillStyle = isRoundWon
            ? "rgba(16, 185, 129, 0.95)"
            : isWrongCrashed
            ? "rgba(239, 68, 68, 0.95)"
            : isPlayerInLane
            ? "rgba(14, 116, 144, 0.92)"
            : "rgba(15, 23, 42, 0.88)";

          ctx.strokeStyle = isRoundWon
            ? "#34D399"
            : isWrongCrashed
            ? "#EF4444"
            : isPlayerInLane
            ? "#38BDF8"
            : "#64748B";
          ctx.lineWidth = isPlayerInLane ? 4 : 2;

          ctx.beginPath();
          ctx.roundRect(sx - 110, -65, 220, 85, 12);
          ctx.fill();
          ctx.stroke();

          // Letter Pill [A], [B], [C]
          ctx.fillStyle = isRoundWon ? "#10B981" : "#F59E0B";
          ctx.beginPath();
          ctx.roundRect(sx - 24, -58, 48, 24, 6);
          ctx.fill();
          ctx.fillStyle = "#0F172A";
          ctx.font = "black 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`[${sign.letter}]`, sx, -41);

          // Option text inside the track arch
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";

          const words = sign.text.split(" ");
          let line1 = "";
          let line2 = "";
          for (const w of words) {
            if ((line1 + " " + w).length < 18) line1 = (line1 + " " + w).trim();
            else line2 = (line2 + " " + w).trim();
          }

          if (line2) {
            ctx.fillText(line1, sx, -18);
            ctx.fillText(line2.slice(0, 20), sx, -2);
          } else {
            ctx.fillText(sign.text.slice(0, 22), sx, -10);
          }

          // Aiming arrow if player is in this lane
          if (isPlayerInLane && gameState === "running") {
            ctx.fillStyle = "#38BDF8";
            ctx.beginPath();
            ctx.moveTo(sx, 28);
            ctx.lineTo(sx - 12, 42);
            ctx.lineTo(sx + 12, 42);
            ctx.closePath();
            ctx.fill();
          }
        });

        ctx.restore();

        // Gantry Passing Check (Z reaches 90)
        if (gZ <= 90 && gameState === "running") {
          const chosenSign = signsRef.current.find((s) => s.lane === player.current.lane);
          if (chosenSign) {
            if (chosenSign.isCorrect) {
              arcadeAudio.playVictory();
              setGameState("round_won");
              setScore((s) => s + 200);
              setCarrotsEarned((c) => c + 2);
              setFeedback(
                `¡VÍA CORRECTA SUPERADA! Has cruzado [${chosenSign.letter}]: "${chosenSign.text}". ${currentRound.explanation}`
              );
            } else {
              shakeRef.current = 16;
              arcadeAudio.playWrong();
              player.current.invulnerableUntil = Date.now() + 2000;
              setLives((l) => {
                const nl = l - 1;
                if (nl <= 0) {
                  setGameState("crashed");
                  setFeedback(
                    `¡Agotaste tus vidas! Cruzaste la vía [${chosenSign.letter}]: "${chosenSign.text}". La respuesta correcta era "${currentRound.correctAnswer}". ${currentRound.explanation}`
                  );
                } else {
                  // Reset gantry further back so the player can switch lanes to the correct one!
                  gantryZ.current = 1100;
                  setFeedback(
                    `¡Vía [${chosenSign.letter}] incorrecta! Te quedan ${nl} vida(s). ¡Cambia de carril hacia la vía correcta!`
                  );
                }
                return Math.max(0, nl);
              });
            }
          }
        }
      }

      // 5. Update Tuddy Position, Jump & Slide Physics
      const targetX = laneXTargets[player.current.lane];
      player.current.visualX += (targetX - player.current.visualX) * 0.24;

      if (player.current.isJumping) {
        player.current.jumpVy += 0.52; // gravity
        player.current.jumpY += player.current.jumpVy;
        if (player.current.jumpY >= 0) {
          player.current.jumpY = 0;
          player.current.isJumping = false;
        }
      }

      const isInvuln = Date.now() < player.current.invulnerableUntil;
      const tuddyY = height - 72 + player.current.jumpY;

      // Draw Tuddy Runner with slide squash or jump stretch
      ctx.save();
      if (isInvuln && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.4; // Blink on damage
      }

      ctx.translate(player.current.visualX, tuddyY);
      if (player.current.isSliding) {
        ctx.scale(1.2, 0.6); // Rolling squash
      }

      drawTuddy(ctx, {
        x: 0,
        y: 0,
        radius: 26,
        expression:
          gameState === "round_won"
            ? "happy"
            : gameState === "crashed"
            ? "dizzy"
            : "focused",
        pet,
      });
      ctx.restore();

      // Shadow under Tuddy
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(
        player.current.visualX,
        height - 44,
        player.current.isSliding ? 30 : 20,
        6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

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
                Subway Runner 3D
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Tuddy Subway Dash 🚇🏃
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Shields / Lives */}
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
      <div className="bg-slate-850 rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Misión de Carrera:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Controles: ⬅️/➡️ Cambiar carril • ⬆️ Saltar • ⬇️ Deslizarse
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

        {/* In-run warning banner */}
        {feedback && gameState === "running" && (
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

      {/* Touch & Quick Track Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-bold">Elegir Carril:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                player.current.lane = 0;
                arcadeAudio.playBounce();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                player.current.lane === 0
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              [A] Carril Izquierdo
            </button>
            <button
              type="button"
              onClick={() => {
                player.current.lane = 1;
                arcadeAudio.playBounce();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                player.current.lane === 1
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              [B] Carril Central
            </button>
            <button
              type="button"
              onClick={() => {
                player.current.lane = 2;
                arcadeAudio.playBounce();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                player.current.lane === 2
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              [C] Carril Derecho
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={moveLeft}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl cursor-pointer"
            title="Izquierda (A)"
          >
            <ArrowL className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={jump}
            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl cursor-pointer flex items-center gap-1"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Saltar (W)</span>
          </button>
          <button
            type="button"
            onClick={slide}
            className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-xl cursor-pointer flex items-center gap-1"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Deslizar (S)</span>
          </button>
          <button
            type="button"
            onClick={moveRight}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl cursor-pointer"
            title="Derecha (D)"
          >
            <ArrowR className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Options Reference Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        {signsRef.current.map((sign, idx) => (
          <div
            key={idx}
            onClick={() => {
              player.current.lane = sign.lane;
              arcadeAudio.playBounce();
            }}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
              player.current.lane === sign.lane
                ? "bg-amber-500/20 border-amber-400 text-white shadow-md"
                : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              {sign.letter}
            </span>
            <span className="font-semibold line-clamp-2">{sign.text}</span>
          </div>
        ))}
      </div>

      {/* Completion */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner">
              🚇
            </div>
            <h3 className="text-2xl font-black text-white">¡Carrera del Saber Superada!</h3>
            <p className="text-xs text-slate-300">
              Has recorrido todas las vías de <strong className="text-amber-300">{topic}</strong> dominando cada concepto.
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
