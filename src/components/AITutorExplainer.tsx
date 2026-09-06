import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  CheckCircle2, 
  FilePlus, 
  Layers, 
  Zap, 
  MessageSquare
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { StudyNote, Flashcard, PetCustomization } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import { useTranslation } from "../utils/translations";
import confetti from "canvas-confetti";

interface AITutorExplainerProps {
  onSaveAsNote?: (note: StudyNote) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
}

export const AITutorExplainer: React.FC<AITutorExplainerProps> = ({
  onSaveAsNote,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
}) => {
  const { t } = useTranslation();
  const [topicInput, setTopicInput] = useState("");
  const [contextInput, setContextInput] = useState("");
  const [mode, setMode] = useState<"feynman" | "step_by_step" | "academic" | "socratic">("feynman");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quick prompt chips
  const quickTopics = [
    "¿Cómo funciona la fotosíntesis?",
    "Explícame la Ley de Ohm con agua",
    "¿Qué causó la Primera Guerra Mundial?",
    "¿Por qué el cielo es azul?",
    "Diferencia entre mitosis y meiosis",
    "¿Cómo funcionan las redes neuronales artificiales?",
  ];

  const handleAskTutor = async (overrideTopic?: string) => {
    const query = overrideTopic || topicInput;
    if (!query.trim()) return;

    setIsLoading(true);
    setExplanation(null);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: query,
          mode,
          context: contextInput,
        }),
      });

      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
        onRewardCarrot(2);
        confetti({ particleCount: 30, spread: 50 });
        if (onTuddyCheer) onTuddyCheer("¡Aquí tienes la explicación clarita como el agua! 🐰✨");
      }
    } catch (err) {
      console.error(err);
      alert("Error al obtener la explicación de Tuddy.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = () => {
    if (!("speechSynthesis" in window) || !explanation) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown symbols for cleaner voice
      const cleanText = explanation.replace(/[#*_`]/g, "").replace(/[🐰✨🥕💡]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-ES";
      utterance.pitch = 1.15;
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToNotes = () => {
    if (!explanation || !onSaveAsNote) return;
    const title = topicInput.trim() || "Explicación de Tuddy";
    const newNote: StudyNote = {
      id: "note-tutor-" + Date.now(),
      title: `Tutor: ${title}`,
      subject: "Explicaciones Tuddy",
      rawContent: explanation,
      aiSummary: explanation,
      tags: ["tutor", "ia", mode],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveAsNote(newNote);
    alert("¡Guardado en tus notas de estudio! 📝🐰");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
          <PetAvatar pet={pet} size="xs" showBg={false} />
          <span>{pet.name} {t.navTutor}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {t.tutorTitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {t.tutorSubtitle}
        </p>
      </div>

      {/* Input Box Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {/* Mode Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            {t.askTuddyPrompt || "Elige el estilo de explicación:"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: "feynman",
                title: "Feynman",
                subtitle: "Simple & claro",
                emoji: "🧒",
              },
              {
                id: "step_by_step",
                title: "Paso a Paso",
                subtitle: "Con ejemplos",
                emoji: "🔢",
              },
              {
                id: "academic",
                title: "Académico",
                subtitle: "Formal & rigor",
                emoji: "🎓",
              },
              {
                id: "socratic",
                title: "Socrático",
                subtitle: "Deducción activa",
                emoji: "🏛️",
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id as any)}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  mode === m.id
                    ? "border-amber-400 bg-amber-50/70 text-amber-950 shadow-xs ring-1 ring-amber-400"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="text-xl mb-1">{m.emoji}</span>
                <span className="text-xs font-bold">{m.title}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{m.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.tutorInputPlaceholder || "Tema, duda o problema a resolver *"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAskTutor();
              }}
              placeholder={t.tutorInputPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
            />
            <button
              type="button"
              disabled={isLoading || !topicInput.trim()}
              onClick={() => handleAskTutor()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-amber-500 p-2 text-white shadow-xs hover:bg-amber-600 disabled:opacity-40 transition-colors"
            >
              {isLoading ? (
                <RotateCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Optional Context Accordion */}
        <details className="text-xs text-slate-600 group">
          <summary className="cursor-pointer font-medium hover:text-amber-700 select-none inline-flex items-center gap-1">
            <span>+ Agregar contexto de tus apuntes o ejercicio específico (opcional)</span>
          </summary>
          <div className="mt-2">
            <textarea
              rows={3}
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              placeholder="Pega aquí el enunciado del ejercicio, fórmula o párrafo de tus notas que no entiendes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </details>

        {/* Quick prompt chips */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Prueba con:</span>
          {quickTopics.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setTopicInput(q);
                handleAskTutor(q);
              }}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] text-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Result Output */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-amber-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <PetAvatar pet={pet} size="xs" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Respuesta de {pet.name} ({mode.toUpperCase()})
                </h4>
                <span className="text-[11px] text-slate-400">Explicación personalizada</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                  isSpeaking
                    ? "border-amber-400 bg-amber-100 text-amber-900 animate-pulse"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                <span>{isSpeaking ? t.cancel : t.listenAudio}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToNotes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
              >
                <FilePlus className="h-3.5 w-3.5" />
                <span>{t.saveAsNote}</span>
              </button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-ul:my-2">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>

          {/* Follow-up actions */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-amber-900">
              <span className="font-bold">¿Te quedó alguna duda?</span> Pídele a Tuddy otro ejemplo o cambia al modo Feynman.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTopicInput(topicInput + " - Dame otro ejemplo diferente de la vida cotidiana");
                  handleAskTutor(topicInput + " - Dame otro ejemplo diferente de la vida cotidiana");
                }}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-2xs"
              >
                Otro ejemplo 🔄
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
