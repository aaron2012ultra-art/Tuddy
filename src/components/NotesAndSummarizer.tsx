import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  BookOpen, 
  Flame,
  FileCheck2,
  RefreshCw,
  Image as ImageIcon,
  ScanText,
  Tag,
  Eye,
  X,
  Lightbulb,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { StudyNote, Flashcard, PetCustomization } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import confetti from "canvas-confetti";
import { ConfirmModal } from "./ConfirmModal";
import { useTranslation } from "../utils/translations";

interface NotesAndSummarizerProps {
  notes: StudyNote[];
  onSaveNotes: (notes: StudyNote[]) => void;
  onAddFlashcardsFromSummary?: (cards: Flashcard[]) => void;
  onLaunchExamFromNote?: (title: string, content: string) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
}

export const NotesAndSummarizer: React.FC<NotesAndSummarizerProps> = ({
  notes,
  onSaveNotes,
  onAddFlashcardsFromSummary,
  onLaunchExamFromNote,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
}) => {
  const { t } = useTranslation();
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || "");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");

  // Summarizer state
  const [summaryStyle, setSummaryStyle] = useState<"concise" | "balanced" | "in_depth">("balanced");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Document & Image parsing states
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [docParsingStatus, setDocParsingStatus] = useState("");
  const [isAnalyzingImg, setIsAnalyzingImg] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachImageRef = useRef<HTMLInputElement>(null);

  const currentNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleSelectNote = (note: StudyNote) => {
    setSelectedNoteId(note.id);
    setIsEditing(false);
  };

  const handleCreateNewNote = () => {
    const newNote: StudyNote = {
      id: "note-" + Date.now(),
      title: "Nueva Nota de Estudio",
      subject: "General",
      rawContent: "",
      tags: ["estudio"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setEditTitle(newNote.title);
    setEditSubject(newNote.subject);
    setEditContent("");
    setEditTags("estudio");
    setIsEditing(true);
  };

  const startEditing = () => {
    if (!currentNote) return;
    setEditTitle(currentNote.title);
    setEditSubject(currentNote.subject);
    setEditContent(currentNote.rawContent);
    setEditTags(currentNote.tags.join(", "));
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentNote) return;

    const tags = editTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const updated = notes.map((n) =>
      n.id === currentNote.id
        ? {
            ...n,
            title: editTitle.trim() || "Nota sin título",
            subject: editSubject.trim() || "General",
            rawContent: editContent,
            tags,
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    onSaveNotes(updated);
    setIsEditing(false);
    onRewardCarrot(1);
  };

  // In-app confirmation modal state (bypasses iframe blocked window.confirm)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  const handleDeleteNote = (id: string) => {
    const targetNote = notes.find((n) => n.id === id);
    const title = targetNote?.title || "esta nota";
    setConfirmModalState({
      isOpen: true,
      title: "¿Eliminar esta nota?",
      message: `¿Estás seguro de que deseas eliminar "${title}" y todos sus apuntes asociados? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar Nota",
      action: () => {
        const remaining = notes.filter((n) => n.id !== id);
        onSaveNotes(remaining);
        if (remaining.length > 0) {
          setSelectedNoteId(remaining[0].id);
        } else {
          setSelectedNoteId("");
        }
        setIsEditing(false);
        if (onTuddyCheer) onTuddyCheer("Nota eliminada correctamente 🗑️");
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteSummary = () => {
    if (!currentNote?.aiSummary) return;
    setConfirmModalState({
      isOpen: true,
      title: "¿Eliminar este resumen?",
      message: "Tu texto original y apuntes se mantendrán intactos. El resumen generado por IA se borrará y podrás volver a crearlo cuando gustes.",
      confirmText: "Borrar Resumen",
      action: () => {
        const updated = notes.map((n) =>
          n.id === currentNote.id
            ? { ...n, aiSummary: undefined, updatedAt: new Date().toISOString() }
            : n
        );
        onSaveNotes(updated);
        if (onTuddyCheer) onTuddyCheer("Resumen eliminado. Puedes generar uno nuevo cuando quieras 🐰✨");
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Helper to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Upload Document (PDF, TXT, MD) - PDF uses AI parsing to completely avoid reading metadata
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      setIsParsingDoc(true);
      setDocParsingStatus("Tuddy está leyendo el PDF y filtrando metadatos para extraer texto y diagramas puros... 📄✨");

      try {
        const base64Data = await fileToBase64(file);
        const res = await fetch("/api/ai/parse-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: "application/pdf",
            fileName,
          }),
        });

        const data = await res.json();
        if (data.cleanContent) {
          const newNote: StudyNote = {
            id: "note-" + Date.now(),
            title: data.titleSuggestion || fileName.replace(/\.[^/.]+$/, ""),
            subject: data.subjectSuggestion || "General",
            rawContent: data.cleanContent,
            fileAttachmentName: fileName,
            tags: Array.isArray(data.keyTerms) && data.keyTerms.length > 0
              ? data.keyTerms.slice(0, 5)
              : ["pdf", "estudio"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          onSaveNotes([newNote, ...notes]);
          setSelectedNoteId(newNote.id);
          setIsEditing(false);
          confetti({ particleCount: 40, spread: 60 });
          onRewardCarrot(2);
          if (onTuddyCheer) onTuddyCheer(`¡PDF '${fileName}' procesado limpiamente sin metadatos técnicos! 🐰📄`);
        } else {
          throw new Error("No se pudo extraer contenido.");
        }
      } catch (err: any) {
        console.error(err);
        setUploadError("No se pudo procesar el PDF automáticamente. Intenta con un PDF estándar o copia y pega el texto.");
      } finally {
        setIsParsingDoc(false);
        setDocParsingStatus("");
        if (docInputRef.current) docInputRef.current.value = "";
      }
    } else {
      // Text files
      try {
        const text = await file.text();
        const cleanTitle = fileName.replace(/\.[^/.]+$/, "");
        const newNote: StudyNote = {
          id: "note-" + Date.now(),
          title: cleanTitle,
          subject: "Archivo de Texto",
          rawContent: text,
          fileAttachmentName: fileName,
          tags: ["importado", extension || "txt"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onSaveNotes([newNote, ...notes]);
        setSelectedNoteId(newNote.id);
        setIsEditing(false);
        confetti({ particleCount: 30, spread: 45 });
        if (onTuddyCheer) onTuddyCheer(`¡Archivo '${fileName}' cargado correctamente!`);
      } catch (err: any) {
        setUploadError("Error al leer el archivo de texto.");
      } finally {
        if (docInputRef.current) docInputRef.current.value = "";
      }
    }
  };

  // Upload New Note from Image with Multimodal AI
  const handleImageUploadNewNote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    setIsAnalyzingImg(true);
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          promptContext: "Analizar apuntes de imagen, extraer OCR y conceptos relacionados",
        }),
      });

      const data = await res.json();
      const cleanTitle = data.suggestedTitle || `Foto de Apuntes: ${file.name.replace(/\.[^/.]+$/, "")}`;

      let compiledText = "";
      if (data.ocrText && data.ocrText.trim()) {
        compiledText += `### 📝 Texto Detectado en la Imagen (OCR):\n${data.ocrText}\n\n`;
      }
      if (data.visualDescription && data.visualDescription.trim()) {
        compiledText += `### 🖼️ Diagramas y Esquemas Visuales:\n${data.visualDescription}\n\n`;
      }
      if (data.summaryMarkdown && data.summaryMarkdown.trim()) {
        compiledText += `### 💡 Síntesis Didáctica:\n${data.summaryMarkdown}\n\n`;
      }

      const newNote: StudyNote = {
        id: "note-" + Date.now(),
        title: cleanTitle,
        subject: data.suggestedSubject || "Estudio Visual",
        rawContent: compiledText || "Imagen analizada con Tuddy IA.",
        fileAttachmentName: file.name,
        imageUrl: base64Data,
        imageAnalysis: {
          ocrText: data.ocrText,
          visualDescription: data.visualDescription,
          relatedConcepts: data.relatedConcepts || [],
          suggestedNoteTitle: data.suggestedTitle,
        },
        tags: Array.isArray(data.relatedConcepts) && data.relatedConcepts.length > 0
          ? data.relatedConcepts.slice(0, 5)
          : ["imagen", "ocr"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSaveNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
      setIsEditing(false);
      confetti({ particleCount: 45, spread: 65 });
      onRewardCarrot(3);
      if (onTuddyCheer) onTuddyCheer("¡Imagen leída con IA! Texto extraído y conceptos relacionados listos 🐰📸");
    } catch (err: any) {
      console.error(err);
      setUploadError("Error al procesar la imagen con IA.");
    } finally {
      setIsAnalyzingImg(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Attach an Image to CURRENT Note
  const handleAttachImageToCurrentNote = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentNote) return;
    setUploadError("");

    setIsAnalyzingImg(true);
    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          promptContext: `Analizar imagen adjunta a la nota "${currentNote.title}"`,
        }),
      });

      const data = await res.json();
      const updated = notes.map((n) => {
        if (n.id === currentNote.id) {
          const newTags = Array.from(
            new Set([...n.tags, ...(data.relatedConcepts || [])])
          ).slice(0, 8);

          return {
            ...n,
            imageUrl: base64Data,
            imageAnalysis: {
              ocrText: data.ocrText,
              visualDescription: data.visualDescription,
              relatedConcepts: data.relatedConcepts || [],
              suggestedNoteTitle: data.suggestedTitle,
            },
            tags: newTags,
            updatedAt: new Date().toISOString(),
          };
        }
        return n;
      });

      onSaveNotes(updated);
      confetti({ particleCount: 30, spread: 50 });
      if (onTuddyCheer) onTuddyCheer("¡Imagen adjuntada y analizada con conceptos relacionados! 🐰🖼️");
    } catch (err: any) {
      console.error(err);
      setUploadError("No se pudo analizar la imagen adjunta.");
    } finally {
      setIsAnalyzingImg(false);
      if (attachImageRef.current) attachImageRef.current.value = "";
    }
  };

  const handleRemoveImageFromCurrentNote = () => {
    if (!currentNote?.imageUrl) return;
    setConfirmModalState({
      isOpen: true,
      title: "¿Quitar imagen de esta nota?",
      message: "¿Deseas quitar la imagen adjunta? Tus apuntes y notas escritas se conservarán intactos.",
      confirmText: "Quitar Imagen",
      action: () => {
        const updated = notes.map((n) =>
          n.id === currentNote.id
            ? { ...n, imageUrl: undefined, imageAnalysis: undefined, updatedAt: new Date().toISOString() }
            : n
        );
        onSaveNotes(updated);
        if (onTuddyCheer) onTuddyCheer("Imagen retirada de la nota 🖼️");
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Append OCR text to raw content
  const handleAppendOcrToContent = () => {
    if (!currentNote?.imageAnalysis?.ocrText) return;
    const textToAppend = `\n\n### 📝 Texto de la Imagen:\n${currentNote.imageAnalysis.ocrText}`;
    const updated = notes.map((n) =>
      n.id === currentNote.id
        ? { ...n, rawContent: n.rawContent + textToAppend, updatedAt: new Date().toISOString() }
        : n
    );
    onSaveNotes(updated);
    if (onTuddyCheer) onTuddyCheer("Texto transcrito añadido a tus apuntes 📝");
  };

  // Create flashcard from image concepts or analysis
  const handleCreateFlashcardFromImage = () => {
    if (!currentNote || !onAddFlashcardsFromSummary) return;

    const analysis = currentNote.imageAnalysis;
    const question = analysis?.visualDescription
      ? `¿Qué representa el esquema de ${currentNote.title}?`
      : `¿Qué concepto clave ilustra la imagen de ${currentNote.title}?`;

    const answer = analysis?.visualDescription || analysis?.ocrText || currentNote.rawContent.slice(0, 200);
    const hint = analysis?.relatedConcepts?.[0] ? `Relacionado con: ${analysis.relatedConcepts[0]}` : "Observa los detalles del apunte visual 🐰";

    const newCard: Flashcard = {
      id: "card-" + Date.now(),
      deckId: "general",
      front: question,
      back: answer,
      hint,
      imageUrl: currentNote.imageUrl,
      tags: analysis?.relatedConcepts || currentNote.tags,
      masteryLevel: 0,
      reviewCount: 0,
    };

    onAddFlashcardsFromSummary([newCard]);
    confetti({ particleCount: 35, spread: 55 });
    if (onTuddyCheer) onTuddyCheer("¡Ficha creada a partir de tu imagen! Lista en tu mazo 🗂️✨");
  };

  // Generate AI Summary
  const handleGenerateSummary = async () => {
    if (!currentNote || !currentNote.rawContent.trim()) {
      setUploadError("Por favor agrega texto o sube un archivo a la nota antes de pedir un resumen.");
      return;
    }

    setIsSummarizing(true);
    setUploadError("");
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentNote.title,
          content: currentNote.rawContent,
          style: summaryStyle,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        const updated = notes.map((n) =>
          n.id === currentNote.id ? { ...n, aiSummary: data.summary, updatedAt: new Date().toISOString() } : n
        );
        onSaveNotes(updated);
        confetti({ particleCount: 45, spread: 60 });
        onRewardCarrot(3);
        if (onTuddyCheer) onTuddyCheer("¡Resumen listo! Estructurado con conceptos clave y puntos críticos de examen 🥕📝");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Error al contactar con la IA de Tuddy. Verifica tu conexión.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    if (!currentNote?.aiSummary) return;
    navigator.clipboard.writeText(currentNote.aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocUpload}
        accept=".pdf,.txt,.md,.doc,.docx"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUploadNewNote}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={attachImageRef}
        onChange={handleAttachImageToCurrentNote}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#E8E2D9] pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#4A4A4A] flex items-center gap-2 font-heading">
            <FileText className="h-6 w-6 text-[#FFB7B2]" />
            {t.notesTitle}
          </h2>
          <p className="text-xs text-[#7A7A7A]">
            {t.notesSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            disabled={isParsingDoc}
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#E8E2D9] bg-white px-3.5 py-2 text-xs font-bold text-[#4A4A4A] shadow-xs hover:bg-[#F8F9FA] transition-all disabled:opacity-50"
            title="Sube PDFs o archivos de texto sin metadatos"
          >
            <Upload className="h-4 w-4 text-[#4A8A9E]" />
            <span>{t.uploadImage}</span>
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isAnalyzingImg}
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition-all disabled:opacity-50"
            title="Sube una foto de apuntes o esquema para leer texto y conceptos relacionados con IA"
          >
            <ImageIcon className="h-4 w-4 text-amber-600" />
            <span>{t.uploadImage}</span>
          </button>

          <button
            type="button"
            onClick={handleCreateNewNote}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFB7B2] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#ffa5a0] transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.newNote}</span>
          </button>
        </div>
      </div>

      {/* Parsing / Analyzing Status Banners */}
      {isParsingDoc && (
        <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 flex items-center gap-3 text-xs text-sky-900 animate-pulse">
          <RefreshCw className="h-5 w-5 text-sky-600 animate-spin shrink-0" />
          <div>
            <span className="font-bold block">Lectura Limpia de PDF en Curso</span>
            <span>{docParsingStatus || "Tuddy está filtrando metadatos técnicos y extrayendo el contenido de estudio..."}</span>
          </div>
        </div>
      )}

      {isAnalyzingImg && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 text-xs text-amber-900 animate-pulse">
          <ScanText className="h-5 w-5 text-amber-600 animate-spin shrink-0" />
          <div>
            <span className="font-bold block">Tuddy IA Analizando Imagen Multimodal</span>
            <span>Extrayendo texto manuscrito/impreso (OCR), analizando diagramas y buscando conceptos relacionados...</span>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError("")} className="text-rose-500 hover:text-rose-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Notes List / Right Note Detail & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Note List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Tus Notas ({notes.length})</span>
            {notes.length > 0 && (
              <span className="text-[11px] text-slate-400">Selecciona para ver o editar</span>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
              <PetAvatar pet={pet} size="sm" />
              <p className="mt-2 text-xs font-medium text-slate-600">No tienes notas todavía</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Crea una nueva nota, sube un PDF o una foto de tus apuntes con los botones superiores.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {notes.map((note) => {
                const isSelected = note.id === currentNote?.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className={`group relative cursor-pointer rounded-2xl p-4 transition-all border-2 ${
                      isSelected
                        ? "border-[#FFB7B2] bg-[#FFF8E6] shadow-sm"
                        : "border-[#E8E2D9] bg-white hover:border-[#FFB7B2]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB7B2] bg-rose-50 px-2 py-0.5 rounded-full line-clamp-1">
                        {note.subject}
                      </span>

                      {/* Explicit, accessible delete button for each note */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        title="Eliminar esta nota"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-[#4A4A4A] line-clamp-1 flex items-center gap-1.5">
                      {note.imageUrl && <ImageIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      <span>{note.title}</span>
                    </h4>
                    
                    <p className="mt-1 text-xs text-[#7A7A7A] line-clamp-2">
                      {note.rawContent ? note.rawContent.slice(0, 95) : "Sin contenido todavía..."}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#7A7A7A]">
                      <div className="flex items-center gap-1.5">
                        {note.aiSummary ? (
                          <span className="text-[#3E7D46] flex items-center gap-0.5 font-bold">
                            <Sparkles className="h-3 w-3 text-[#3E7D46]" /> Resumen
                          </span>
                        ) : (
                          <span className="text-slate-400">Apuntes</span>
                        )}

                        {note.imageUrl && (
                          <span className="text-amber-700 bg-amber-100/70 text-[10px] px-1.5 py-0.2 rounded-md font-semibold">
                            Foto
                          </span>
                        )}
                      </div>

                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Note Detail & AI Summarizer */}
        <div className="lg:col-span-8 space-y-6">
          {currentNote ? (
            <div className="rounded-3xl border-2 border-[#E8E2D9] bg-white p-6 shadow-sm space-y-6">
              {/* Note Header & Actions */}
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        {currentNote.subject}
                      </span>
                      {currentNote.fileAttachmentName && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FileCheck2 className="h-3 w-3 text-emerald-600" />
                          {currentNote.fileAttachmentName}
                        </span>
                      )}
                      {currentNote.imageUrl && (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ImageIcon className="h-3 w-3 text-amber-600" />
                          Con Imagen de Apuntes
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {currentNote.title}
                    </h3>
                  </div>

                  {/* Actions: Edit, Attach Image, Delete Note */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!currentNote.imageUrl && (
                      <button
                        type="button"
                        onClick={() => attachImageRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                        title="Adjuntar una imagen o foto a esta nota"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                        <span>Adjuntar Imagen</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={startEditing}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(currentNote.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                      title="Eliminar esta nota por completo"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Eliminar Nota</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Note Edit Form */
                <form onSubmit={handleSaveEdit} className="space-y-4 border-b border-slate-100 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Título</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Materia</label>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contenido / Apuntes de Estudio
                    </label>
                    <textarea
                      rows={6}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Pega aquí tus apuntes de clase, lecturas o fórmulas para estudiar..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Etiquetas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="examen, definicion, biologia"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(currentNote.id)}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Eliminar esta nota</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Attached Image Card with OCR and Related Concepts */}
              {currentNote.imageUrl && (
                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/70 pb-2">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-amber-600" />
                      Imagen y Esquema Adjunto
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewImageModal(currentNote.imageUrl || null)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-50"
                      >
                        <Eye className="h-3 w-3" /> Ver completa
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImageFromCurrentNote}
                        className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-white border border-rose-200 px-2 py-0.5 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" /> Quitar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div 
                      className="cursor-pointer rounded-xl overflow-hidden border border-amber-200 bg-black/5 max-h-40 flex items-center justify-center"
                      onClick={() => setPreviewImageModal(currentNote.imageUrl || null)}
                    >
                      <img 
                        src={currentNote.imageUrl} 
                        alt="Apunte o esquema de estudio" 
                        className="object-contain w-full h-full max-h-40 hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2 text-xs">
                      {currentNote.imageAnalysis?.visualDescription && (
                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80">
                          <span className="font-bold text-amber-900 block mb-0.5">🔍 Esquema / Diagrama detectado:</span>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            {currentNote.imageAnalysis.visualDescription}
                          </p>
                        </div>
                      )}

                      {/* Related Concepts Badges */}
                      {currentNote.imageAnalysis?.relatedConcepts && currentNote.imageAnalysis.relatedConcepts.length > 0 && (
                        <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80">
                          <span className="font-bold text-amber-900 block mb-1">🔗 Conceptos Relacionados Encontrados:</span>
                          <div className="flex flex-wrap gap-1">
                            {currentNote.imageAnalysis.relatedConcepts.map((concept, idx) => (
                              <span
                                key={idx}
                                className="bg-amber-100 text-amber-900 font-medium px-2 py-0.5 rounded-md text-[10px]"
                              >
                                #{concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions with image analysis */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {currentNote.imageAnalysis?.ocrText && (
                          <button
                            type="button"
                            onClick={handleAppendOcrToContent}
                            className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
                          >
                            <ScanText className="h-3 w-3 text-amber-600" />
                            <span>Insertar texto OCR en la nota</span>
                          </button>
                        )}

                        {onAddFlashcardsFromSummary && (
                          <button
                            type="button"
                            onClick={handleCreateFlashcardFromImage}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-600 transition-colors shadow-2xs"
                          >
                            <Layers className="h-3 w-3" />
                            <span>Crear Ficha con esta Imagen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Content Collapsible or preview */}
              {!isEditing && currentNote.rawContent && (
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line font-sans">
                  {currentNote.rawContent}
                </div>
              )}

              {/* Summarizer Action Toolbar */}
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-orange-50/50 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Resumen Pedagógico Tuddy</span>
                  </div>

                  {/* Style selector */}
                  <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-amber-200/80 text-xs">
                    {(
                      [
                        { id: "concise", label: "Sintético" },
                        { id: "balanced", label: "Equilibrado" },
                        { id: "in_depth", label: "Exhaustivo" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSummaryStyle(s.id)}
                        className={`rounded-xl px-3 py-1 font-bold text-xs transition-all ${
                          summaryStyle === s.id
                            ? "bg-[#FFB7B2] text-white shadow-xs"
                            : "text-[#7A7A7A] hover:text-[#4A4A4A]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs text-[#7A7A7A] max-w-md font-medium">
                    Tuddy estructura la idea principal, conceptos clave, advertencias para exámenes y nemotecnias sin saturación.
                  </p>

                  <button
                    type="button"
                    disabled={isSummarizing || !currentNote.rawContent.trim()}
                    onClick={handleGenerateSummary}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFB7B2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#ffa5a0] active:scale-95 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                  >
                    {isSummarizing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Tuddy resumiendo...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{currentNote.aiSummary ? "Re-generar Resumen" : "Generar Resumen"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Summary Render Display with PROMINENT Delete Summary Button */}
              {currentNote.aiSummary ? (
                <div className="rounded-3xl border-2 border-[#B2F2BB] bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D9] pb-3">
                    <span className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-[#3E7D46]" />
                      Resultado del Resumen
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="inline-flex items-center gap-1 text-xs text-[#4A4A4A] hover:text-black bg-[#F8F9FA] hover:bg-[#E8E2D9]/40 border border-[#E8E2D9] px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-[#3E7D46]" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? "¡Copiado!" : "Copiar"}</span>
                      </button>

                      {onLaunchExamFromNote && (
                        <button
                          type="button"
                          onClick={() => onLaunchExamFromNote(currentNote.title, currentNote.aiSummary || currentNote.rawContent)}
                          className="inline-flex items-center gap-1 text-xs text-white bg-[#4A4A4A] hover:bg-[#333333] px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Flame className="h-3.5 w-3.5 text-[#FFB7B2]" />
                          <span>Crear Quiz de esto</span>
                        </button>
                      )}

                      {/* Explicit Borrar Resumen button requested by user */}
                      <button
                        type="button"
                        onClick={handleDeleteSummary}
                        className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer"
                        title="Eliminar este resumen y conservar tus notas originales"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                        <span>Borrar Resumen</span>
                      </button>
                    </div>
                  </div>

                  {/* Markdown Renderer with pleasant styling */}
                  <div className="prose prose-sm max-w-none text-[#4A4A4A] leading-relaxed prose-headings:font-bold prose-headings:text-[#4A4A4A] prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-strong:text-[#4A4A4A] prose-ul:my-2 prose-li:my-0.5">
                    <ReactMarkdown>{currentNote.aiSummary}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
                  <div className="flex justify-center mb-2">
                    <PetAvatar pet={pet} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Aún no has generado un resumen para esta nota. Haz clic en "Generar Resumen" arriba y {pet.name} lo preparará con IA.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
              <p className="text-sm text-slate-500">Selecciona o crea una nota para comenzar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Full Image Preview */}
      <AnimatePresence>
        {previewImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImageModal}
                alt="Vista detallada de la imagen"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-app Confirmation Modal (Reliable across all browsers and iframes) */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText || "Eliminar"}
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={confirmModalState.action}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
