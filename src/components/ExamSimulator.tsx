import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  RotateCw, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Sliders, 
  Eye, 
  Lightbulb, 
  AlertCircle,
  FileCheck,
  Volume2,
  Shuffle,
  Link2,
  Crown
} from "lucide-react";
import { ExamQuestion, ExamConfig, ExamSession, PetCustomization } from "../types";
import { AnthropomorphicBunny, PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import { useTranslation } from "../utils/translations";
import confetti from "canvas-confetti";

interface ExamSimulatorProps {
  initialTopic?: string;
  initialNotes?: string;
  onSaveExamResult: (session: ExamSession) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  initialTopic = "",
  initialNotes = "",
  onSaveExamResult,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const { t } = useTranslation();

  // Config state
  const [topic, setTopic] = useState(initialTopic || "Biología y Ciencias");
  const [notesSource, setNotesSource] = useState(initialNotes || "");
  const [questionCount, setQuestionCount] = useState(5);
  const [customQuestionCount, setCustomQuestionCount] = useState(60);
  const [useCustomCount, setUseCustomCount] = useState(false);
  const [difficulty, setDifficulty] = useState<ExamConfig["difficulty"]>("intermediate");
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<ExamConfig["questionTypes"]>([
    "multiple_choice",
    "true_false",
    "fill_blank",
  ]);

  // Exam state
  const [isGenerating, setIsGenerating] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [tuddyTip, setTuddyTip] = useState("");

  // Running exam
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  // Results & AI open question evaluations
  const [evaluatingOpenAnswers, setEvaluatingOpenAnswers] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (examActive && timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examActive, timerActive, secondsRemaining]);

  const toggleType = (t: ExamConfig["questionTypes"][number], isProType = false) => {
    if (isProType && !isPro) {
      onOpenSubscriptionModal?.();
      return;
    }
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length === 1) return; // Keep at least one
      setSelectedTypes(selectedTypes.filter((x) => x !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const effectiveQuestionCount = useCustomCount ? customQuestionCount : questionCount;

  // Generate Exam
  const handleStartExam = async () => {
    if (!topic.trim() && !notesSource.trim()) {
      alert("Por favor escribe un tema o pega tus notas.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          notes: notesSource,
          questionCount: effectiveQuestionCount,
          questionTypes: selectedTypes,
          difficulty,
          includeVisualPrompts: includeVisuals,
          timeLimitMinutes,
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setExamTitle(data.title || `Simulacro: ${topic}`);
        setTuddyTip(data.tuddyMascotTip || "¡Respira hondo y confía en lo que has estudiado!");
        setUserAnswers({});
        setRevealedHints({});
        setCurrentIndex(0);
        setSecondsRemaining(timeLimitMinutes * 60);
        setExamActive(true);
        setTimerActive(true);
        setExamCompleted(false);

        if (onTuddyCheer) onTuddyCheer(data.tuddyMascotTip || "¡Comenzó tu examen! Tú puedes lograrlo 🐰🔥");
      } else {
        alert("No se pudieron generar preguntas. Intenta con otro tema.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al contactar con el generador de exámenes de Tuddy.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleHint = (qId: string) => {
    setRevealedHints((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // Finish & Grade Exam
  const finishExam = async () => {
    setTimerActive(false);
    setExamActive(false);
    setEvaluatingOpenAnswers(true);

    let earnedPoints = 0;
    let totalPossible = 0;

    // Check simple questions
    for (const q of questions) {
      const pts = q.points || 10;
      totalPossible += pts;
      const userAns = (userAnswers[q.id] || "").trim().toLowerCase();
      const correctAns = q.correctAnswer.trim().toLowerCase();

      if (q.type === "multiple_choice" || q.type === "true_false") {
        if (userAns === correctAns) {
          earnedPoints += pts;
        }
      } else if (q.type === "fill_blank") {
        if (userAns === correctAns || correctAns.includes(userAns)) {
          earnedPoints += pts;
        }
      } else if (q.type === "audio_dictation") {
        const cleanUser = userAns.replace(/[.,!?;:]/g, "").trim();
        const cleanCorrect = correctAns.replace(/[.,!?;:]/g, "").trim();
        if (cleanUser === cleanCorrect || cleanCorrect.includes(cleanUser)) {
          earnedPoints += pts;
        } else if (cleanUser.length > 3 && cleanCorrect.split(" ").some(w => cleanUser.includes(w))) {
          earnedPoints += Math.round(pts * 0.5);
        }
      } else if (q.type === "sentence_scramble") {
        const normUser = userAns.replace(/\s+/g, " ").trim();
        const normCorrect = correctAns.replace(/\s+/g, " ").trim();
        if (normUser === normCorrect) {
          earnedPoints += pts;
        }
      } else if (q.type === "concept_match") {
        if (userAns === correctAns) {
          earnedPoints += pts;
        }
      } else if (q.type === "open_short") {
        // Evaluate open question with AI if student wrote something
        if (userAns.length > 5) {
          try {
            const evalRes = await fetch("/api/ai/evaluate-answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                question: q.question,
                studentAnswer: userAnswers[q.id],
                expectedAnswer: q.correctAnswer,
              }),
            });
            const evalData = await evalRes.json();
            const ratio = (evalData.score || 70) / 100;
            earnedPoints += Math.round(pts * ratio);
          } catch {
            earnedPoints += Math.round(pts * 0.75);
          }
        }
      }
    }

    setEvaluatingOpenAnswers(false);
    setExamCompleted(true);
    setFinalScore(earnedPoints);
    setMaxScore(totalPossible || 100);

    const percentage = Math.round((earnedPoints / (totalPossible || 1)) * 100);

    // Save session
    const session: ExamSession = {
      id: "exam-" + Date.now(),
      title: examTitle || topic,
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      score: earnedPoints,
      maxScore: totalPossible,
      percentage,
      durationSeconds: timeLimitMinutes * 60 - secondsRemaining,
      answers: userAnswers,
      questions,
    };
    onSaveExamResult(session);

    // Rewards
    if (percentage >= 80) {
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
      onRewardCarrot(10);
      if (onTuddyCheer) onTuddyCheer(`¡Sobresaliente! ${percentage}% en tu examen. ¡10 zanahorias de premio! 🥕🏆`);
    } else if (percentage >= 60) {
      confetti({ particleCount: 40, spread: 50 });
      onRewardCarrot(5);
      if (onTuddyCheer) onTuddyCheer(`¡Bien hecho! ${percentage}%. Vamos a revisar los puntos a mejorar juntos 🐰👏`);
    } else {
      onRewardCarrot(2);
      if (onTuddyCheer) onTuddyCheer("¡Buen entrenamiento! Cada error en un simulacro es un acierto seguro en el examen real 🐰💪");
    }
  };

  const activeQ = questions[currentIndex];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            {t.examsTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.examsSubtitle}
          </p>
        </div>

        {examActive && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-500 text-white px-4 py-2 text-sm font-bold shadow-xs">
            <Clock className="h-4 w-4 animate-pulse" />
            <span>{t.minutes}: {formatTimer(secondsRemaining)}</span>
          </div>
        )}
      </div>

      {/* VIEW 1: CONFIGURATION PANEL */}
      {!examActive && !examCompleted && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 w-fit px-3 py-1 rounded-full">
            <Sliders className="h-3.5 w-3.5" />
            <span>{t.newExam}</span>
          </div>

          <div className="space-y-5">
            {/* Topic / Source */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.examTopic} *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Genética Mendeliana, Historia Contemporánea, Cálculo Integral..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>

            {/* Optional Paste Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido o Apuntes de Referencia (Opcional)
              </label>
              <textarea
                rows={3}
                value={notesSource}
                onChange={(e) => setNotesSource(e.target.value)}
                placeholder="Pega aquí párrafos de tus notas o PDFs para que el examen sea exactamente sobre tu temario..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Types of exercises customization */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tipos de Ejercicios a Incluir en el Examen:
                </label>
                <span className="text-[11px] text-amber-800 font-bold">3 tipos VIP desbloqueados con Pro 👑</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: "multiple_choice",
                    title: "Opción Múltiple",
                    desc: "4 alternativas con única respuesta",
                  },
                  {
                    id: "true_false",
                    title: "Verdadero o Falso",
                    desc: "Juicio de afirmaciones clave",
                  },
                  {
                    id: "fill_blank",
                    title: "Completar Espacio",
                    desc: "Terminología y conceptos",
                  },
                  {
                    id: "open_short",
                    title: "Pregunta Abierta",
                    desc: "Desarrollo evaluado por IA",
                  },
                  {
                    id: "audio_dictation",
                    title: "Dictado Auditivo",
                    desc: "Escucha el audio y transcribe",
                    isPro: true,
                  },
                  {
                    id: "sentence_scramble",
                    title: "Ordenar Frase",
                    desc: "Reorganiza palabras en orden",
                    isPro: true,
                  },
                  {
                    id: "concept_match",
                    title: "Emparejar Conceptos",
                    desc: "Conecta pares de conceptos",
                    isPro: true,
                  },
                ].map((t) => {
                  const active = selectedTypes.includes(t.id as any);
                  const isLocked = t.isPro && !isPro;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleType(t.id as any, t.isPro)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative ${
                        isLocked
                          ? "border-amber-200 bg-amber-50/40 text-amber-900 hover:border-amber-300"
                          : active
                          ? "border-amber-500 bg-amber-50/70 text-amber-950 ring-1 ring-amber-400"
                          : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold truncate">{t.title}</span>
                          {t.isPro && (
                            <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1 rounded-sm">
                              👑
                            </span>
                          )}
                        </div>
                        <div
                          className={`h-4 w-4 rounded-full flex items-center justify-center border shrink-0 ${
                            isLocked
                              ? "border-amber-300 text-amber-800 text-[10px] font-bold"
                              : active
                              ? "bg-amber-500 border-amber-600 text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isLocked ? "🔒" : active && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 leading-tight">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count, Difficulty & Time Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {/* Question count */}
              <div className="sm:col-span-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Número de Preguntas
                  </label>
                  <span className="text-[10px] font-bold text-slate-500">
                    {effectiveQuestionCount} preguntas
                  </span>
                </div>
                
                {/* Standard buttons (Free: max 15) */}
                <div className="flex items-center gap-1.5">
                  {[3, 5, 10, 15].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setUseCustomCount(false);
                        setQuestionCount(n);
                      }}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition-all border ${
                        !useCustomCount && questionCount === n
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Pro Tier: Extensive question sets (>50 preguntas) */}
                <div className="pt-1.5 border-t border-amber-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-amber-800 flex items-center gap-1">
                      <span>👑 Tuddy Plus: Más de 50 preguntas</span>
                    </span>
                    {!isPro && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-full">
                        $3.50/mes
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[25, 50, 60, 75, 100].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          if (!isPro) {
                            onOpenSubscriptionModal?.();
                            return;
                          }
                          setUseCustomCount(true);
                          setCustomQuestionCount(n);
                        }}
                        className={`flex-1 rounded-xl py-1 text-[11px] font-black transition-all border ${
                          useCustomCount && customQuestionCount === n
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-600 shadow-xs"
                            : "border-amber-200 bg-amber-50/50 text-amber-900 hover:bg-amber-100"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.difficulty}</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <option value="easy">🌱 {t.difficultyEasy}</option>
                  <option value="intermediate">⭐ {t.difficultyMedium}</option>
                  <option value="hard">🔥 {t.difficultyHard}</option>
                  <option value="simulated_exam">🏆 {t.examSimulatorCard}</option>
                </select>
              </div>

              {/* Time limit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.pomodoroFocus}
                </label>
                <select
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <option value={5}>5 {t.minutes}</option>
                  <option value={10}>10 {t.minutes}</option>
                  <option value={15}>15 {t.minutes}</option>
                  <option value={25}>25 {t.minutes}</option>
                </select>
              </div>
            </div>

            {/* Toggle visual scenarios */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800">
                    {t.practiceChallenge || "Incluir situaciones prácticas y diagramas"}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {t.examSimulatorCardSub}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeVisuals}
                onChange={(e) => setIncludeVisuals(e.target.checked)}
                className="h-4 w-4 rounded-md text-amber-500 focus:ring-amber-400"
              />
            </div>

            {/* Submit / Launch Button */}
            <div className="pt-3">
              <button
                type="button"
                disabled={isGenerating || !topic.trim()}
                onClick={handleStartExam}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-md hover:from-amber-600 hover:to-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>{t.generatingExam}</span>
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4 text-amber-200" />
                    <span>{t.startExam}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE EXAM SCREEN */}
      {examActive && activeQ && (
        <div className="space-y-6">
          {/* Top banner with Tuddy tip */}
          {tuddyTip && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2.5">
              <PetAvatar pet={pet} size="xs" showBg={false} />
              <span>{tuddyTip}</span>
            </div>
          )}

          {/* Question Navigator Dots */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(userAnswers[q.id]);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-slate-900 text-white shadow-xs scale-105"
                        : isAnswered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-semibold shrink-0">
              Pregunta {currentIndex + 1} de {questions.length}
            </div>
          </div>

          {/* Active Question Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
              <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                {activeQ.type === "multiple_choice"
                  ? "Opción Múltiple"
                  : activeQ.type === "true_false"
                  ? "Verdadero o Falso"
                  : activeQ.type === "open_short"
                  ? "Pregunta Abierta"
                  : activeQ.type === "audio_dictation"
                  ? "Dictado Auditivo 👑"
                  : activeQ.type === "sentence_scramble"
                  ? "Ordenar Frase 👑"
                  : activeQ.type === "concept_match"
                  ? "Emparejar Conceptos 👑"
                  : "Completar Espacio"}
              </span>
              <span className="font-semibold text-slate-600">{activeQ.points} puntos</span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {activeQ.question}
            </h3>

            {/* Scenario or Visual Description box if present */}
            {activeQ.scenarioOrVisual && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-amber-600" />
                  <span>Escenario o Diagrama Conceptual:</span>
                </div>
                <p className="leading-relaxed italic">{activeQ.scenarioOrVisual}</p>
              </div>
            )}

            {/* Answer Input based on type */}
            <div className="space-y-3 pt-2">
              {/* Multiple Choice Options */}
              {(activeQ.type === "multiple_choice" || activeQ.type === "true_false") &&
                activeQ.options && (
                  <div className="space-y-2">
                    {activeQ.options.map((opt, i) => {
                      const isSelected = userAnswers[activeQ.id] === opt;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectOption(activeQ.id, opt)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-amber-500 bg-amber-50/80 text-amber-950 font-bold shadow-xs ring-1 ring-amber-400"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "bg-amber-500 border-amber-600 text-white"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

              {/* Fill Blank */}
              {activeQ.type === "fill_blank" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Escribe la palabra o término exacto:
                  </label>
                  <input
                    type="text"
                    value={userAnswers[activeQ.id] || ""}
                    onChange={(e) => handleSelectOption(activeQ.id, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                </div>
              )}

              {/* Open Question */}
              {activeQ.type === "open_short" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tu desarrollo o explicación breve (será evaluada por Tuddy IA):
                  </label>
                  <textarea
                    rows={4}
                    value={userAnswers[activeQ.id] || ""}
                    onChange={(e) => handleSelectOption(activeQ.id, e.target.value)}
                    placeholder="Explica con tus palabras los puntos clave solicitados..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}

              {/* Pro Type: Audio Dictation */}
              {activeQ.type === "audio_dictation" && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-950">Audio de Dictado Tuddy</div>
                        <div className="text-[11px] text-amber-800">Escucha la pronunciación y escribe la frase exacta.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const textToSpeak = activeQ.audioPrompt || activeQ.question || activeQ.correctAnswer;
                        if ("speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(textToSpeak);
                          utterance.rate = 0.9;
                          window.speechSynthesis.speak(utterance);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Reproducir Audio</span>
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Transcribe el audio escuchado:
                    </label>
                    <input
                      type="text"
                      value={userAnswers[activeQ.id] || ""}
                      onChange={(e) => handleSelectOption(activeQ.id, e.target.value)}
                      placeholder="Escribe la frase o palabras dictadas..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Pro Type: Sentence Scramble */}
              {activeQ.type === "sentence_scramble" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">
                      Tu frase construida:
                    </label>
                    <div className="min-h-[50px] rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-3 flex flex-wrap items-center gap-2">
                      {(userAnswers[activeQ.id] || "").split(" ").filter(Boolean).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Toca las palabras abajo en el orden correcto...</span>
                      ) : (
                        (userAnswers[activeQ.id] || "").split(" ").filter(Boolean).map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                          >
                            {word}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Palabras para ordenar:</span>
                      <button
                        type="button"
                        onClick={() => handleSelectOption(activeQ.id, "")}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Reiniciar frase
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(activeQ.scrambledWords || activeQ.correctAnswer.split(" ").sort()).map((word, wIdx) => (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => {
                            const cur = (userAnswers[activeQ.id] || "").trim();
                            const next = cur ? `${cur} ${word}` : word;
                            handleSelectOption(activeQ.id, next);
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 text-slate-800 font-bold text-xs shadow-2xs transition-all active:scale-95"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pro Type: Concept Match */}
              {activeQ.type === "concept_match" && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-600">
                    Selecciona la correspondencia correcta para el concepto:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(activeQ.options && activeQ.options.length > 0
                      ? activeQ.options
                      : [activeQ.correctAnswer, "Definición secundaria no compatible", "Concepto alternativo inverso"]
                    ).map((opt, i) => {
                      const selected = userAnswers[activeQ.id] === opt;
                      return (
                        <div
                          key={i}
                          onClick={() => handleSelectOption(activeQ.id, opt)}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start gap-3 ${
                            selected
                              ? "border-amber-500 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-400"
                              : "border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center border text-[11px] font-bold shrink-0 mt-0.5 ${
                              selected
                                ? "bg-amber-500 border-amber-600 text-white"
                                : "border-slate-300 bg-white text-slate-600"
                            }`}
                          >
                            {selected ? "✓" : String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-xs leading-relaxed">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Hint Accordion */}
            {activeQ.hint && (
              <div className="pt-2">
                {!revealedHints[activeQ.id] ? (
                  <button
                    type="button"
                    onClick={() => toggleHint(activeQ.id)}
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span>¿Necesitas una pista de {pet.name}?</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200 flex items-start gap-2.5">
                    <PetAvatar pet={pet} size="xs" showBg={false} />
                    <span className="pt-0.5">{activeQ.hint}</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> {t.prevQuestion}
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  <span>{t.nextQuestion}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishExam}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t.submitExam}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Evaluating state overlay */}
      {evaluatingOpenAnswers && (
        <div className="text-center py-16 space-y-3">
          <RotateCw className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">{t.loading}...</h3>
          <p className="text-xs text-slate-500">{t.examResults}</p>
        </div>
      )}

      {/* VIEW 3: EXAM COMPLETED & DETAILED REVIEW */}
      {examCompleted && !evaluatingOpenAnswers && (
        <div className="space-y-6">
          {/* Results Scoreboard */}
          <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-8 shadow-sm text-center space-y-4">
            <div className="mx-auto flex items-center justify-center">
              <AnthropomorphicBunny pet={pet} mood="cheering" size="sm" isBouncing={true} showShadow={false} />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t.examResults}
              </h3>
              <p className="text-sm text-slate-500">{examTitle}</p>
            </div>

            <div className="inline-flex items-center gap-6 bg-white py-3 px-6 rounded-2xl border border-amber-200 shadow-xs">
              <div>
                <div className="text-3xl font-extrabold text-amber-600">
                  {Math.round((finalScore / (maxScore || 1)) * 100)}%
                </div>
                <div className="text-[11px] font-medium text-slate-400">{t.yourScore}</div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <div className="text-2xl font-bold text-slate-800">
                  {finalScore} / {maxScore}
                </div>
                <div className="text-[11px] font-medium text-slate-400">{t.correctAnswers}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setExamCompleted(false);
                  setExamActive(false);
                }}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                {t.takeAnotherExam}
              </button>
            </div>
          </div>

          {/* Detailed Question Review Breakdown */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              Revisión Detallada de Preguntas y Respuestas
            </h4>

            {questions.map((q, idx) => {
              const studentAns = userAnswers[q.id] || "(Sin respuesta)";
              const isCorrect =
                q.type === "open_short"
                  ? true // open question has nuanced review
                  : studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 bg-white transition-all ${
                    isCorrect ? "border-emerald-200" : "border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500">Pregunta {idx + 1}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isCorrect
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correcta
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> A repasar
                        </>
                      )}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900 mb-3">{q.question}</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="font-semibold text-slate-500 block mb-0.5">Tu respuesta:</span>
                      <span className="font-medium text-slate-800">{studentAns}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="font-semibold text-emerald-700 block mb-0.5">Respuesta correcta:</span>
                      <span className="font-medium text-emerald-900">{q.correctAnswer}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <PetAvatar pet={pet} size="xs" showBg={false} />
                    <div className="pt-0.5">
                      <span className="font-bold">Explicación de {pet.name}:</span> {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
