import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Printer,
  FilePlus,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Wrench,
  BookOpen,
  Play,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { GeneratedChatTool, ExamQuestion, Flashcard } from "../../types";

interface GeneratedToolCardProps {
  tool: GeneratedChatTool;
  onSolveExam?: (questions: ExamQuestion[], title: string, topic?: string) => void;
  onPrintExam?: (questions: ExamQuestion[], title: string) => void;
  onSaveAsNote?: (title: string, content: string) => void;
  onOpenNoteInWorkspace?: (title: string, content: string, subject?: string) => void;
  onPracticeFlashcards?: (cards: Array<{ front: string; back: string; hint?: string }>, deckName?: string) => void;
  onQuickPrompt?: (prompt: string) => void;
}

export const GeneratedToolCard: React.FC<GeneratedToolCardProps> = ({
  tool,
  onSolveExam,
  onPrintExam,
  onSaveAsNote,
  onOpenNoteInWorkspace,
  onPracticeFlashcards,
  onQuickPrompt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [copiedNote, setCopiedNote] = useState(false);

  const toggleRevealAnswer = (qId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (tool.type === "exam") {
    const questions = tool.questions || [];
    const difficultyLabels: Record<string, { label: string; color: string }> = {
      easy: { label: "Fácil", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      intermediate: { label: "Intermedio", color: "bg-blue-100 text-blue-800 border-blue-200" },
      hard: { label: "Avanzado / Difícil", color: "bg-amber-100 text-amber-900 border-amber-300" },
      simulated_exam: { label: "Simulacro Oficial", color: "bg-rose-100 text-rose-900 border-rose-200" },
    };
    const diffInfo = difficultyLabels[tool.difficulty || "intermediate"] || difficultyLabels.intermediate;

    return (
      <div className="mt-3 rounded-2xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-indigo-50/40 p-4 shadow-sm space-y-3.5 transition-all">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-200 text-purple-900 px-2 py-0.2 rounded-full">
                  Herramienta Generada por TuddyACI
                </span>
                <span className={`text-[10px] font-bold border px-2 py-0.2 rounded-full ${diffInfo.color}`}>
                  {diffInfo.label}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {tool.title || `Examen: ${tool.topic}`}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {questions.length} {questions.length === 1 ? "pregunta" : "preguntas"}
            </span>
            {tool.recommendedTimeMinutes && (
              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200/80 hidden sm:inline">
                ⏱️ {tool.recommendedTimeMinutes} min
              </span>
            )}
          </div>
        </div>

        {/* Verification & Accuracy Guarantee */}
        <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-2.5 flex items-start gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold flex items-center gap-1">
              <span>Precisión y Calidad Verificada por TuddyACI</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 font-black px-1.5 rounded-full">100% Listo</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-tight mt-0.5">
              {tool.verificationNotes || "Preguntas con rigor conceptual, distractores plausibles y explicaciones pedagógicas completas sin ambigüedades."}
            </p>
          </div>
        </div>

        {/* Primary Call to Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onSolveExam && (
            <button
              type="button"
              id="btn-solve-exam-in-simulator"
              onClick={() => onSolveExam(questions, tool.title, tool.topic)}
              className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white p-3 text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-current text-amber-300 group-hover:scale-110 transition-transform" />
              <span>🚀 Entrar a resolver la Práctica ahora (Lista para hacer)</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 px-3.5 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Analizar y revisar las preguntas con sus respuestas explicadas"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>{isExpanded ? "Ocultar Análisis" : "Analizar Preguntas"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        {/* Expandable Question Analysis Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3 pt-2 border-t border-purple-100"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800">
                  Desglose y Análisis de Preguntas ({questions.length}):
                </span>
                <span className="text-[11px] text-slate-500">
                  Revisa cada concepto antes o después de resolver
                </span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isRevealed = revealedAnswers[q.id] ?? false;

                  return (
                    <div
                      key={q.id || `q-${idx}`}
                      className="rounded-xl bg-white border border-slate-200/80 p-3 text-xs space-y-2 shadow-2xs hover:border-purple-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 leading-snug">
                          <strong className="text-purple-700">#{idx + 1}.</strong> {q.question}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                          {q.type === "multiple_choice" ? "Opción Múltiple" : q.type === "true_false" ? "V/F" : "Test"}
                        </span>
                      </div>

                      {q.scenarioOrVisual && (
                        <div className="text-[11px] italic bg-slate-50 border-l-2 border-purple-400 p-2 text-slate-700 rounded-r-md">
                          📋 {q.scenarioOrVisual}
                        </div>
                      )}

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = isRevealed && opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                            return (
                              <div
                                key={optIdx}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between ${
                                  isCorrect
                                    ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                                    : "bg-slate-50/60 border-slate-200 text-slate-700"
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Reveal Answer / Explanation toggle */}
                      <div className="pt-1.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleRevealAnswer(q.id)}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer flex items-center gap-1"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{isRevealed ? "Ocultar Respuesta Explicada" : "Mostrar Respuesta y Justificación"}</span>
                        </button>

                        {onQuickPrompt && (
                          <button
                            type="button"
                            onClick={() => onQuickPrompt(`Ajusta la pregunta #${idx + 1} ("${q.question.slice(0, 40)}...") para hacerla más clara o cambiar sus opciones.`)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                          >
                            ✏️ Modificar en chat
                          </button>
                        )}
                      </div>

                      {isRevealed && (
                        <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-2.5 text-[11px] text-indigo-950 space-y-1 mt-1">
                          <div>
                            <span className="font-bold text-emerald-700">Respuesta Correcta:</span>{" "}
                            <span className="font-semibold">{q.correctAnswer}</span>
                          </div>
                          <div className="text-slate-700 leading-relaxed">
                            <span className="font-bold text-indigo-900">Explicación:</span> {q.explanation}
                          </div>
                          {q.hint && (
                            <div className="text-amber-800 font-medium flex items-center gap-1 pt-0.5">
                              <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Pista: {q.hint}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary utilities row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100/80 text-xs">
          <div className="flex items-center gap-2">
            {onPrintExam && (
              <button
                type="button"
                onClick={() => onPrintExam(questions, tool.title)}
                className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-medium bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                title="Generar formato académico imprimible en PDF"
              >
                <Printer className="w-3 h-3 text-slate-600" />
                <span>Imprimir PDF</span>
              </button>
            )}

            {onSaveAsNote && (
              <button
                type="button"
                onClick={() => {
                  const content = `# ${tool.title}\n\n**Tema:** ${tool.topic}\n\n` +
                    questions.map((q, i) => `### Pregunta ${i + 1}: ${q.question}\n- **Respuesta Correcta:** ${q.correctAnswer}\n- **Explicación:** ${q.explanation}\n`).join("\n");
                  onSaveAsNote(tool.title, content);
                }}
                className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-medium bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                title="Guardar cuestionario y explicaciones como apunte"
              >
                <FilePlus className="w-3 h-3 text-blue-600" />
                <span>Guardar Apunte</span>
              </button>
            )}
          </div>

          {/* Quick Refine Chips */}
          {onQuickPrompt && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold hidden md:inline">Arreglar/Ajustar:</span>
              <button
                type="button"
                onClick={() => onQuickPrompt("Revisa este examen y arregla cualquier error conceptual o ambigüedad en las preguntas, dejándolo 100% verificado.")}
                className="text-[10px] font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer transition-colors"
                title="Pedir a TuddyACI corregir posibles errores"
              >
                🛠️ Arreglar errores
              </button>
              <button
                type="button"
                onClick={() => onQuickPrompt("Haz este examen más difícil y conceptual, con preguntas que requieran razonamiento avanzado.")}
                className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 cursor-pointer transition-colors"
              >
                🔥 Más difícil
              </button>
              <button
                type="button"
                onClick={() => onQuickPrompt("Agrega 3 preguntas más a este examen sobre aspectos complementarios del tema.")}
                className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer transition-colors"
              >
                ➕ 3 preguntas más
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tool.type === "flashcards") {
    const cards = tool.cards || [];

    return (
      <div className="mt-3 rounded-2xl border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/40 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 text-emerald-100" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full">
                Mazo de Fichas TuddyACI
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {tool.title || "Fichas de Estudio"}
              </h4>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
            {cards.length} fichas
          </span>
        </div>

        {/* Flashcards Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cards.slice(0, 4).map((c, i) => (
            <div key={i} className="rounded-xl border border-emerald-100 bg-white p-2.5 text-xs space-y-1 shadow-2xs">
              <span className="font-bold text-slate-900 block truncate">{c.front}</span>
              <span className="text-slate-600 text-[11px] block line-clamp-2">{c.back}</span>
            </div>
          ))}
        </div>

        {onPracticeFlashcards && (
          <button
            type="button"
            onClick={() => onPracticeFlashcards(cards, tool.deckName || tool.title)}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3 text-xs font-black shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Layers className="w-4 h-4" />
            <span>🃏 Entrar a practicar Fichas ahora (Listas para repasar)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (tool.type === "note") {
    const wordCount = tool.content ? tool.content.split(/\s+/).filter(Boolean).length : 0;
    const estMinutes = Math.max(1, Math.round(wordCount / 180));

    const handleCopyNoteContent = () => {
      if (tool.content) {
        navigator.clipboard.writeText(tool.content);
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 2000);
      }
    };

    return (
      <div className="mt-3 rounded-2xl border-2 border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-indigo-50/40 p-4 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-200 text-blue-900 px-2 py-0.2 rounded-full">
                  Apunte / Resumen TuddyACI
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  100% Hecho y Guardado
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                {tool.title || "Resumen de Estudio"}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
              {tool.subject || "Tutoría"}
            </span>
            <span className="text-[11px] text-slate-400">~{estMinutes} min lectura</span>
          </div>
        </div>

        {/* Note Preview Box */}
        <div className="rounded-xl border border-blue-100 bg-white p-3 text-xs text-slate-700 max-h-48 overflow-y-auto space-y-1.5 font-sans leading-relaxed shadow-2xs">
          <div className="prose prose-xs max-w-none line-clamp-6 text-slate-600 whitespace-pre-line">
            {tool.content}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onOpenNoteInWorkspace && (
            <button
              type="button"
              onClick={() => onOpenNoteInWorkspace(tool.title, tool.content, tool.subject)}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white p-3 text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <FileText className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>📝 Entrar a ver mi Nota / Resumen en Notas & IA (Lista)</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyNoteContent}
            className="rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 px-3.5 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Copiar texto del resumen"
          >
            {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedNote ? "Copiado" : "Copiar"}</span>
          </button>
        </div>

        {/* Quick follow-up prompts */}
        {onQuickPrompt && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-blue-50">
            <span className="text-[10px] font-bold text-slate-400">Acciones rápidas con Tuddy:</span>
            <button
              type="button"
              onClick={() => onQuickPrompt(`Hazme una práctica de 5 preguntas tipo test basada en este resumen: "${tool.title}" de una vez lista para resolver.`)}
              className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-2.5 h-2.5 text-purple-600" />
              <span>Convertir en Práctica de 5 preguntas</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickPrompt(`Crea un mazo de fichas de estudio a partir de este apunte: "${tool.title}" de una vez listo para repasar.`)}
              className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 cursor-pointer transition-colors flex items-center gap-1"
            >
              <Layers className="w-2.5 h-2.5 text-emerald-600" />
              <span>Convertir en Fichas</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};
