import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Sparkles, 
  Heart, 
  Smile, 
  BookOpen,
  CloudRain,
  Flame,
  CheckCircle2
} from "lucide-react";
import { FriendItem, PetCustomization } from "../../types";
import { AnthropomorphicBunny } from "../AnthropomorphicBunny";
import { audioSynth } from "../../utils/audioSynth";
import confetti from "canvas-confetti";

interface FriendDuoStudyRoomProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem;
  userPet: PetCustomization;
  onRewardCarrot?: (amount: number) => void;
}

const QUICK_CHEERS = [
  "¡Foco total! 🧠",
  "¡Ya casi 5 minutos! ⏱️",
  "¡Gran sesión de estudio! 📚",
  "Café virtual ☕",
  "¡Tú puedes! 💪",
  "Zanahorias a tope 🥕",
];

export const FriendDuoStudyRoom: React.FC<FriendDuoStudyRoomProps> = ({
  isOpen,
  onClose,
  friend,
  userPet,
  onRewardCarrot,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "library" | "waves" | "zen">("none");
  const [activeCheer, setActiveCheer] = useState<string | null>(null);
  const [friendCheer, setFriendCheer] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      audioSynth.playFanfare();
      confetti({ particleCount: 50, spread: 70 });
      if (onRewardCarrot) onRewardCarrot(10);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Ambient sound controller
  useEffect(() => {
    if (ambientSound === "none") {
      audioSynth.stopAmbient();
    } else {
      audioSynth.startAmbient(ambientSound, 0.4);
    }
    return () => {
      audioSynth.stopAmbient();
    };
  }, [ambientSound]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      audioSynth.stopAmbient();
      setIsRunning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleSendCheer = (cheerText: string) => {
    setActiveCheer(cheerText);
    audioSynth.playZenChime();

    setTimeout(() => {
      setActiveCheer(null);
    }, 3000);

    // Friend responds with a cheer
    setTimeout(() => {
      const friendResponses = [
        `¡Gracias! ¡A tope! 🐰✨`,
        `¡Vamos dúo invencible! 🔥`,
        `¡Qué bien sienta estudiar juntos! ☕`,
        `¡A por esas zanahorias! 🥕`,
      ];
      setFriendCheer(friendResponses[Math.floor(Math.random() * friendResponses.length)]);
      setTimeout(() => setFriendCheer(null), 3500);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#2D2424] text-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-[#524444] overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1E1717] border-b border-[#3E3333] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Sala de Estudio en Dúo</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  Sincronizado con {friend.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pomodoro compartido de 25 minutos • Concentración mutua y racha
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duo Desk Studio Scene */}
        <div className="p-6 bg-gradient-to-b from-[#251D1D] to-[#1C1616] flex-1 overflow-y-auto">
          {/* Timer Display */}
          <div className="text-center mb-6">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-amber-200 drop-shadow-md">
              {formattedTime}
            </span>
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-5 py-2 rounded-2xl font-black text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                  isRunning
                    ? "bg-rose-500 hover:bg-rose-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isRunning ? "Pausar" : "Iniciar Sesión de Foco"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRunning(false);
                  setSecondsLeft(25 * 60);
                }}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Side-by-side Study Desks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {/* User Desk (Left) */}
            <div className="bg-[#3A3030] rounded-3xl p-5 border-2 border-[#544545] relative flex flex-col items-center shadow-lg">
              <span className="absolute top-3 left-4 text-[10px] uppercase font-black tracking-wider text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
                Tu Escritorio
              </span>

              {/* Cheer Speech Bubble */}
              {activeCheer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-amber-400 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg absolute -top-3 z-20"
                >
                  {activeCheer}
                </motion.div>
              )}

              <div className="w-32 h-32 bg-white/95 rounded-full flex items-center justify-center my-3 p-2 shadow-inner border-2 border-amber-300/40">
                <AnthropomorphicBunny
                  pet={userPet}
                  mood="studying"
                  size="md"
                  isBouncing={isRunning}
                  showShadow={false}
                />
              </div>

              <h4 className="text-sm font-black text-white">{userPet.name} (Tú)</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isRunning ? "En concentración total 🎧📖" : "Listo para empezar"}
              </p>

              {/* Study Desk Props: Laptop & Coffee */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 text-xs text-amber-200">
                <span className="flex items-center gap-1">💻 Laptop abierta</span>
                <span>•</span>
                <span className="flex items-center gap-1">☕ Té caliente</span>
              </div>
            </div>

            {/* Friend Desk (Right) */}
            <div className="bg-[#3A3030] rounded-3xl p-5 border-2 border-[#544545] relative flex flex-col items-center shadow-lg">
              <span className="absolute top-3 left-4 text-[10px] uppercase font-black tracking-wider text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-500/20">
                Escritorio de {friend.name}
              </span>

              {/* Friend Speech Bubble */}
              {friendCheer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-sky-400 text-sky-950 text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-lg absolute -top-3 z-20"
                >
                  {friendCheer}
                </motion.div>
              )}

              <div className="w-32 h-32 bg-white/95 rounded-full flex items-center justify-center my-3 p-2 shadow-inner border-2 border-sky-300/40">
                <AnthropomorphicBunny
                  pet={friend.pet}
                  mood="studying"
                  size="md"
                  isBouncing={isRunning}
                  showShadow={false}
                />
              </div>

              <h4 className="text-sm font-black text-white">{friend.pet.name}</h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {friend.currentActivity}
              </p>

              {/* Friend Desk Props */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10 text-xs text-sky-200">
                <span className="flex items-center gap-1">📚 Fichas de repaso</span>
                <span>•</span>
                <span className="flex items-center gap-1">🥕 Snacks sanos</span>
              </div>
            </div>
          </div>

          {/* Quick Cheers Bar */}
          <div className="mt-5 p-4 bg-[#231A1A] rounded-2xl border border-[#3E3030]">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Envía una motivación instantánea a {friend.name}:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHEERS.map((cheer) => (
                <button
                  key={cheer}
                  type="button"
                  onClick={() => handleSendCheer(cheer)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer text-slate-200"
                >
                  {cheer}
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Sounds Selector */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#231A1A] p-3 rounded-2xl border border-[#3E3030]">
            <div className="flex items-center gap-2 text-slate-300">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Sonido Ambiente:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: "none", label: "Silencio" },
                { id: "rain", label: "🌧️ Lluvia" },
                { id: "library", label: "🏛️ Biblioteca" },
                { id: "waves", label: "🌊 Olas" },
                { id: "zen", label: "🧘 Campana Zen" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setAmbientSound(s.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    ambientSound === s.id
                      ? "bg-amber-400 text-amber-950 font-black"
                      : "bg-white/5 hover:bg-white/10 text-slate-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
