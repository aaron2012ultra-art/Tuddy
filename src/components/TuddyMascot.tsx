import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Volume2, RefreshCw, Lightbulb, Heart, Award, Palette } from "lucide-react";
import { TuddyMood, PetCustomization } from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";

interface TuddyMascotProps {
  mood?: "happy" | "studying" | "cheering" | "relaxed" | "proud" | "thinking";
  customMessage?: string;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onCarrotFed?: () => void;
  carrotCoins?: number;
  pet?: PetCustomization;
  onOpenCustomizer?: () => void;
}

const PERSONALITY_TIPS = {
  enthusiastic: [
    "¡Eres imparable! ¡Cada minuto dedicado a estudiar te acerca al éxito total! 🐰🔥",
    "¡Celebra este esfuerzo! Las personas constantes llegan lejísimos, ¡a darle con todo!",
    "¡Tus neuronas están que arden de genialidad hoy! ¡Vamos a dominar la materia!",
    "¡Pomodoro activado! 25 minutos con el corazón en alto y luego descansamos!",
  ],
  calm_wise: [
    "Respira hondo... La constancia serena supera siempre a la prisa precipitada. 🐰🍃",
    "Si un tema parece complejo, no te angusties: descomponlo en pequeñas verdades simples.",
    "El descanso también es parte del estudio: tu cerebro consolida mientras reposas.",
    "Enfócate en comprender la raíz, no solo en memorizar palabras pasajeras.",
  ],
  fun_energetic: [
    "¡Si las neuronas tuvieran zapatillas, las tuyas ya habrían ganado una maratón! 🥕⚡",
    "¡Un examen es solo un papel tratando de adivinar qué tan inteligente eres! ¡A por el 10!",
    "Nemotecnia relámpago: inventa una historia loca con los conceptos y jamás se te olvidará.",
    "¡A darle caña antes de que las zanahorias se queden frías! ¿Listos para el reto?",
  ],
};

export const TuddyMascot: React.FC<TuddyMascotProps> = ({
  mood = "happy",
  customMessage,
  size = "md",
  interactive = true,
  onCarrotFed,
  carrotCoins = 0,
  pet = DEFAULT_PET,
  onOpenCustomizer,
}) => {
  const [currentMood, setCurrentMood] = useState<TuddyMood["expression"]>(mood);
  const [tipIndex, setTipIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    setCurrentMood(mood);
  }, [mood]);

  const tipsPool = PERSONALITY_TIPS[pet.personality] || PERSONALITY_TIPS.enthusiastic;
  const activeMessage = customMessage || tipsPool[tipIndex % tipsPool.length];

  const handleNextTip = () => {
    setTipIndex((prev) => prev + 1);
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
  };

  const handleMascotClick = () => {
    if (!interactive) return;
    setIsBouncing(true);
    setShowHeart(true);
    setTimeout(() => {
      setIsBouncing(false);
      setShowHeart(false);
    }, 900);
    handleNextTip();
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeMessage.replace(/[🐰✨🥕💡🔥🍃⚡]/g, ""));
    utterance.lang = "es-ES";
    
    if (pet.personality === "enthusiastic") {
      utterance.pitch = 1.35;
      utterance.rate = 1.05;
    } else if (pet.personality === "calm_wise") {
      utterance.pitch = 1.05;
      utterance.rate = 0.94;
    } else {
      utterance.pitch = 1.25;
      utterance.rate = 1.1;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="relative flex items-center gap-4">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMessage}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-sm rounded-3xl border-2 border-[#E8E2D9] bg-white p-4 shadow-sm text-[#4A4A4A]"
        >
          {/* Triangle pointing to rabbit */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-6 border-y-transparent border-l-8 border-l-[#E8E2D9]" />
          
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FFB7B2]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#3E7D46] animate-pulse" />
              <span>{pet.name} ({pet.personality === "enthusiastic" ? "Entusiasta" : pet.personality === "calm_wise" ? "Sabio" : "Divertido"})</span>
            </div>
            <div className="flex items-center gap-1">
              {onOpenCustomizer && (
                <button
                  type="button"
                  onClick={onOpenCustomizer}
                  title="Personalizar mascota"
                  className="rounded-full p-1 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSpeak}
                title={`Escuchar a ${pet.name}`}
                className={`rounded-full p-1 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors ${
                  isSpeaking ? "text-[#FFB7B2] animate-pulse bg-rose-50" : ""
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextTip}
                title="Siguiente consejo"
                className="rounded-full p-1 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#4A4A4A]">
            {activeMessage}
          </p>

          <div className="mt-3 flex items-center justify-between border-t border-[#E8E2D9] pt-2.5 text-xs">
            {carrotCoins > 0 && onCarrotFed ? (
              <>
                <span className="text-[#4A4A4A] font-bold">🥕 {carrotCoins} zanahorias</span>
                <button
                  type="button"
                  onClick={onCarrotFed}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FFB7B2] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#ffa5a0] active:scale-95 transition-all"
                >
                  <span>Dar premio 🥕</span>
                </button>
              </>
            ) : onOpenCustomizer ? (
              <button
                type="button"
                onClick={onOpenCustomizer}
                className="text-[11px] font-bold text-[#FFB7B2] hover:underline flex items-center gap-1"
              >
                <Palette className="h-3 w-3" />
                <span>Personalizar a {pet.name}</span>
              </button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Anthropomorphic Bunny Avatar */}
      <div className="relative group cursor-pointer select-none" onClick={handleMascotClick}>
        {/* Animated Floating Heart when clicked */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -30, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 text-rose-500 pointer-events-none z-20"
            >
              <Heart className="h-6 w-6 fill-rose-400" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-3xl bg-[#FFF8E6] p-2 shadow-sm border-2 border-[#E8E2D9] transition-transform group-hover:scale-105">
          <AnthropomorphicBunny
            pet={pet}
            mood={currentMood}
            size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
            isBouncing={isBouncing}
            showShadow={false}
          />
        </div>
      </div>
    </div>
  );
};

