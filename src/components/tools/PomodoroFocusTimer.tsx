import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Waves, 
  Sparkles, 
  Bell, 
  Award,
  Coffee,
  BookOpen,
  Wind
} from "lucide-react";
import { PetCustomization } from "../../types";
import { AnthropomorphicBunny } from "../AnthropomorphicBunny";
import { audioSynth } from "../../utils/audioSynth";
import confetti from "canvas-confetti";
import { DEFAULT_PET } from "../../utils/storage";

interface PomodoroFocusTimerProps {
  pet?: PetCustomization;
  onRewardCarrot?: (amount: number) => void;
  onTuddyCheer?: (msg: string) => void;
}

type TimerMode = "work" | "short_break" | "long_break";

export const PomodoroFocusTimer: React.FC<PomodoroFocusTimerProps> = ({
  pet = DEFAULT_PET,
  onRewardCarrot,
  onTuddyCheer,
}) => {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Ambient sound settings
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "waves" | "zen" | "library">("none");
  const [soundVolume, setSoundVolume] = useState(0.5);

  // Breathing guide state
  const [isBreathingGuideActive, setIsBreathingGuideActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhala profundo..." | "Mantén el aire..." | "Exhala despacio...">("Inhala profundo...");

  const durations: Record<TimerMode, number> = {
    work: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
  };

  const modeLabels: Record<TimerMode, string> = {
    work: "Bloque de Concentración",
    short_break: "Descanso Corto",
    long_break: "Descanso Largo",
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Completed!
      setIsActive(false);
      audioSynth.playZenChime();

      if (mode === "work") {
        setCompletedSessions((prev) => prev + 1);
        if (onRewardCarrot) {
          onRewardCarrot(5);
        }
        if (onTuddyCheer) {
          onTuddyCheer("¡Excelente trabajo! Has completado 25 minutos de enfoque total. Tómate un respiro merecido.");
        }
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setMode("short_break");
        setTimeLeft(5 * 60);
      } else {
        setMode("work");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onRewardCarrot, onTuddyCheer]);

  // Ambient sound controller
  useEffect(() => {
    if (ambientSound === "none" || !isActive) {
      audioSynth.stopAmbient();
    } else {
      audioSynth.startAmbient(ambientSound, soundVolume);
    }
    return () => {
      audioSynth.stopAmbient();
    };
  }, [ambientSound, isActive, soundVolume]);

  // Breathing Guide Loop
  useEffect(() => {
    if (!isBreathingGuideActive) return;
    const cycle = ["Inhala profundo...", "Mantén el aire...", "Exhala despacio..."] as const;
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      setBreathPhase(cycle[idx]);
    }, 4000);
    return () => clearInterval(timer);
  }, [isBreathingGuideActive]);

  const handleSwitchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(durations[mode]);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const totalTime = durations[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Temporizador Pomodoro & Sonidos de Enfoque
              <span className="text-[10px] bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full font-semibold border border-rose-400/20">
                Productividad
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Estudia en bloques de alta concentración con paisajes sonoros relajantes y gana zanahorias.
            </p>
          </div>
        </div>

        {/* Sessions Counter */}
        <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-slate-700 text-xs">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Sesiones completadas:</span>
          <strong className="text-amber-400 font-mono text-sm">{completedSessions}</strong>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Main Timer Display */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => handleSwitchMode("work")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "work"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Enfoque (25m)
            </button>
            <button
              onClick={() => handleSwitchMode("short_break")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "short_break"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Descanso Corto (5m)
            </button>
            <button
              onClick={() => handleSwitchMode("long_break")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "long_break"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Descanso Largo (15m)
            </button>
          </div>

          {/* Circular SVG Timer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={mode === "work" ? "#e11d48" : mode === "short_break" ? "#059669" : "#4f46e5"}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {modeLabels[mode]}
              </span>
              <span className="text-5xl font-mono font-black text-slate-900 tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-slate-500 mt-2 font-medium">
                {isActive ? "En progreso..." : "Pausado"}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-6 py-3 rounded-2xl text-sm font-black shadow-md transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : mode === "work"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Comenzar
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
              title="Reiniciar temporizador"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient Sounds & Breathing Guide */}
        <div className="space-y-6">
          {/* Ambient Sound Selector */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Sonidos de Enfoque</span>
              </h3>
              {ambientSound !== "none" && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md animate-pulse">
                  Reproduciendo
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmbientSound(ambientSound === "rain" ? "none" : "rain")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  ambientSound === "rain"
                    ? "bg-sky-100 border-sky-300 text-sky-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>Lluvia Suave</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === "waves" ? "none" : "waves")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  ambientSound === "waves"
                    ? "bg-teal-100 border-teal-300 text-teal-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Waves className="w-4 h-4 text-teal-600" />
                <span>Olas de Mar</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === "zen" ? "none" : "zen")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  ambientSound === "zen"
                    ? "bg-purple-100 border-purple-300 text-purple-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Meditación Zen</span>
              </button>

              <button
                onClick={() => setAmbientSound(ambientSound === "library" ? "none" : "library")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  ambientSound === "library"
                    ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Biblioteca</span>
              </button>
            </div>

            {/* Volume slider */}
            {ambientSound !== "none" && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                <span>Volumen:</span>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
                <span className="font-mono text-[11px]">{Math.round(soundVolume * 100)}%</span>
              </div>
            )}
          </div>

          {/* Breathing Guide with Tuddy */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-indigo-600" />
                <span>Pausa Guiada de Respiración</span>
              </h3>
              <button
                onClick={() => setIsBreathingGuideActive(!isBreathingGuideActive)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
              >
                {isBreathingGuideActive ? "Cerrar" : "Iniciar"}
              </button>
            </div>

            {isBreathingGuideActive ? (
              <div className="flex flex-col items-center text-center py-2 space-y-2">
                <div className="w-16 h-16 transition-transform duration-3000 ease-in-out transform">
                  <AnthropomorphicBunny pet={pet} mood="relaxed" size="md" />
                </div>
                <span className="text-xs font-black text-indigo-900 animate-pulse">
                  {breathPhase}
                </span>
                <p className="text-[10px] text-indigo-600 max-w-xs">
                  Sincroniza tu respiración para reducir la ansiedad académica y oxigenar tu mente.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                ¿Sientes cansancio mental? Haz una pausa de 2 minutos para respirar guiado por Tuddy.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
