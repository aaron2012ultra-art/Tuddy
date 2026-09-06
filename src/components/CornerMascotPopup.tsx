import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  X, 
  Sparkles, 
  BookOpen, 
  Heart, 
  ChevronRight,
  MessageCircle,
  Lightbulb
} from "lucide-react";
import { PetCustomization, CustomSubject, ScheduleItem } from "../types";
import { AnthropomorphicBunny, PetAvatar } from "./AnthropomorphicBunny";
import confetti from "canvas-confetti";

interface CornerMascotPopupProps {
  pet: PetCustomization;
  subjects: CustomSubject[];
  schedule: ScheduleItem[];
  onRewardCarrot: (amount: number) => void;
  onNavigateToSubject?: (subjectName: string) => void;
}

interface MascotAdviceData {
  title: string;
  subject: string;
  advice: string;
  actionTip: string;
  expression: "cheering" | "studying" | "happy" | "relaxed" | "proud";
}

export const CornerMascotPopup: React.FC<CornerMascotPopupProps> = ({
  pet,
  subjects,
  schedule,
  onRewardCarrot,
  onNavigateToSubject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adviceData, setAdviceData] = useState<MascotAdviceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasCheered, setHasCheered] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const timerRef = useRef<any>(null);

  // Pool of subjects to advise on
  const availableSubjectNames = Array.from(
    new Set([
      ...subjects.map((s) => s.name),
      ...schedule.map((s) => s.subject),
    ])
  ).filter(Boolean);

  const fetchAdviceForRandomSubject = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setHasCheered(false);

    // Pick a random subject from user's assigned subjects
    const targetSubject = availableSubjectNames.length > 0
      ? availableSubjectNames[Math.floor(Math.random() * availableSubjectNames.length)]
      : "Técnicas de Estudio y Concentración";

    // Related schedule info if any
    const scheduleMatch = schedule.find((s) => s.subject.toLowerCase() === targetSubject.toLowerCase());
    const scheduleInfo = scheduleMatch ? `Sesión programada de ${scheduleMatch.startTime} a ${scheduleMatch.endTime}` : "";

    try {
      const res = await fetch("/api/ai/mascot-subject-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet,
          subject: targetSubject,
          scheduleInfo,
        }),
      });

      if (!res.ok) throw new Error("Advice error");
      const data = await res.json();
      setAdviceData({
        title: data.title || `💡 Consejo de ${pet.name} para ${targetSubject}`,
        subject: targetSubject,
        advice: data.advice || `¡Concéntrate 20 minutos en ${targetSubject} sin celular y verás cuánto retienes!`,
        actionTip: data.actionTip || `Revisa 3 conceptos de ${targetSubject}.`,
        expression: data.expression || (pet.personality === "calm_wise" ? "relaxed" : "cheering"),
      });
      setIsOpen(true);
      setIsMinimized(false);
    } catch (err) {
      console.warn("Using offline fallback for mascot advice:", err);
      // Fallback
      setAdviceData({
        title: `🥕 Consejo de ${pet.name} para ${targetSubject}`,
        subject: targetSubject,
        advice: `¡Hola! En ${targetSubject}, asociar conceptos clave con imágenes mentales multiplica tu memoria a largo plazo. 🐰✨`,
        actionTip: `Dibuja un mini-esquema de ${targetSubject} de 2 minutos.`,
        expression: pet.personality === "calm_wise" ? "relaxed" : "happy",
      });
      setIsOpen(true);
      setIsMinimized(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Periodic trigger: every 3.5 minutes, pop up a surprise advice if not already open
  useEffect(() => {
    // Initial surprise advice after 45 seconds for demonstration
    const firstTimer = setTimeout(() => {
      fetchAdviceForRandomSubject();
    }, 45000);

    const recurringInterval = setInterval(() => {
      if (!isOpen) {
        fetchAdviceForRandomSubject();
      }
    }, 210000); // 3.5 minutes

    return () => {
      clearTimeout(firstTimer);
      clearInterval(recurringInterval);
    };
  }, [pet.name, pet.personality, availableSubjectNames.length]);

  const handleSpeak = () => {
    if (!adviceData || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = `${adviceData.title}. ${adviceData.advice}. Sugerencia: ${adviceData.actionTip}`;
    const utterance = new SpeechSynthesisUtterance(cleanText.replace(/[🐰🔥🍃🥕⚡💡]/g, ""));
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

  const handleRewardCarrot = () => {
    if (hasCheered) return;
    setHasCheered(true);
    onRewardCarrot(2);
    confetti({ particleCount: 30, spread: 50, origin: { x: 0.85, y: 0.85 } });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-none">
      {/* 1. DISCREET CALL BUTTON (Always accessible so the user can summon advice whenever they want) */}
      {!isOpen && (
        <motion.button
          type="button"
          onClick={fetchAdviceForRandomSubject}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2.5 shadow-lg border-2 border-[#E8E2D9] text-[#4A4A4A] hover:border-[#FFB7B2] hover:bg-[#FFF8E6] transition-all group backdrop-blur-xs"
        >
          <div className="relative">
            <PetAvatar pet={pet} size="xs" className="group-hover:scale-110 transition-transform shadow-2xs" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-left">
            <span className="text-[11px] font-black text-[#4A4A4A] block font-heading leading-tight">
              {isLoading ? "Consultando a " + pet.name + "..." : `Tip de ${pet.name}`}
            </span>
            <span className="text-[9px] text-[#7A7A7A] block font-medium">
              Asomarse con un consejo
            </span>
          </div>
        </motion.button>
      )}

      {/* 2. THE PEEKING CORNER MASCOT & SPEECH BUBBLE */}
      <AnimatePresence>
        {isOpen && adviceData && (
          <motion.div
            initial={{ opacity: 0, y: 120, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto flex flex-col sm:flex-row items-end sm:items-center gap-3 max-w-sm sm:max-w-md"
          >
            {/* SPEECH BUBBLE */}
            <div className="relative bg-[#FDF9F3] p-4 rounded-3xl border-2 border-[#E8E2D9] shadow-2xl text-[#4A4A4A] space-y-2.5 w-full">
              {/* Top bar with Mascot Identity and Close */}
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFB7B2]/20 text-[#D97706] border border-[#FFB7B2]/30">
                    {pet.personality === "enthusiastic" ? "🔥 Entusiasta" : pet.personality === "calm_wise" ? "🍃 Sabio" : "⚡ Divertido"}
                  </span>
                  <span className="text-[11px] font-bold text-[#4A4A4A]">
                    {pet.name} se asomó
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSpeak}
                    title="Escuchar consejo"
                    className={`rounded-full p-1 text-[#7A7A7A] hover:text-[#4A4A4A] transition-colors ${
                      isSpeaking ? "bg-[#FFB7B2] text-white animate-pulse" : "hover:bg-white"
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-1 text-[#7A7A7A] hover:text-[#4A4A4A] hover:bg-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subject Tag & Title */}
              <div>
                <span className="text-[10px] font-bold text-[#FFB7B2] bg-rose-50 px-2 py-0.5 rounded-md border border-[#FFB7B2]/20 inline-block mb-1">
                  Materia: {adviceData.subject}
                </span>
                <h4 className="text-xs font-black text-[#4A4A4A] font-heading leading-tight">
                  {adviceData.title}
                </h4>
              </div>

              {/* Body Text */}
              <p className="text-xs text-[#4A4A4A] leading-relaxed bg-white p-2.5 rounded-2xl border border-[#E8E2D9]">
                "{adviceData.advice}"
              </p>

              {/* Action Tip */}
              <div className="flex items-start gap-1.5 text-[11px] text-[#7A7A7A] bg-[#FFF8E6] p-2 rounded-xl border border-[#FDE68A]">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Micro-reto:</strong> {adviceData.actionTip}</span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleRewardCarrot}
                  disabled={hasCheered}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold border transition-all ${
                    hasCheered
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-[#4A4A4A] border-[#E8E2D9] hover:border-[#FFB7B2] active:scale-95"
                  }`}
                >
                  <span>{hasCheered ? "¡Gracias! 🥕✨" : "🥕 Dar zanahoria (+2)"}</span>
                </button>

                {onNavigateToSubject && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToSubject(adviceData.subject);
                      setIsOpen(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-[#FFB7B2] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#ffa5a0] transition-colors shadow-2xs"
                  >
                    <span>Ver materia</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* THE ANTHROPOMORPHIC BUNNY EMERGING FROM CORNER */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="shrink-0 cursor-pointer filter drop-shadow-md select-none -mb-2"
              onClick={handleRewardCarrot}
              title={`¡Haz clic para interactuar con ${pet.name}!`}
            >
              <AnthropomorphicBunny
                pet={pet}
                mood={adviceData.expression}
                size="sm"
                isBouncing={hasCheered}
                showShadow={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
