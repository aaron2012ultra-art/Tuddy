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

interface AngryTuddyGameProps {
  rounds: RoundData[];
  topic: string;
  subject: string;
  pet?: PetCustomization;
  onFinish: (score: number, carrotsEarned: number) => void;
  onBack: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "wood" | "stone" | "target";
  hp: number;
  targetIndex?: number;
  isHit?: boolean;
  vx?: number;
  vy?: number;
  rot?: number;
  vRot?: number;
}

export const AngryTuddyGame: React.FC<AngryTuddyGameProps> = ({
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
  const [shotsLeft, setShotsLeft] = useState(3);
  const [gameState, setGameState] = useState<"aiming" | "flying" | "hit_correct" | "hit_wrong" | "out_of_shots">("aiming");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentRound = rounds[currentRoundIdx] || {
    question: `¿Cuál es el concepto clave de ${topic}?`,
    options: ["Fundamento principal", "Opción distractora 1", "Opción distractora 2", "Opción distractora 3"],
    correctAnswer: "Fundamento principal",
    explanation: `Este es el principio esencial para dominar ${topic} en ${subject}.`,
  };

  // Slingshot anchor coordinate (canvas relative)
  const SLING_X = 130;
  const SLING_Y = 370;
  const MAX_PULL = 90;
  const GRAVITY = 0.42;

  // Tuddy Physics State
  const tuddyState = useRef({
    x: SLING_X,
    y: SLING_Y,
    vx: 0,
    vy: 0,
    isDragging: false,
    inFlight: false,
    angle: 0,
    trail: [] as Array<{ x: number; y: number; alpha: number }>,
  });

  // Game blocks and targets
  const blocksRef = useRef<Block[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const shakeRef = useRef(0);

  // Initialize blocks for current question
  const initLevel = useCallback(() => {
    const blocks: Block[] = [];
    const optionsCount = currentRound.options.length;

    // Build 2 or 4 tower pedestals on the right side
    const startX = 460;
    const spacingX = 85;

    currentRound.options.forEach((_, optIdx) => {
      const towerX = startX + (optIdx % 4) * spacingX;
      const baseY = 430;

      // Base stone block
      blocks.push({ x: towerX, y: baseY, w: 48, h: 24, type: "stone", hp: 3 });
      // Wood support block
      blocks.push({ x: towerX, y: baseY - 32, w: 40, h: 28, type: "wood", hp: 2 });
      // Target Orb (Option A, B, C, D)
      blocks.push({
        x: towerX,
        y: baseY - 70,
        w: 44,
        h: 44,
        type: "target",
        hp: 1,
        targetIndex: optIdx,
        isHit: false,
      });
      // Decorative roof plank
      blocks.push({ x: towerX, y: baseY - 100, w: 56, h: 14, type: "wood", hp: 1 });
    });

    blocksRef.current = blocks;
    tuddyState.current = {
      x: SLING_X,
      y: SLING_Y,
      vx: 0,
      vy: 0,
      isDragging: false,
      inFlight: false,
      angle: 0,
      trail: [],
    };
    setGameState("aiming");
    setFeedback(null);
  }, [currentRound.options]);

  useEffect(() => {
    initLevel();
  }, [currentRoundIdx, initLevel]);

  // Create debris particles
  const addDebris = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 6 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 2,
        color,
        size: Math.random() * 5 + 3,
        alpha: 1,
        life: 1,
      });
    }
  };

  // Touch / Mouse Handlers for the Slingshot
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

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== "aiming" || isCompleted) return;
    const { x, y } = getCanvasCoords(e);
    const dist = Math.hypot(x - SLING_X, y - SLING_Y);
    if (dist < 65) {
      tuddyState.current.isDragging = true;
      arcadeAudio.playStretch();
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!tuddyState.current.isDragging) return;
    const { x, y } = getCanvasCoords(e);
    const dx = x - SLING_X;
    const dy = y - SLING_Y;
    const dist = Math.hypot(dx, dy);

    if (dist > MAX_PULL) {
      const angle = Math.atan2(dy, dx);
      tuddyState.current.x = SLING_X + Math.cos(angle) * MAX_PULL;
      tuddyState.current.y = SLING_Y + Math.sin(angle) * MAX_PULL;
    } else {
      tuddyState.current.x = x;
      tuddyState.current.y = y;
    }
  };

  const handlePointerUp = () => {
    if (!tuddyState.current.isDragging) return;
    tuddyState.current.isDragging = false;

    const pullX = tuddyState.current.x - SLING_X;
    const pullY = tuddyState.current.y - SLING_Y;
    const pullDist = Math.hypot(pullX, pullY);

    if (pullDist < 15) {
      // Small pull cancelled
      tuddyState.current.x = SLING_X;
      tuddyState.current.y = SLING_Y;
      return;
    }

    // Launch velocity is proportional to opposite pull vector
    const launchPower = 0.22;
    tuddyState.current.vx = -pullX * launchPower;
    tuddyState.current.vy = -pullY * launchPower;
    tuddyState.current.inFlight = true;
    setGameState("flying");
    setShotsLeft((prev) => Math.max(0, prev - 1));
    arcadeAudio.playLaunch();
  };

  // Main Canvas Render and Game Loop
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

      // Screen shake decay
      if (shakeRef.current > 0) {
        shakeRef.current *= 0.9;
        if (shakeRef.current < 0.2) shakeRef.current = 0;
      }

      ctx.save();
      if (shakeRef.current > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeRef.current,
          (Math.random() - 0.5) * shakeRef.current
        );
      }

      // 1. Sky & Hills Background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, "#BAE6FD"); // Sky blue
      skyGradient.addColorStop(0.7, "#E0F2FE");
      skyGradient.addColorStop(1, "#86EFAC"); // Soft green grass horizon
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      [
        { x: 120, y: 70, r: 28 },
        { x: 150, y: 65, r: 36 },
        { x: 180, y: 75, r: 26 },
        { x: 520, y: 90, r: 32 },
        { x: 555, y: 80, r: 42 },
        { x: 590, y: 90, r: 30 },
      ].forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Background mountain / hill
      ctx.beginPath();
      ctx.moveTo(350, height - 60);
      ctx.bezierCurveTo(460, height - 160, 600, height - 140, width, height - 70);
      ctx.lineTo(width, height);
      ctx.lineTo(350, height);
      ctx.fillStyle = "#A7F3D0";
      ctx.fill();

      // Ground (Dirt and Grass)
      const groundY = height - 65;
      ctx.fillStyle = "#16A34A"; // Vibrant Grass
      ctx.fillRect(0, groundY, width, 18);
      ctx.fillStyle = "#B45309"; // Dirt underground
      ctx.fillRect(0, groundY + 18, width, height - (groundY + 18));

      // 2. Trajectory prediction line when pulling slingshot
      if (tuddyState.current.isDragging) {
        const pullX = tuddyState.current.x - SLING_X;
        const pullY = tuddyState.current.y - SLING_Y;
        const simVx = -pullX * 0.22;
        let simVy = -pullY * 0.22;
        let simX = tuddyState.current.x;
        let simY = tuddyState.current.y;

        ctx.beginPath();
        for (let step = 0; step < 26; step++) {
          simX += simVx;
          simY += simVy;
          simVy += GRAVITY;
          if (step % 2 === 0) {
            ctx.fillStyle = "rgba(249, 115, 22, 0.75)";
            ctx.beginPath();
            ctx.arc(simX, simY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Slingshot Base & Rubber Bands
      // Back Rubber Band
      ctx.strokeStyle = "#78350F";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(SLING_X - 12, SLING_Y - 25);
      ctx.lineTo(tuddyState.current.x, tuddyState.current.y);
      ctx.stroke();

      // Slingshot wooden fork
      ctx.strokeStyle = "#92400E";
      ctx.lineWidth = 14;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(SLING_X, groundY + 5);
      ctx.lineTo(SLING_X, SLING_Y);
      ctx.lineTo(SLING_X - 18, SLING_Y - 32);
      ctx.moveTo(SLING_X, SLING_Y);
      ctx.lineTo(SLING_X + 18, SLING_Y - 32);
      ctx.stroke();

      // 4. Update and Draw Tuddy
      if (tuddyState.current.inFlight) {
        // Apply Physics
        tuddyState.current.x += tuddyState.current.vx;
        tuddyState.current.y += tuddyState.current.vy;
        tuddyState.current.vy += GRAVITY;
        tuddyState.current.angle = Math.atan2(tuddyState.current.vy, tuddyState.current.vx);

        // Add trail dot
        tuddyState.current.trail.push({
          x: tuddyState.current.x,
          y: tuddyState.current.y,
          alpha: 1,
        });

        // Ground Collision
        if (tuddyState.current.y >= groundY - 22) {
          tuddyState.current.y = groundY - 22;
          tuddyState.current.vx *= 0.55;
          tuddyState.current.vy = -tuddyState.current.vy * 0.35;
          if (Math.abs(tuddyState.current.vy) < 1.5) tuddyState.current.vy = 0;

          if (Math.abs(tuddyState.current.vx) < 0.4 && tuddyState.current.vy === 0) {
            tuddyState.current.inFlight = false;
            if (gameState === "flying") {
              setGameState("hit_wrong");
              setFeedback("¡Tuddy aterrizó en el suelo! Vuelve a apuntar a la torre correcta.");
              arcadeAudio.playWrong();
            }
          }
        }

        // Check Block Collisions
        blocksRef.current.forEach((block) => {
          if (block.hp <= 0) return;
          const dist = Math.hypot(tuddyState.current.x - block.x, tuddyState.current.y - block.y);
          const collisionRadius = block.w * 0.55 + 22;

          if (dist < collisionRadius) {
            // Collision occurred!
            shakeRef.current = 14;
            arcadeAudio.playImpact();
            block.hp -= 1;
            block.vx = tuddyState.current.vx * 0.4;
            block.vy = tuddyState.current.vy * 0.3 - 2;
            block.vRot = (Math.random() - 0.5) * 0.2;

            addDebris(block.x, block.y, block.type === "wood" ? "#D97706" : block.type === "stone" ? "#64748B" : "#F59E0B", 14);

            // Tuddy rebounds slightly
            tuddyState.current.vx *= 0.35;
            tuddyState.current.vy = -tuddyState.current.vy * 0.4;

            if (block.type === "target" && block.targetIndex !== undefined) {
              const selectedOption = currentRound.options[block.targetIndex];
              const isCorrect = selectedOption === currentRound.correctAnswer;

              if (isCorrect) {
                // Correct target hit!
                arcadeAudio.playVictory();
                setGameState("hit_correct");
                setScore((s) => s + 100);
                setCarrotsEarned((c) => c + 25);
                setFeedback(`¡EXCELENTE! ¡Destruiste la torre con la respuesta correcta! ${currentRound.explanation}`);
                tuddyState.current.inFlight = false;
                addDebris(block.x, block.y, "#F59E0B", 35);
              } else {
                // Incorrect target hit
                arcadeAudio.playWrong();
                setGameState("hit_wrong");
                setFeedback(`¡Cuidado! Esa torre era "${selectedOption}". La respuesta correcta es "${currentRound.correctAnswer}".`);
                tuddyState.current.inFlight = false;
              }
            }
          }
        });
      }

      // Draw smoke / carrot trail
      tuddyState.current.trail.forEach((p, idx) => {
        p.alpha *= 0.94;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${p.alpha * 0.6})`;
        ctx.fill();
        if (p.alpha < 0.05) tuddyState.current.trail.splice(idx, 1);
      });

      // Front Rubber Band if dragging
      if (tuddyState.current.isDragging) {
        ctx.strokeStyle = "#92400E";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(SLING_X + 12, SLING_Y - 25);
        ctx.lineTo(tuddyState.current.x, tuddyState.current.y);
        ctx.stroke();
      }

      // Draw Tuddy the Hero Bunny!
      drawTuddy(ctx, {
        x: tuddyState.current.x,
        y: tuddyState.current.y,
        radius: 24,
        angle: tuddyState.current.angle,
        expression:
          gameState === "hit_correct"
            ? "happy"
            : gameState === "hit_wrong"
            ? "dizzy"
            : tuddyState.current.inFlight
            ? "flying"
            : "normal",
        pet,
      });

      // 5. Update and Draw Blocks & Targets
      blocksRef.current.forEach((block) => {
        if (block.hp <= 0 && (!block.vy || block.y > height)) return;

        // Apply physics to falling blocks
        if (block.vx || block.vy) {
          block.x += block.vx || 0;
          block.y += block.vy || 0;
          block.vy = (block.vy || 0) + GRAVITY * 0.8;
          block.rot = (block.rot || 0) + (block.vRot || 0);
        }

        ctx.save();
        ctx.translate(block.x, block.y);
        if (block.rot) ctx.rotate(block.rot);

        if (block.type === "wood") {
          ctx.fillStyle = "#D97706";
          ctx.strokeStyle = "#92400E";
          ctx.lineWidth = 2.5;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
          // Wood grain line
          ctx.beginPath();
          ctx.moveTo(-block.w / 3, -block.h / 4);
          ctx.lineTo(block.w / 3, -block.h / 4);
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.stroke();
        } else if (block.type === "stone") {
          ctx.fillStyle = "#64748B";
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 2.5;
          ctx.fillRect(-block.w / 2, -block.h / 2, block.w, block.h);
          ctx.strokeRect(-block.w / 2, -block.h / 2, block.w, block.h);
        } else if (block.type === "target") {
          // Colorful target orb with option letter A, B, C, D
          const letter = ["A", "B", "C", "D"][block.targetIndex ?? 0] || "•";
          const orbGrad = ctx.createRadialGradient(0, -6, 4, 0, 0, block.w / 2);
          orbGrad.addColorStop(0, "#FDE047");
          orbGrad.addColorStop(0.6, "#F59E0B");
          orbGrad.addColorStop(1, "#D97706");

          ctx.beginPath();
          ctx.arc(0, 0, block.w / 2, 0, Math.PI * 2);
          ctx.fillStyle = orbGrad;
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          ctx.stroke();

          // Target Letter
          ctx.fillStyle = "#78350F";
          ctx.font = "bold 20px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(letter, 0, 1);
        }

        ctx.restore();
      });

      // 6. Update and Draw Particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY * 0.4;
        p.alpha -= 0.025;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (p.alpha <= 0) particlesRef.current.splice(idx, 1);
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, pet, currentRound]);

  // Next round or finish
  const handleNextRound = () => {
    if (currentRoundIdx + 1 < rounds.length) {
      setCurrentRoundIdx((r) => r + 1);
      setShotsLeft(3);
    } else {
      setIsCompleted(true);
      onFinish(score, carrotsEarned);
    }
  };

  const handleRetryRound = () => {
    initLevel();
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
            title="Volver a juegos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full">
                Angry Birds Arcade
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {subject} • {topic}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              Angry Tuddy: Tirachinas del Saber 🎯
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
            title="Sonido"
          >
            {soundOn ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Question Banner */}
      <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-rose-600/30 rounded-2xl p-4 border border-amber-500/30 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            {currentRoundIdx + 1}/{rounds.length}
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Pregunta de Estudio:
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentRound.question}
            </p>
          </div>
        </div>

        <div className="text-xs text-amber-200/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
          Tira a Tuddy hacia atrás con el ratón/dedo y suelta 🏹
        </div>
      </div>

      {/* Interactive HTML5 Physics Slingshot Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-2xl flex justify-center">
        <canvas
          ref={canvasRef}
          width={840}
          height={480}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full max-w-full h-auto cursor-crosshair touch-none"
        />

        {/* Feedback Overlay upon Hit */}
        {feedback && (
          <div
            className={`absolute bottom-4 left-4 right-4 p-4 rounded-2xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border ${
              gameState === "hit_correct"
                ? "bg-emerald-950/85 border-emerald-500/60 text-emerald-100"
                : "bg-rose-950/85 border-rose-500/60 text-rose-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {gameState === "hit_correct" ? "🎉" : "💥"}
              </span>
              <div>
                <p className="font-bold text-sm leading-relaxed">{feedback}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {gameState === "hit_correct" ? (
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
                  onClick={handleRetryRound}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Tiro</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Target Options Reference Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {currentRound.options.map((opt, idx) => {
          const letter = ["A", "B", "C", "D"][idx];
          const isCorrect = opt === currentRound.correctAnswer;
          const isTargetActive = gameState === "hit_correct" && isCorrect;

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                isTargetActive
                  ? "bg-emerald-500/20 border-emerald-400 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 border-slate-700 text-slate-200"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                  isTargetActive ? "bg-emerald-400 text-slate-950" : "bg-amber-500 text-slate-950"
                }`}
              >
                {letter}
              </div>
              <div className="text-xs font-semibold leading-snug truncate">
                {opt}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner">
              🏆
            </div>
            <h3 className="text-2xl font-black text-white">¡Nivel Completado!</h3>
            <p className="text-xs text-slate-300">
              Has dominado las torres del conocimiento en <strong className="text-amber-300">{topic}</strong> con Tuddy.
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
