import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Copy, 
  Check, 
  Paperclip, 
  Sliders, 
  X, 
  PanelLeft, 
  PanelLeftClose, 
  Plus, 
  Edit3, 
  Lightbulb, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  Crown,
  ArrowUp,
  BrainCircuit,
  MessageSquare
} from "lucide-react";
import { StudyNote, Flashcard, PetCustomization, Deck, ChatMessage, ChatSession, ExamQuestion } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import { useTranslation } from "../utils/translations";
import confetti from "canvas-confetti";
import { ConfirmModal } from "./ConfirmModal";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatMessageItem } from "./chat/ChatMessageItem";

interface AITutorExplainerProps {
  onSaveAsNote?: (note: StudyNote) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
  onLaunchExam?: (topic: string, notes?: string) => void;
  onSolveExamWithQuestions?: (questions: ExamQuestion[], title: string, topic?: string) => void;
  onPracticeFlashcards?: (cards: Array<{ front: string; back: string; hint?: string }>, deckName?: string) => void;
  onPrintExam?: (questions: ExamQuestion[], title: string) => void;
  onSaveFlashcards?: (cards: Flashcard[]) => void;
  onOpenNoteInWorkspace?: (title: string, content: string, subject?: string) => void;
  decks?: Deck[];
  notes?: StudyNote[];
}

export const AITutorExplainer: React.FC<AITutorExplainerProps> = ({
  onSaveAsNote,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
  isPro = false,
  onOpenSubscriptionModal,
  onLaunchExam,
  onSolveExamWithQuestions,
  onPracticeFlashcards,
  onPrintExam,
  onSaveFlashcards,
  onOpenNoteInWorkspace,
  decks = [],
  notes = [],
}) => {
  const { t } = useTranslation();
  
  const SESSIONS_STORAGE_KEY = `tuddy_chat_sessions_v2_${pet.name.toLowerCase()}`;
  const ACTIVE_ID_STORAGE_KEY = `tuddy_chat_active_id_v2_${pet.name.toLowerCase()}`;

  // Initial welcome message for default session
  const defaultWelcomeMessage: ChatMessage = {
    id: "welcome-initial",
    role: "model",
    content: `¡Hola! 🐰 Soy **TuddyACI (Tuddy Advanced Chat Intelligence)**, tu copiloto y tutor inteligente de estudio con IA avanzada ambientado para la app al estilo ChatGPT.

Puedo ayudarte con requerimientos académicos de cualquier materia:
- 💡 **Explicaciones profundas**: desde ciencias exactas y programación hasta literatura e historia.
- ⚙️ **Instrucciones ultra específicas**: pídemelo en *"tabla comparativa"*, con *"regla mnemotécnica en rima"*, *"paso a paso justificando fórmulas"* o *"un simulacro de 5 preguntas tipo test"*.
- 🎯 **Ponerte a prueba con preguntas interactivas**.

> 💡 *Nota: si me pides funciones masivas nativas como un **examen de 100 preguntas**, te indicaré que se requiere **Tuddy Plus** 👑 y te ofreceré alternativas directas de 5 a 10 preguntas para comenzar de inmediato.*

¿Qué tema te gustaría explorar o dominar hoy en TuddyACI?`,
    timestamp: new Date().toISOString(),
  };

  // State: Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
    }
    return [
      {
        id: "session-default",
        title: "Tutoría con " + pet.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [defaultWelcomeMessage],
      },
    ];
  });

  // State: Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId = localStorage.getItem(ACTIVE_ID_STORAGE_KEY);
    return savedId || "session-default";
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"general" | "feynman" | "academic" | "step_by_step" | "socratic" | "expert_quiz">("general");
  const [activeDirective, setActiveDirective] = useState<string>("");
  const [customDirectiveText, setCustomDirectiveText] = useState("");
  const [isCustomDirectiveOpen, setIsCustomDirectiveOpen] = useState(false);
  const [attachedNoteId, setAttachedNoteId] = useState<string | null>(null);
  const [isAttachNoteOpen, setIsAttachNoteOpen] = useState(false);
  
  // Voice state
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentEditTitle, setCurrentEditTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto-save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      if (activeSession) {
        localStorage.setItem(ACTIVE_ID_STORAGE_KEY, activeSession.id);
      }
    } catch (err) {
      console.error("Error saving sessions:", err);
    }
  }, [sessions, activeSession, SESSIONS_STORAGE_KEY, ACTIVE_ID_STORAGE_KEY]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isLoading]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputQuery]);

  // Preset Directives
  const presetDirectives = [
    { id: "table", label: "📊 Formato Tabla Comparativa", prompt: "Estructura la respuesta en una tabla comparativa con columnas claras y síntesis visual." },
    { id: "mnemonic", label: "🧠 Regla Mnemotécnica", prompt: "Diseña una regla mnemotécnica pegadiza (acrónimo o rima) para recordar esto fácilmente." },
    { id: "5points", label: "🎯 5 Puntos Clave", prompt: "Resume todo el concepto en exactamente 5 puntos esenciales numerados y directos al grano." },
    { id: "step_formulas", label: "🔢 Fórmulas & Paso a Paso", prompt: "Desglosa la solución paso a paso justificando cada fórmula, cálculo o teorema utilizado." },
    { id: "quiz5", label: "⚡ Test de 5 Preguntas", prompt: "Genera 5 preguntas tipo test con 4 opciones (A, B, C, D), indicando cuál es la correcta y su justificación didáctica." },
  ];

  // Starter Cards for Empty Chat
  const starterCards = [
    {
      title: "Práctica Inmediata: Mitosis",
      desc: "5 preguntas de opción múltiple listas para resolver",
      icon: "⚡",
      prompt: "Hazme una práctica de 5 preguntas tipo test sobre Mitosis y Meiosis de una vez lista para resolver.",
      mode: "expert_quiz" as const,
    },
    {
      title: "Resumen Listo: Rev. Francesa",
      desc: "Apunte completo estructurado listo para estudiar",
      icon: "📝",
      prompt: "Hazme un resumen completo y apunte estructurado de la Revolución Francesa de una vez listo para estudiar.",
      directive: "Estructura un resumen completo con puntos clave y causas.",
    },
    {
      title: "Ley de Ohm con analogías",
      desc: "Explicación estilo Feynman con tuberías de agua",
      icon: "🧒",
      prompt: "¿Cómo funciona la Ley de Ohm explicada con una analogía de tuberías de agua?",
      mode: "feynman" as const,
    },
    {
      title: "Mnemotecnia Química",
      desc: "Regla en rima para los primeros 10 elementos",
      icon: "🧠",
      prompt: "Crea una regla mnemotécnica divertida en rima para recordar los primeros 10 elementos de la tabla periódica.",
      directive: "Crea una mnemotecnia en verso fácil de memorizar.",
    },
  ];

  // Handler: Start New Chat
  const handleNewChat = () => {
    // If active session is already empty, just stay there
    if (activeSession && activeSession.messages.length === 0) {
      return;
    }

    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: "Nuevo chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setActiveDirective("");
    setAttachedNoteId(null);
    setInputQuery("");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Handler: Delete Session
  const handleDeleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: `session-${Date.now()}`,
        title: "Nuevo chat",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
    }
  };

  // Handler: Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  // Handler: Toggle Pin
  const handleTogglePinSession = (id: string) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Handler: Clear current session messages
  const handleClearCurrentSession = () => {
    if (!activeSession) return;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    setSessions(
      sessions.map((s) => (s.id === activeSession.id ? { ...s, messages: [], updatedAt: new Date().toISOString() } : s))
    );
    setIsClearModalOpen(false);
  };

  // Handler: Send Message
  const handleSendMessage = async (textOverride?: string, customDirectiveOverride?: string, modeOverride?: any) => {
    const textToSend = (textOverride !== undefined ? textOverride : inputQuery).trim();
    if (!textToSend || isLoading) return;

    const currentDirective = customDirectiveOverride !== undefined ? customDirectiveOverride : activeDirective;
    const currentMode = modeOverride || mode;
    const attachedNote = attachedNoteId ? notes.find((n) => n.id === attachedNoteId) : null;

    // Check if asking for 100 questions exam on free tier
    const lower = textToSend.toLowerCase();
    const isAsking100Questions =
      (/\b(100|cien)\s*(preguntas|questions|items|reactivos|ejercicios)\b/i.test(lower) ||
       /\b(examen|test|simulacro|quiz|cuestionario|prueba)\s*(de|con)?\s*(100|cien)\b/i.test(lower) ||
       (/\b100\b/.test(lower) && /\b(preguntas|test|examen|simulacro)\b/i.test(lower)));

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
      mode: currentMode,
      specialInstruction: currentDirective || undefined,
    };

    const currentMessages = activeSession?.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    // Determine new title if this was a new chat
    let newTitle = activeSession?.title || "Conversación de estudio";
    if (activeSession?.title === "Nuevo chat" || currentMessages.length === 0) {
      newTitle = textToSend.slice(0, 36) + (textToSend.length > 36 ? "..." : "");
    }

    setSessions(
      sessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setInputQuery("");
    setIsLoading(true);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    // Fast-path guard for 100 questions on free tier
    if (!isPro && isAsking100Questions) {
      setTimeout(() => {
        const plusResponse: ChatMessage = {
          id: "model-" + Date.now(),
          role: "model",
          content: `🐰 ¡Hola! Como tu compañero y tutor de estudio me encantaría preparar todo lo que me pides, pero **generar un examen masivo de 100 preguntas** (o pruebas de alta capacidad que exceden el límite estándar) es una función que solo puedes realizar nativamente con **Tuddy Plus** 👑.

### 💡 ¿Por qué esta función requiere Tuddy Plus?
Un examen masivo de 100 preguntas completas con justificaciones, rúbricas dinámicas y exportación formal en PDF requiere la infraestructura exclusiva de cómputo de **Tuddy Plus**.

### ✨ ¿Qué podemos hacer ahora mismo en tu plan actual?
1. **Simulacro Rápido en este Chat (Gratis)**: Puedo formularte ahora mismo una batería intensiva de **5 a 10 preguntas clave** tipo test o desarrollo sobre este tema, con retroalimentación inmediata paso a paso.
2. **Simulador de Exámenes**: Puedes dirigirte al módulo de **Exámenes** en la barra superior para configurar un test estándar de hasta **15 preguntas** con cronómetro y modo formal imprimible en PDF.

¿Te gustaría que te prepare ahora mismo una batería de 5 o 10 preguntas de práctica sobre este tema?`,
          timestamp: new Date().toISOString(),
          requiresPlus: true,
          plusReason: "exams_100",
          suggestedActions: [
            { label: "👑 Desbloquear Tuddy Plus ($3.50/mes)", action: "open_plus_modal" },
            { 
              label: "🥕 Hacer test rápido de 5 preguntas (Gratis)", 
              action: "send_prompt", 
              prompt: `Genérame un examen rápido de 5 preguntas de práctica sobre este tema con opciones múltiples y justificación didáctica.` 
            }
          ]
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  updatedAt: new Date().toISOString(),
                  messages: [...updatedMessages, plusResponse],
                }
              : s
          )
        );
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          isPro,
          mode: currentMode,
          specialInstruction: currentDirective,
          notesContext: attachedNote ? `${attachedNote.title}\n${attachedNote.aiSummary || attachedNote.rawContent}` : "",
          petName: pet.name,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: "model-" + Date.now(),
        role: "model",
        content: data.text || "No pude generar la respuesta. Por favor intenta de nuevo.",
        timestamp: new Date().toISOString(),
        requiresPlus: data.requiresPlus,
        plusReason: data.plusReason,
        suggestedActions: data.suggestedActions,
        generatedTool: data.generatedTool,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, assistantMessage],
              }
            : s
        )
      );

      // Auto-save generated note tool if provided so student enters Notes and it is ready
      if (data.generatedTool && data.generatedTool.type === "note" && onSaveAsNote) {
        const generatedNote = data.generatedTool;
        const autoNote: StudyNote = {
          id: `note-tuddy-${Date.now()}`,
          title: generatedNote.title || "Resumen de TuddyACI",
          subject: generatedNote.subject || "Tutoría Inteligente",
          rawContent: generatedNote.content,
          aiSummary: generatedNote.content,
          tags: generatedNote.tags || ["resumen", "tuddy", "ia"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onSaveAsNote(autoNote);
      }

      // Reward carrots & cheer
      if (!data.requiresPlus) {
        onRewardCarrot(2);
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
        if (onTuddyCheer) {
          if (data.generatedTool?.type === "exam") {
            const qCount = data.generatedTool.questions?.length || 5;
            onTuddyCheer(`¡Práctica de ${qCount} preguntas lista! Entra directo a resolverla 🚀🐰`);
          } else if (data.generatedTool?.type === "note") {
            onTuddyCheer(`¡Resumen "${data.generatedTool.title}" guardado y listo en tus Notas! 📝🐰`);
          } else if (data.generatedTool?.type === "flashcards") {
            const cCount = data.generatedTool.cards?.length || 5;
            onTuddyCheer(`¡Mazo de ${cCount} fichas listo para voltear y repasar! 🃏🐰`);
          } else {
            onTuddyCheer(`¡Gran consulta! ${pet.name} preparó una respuesta detallada 🐰✨`);
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      const fallbackMessage: ChatMessage = {
        id: "model-err-" + Date.now(),
        role: "model",
        content: `🐰 Disculpa, hubo un breve fallo de conexión al procesar la respuesta. Por favor vuelve a enviar tu pregunta o simplifica la consulta.`,
        timestamp: new Date().toISOString(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...updatedMessages, fallbackMessage],
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Speech Synthesis
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta síntesis de voz.");
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[#*_`>~-]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/🐰|✨|🥕|💡|👑|📊|🧠|🎯|🔢|⚡/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-ES";
    utterance.pitch = 1.15;
    utterance.rate = 1.0;
    utterance.onstart = () => setSpeakingMessageId(msgId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Handler: Save to Notes
  const handleSaveToNotes = (msg: ChatMessage) => {
    if (!onSaveAsNote) return;
    const firstLine = msg.content.split("\n")[0].replace(/[#*`]/g, "").trim();
    const title = firstLine.length > 5 && firstLine.length < 50 ? firstLine : `Apuntes: ${activeSession?.title || pet.name}`;

    const newNote: StudyNote = {
      id: "note-chat-" + Date.now(),
      title: `Tutor: ${title}`,
      subject: "Tutoría Inteligente",
      rawContent: msg.content,
      aiSummary: msg.content,
      tags: ["chat", "ia", pet.name.toLowerCase()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveAsNote(newNote);
    confetti({ particleCount: 30, spread: 50 });
    alert("¡Explicación guardada exitosamente en tus Notas de Estudio! 📝🐰");
  };

  // Handler: Create Flashcards from message
  const handleCreateFlashcardsFromMessage = (content: string) => {
    if (!onSaveFlashcards) return;
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const generatedCards: Flashcard[] = [];
    const deckId = decks[0]?.id || "deck-default";

    for (const line of lines) {
      if (generatedCards.length >= 4) break;
      const cleanLine = line.replace(/^[-*•\d.]+\s*/, "").trim();
      const colonMatch = cleanLine.match(/^\*{0,2}(.*?)\*{0,2}[:\-–]\s*(.+)$/);
      if (colonMatch && colonMatch[1].length > 2 && colonMatch[2].length > 5) {
        generatedCards.push({
          id: `card-ai-${Date.now()}-${generatedCards.length}`,
          deckId,
          front: colonMatch[1].trim(),
          back: colonMatch[2].trim(),
          tags: ["tutor-ia", "chat"],
          masteryLevel: 0,
          reviewCount: 0,
        });
      }
    }

    if (generatedCards.length === 0) {
      generatedCards.push({
        id: `card-ai-${Date.now()}-0`,
        deckId,
        front: "¿Qué concepto central explicó " + pet.name + "?",
        back: content.slice(0, 200) + "...",
        tags: ["tutor-ia"],
        masteryLevel: 0,
        reviewCount: 0,
      });
    }

    onSaveFlashcards(generatedCards);
    confetti({ particleCount: 40, spread: 60 });
    alert(`¡Se crearon ${generatedCards.length} fichas de estudio a partir de esta respuesta! 🗂️✨`);
  };

  // Handler: Launch Exam Simulator
  const handleLaunchExamFromTopic = (content: string) => {
    if (!onLaunchExam) return;
    const firstLine = content.split("\n")[0].replace(/[#*`]/g, "").trim();
    const topic = firstLine.slice(0, 45) || activeSession?.title || "Simulacro de Estudio";
    onLaunchExam(topic, content.slice(0, 1000));
  };

  // Handler: Regenerate last response
  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const msgs = [...activeSession.messages];
    const lastMsg = msgs[msgs.length - 1];
    
    if (lastMsg.role === "model") {
      msgs.pop(); // remove last model answer
      const prevUserMsg = msgs[msgs.length - 1];
      if (prevUserMsg && prevUserMsg.role === "user") {
        setSessions(
          sessions.map((s) =>
            s.id === activeSession.id ? { ...s, messages: msgs, updatedAt: new Date().toISOString() } : s
          )
        );
        handleSendMessage(prevUserMsg.content, prevUserMsg.specialInstruction, prevUserMsg.mode);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-125px)] bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* ChatGPT-style Left Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSession?.id || ""}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pet={pet}
        isPro={isPro}
        onOpenSubscriptionModal={onOpenSubscriptionModal}
      />

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Top Chat Bar */}
        <header className="h-14 border-b border-slate-200/80 px-3 sm:px-5 flex items-center justify-between gap-2 bg-white/90 backdrop-blur-xs z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Toggle sidebar button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title={isSidebarOpen ? "Ocultar barra lateral" : "Mostrar barra lateral"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            {/* TuddyACI Brand Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-900 text-xs font-black shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-extrabold tracking-tight">TuddyACI</span>
              <span className="text-[9px] bg-purple-200/90 text-purple-950 px-1.5 py-0.2 rounded font-bold uppercase hidden sm:inline">
                ACI
              </span>
            </div>

            {/* Editable Conversation Title */}
            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={currentEditTitle}
                    onChange={(e) => setCurrentEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (currentEditTitle.trim() && activeSession) {
                          handleRenameSession(activeSession.id, currentEditTitle.trim());
                        }
                        setIsEditingTitle(false);
                      }
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    className="border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentEditTitle.trim() && activeSession) {
                        handleRenameSession(activeSession.id, currentEditTitle.trim());
                      }
                      setIsEditingTitle(false);
                    }}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded text-xs font-bold"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentEditTitle(activeSession?.title || "");
                    setIsEditingTitle(true);
                  }}
                  className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 truncate cursor-pointer"
                  title="Clic para renombrar este chat"
                >
                  <span className="truncate">{activeSession?.title || "Nuevo chat"}</span>
                  <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector & Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode Select */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
              title="Modo pedagógico de Tuddy"
            >
              <option value="general">💡 Modo Inteligente</option>
              <option value="feynman">🧒 Técnica Feynman</option>
              <option value="academic">🎓 Académico Riguroso</option>
              <option value="step_by_step">🔢 Paso a Paso (Fórmulas)</option>
              <option value="socratic">🏛️ Método Socrático</option>
              <option value="expert_quiz">⚡ Entrenador Test</option>
            </select>

            {/* Clear conversation messages */}
            {activeSession && activeSession.messages.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Vaciar mensajes de este chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* New chat shortcut */}
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Iniciar nuevo chat (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Conversation Feed or Empty Hero (ChatGPT style) */}
        <div className="flex-1 overflow-y-auto">
          {(!activeSession || activeSession.messages.length === 0) ? (
            /* ChatGPT-style Empty Canvas */
            <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mb-4"
              >
                <PetAvatar pet={pet} size="md" showBg={true} className="shadow-md ring-4 ring-amber-100" />
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <span>¿En qué te puedo ayudar a estudiar hoy?</span>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8">
                Soy tu tutor inteligente de IA. Pídeme explicaciones con instrucciones precisas, tablas comparativas, reglas mnemotécnicas o repasos guiados.
              </p>

              {/* Starter Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {starterCards.map((card, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (card.mode) setMode(card.mode);
                      if (card.directive) setActiveDirective(card.directive);
                      handleSendMessage(card.prompt, card.directive, card.mode);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-amber-50/60 hover:border-amber-300 transition-all shadow-2xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 group-hover:text-amber-900 mb-1">
                      <span className="text-base">{card.icon}</span>
                      <span>{card.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            /* Stream of Messages */
            <div className="divide-y divide-slate-100/80 pb-6">
              {activeSession.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  pet={pet}
                  isSpeaking={speakingMessageId === msg.id}
                  onToggleSpeak={handleToggleSpeak}
                  onSaveToNotes={handleSaveToNotes}
                  onOpenNoteInWorkspace={onOpenNoteInWorkspace}
                  onSaveFlashcards={handleCreateFlashcardsFromMessage}
                  onLaunchExam={handleLaunchExamFromTopic}
                  onSolveExamWithQuestions={onSolveExamWithQuestions}
                  onPracticeFlashcards={onPracticeFlashcards}
                  onPrintExam={onPrintExam}
                  onRegenerate={handleRegenerate}
                  onOpenSubscriptionModal={onOpenSubscriptionModal}
                  onQuickPrompt={(prompt) => handleSendMessage(prompt)}
                />
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="w-full py-4 px-3 sm:px-6 bg-slate-50/70 border-y border-slate-100/90">
                  <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-center">
                    <PetAvatar pet={pet} size="xs" showBg={true} />
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <RotateCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      <span>{pet.name} está redactando tu respuesta académica...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ChatGPT Bottom Floating Input Area */}
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-xs p-3 sm:p-4 shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Specific Directives Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pl-1 shrink-0">
                <Sliders className="w-3 h-3 text-amber-500" />
                <span>Formato:</span>
              </span>

              {presetDirectives.map((d) => {
                const isSelected = activeDirective === d.prompt;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) setActiveDirective("");
                      else setActiveDirective(d.prompt);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? "bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-300"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span>{d.label}</span>
                    {isSelected && <X className="w-3 h-3 text-amber-800" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomDirectiveOpen(!isCustomDirectiveOpen)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                  isCustomDirectiveOpen
                    ? "bg-purple-100 text-purple-950 border-purple-300"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                ✍️ Regla libre...
              </button>
            </div>

            {/* Custom Directive Input Bar */}
            {isCustomDirectiveOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={customDirectiveText}
                  onChange={(e) => setCustomDirectiveText(e.target.value)}
                  placeholder="Especifica una regla exacta (ej. 'Explica solo en metáforas', 'Máximo 3 párrafos')..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customDirectiveText.trim()) {
                      setActiveDirective(customDirectiveText.trim());
                      setIsCustomDirectiveOpen(false);
                    }
                  }}
                  className="rounded-xl bg-purple-600 text-white px-3 py-1 text-xs font-bold hover:bg-purple-700 transition-colors"
                >
                  Fijar
                </button>
              </motion.div>
            )}

            {/* Attached Note indicator */}
            {attachedNoteId && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-1 text-xs text-blue-900">
                <span className="truncate flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Apunte de referencia: <strong>{notes.find((n) => n.id === attachedNoteId)?.title}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedNoteId(null)}
                  className="text-blue-700 hover:text-blue-950 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* ChatGPT-style Floating Input Box */}
            <div className="relative rounded-2xl border border-slate-300/90 bg-slate-50/70 focus-within:bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all p-2 flex items-end gap-2 shadow-2xs">
              {/* Attach note popover button */}
              {notes.length > 0 && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAttachNoteOpen(!isAttachNoteOpen)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      attachedNoteId
                        ? "bg-blue-100 text-blue-900 border-blue-300"
                        : "bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200"
                    }`}
                    title="Adjuntar notas guardadas como contexto para Tuddy"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {isAttachNoteOpen && (
                    <div className="absolute bottom-12 left-0 w-64 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-30 space-y-1">
                      <div className="text-xs font-bold text-slate-700 px-2 py-1">Selecciona tus apuntes:</div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {notes.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setAttachedNoteId(n.id);
                              setIsAttachNoteOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-100 truncate block cursor-pointer"
                          >
                            📝 {n.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Envía un mensaje a ${pet.name} o pídele una tarea específica...`}
                className="flex-1 max-h-36 resize-none bg-transparent p-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden leading-relaxed font-normal"
              />

              {/* Send Button */}
              <button
                type="button"
                disabled={isLoading || !inputQuery.trim()}
                onClick={() => handleSendMessage()}
                className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Enviar mensaje (Enter)"
              >
                {isLoading ? (
                  <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* ChatGPT-style subtle disclaimer */}
            <p className="text-[10px] text-center text-slate-400">
              {pet.name} puede cometer errores. Verifica conceptos académicos importantes.
            </p>
          </div>
        </div>
      </main>

      {/* Clear Chat Confirm Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="¿Vaciar los mensajes de este chat?"
        message="Se eliminarán los mensajes de esta conversación. Podrás seguir enviando nuevas preguntas."
        confirmText="Sí, vaciar"
        cancelText="Cancelar"
        onConfirm={handleClearCurrentSession}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};
