import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX,
  BookOpen, 
  PenTool, 
  Target, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  X, 
  Sparkles, 
  Plane, 
  Award,
  RotateCcw
} from "lucide-react";
import { LanguageLesson, PetCustomization, AppSettings } from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import confetti from "canvas-confetti";
import { useTranslation } from "../utils/translations";

interface InteractiveLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LanguageLesson;
  cityTitle?: string;
  countryName?: string;
  flagEmoji?: string;
  carrotsReward?: number;
  pet: PetCustomization;
  settings?: AppSettings;
  onCompleteLesson: (carrotsEarned: number) => void;
}

type LessonStep = "listening" | "reading" | "writing" | "challenge" | "completed";

export const InteractiveLessonModal: React.FC<InteractiveLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  cityTitle = "Lección de Idiomas",
  countryName = "",
  flagEmoji = "🌍",
  carrotsReward = 15,
  pet,
  settings,
  onCompleteLesson,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<LessonStep>("listening");
  const [speed, setSpeed] = useState<number>(settings?.speechSpeed || 1.0);
  const [tuddyMessage, setTuddyMessage] = useState<string>(
    lesson.pronunciationTip || "¡Escucha con atención y despeguemos juntos!"
  );
  const [tuddyMood, setTuddyMood] = useState<"happy" | "thinking" | "cheering">("happy");

  // Step 1: Listening State
  const [listeningSelectedOption, setListeningSelectedOption] = useState<number | null>(null);
  const [listeningSubmitted, setListeningSubmitted] = useState(false);

  // Step 2: Reading State
  const [readingSelectedOption, setReadingSelectedOption] = useState<number | null>(null);
  const [readingSubmitted, setReadingSubmitted] = useState(false);

  // Step 3: Writing State
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [writingSubmitted, setWritingSubmitted] = useState(false);
  const [writingIsCorrect, setWritingIsCorrect] = useState<boolean | null>(null);
  const [showWritingHint, setShowWritingHint] = useState(false);

  // Step 4: Challenge State
  const [challengeSelectedOption, setChallengeSelectedOption] = useState<number | null>(null);
  const [challengeSubmitted, setChallengeSubmitted] = useState(false);

  // Fallback structures if lesson didn't have optional fields
  const listeningData = lesson.listeningExercise || {
    audioText: lesson.vocabulary[0]?.exampleSentence || lesson.vocabulary[0]?.word || "Hello",
    question: `¿Qué significa o expresa la frase escuchada en ${lesson.targetLanguage}?`,
    options: [
      lesson.vocabulary[0]?.exampleTranslation || lesson.vocabulary[0]?.translation || "Opción correcta",
      "Una despedida informal de noche",
      "Pedir la cuenta en un restaurante",
      "Una queja sobre el clima",
    ],
    correctOptionIndex: 0,
    tip: lesson.pronunciationTip,
  };

  const readingData = lesson.readingExercise || {
    passageTitle: `Diálogo en contexto (${lesson.level})`,
    passageText: lesson.dialogue.map((d) => `${d.speaker}: "${d.text}"`).join("\n\n"),
    question: `Según el diálogo en ${lesson.targetLanguage}, ¿cuál es la intención principal?`,
    options: [
      lesson.dialogue[0]?.translation ? `Traducción: "${lesson.dialogue[0].translation}"` : "Establecer una conversación cortés y amigable",
      "Cancelar un billete de transporte",
      "Discutir acaloradamente con el oficial",
      "Comprar un paraguas roto",
    ],
    correctOptionIndex: 0,
    explanation: "El diálogo presenta un intercambio natural respetuoso acorde al nivel.",
  };

  const writingData = lesson.writingExercise || {
    prompt: `Traduce o escribe en ${lesson.targetLanguage}: "${lesson.vocabulary[0]?.translation || "Hola"}"`,
    expectedAnswer: lesson.vocabulary[0]?.word || "Hello",
    alternativeAcceptable: [lesson.vocabulary[0]?.word?.toLowerCase() || "hello"],
    hint: `Empieza con la letra "${(lesson.vocabulary[0]?.word || "H").charAt(0)}"`,
  };

  // Resolve language code
  const resolveLangCode = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes("ingl") || l.includes("eng")) return "en-US";
    if (l.includes("fran") || l.includes("fr")) return "fr-FR";
    if (l.includes("alem") || l.includes("ger") || l.includes("de")) return "de-DE";
    if (l.includes("japo") || l.includes("jap") || l.includes("ja")) return "ja-JP";
    if (l.includes("ital") || l.includes("it")) return "it-IT";
    if (l.includes("port") || l.includes("pt")) return "pt-BR";
    return "en-US";
  };

  const langCode = resolveLangCode(lesson.targetLanguage);

  // Audio Speech Synthesis
  const speak = (text: string, rateMultiplier: number = 1.0) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = speed * rateMultiplier;
    window.speechSynthesis.speak(utterance);
  };

  // Reset states when opening a new lesson
  useEffect(() => {
    if (isOpen) {
      setCurrentStep("listening");
      setListeningSelectedOption(null);
      setListeningSubmitted(false);
      setReadingSelectedOption(null);
      setReadingSubmitted(false);
      setWrittenAnswer("");
      setWritingSubmitted(false);
      setWritingIsCorrect(null);
      setShowWritingHint(false);
      setChallengeSelectedOption(null);
      setChallengeSubmitted(false);
      setTuddyMood("happy");
      setTuddyMessage(lesson.pronunciationTip || "¡Despeguemos escuchando la pronunciación nativa!");
      // Auto-play initial listening audio after a small delay
      const t = setTimeout(() => {
        speak(listeningData.audioText);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen, lesson.topicTitle]);

  if (!isOpen) return null;

  // Accents keyboard helper based on target language
  const getAccentsForLang = () => {
    const l = lesson.targetLanguage.toLowerCase();
    if (l.includes("fran")) return ["é", "è", "à", "ç", "ù", "ê", "î", "ô", "œ", "’"];
    if (l.includes("alem")) return ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];
    if (l.includes("port")) return ["ã", "õ", "á", "é", "í", "ó", "ú", "ç", "ê"];
    if (l.includes("ital")) return ["à", "è", "é", "ì", "ò", "ù", "’"];
    if (l.includes("japo")) return ["ありがとう", "です", "ます", "か", "はい", "いいえ"];
    return ["'", "-", "!", "?"];
  };

  // Writing normalization helper
  const checkWritingAnswer = () => {
    if (!writtenAnswer.trim()) return;
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/[.,!?;:¿¡]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const userAnswer = clean(writtenAnswer);
    const expected = clean(writingData.expectedAnswer);
    const alternatives = (writingData.alternativeAcceptable || []).map(clean);

    const isMatch = userAnswer === expected || alternatives.includes(userAnswer);
    setWritingIsCorrect(isMatch);
    setWritingSubmitted(true);

    if (isMatch) {
      setTuddyMood("cheering");
      setTuddyMessage("¡Escritura impecable! Tus alas de gramática están perfectas 🐰✍️");
      if (settings?.soundEffects !== false) {
        confetti({ particleCount: 25, spread: 50 });
      }
    } else {
      setTuddyMood("thinking");
      setTuddyMessage("¡Casi lo tienes! Compara tu respuesta con la ortografía nativa.");
    }
  };

  // Completion Handler
  const handleFinalFinish = () => {
    if (settings?.soundEffects !== false) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }
    onCompleteLesson(carrotsReward);
    setCurrentStep("completed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[#FDFBF7] rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden"
      >
        {/* HEADER BAR */}
        <div className="relative z-10 px-5 py-4 border-b border-[#E8E2D9] bg-gradient-to-r from-sky-50 via-white to-amber-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex items-center justify-center text-2xl">
              {flagEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#0C4A6E] tracking-tight">
                  {cityTitle} {countryName ? `• ${countryName}` : ""}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200">
                  {lesson.level}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-700 truncate max-w-xs sm:max-w-md">
                {lesson.topicTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shadow-2xs">
              <span>🥕</span>
              <span>+{carrotsReward}</span>
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/80 hover:bg-slate-200/80 border border-[#E8E2D9] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar lección"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR (4 Partes: Auditiva, Lectura, Escritura, Reto) */}
        {currentStep !== "completed" && (
          <div className="px-5 py-2.5 bg-slate-50/80 border-b border-[#E8E2D9]/60 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold select-none">
            <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
              {/* Step 1: Listening */}
              <div
                onClick={() => setCurrentStep("listening")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  currentStep === "listening"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : listeningSubmitted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="truncate">1. {t.practiceListening}</span>
              </div>

              {/* Step 2: Reading */}
              <div
                onClick={() => setCurrentStep("reading")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  currentStep === "reading"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : readingSubmitted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate">2. {t.practiceReading}</span>
              </div>

              {/* Step 3: Writing */}
              <div
                onClick={() => setCurrentStep("writing")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  currentStep === "writing"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : writingSubmitted && writingIsCorrect
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="truncate">3. {t.practiceWriting}</span>
              </div>

              {/* Step 4: Challenge */}
              <div
                onClick={() => setCurrentStep("challenge")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  currentStep === "challenge"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : challengeSubmitted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span className="truncate">4. {t.practiceChallenge}</span>
              </div>
            </div>
          </div>
        )}

        {/* SCROLLABLE LESSON BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ============================================================ */}
          {/* 1. PARTE AUDITIVA (Listening & Pronunciation) */}
          {/* ============================================================ */}
          {currentStep === "listening" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  🎧 Módulo Auditivo • Escucha y Comprende
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-[11px] font-bold text-slate-600">
                  <span className="px-1 text-slate-400">Velocidad:</span>
                  <button
                    type="button"
                    onClick={() => setSpeed(0.8)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      speed === 0.8 ? "bg-sky-500 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    0.8x Lenta
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed(1.0)}
                    className={`px-2 py-0.5 rounded-lg transition-colors ${
                      speed === 1.0 ? "bg-sky-500 text-white" : "hover:bg-slate-100"
                    }`}
                  >
                    1.0x Normal
                  </button>
                </div>
              </div>

              {/* Big Audio Player Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-50 via-white to-sky-50/40 border-2 border-sky-200 shadow-xs flex flex-col items-center text-center">
                <p className="text-xs font-bold text-slate-500 mb-3">
                  Toca el botón para escuchar la pronunciación nativa de la frase:
                </p>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => speak(listeningData.audioText)}
                  className="w-16 h-16 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center justify-center shadow-lg shadow-sky-500/25 cursor-pointer mb-3"
                  title="Reproducir audio"
                >
                  <Volume2 className="w-8 h-8" />
                </motion.button>

                <p className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  "{listeningData.audioText}"
                </p>

                {lesson.vocabulary[0]?.phoneticOrPronunciationGuide && (
                  <span className="mt-1 text-xs font-mono font-bold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-md">
                    Guía fonética: {lesson.vocabulary[0].phoneticOrPronunciationGuide}
                  </span>
                )}
              </div>

              {/* Auditory Comprehension Question */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  {listeningData.question}
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {listeningData.options.map((option, idx) => {
                    const isSelected = listeningSelectedOption === idx;
                    const isCorrect = idx === listeningData.correctOptionIndex;

                    let btnStyle = "bg-white border-slate-200 hover:border-sky-300 text-slate-700";
                    if (listeningSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-50 border-rose-300 text-rose-700";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-sky-50 border-sky-500 text-sky-900 font-bold ring-2 ring-sky-200";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!listeningSubmitted) {
                            setListeningSelectedOption(idx);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {listeningSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {listeningSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Step 1 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {!listeningSubmitted ? (
                  <button
                    type="button"
                    disabled={listeningSelectedOption === null}
                    onClick={() => {
                      if (listeningSelectedOption === null) return;
                      setListeningSubmitted(true);
                      const isCorrect = listeningSelectedOption === listeningData.correctOptionIndex;
                      if (isCorrect) {
                        setTuddyMood("cheering");
                        setTuddyMessage("¡Excelente oído! Has captado el significado exacto 🐰🎧");
                        if (settings?.soundEffects !== false) {
                          confetti({ particleCount: 20, spread: 40 });
                        }
                      } else {
                        setTuddyMood("thinking");
                        setTuddyMessage("¡Escucha de nuevo! La práctica auditiva afina el oído con cada intento.");
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all ${
                      listeningSelectedOption !== null
                        ? "bg-[#0284C7] hover:bg-[#0369A1] text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Verificar Audio
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep("reading");
                      setTuddyMood("happy");
                      setTuddyMessage("¡Momento de lectura! Lee el diálogo y deduce los detalles.");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Avanzar a Lectura</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {listeningData.tip && (
                  <span className="text-[11px] font-semibold text-slate-500 italic max-w-xs text-right">
                    💡 {listeningData.tip}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 2. PARTE DE LECTURA (Reading & Context) */}
          {/* ============================================================ */}
          {currentStep === "reading" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  📖 Módulo de Lectura • Comprensión Situacional
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {readingData.passageTitle}
                </span>
              </div>

              {/* Reading Passage Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs space-y-3">
                {lesson.dialogue && lesson.dialogue.length > 0 ? (
                  <div className="space-y-2.5">
                    {lesson.dialogue.map((line, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="text-[11px] font-black text-sky-700 block">
                            {line.speaker}:
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">
                            "{line.text}"
                          </p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            {line.translation}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(line.text)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 text-slate-600 hover:text-sky-700 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
                          title="Escuchar línea"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {readingData.passageText}
                  </p>
                )}
              </div>

              {/* Reading Comprehension Question */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  {readingData.question}
                </h4>

                <div className="grid grid-cols-1 gap-2">
                  {readingData.options.map((option, idx) => {
                    const isSelected = readingSelectedOption === idx;
                    const isCorrect = idx === readingData.correctOptionIndex;

                    let btnStyle = "bg-white border-slate-200 hover:border-amber-300 text-slate-700";
                    if (readingSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-50 border-rose-300 text-rose-700";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-200";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!readingSubmitted) {
                            setReadingSelectedOption(idx);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {readingSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {readingSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Step 2 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {!readingSubmitted ? (
                  <button
                    type="button"
                    disabled={readingSelectedOption === null}
                    onClick={() => {
                      if (readingSelectedOption === null) return;
                      setReadingSubmitted(true);
                      const isCorrect = readingSelectedOption === readingData.correctOptionIndex;
                      if (isCorrect) {
                        setTuddyMood("cheering");
                        setTuddyMessage("¡Gran comprensión lectora! Analizaste el contexto como un auténtico nativo 🐰📖");
                        if (settings?.soundEffects !== false) {
                          confetti({ particleCount: 20, spread: 40 });
                        }
                      } else {
                        setTuddyMood("thinking");
                        setTuddyMessage("Revisa el diálogo de nuevo, ¡las pistas están en las frases de cada personaje!");
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all ${
                      readingSelectedOption !== null
                        ? "bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Verificar Lectura
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep("writing");
                      setTuddyMood("happy");
                      setTuddyMessage("¡Turno de escribir! Tipea la respuesta en el idioma meta con tu teclado.");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Avanzar a Escritura</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {readingData.explanation && readingSubmitted && (
                  <span className="text-[11px] font-semibold text-slate-500 italic max-w-xs text-right">
                    💡 {readingData.explanation}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 3. PARTE DE ESCRITURA (Writing & Typing) */}
          {/* ============================================================ */}
          {currentStep === "writing" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  ✍️ Módulo de Escritura • Tipeo en Idioma Meta
                </span>
                <button
                  type="button"
                  onClick={() => setShowWritingHint(!showWritingHint)}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 underline cursor-pointer"
                >
                  {showWritingHint ? "Ocultar pista" : "¿Necesitas una pista?"}
                </button>
              </div>

              {/* Writing Card Prompt */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    Consigna de traducción o redacción:
                  </span>
                  <h4 className="text-base font-black text-slate-800">
                    {writingData.prompt}
                  </h4>
                </div>

                {/* Input with AutoFocus */}
                <div className="relative">
                  <input
                    type="text"
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !writingSubmitted) {
                        checkWritingAnswer();
                      }
                    }}
                    placeholder={`Escribe aquí en ${lesson.targetLanguage}...`}
                    disabled={writingSubmitted && writingIsCorrect === true}
                    className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 outline-hidden transition-all ${
                      writingSubmitted
                        ? writingIsCorrect
                          ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                          : "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-slate-50 border-slate-200 focus:border-purple-400 focus:bg-white text-slate-800"
                    }`}
                  />
                  {writtenAnswer && (
                    <button
                      type="button"
                      onClick={() => speak(writtenAnswer)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 p-1"
                      title="Pronunciar lo escrito"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Quick accents keyboard buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Caracteres:</span>
                  {getAccentsForLang().map((char, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWrittenAnswer((prev) => prev + char)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-700 text-xs font-mono font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWrittenAnswer("")}
                    className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-[11px] font-bold ml-auto"
                  >
                    Borrar
                  </button>
                </div>

                {/* Hint if requested */}
                {showWritingHint && writingData.hint && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold">
                    💡 Pista de Tuddy: {writingData.hint}
                  </div>
                )}

                {/* Feedback Result */}
                {writingSubmitted && (
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      writingIsCorrect
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                        : "bg-rose-50 border-rose-300 text-rose-800"
                    }`}
                  >
                    <div>
                      {writingIsCorrect ? (
                        <span>✓ ¡Respuesta correcta! Excelente ortografía.</span>
                      ) : (
                        <span>
                          ✗ Respuesta esperada: <span className="font-mono underline font-black">{writingData.expectedAnswer}</span>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(writingData.expectedAnswer)}
                      className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Escuchar
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons for Step 3 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {!writingSubmitted || !writingIsCorrect ? (
                  <button
                    type="button"
                    disabled={!writtenAnswer.trim()}
                    onClick={checkWritingAnswer}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all ${
                      writtenAnswer.trim()
                        ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Verificar Escritura
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep("challenge");
                      setTuddyMood("happy");
                      setTuddyMessage("¡Último paso! Supera el Reto de Despegue para ganar tus zanahorias.");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Ir al Reto de Despegue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {writingSubmitted && !writingIsCorrect && (
                  <button
                    type="button"
                    onClick={() => {
                      setWritingSubmitted(false);
                      setWritingIsCorrect(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. PARTE DEL RETO DE DESPEGUE (Interactive Challenge) */}
          {/* ============================================================ */}
          {currentStep === "challenge" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  🎯 Reto de Despegue • Prueba de Consolidación
                </span>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <span>🥕</span> +{carrotsReward} zanahorias
                </span>
              </div>

              {/* Challenge Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-800">
                  {lesson.interactiveChallenge.promptText}
                </h3>

                {lesson.interactiveChallenge.sentenceToCompleteOrTranslate && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs font-bold text-amber-900 flex items-center justify-between">
                    <span>{lesson.interactiveChallenge.sentenceToCompleteOrTranslate}</span>
                    <button
                      type="button"
                      onClick={() => speak(lesson.interactiveChallenge.sentenceToCompleteOrTranslate)}
                      className="text-amber-700 hover:text-amber-900 p-1"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Challenge Options */}
                <div className="grid grid-cols-1 gap-2.5">
                  {lesson.interactiveChallenge.options.map((option, idx) => {
                    const isSelected = challengeSelectedOption === idx;
                    const isCorrect = idx === lesson.interactiveChallenge.correctOptionIndex;

                    let btnStyle = "bg-white border-slate-200 hover:border-rose-300 text-slate-700";
                    if (challengeSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-50 border-rose-300 text-rose-700";
                      } else {
                        btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-200";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (!challengeSubmitted) {
                            setChallengeSelectedOption(idx);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {challengeSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {challengeSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {challengeSubmitted && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                    💡 <span className="font-bold">Explicación:</span> {lesson.interactiveChallenge.explanation}
                  </div>
                )}
              </div>

              {/* Action Buttons for Step 4 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {!challengeSubmitted ? (
                  <button
                    type="button"
                    disabled={challengeSelectedOption === null}
                    onClick={() => {
                      if (challengeSelectedOption === null) return;
                      setChallengeSubmitted(true);
                      const isCorrect = challengeSelectedOption === lesson.interactiveChallenge.correctOptionIndex;
                      if (isCorrect) {
                        setTuddyMood("cheering");
                        setTuddyMessage(lesson.tuddyEncouragement || "¡Reto conquistado! Eres un as del aire.");
                      } else {
                        setTuddyMood("thinking");
                        setTuddyMessage("¡Revisa la explicación! Siempre podemos ajustar el timón.");
                      }
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xs transition-all ${
                      challengeSelectedOption !== null
                        ? "bg-[#E11D48] hover:bg-[#BE123C] text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Verificar Reto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalFinish}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>¡Completar Lección y Reclamar Zanahorias!</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PANTALLA FINAL DE VICTORIA (Completed Screen) */}
          {/* ============================================================ */}
          {currentStep === "completed" && (
            <div className="py-8 px-4 text-center space-y-5 animate-in zoom-in-95 duration-400">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-300 text-emerald-600 flex items-center justify-center text-3xl shadow-lg"
              >
                🎉
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  ¡Lección Superada con Éxito!
                </h3>
                <p className="text-xs font-bold text-emerald-700">
                  Has dominado las 4 áreas: Auditiva, Lectura, Escritura y Reto final.
                </p>
              </div>

              {/* Carrots Bounty */}
              <div className="inline-flex items-center gap-2 bg-amber-50 border-2 border-amber-300 px-5 py-2.5 rounded-2xl shadow-xs">
                <span className="text-2xl">🥕</span>
                <span className="text-base font-black text-amber-900">
                  +{carrotsReward} Zanahorias sumadas a tu saldo
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] max-w-md mx-auto text-xs font-semibold text-slate-600">
                "{lesson.tuddyEncouragement}"
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-black shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
                >
                  Regresar al Mapa de Vuelo ✈️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TUDDY COMPANION REACTION FOOTER */}
        {currentStep !== "completed" && (
          <div className="px-5 py-3 bg-[#F4EFEA]/80 border-t border-[#E8E2D9] flex items-center gap-3">
            <div className="w-10 h-10 shrink-0">
              <AnthropomorphicBunny pet={pet} mood={tuddyMood} size="xs" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-black text-[#8C6D62] uppercase tracking-wide block">
                {pet.name} (Tutor de Vuelo):
              </span>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {tuddyMessage}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
