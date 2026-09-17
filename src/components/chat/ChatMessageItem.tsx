import React, { useState, useMemo } from "react";
import { 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  FilePlus, 
  Layers, 
  Target, 
  Crown, 
  RotateCw, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage, PetCustomization, StudyNote, Flashcard, ExamQuestion, GeneratedChatTool } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";
import { GeneratedToolCard } from "./GeneratedToolCard";

interface ChatMessageItemProps {
  message: ChatMessage;
  pet: PetCustomization;
  isSpeaking: boolean;
  onToggleSpeak: (id: string, text: string) => void;
  onSaveToNotes?: (msg: ChatMessage) => void;
  onOpenNoteInWorkspace?: (title: string, content: string, subject?: string) => void;
  onSaveFlashcards?: (content: string) => void;
  onLaunchExam?: (content: string) => void;
  onSolveExamWithQuestions?: (questions: ExamQuestion[], title: string, topic?: string) => void;
  onPracticeFlashcards?: (cards: Array<{ front: string; back: string; hint?: string }>, deckName?: string) => void;
  onPrintExam?: (questions: ExamQuestion[], title: string) => void;
  onRegenerate?: () => void;
  onOpenSubscriptionModal?: () => void;
  onQuickPrompt?: (prompt: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  pet,
  isSpeaking,
  onToggleSpeak,
  onSaveToNotes,
  onOpenNoteInWorkspace,
  onSaveFlashcards,
  onLaunchExam,
  onSolveExamWithQuestions,
  onPracticeFlashcards,
  onPrintExam,
  onRegenerate,
  onOpenSubscriptionModal,
  onQuickPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const { cleanContent, tool } = useMemo(() => {
    if (message.generatedTool) {
      return { cleanContent: message.content, tool: message.generatedTool };
    }
    const match = message.content.match(/```(?:json:tuddy_tool|tuddy_tool)\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1].trim());
        const clean = message.content.replace(match[0], "").trim();
        return { cleanContent: clean, tool: parsed as GeneratedChatTool };
      } catch (e) {
        console.warn("Failed to parse tuddy_tool in message:", e);
      }
    }
    return { cleanContent: message.content, tool: undefined };
  }, [message.content, message.generatedTool]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full py-4 px-3 sm:px-6 transition-colors ${isUser ? "bg-transparent" : "bg-slate-50/70 border-y border-slate-100/90"}`}>
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              Tú
            </div>
          ) : (
            <div className="relative">
              <PetAvatar pet={pet} size="xs" showBg={true} />
              {message.requiresPlus && (
                <Crown className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
              )}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                {isUser ? "Tú" : pet.name}
              </span>
              {!isUser && message.requiresPlus && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 text-[10px] font-black">
                  <Crown className="w-2.5 h-2.5 text-amber-600" /> Tuddy Plus
                </span>
              )}
              {isUser && message.specialInstruction && (
                <span className="rounded-md bg-amber-100/90 text-amber-900 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                  Directiva: {message.specialInstruction}
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Markdown Content */}
          <div className="markdown-body text-xs sm:text-sm leading-relaxed text-slate-800 break-words prose prose-slate max-w-none">
            <ReactMarkdown>{cleanContent}</ReactMarkdown>
          </div>

          {/* Inline Generated Interactive Tool (Exam, Flashcards, Note, etc.) */}
          {tool && (
            <GeneratedToolCard
              tool={tool}
              onSolveExam={onSolveExamWithQuestions}
              onPrintExam={onPrintExam}
              onOpenNoteInWorkspace={onOpenNoteInWorkspace}
              onSaveAsNote={(title, content) => {
                if (onOpenNoteInWorkspace) {
                  onOpenNoteInWorkspace(title, content);
                } else if (onSaveToNotes) {
                  onSaveToNotes({
                    id: `note-${Date.now()}`,
                    role: "model",
                    content,
                    timestamp: new Date().toISOString(),
                  });
                }
              }}
              onPracticeFlashcards={(cards, deckName) => {
                if (onPracticeFlashcards) {
                  onPracticeFlashcards(cards, deckName);
                } else if (onSaveFlashcards) {
                  const fcText = cards.map(c => `FRENTE: ${c.front}\nREVERSO: ${c.back}`).join("\n\n");
                  onSaveFlashcards(fcText);
                }
              }}
              onQuickPrompt={onQuickPrompt}
            />
          )}

          {/* Tuddy Plus Limitation Alert Card */}
          {message.requiresPlus && (
            <div className="mt-4 pt-3 border-t border-amber-200/80">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-4 text-white shadow-md">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xs sm:text-sm font-black">
                      👑 Desbloquea Exámenes de 100 Preguntas con Tuddy Plus
                    </h4>
                    <p className="text-xs text-amber-100 leading-relaxed">
                      La generación de 100 preguntas masivas con rúbricas avanzadas, explicaciones detalladas y exportación formal en PDF para imprimir es exclusiva de <strong>Tuddy Plus</strong> ($3.50/mes).
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {onOpenSubscriptionModal && (
                        <button
                          type="button"
                          onClick={onOpenSubscriptionModal}
                          className="rounded-xl bg-white text-slate-950 hover:bg-amber-50 px-3.5 py-1.5 text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          <span>Ver Tuddy Plus ($3.50/mes)</span>
                        </button>
                      )}
                      {onQuickPrompt && (
                        <button
                          type="button"
                          onClick={() => onQuickPrompt("Genérame un examen rápido de 5 preguntas de práctica sobre este tema con sus opciones y respuestas didácticas.")}
                          className="rounded-xl bg-black/30 hover:bg-black/40 text-white px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          🥕 Test de 5 preguntas (Gratis)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Toolbar under Assistant response */}
          {!isUser && !message.requiresPlus && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-1">
                {/* Voice */}
                <button
                  type="button"
                  onClick={() => onToggleSpeak(message.id, message.content)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    isSpeaking
                      ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                      : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200/80"
                  }`}
                  title="Escuchar con la voz de Tuddy"
                >
                  {isSpeaking ? <VolumeX className="w-3 h-3 text-amber-800" /> : <Volume2 className="w-3 h-3 text-slate-500" />}
                  <span>{isSpeaking ? "Pausar voz" : "Escuchar"}</span>
                </button>

                {/* Save to Notes */}
                {onSaveToNotes && (
                  <button
                    type="button"
                    onClick={() => onSaveToNotes(message)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Guardar como apunte en Notas & IA"
                  >
                    <FilePlus className="w-3 h-3 text-blue-600" />
                    <span>Guardar Apunte</span>
                  </button>
                )}

                {/* Create Flashcards */}
                {onSaveFlashcards && (
                  <button
                    type="button"
                    onClick={() => onSaveFlashcards(message.content)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Generar fichas flashcard a partir de esta respuesta"
                  >
                    <Layers className="w-3 h-3 text-emerald-600" />
                    <span>Crear Fichas</span>
                  </button>
                )}

                {/* Launch Exam */}
                {onLaunchExam && (
                  <button
                    type="button"
                    onClick={() => onLaunchExam(message.content)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Practicar este tema en el Simulador de Exámenes"
                  >
                    <Target className="w-3 h-3 text-orange-600" />
                    <span>Llevar a Examen</span>
                  </button>
                )}

                {/* Regenerate */}
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/80 text-[11px] font-medium transition-colors cursor-pointer"
                    title="Regenerar respuesta"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Regenerar</span>
                  </button>
                )}
              </div>

              {/* Copy message button */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Copiar texto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* User message copy */}
          {isUser && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                title="Copiar mensaje"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
