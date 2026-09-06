import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Eye, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Lightbulb, 
  Image as ImageIcon,
  FolderPlus,
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  ScanText,
  RefreshCw,
  Tag
} from "lucide-react";
import { Flashcard, Deck, PetCustomization } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import confetti from "canvas-confetti";
import { ConfirmModal } from "./ConfirmModal";
import { useTranslation } from "../utils/translations";

interface FlashcardsModuleProps {
  decks: Deck[];
  flashcards: Flashcard[];
  onSaveDecks: (decks: Deck[]) => void;
  onSaveFlashcards: (cards: Flashcard[]) => void;
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

export const FlashcardsModule: React.FC<FlashcardsModuleProps> = ({
  decks,
  flashcards,
  onSaveDecks,
  onSaveFlashcards,
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const { t } = useTranslation();
  const [selectedDeckId, setSelectedDeckId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Modal create/edit card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [hintText, setHintText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [cardDeckId, setCardDeckId] = useState(decks[0]?.id || "");

  // Image analysis within flashcard modal
  const [isAnalyzingCardImage, setIsAnalyzingCardImage] = useState(false);
  const [cardImageAnalysis, setCardImageAnalysis] = useState<{
    ocrText?: string;
    visualDescription?: string;
    relatedConcepts?: string[];
    suggestedFront?: string;
    suggestedBack?: string;
    suggestedHint?: string;
  } | null>(null);

  // Modal for previewing images full size
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);

  // Deck create modal
  const [isNewDeckOpen, setIsNewDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckSubject, setNewDeckSubject] = useState("General");
  const [newDeckColor, setNewDeckColor] = useState("#10b981");

  // AI Flashcard generation modal
  const [isAiGenOpen, setIsAiGenOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const cardImageInputRef = useRef<HTMLInputElement>(null);

  // Filtered cards
  const filteredCards = flashcards.filter((card) => {
    const matchesDeck = selectedDeckId === "all" || card.deckId === selectedDeckId;
    const matchesSearch =
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDeck && matchesSearch;
  });

  const activeCard = filteredCards[currentIndex];

  // Open Create Modal
  const openCreateModal = () => {
    if (!isPro && flashcards.length >= 15) {
      if (onOpenSubscriptionModal) {
        onOpenSubscriptionModal();
      } else {
        alert("Has alcanzado el límite de 15 fichas de la versión gratuita. ¡Suscríbete a Tuddy Plus 👑 por $3.50/mes para tener fichas ilimitadas!");
      }
      return;
    }
    setEditingCard(null);
    setFrontText("");
    setBackText("");
    setHintText("");
    setImageUrl("");
    setTagsInput("");
    setCardImageAnalysis(null);
    setCardDeckId(selectedDeckId !== "all" ? selectedDeckId : (decks[0]?.id || "general"));
    setIsModalOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setFrontText(card.front);
    setBackText(card.back);
    setHintText(card.hint || "");
    setImageUrl(card.imageUrl || "");
    setTagsInput(card.tags.join(", "));
    setCardDeckId(card.deckId);
    setCardImageAnalysis(null);
    setIsModalOpen(true);
  };

  // Helper: Read file as base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Upload image for flashcard
  const handleImageUploadForCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64Data = await fileToBase64(file);
      setImageUrl(base64Data);
      setCardImageAnalysis(null);
    } catch (err) {
      console.error(err);
      alert("Error al cargar la imagen.");
    } finally {
      if (cardImageInputRef.current) cardImageInputRef.current.value = "";
    }
  };

  // Analyze image with Tuddy AI (OCR + Visual + Related Concepts)
  const handleAnalyzeCardImage = async () => {
    if (!imageUrl) return;
    setIsAnalyzingCardImage(true);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageUrl,
          promptContext: "Analizar imagen de estudio para formular una ficha de repaso de alta efectividad",
        }),
      });

      const data = await res.json();
      setCardImageAnalysis({
        ocrText: data.ocrText,
        visualDescription: data.visualDescription,
        relatedConcepts: data.relatedConcepts || [],
        suggestedFront: data.flashcardSuggestion?.front,
        suggestedBack: data.flashcardSuggestion?.back,
        suggestedHint: data.flashcardSuggestion?.hint,
      });

      if (onTuddyCheer) onTuddyCheer("¡Imagen leída con IA! Revisa los conceptos relacionados y autocompleta tu ficha 🐰📸");
    } catch (err) {
      console.error(err);
      alert("Error al analizar la imagen con IA. Verifica tu conexión.");
    } finally {
      setIsAnalyzingCardImage(false);
    }
  };

  // Autocomplete front and back using AI image analysis
  const handleApplyCardAnalysis = () => {
    if (!cardImageAnalysis) return;
    if (cardImageAnalysis.suggestedFront && !frontText.trim()) {
      setFrontText(cardImageAnalysis.suggestedFront);
    } else if (cardImageAnalysis.suggestedFront) {
      setFrontText(cardImageAnalysis.suggestedFront);
    }

    if (cardImageAnalysis.suggestedBack) {
      setBackText(cardImageAnalysis.suggestedBack);
    }

    if (cardImageAnalysis.suggestedHint) {
      setHintText(cardImageAnalysis.suggestedHint);
    }

    if (cardImageAnalysis.relatedConcepts && cardImageAnalysis.relatedConcepts.length > 0) {
      const existing = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
      const combined = Array.from(new Set([...existing, ...cardImageAnalysis.relatedConcepts])).slice(0, 6);
      setTagsInput(combined.join(", "));
    }
    confetti({ particleCount: 25, spread: 40 });
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontText.trim() || !backText.trim()) return;

    if (!editingCard && !isPro && flashcards.length >= 15) {
      if (onOpenSubscriptionModal) onOpenSubscriptionModal();
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (editingCard) {
      const updated = flashcards.map((c) =>
        c.id === editingCard.id
          ? {
              ...c,
              front: frontText,
              back: backText,
              hint: hintText,
              imageUrl,
              tags,
              deckId: cardDeckId,
            }
          : c
      );
      onSaveFlashcards(updated);
    } else {
      const newCard: Flashcard = {
        id: "fc-" + Date.now(),
        deckId: cardDeckId || decks[0]?.id || "general",
        front: frontText,
        back: backText,
        hint: hintText,
        imageUrl,
        tags,
        masteryLevel: 0,
        reviewCount: 0,
      };
      onSaveFlashcards([...flashcards, newCard]);
      onRewardCarrot(2);
      if (onTuddyCheer) onTuddyCheer("¡Genial! Añadiste una nueva ficha. ¡Tu mazo crece! 🥕");
    }

    setIsModalOpen(false);
  };

  // In-app confirmation modal state (safe from iframe confirm/alert blocks)
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

  // Delete Card with Custom in-app Confirmation
  const handleDeleteCard = (id: string) => {
    const cardToDelete = flashcards.find((c) => c.id === id);
    const label = cardToDelete?.front ? `"${cardToDelete.front.slice(0, 45)}..."` : "esta ficha";
    setConfirmModalState({
      isOpen: true,
      title: "¿Eliminar esta ficha?",
      message: `¿Estás seguro de que deseas eliminar ${label}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar Ficha",
      action: () => {
        const updated = flashcards.filter((c) => c.id !== id);
        onSaveFlashcards(updated);
        if (currentIndex >= updated.length) {
          setCurrentIndex(Math.max(0, updated.length - 1));
        }
        if (onTuddyCheer) onTuddyCheer("Ficha eliminada correctamente 🗑️");
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Delete Active Card while studying
  const handleDeleteActiveCardInStudy = () => {
    if (!activeCard) return;
    const label = activeCard.front ? `"${activeCard.front.slice(0, 45)}..."` : "esta ficha";
    setConfirmModalState({
      isOpen: true,
      title: "¿Eliminar ficha en estudio?",
      message: `¿Deseas eliminar la ficha activa ${label} de tu mazo?`,
      confirmText: "Eliminar Ficha",
      action: () => {
        const updated = flashcards.filter((c) => c.id !== activeCard.id);
        onSaveFlashcards(updated);
        setIsFlipped(false);
        setShowHint(false);
        const newFiltered = updated.filter((c) => selectedDeckId === "all" || c.deckId === selectedDeckId);
        if (newFiltered.length === 0) {
          setIsStudyMode(false);
          setCurrentIndex(0);
        } else if (currentIndex >= newFiltered.length) {
          setCurrentIndex(Math.max(0, newFiltered.length - 1));
        }
        if (onTuddyCheer) onTuddyCheer("Ficha eliminada de tu sesión de estudio 🗑️");
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Delete entire custom Deck
  const handleDeleteDeck = (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;
    setConfirmModalState({
      isOpen: true,
      title: `¿Eliminar mazo "${deck.name}"?`,
      message: `Las fichas existentes se mantendrán en tu colección y se transferirán al mazo "General".`,
      confirmText: "Eliminar Mazo",
      action: () => {
        const updatedDecks = decks.filter((d) => d.id !== deckId);
        const updatedCards = flashcards.map((c) => c.deckId === deckId ? { ...c, deckId: "general" } : c);
        onSaveDecks(updatedDecks);
        onSaveFlashcards(updatedCards);
        setSelectedDeckId("all");
        setCurrentIndex(0);
        if (onTuddyCheer) onTuddyCheer(`Mazo "${deck.name}" eliminado correctamente 🗑️`);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    const newDeck: Deck = {
      id: "deck-" + Date.now(),
      name: newDeckName,
      subject: newDeckSubject,
      color: newDeckColor,
      description: `Mazo de ${newDeckSubject}`,
      createdAt: new Date().toISOString(),
    };
    onSaveDecks([...decks, newDeck]);
    setSelectedDeckId(newDeck.id);
    setIsNewDeckOpen(false);
    setNewDeckName("");
  };

  // Spaced Repetition Grading in Study Mode
  const handleRateCard = (levelChange: 0 | 1 | 2 | 3) => {
    if (!activeCard) return;

    const updated = flashcards.map((c) => {
      if (c.id === activeCard.id) {
        return {
          ...c,
          masteryLevel: levelChange,
          reviewCount: (c.reviewCount || 0) + 1,
          lastReviewed: new Date().toISOString(),
        };
      }
      return c;
    });

    onSaveFlashcards(updated);

    if (levelChange === 3) {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
      onRewardCarrot(5);
      if (onTuddyCheer) onTuddyCheer("¡Ficha dominada! ¡Toma 5 zanahorias de premio! 🥕🏆");
    } else {
      onRewardCarrot(1);
    }

    setIsFlipped(false);
    setShowHint(false);

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      setIsStudyMode(false);
      setCurrentIndex(0);
      if (onTuddyCheer) onTuddyCheer("¡Completaste tu sesión de repaso! ¡Tu memoria a largo plazo está en llamas! 🔥🐰");
    }
  };

  // AI Flashcards Generator
  const handleGenerateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          questionCount: 4,
          questionTypes: ["multiple_choice", "fill_blank"],
          difficulty: "intermediate",
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const targetDeck = selectedDeckId !== "all" ? selectedDeckId : (decks[0]?.id || "general");
        const newCards: Flashcard[] = data.questions.map((q: any, idx: number) => ({
          id: `ai-fc-${Date.now()}-${idx}`,
          deckId: targetDeck,
          front: q.question,
          back: `${q.correctAnswer}\n\n💡 Explicación: ${q.explanation}`,
          hint: q.hint || "Piensa en el concepto clave del tema",
          tags: [aiTopic.toLowerCase().slice(0, 15), "ia"],
          masteryLevel: 0,
          reviewCount: 0,
        }));

        onSaveFlashcards([...flashcards, ...newCards]);
        confetti({ particleCount: 45, spread: 60 });
        onRewardCarrot(3);
        setIsAiGenOpen(false);
        setAiTopic("");
        if (onTuddyCheer) onTuddyCheer(`¡Tuddy generó ${newCards.length} fichas inteligentes sobre '${aiTopic}'! 🐰✨`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con la IA de Tuddy. Verifica tu conexión.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file picker for flashcard images */}
      <input
        type="file"
        ref={cardImageInputRef}
        onChange={handleImageUploadForCard}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 font-heading">
            <Layers className="h-6 w-6 text-amber-500" />
            {t.flashcardsTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.flashcardsSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiGenOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>{t.generate}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewDeckOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
          >
            <FolderPlus className="h-4 w-4 text-emerald-600" />
            <span>{t.createDeck}</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t.newCard}</span>
          </button>
        </div>
      </div>

      {/* SUBSCRIPTION LIMIT BADGE / BANNER */}
      <div className={`p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${
        isPro 
          ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 text-amber-900 shadow-2xs" 
          : "bg-white border-slate-200 text-slate-700 shadow-2xs"
      }`}>
        <div className="flex items-center gap-3 text-xs">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
            isPro ? "bg-amber-400 text-slate-900 shadow-xs" : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}>
            {isPro ? "👑" : "🗂️"}
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>{isPro ? "Fichas Ilimitadas Activas (Tuddy Plus 👑)" : `Fichas creadas: ${flashcards.length} / 15 (Máximo versión gratuita)`}</span>
              {!isPro && flashcards.length >= 15 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                  Límite de 15 alcanzado
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {isPro 
                ? "Disfrutas de capacidad ilimitada para crear todos los mazos y fichas que necesites para tu estudio." 
                : "La versión gratuita permite hasta 15 fichas. Con Tuddy Plus ($3.50/mes) desbloqueas fichas infinitas."}
            </p>
          </div>
        </div>

        {!isPro && (
          <button
            type="button"
            onClick={onOpenSubscriptionModal}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Fichas Ilimitadas ($3.50/mes)</span>
          </button>
        )}
      </div>

      {/* Decks Carousel / Pill filter with Delete Deck button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setSelectedDeckId("all");
            setCurrentIndex(0);
          }}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            selectedDeckId === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {t.allDecks} ({flashcards.length})
        </button>

        {decks.map((d) => {
          const count = flashcards.filter((c) => c.deckId === d.id).length;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setSelectedDeckId(d.id);
                setCurrentIndex(0);
              }}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                selectedDeckId === d.id
                  ? "text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={{
                backgroundColor: selectedDeckId === d.id ? d.color : undefined,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: selectedDeckId === d.id ? "#ffffff" : d.color }}
              />
              <span>{d.name}</span>
              <span className="opacity-75 text-[10px]">({count})</span>
            </button>
          );
        })}

        {/* Delete custom deck button when a specific deck is active */}
        {selectedDeckId !== "all" && decks.some((d) => d.id === selectedDeckId) && (
          <button
            type="button"
            onClick={() => handleDeleteDeck(selectedDeckId)}
            className="shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            title={t.delete}
          >
            <Trash2 className="h-3 w-3" />
            <span>{t.delete}</span>
          </button>
        )}
      </div>

      {/* Mode Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchFlashcards}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            className="w-full rounded-xl bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setIsStudyMode(!isStudyMode);
              setIsFlipped(false);
              setShowHint(false);
            }}
            disabled={filteredCards.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isStudyMode
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>{isStudyMode ? t.exitStudy : t.studyMode}</span>
          </button>
        </div>
      </div>

      {/* STUDY MODE VIEW */}
      {isStudyMode && activeCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Header with Delete Active Card Button */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <span className="flex items-center gap-1 text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                {t.mastery}: {["🌱 " + t.newStatus, "📖 " + t.learningStatus, "⭐ " + t.goodStatus, "🏆 " + t.masteredStatus][activeCard.masteryLevel]}
              </span>
            </div>

            {/* Quick delete while studying */}
            <button
              type="button"
              onClick={handleDeleteActiveCardInStudy}
              className="inline-flex items-center gap-1 text-[11px] text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
              title={t.delete}
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>{t.delete}</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 min-h-[320px] cursor-pointer group"
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative w-full min-h-[320px] rounded-3xl p-8 shadow-md border border-slate-200/90 bg-white flex flex-col justify-between transform-style-3d select-none hover:shadow-lg transition-shadow"
            >
              {!isFlipped ? (
                // FRONT
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>{t.front}</span>
                    <span className="text-amber-600 flex items-center gap-1">
                      <RotateCw className="h-3 w-3" /> {t.flip}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {activeCard.front}
                  </h3>

                  {activeCard.imageUrl && (
                    <div 
                      className="mt-4 rounded-xl overflow-hidden max-h-48 border border-slate-100 bg-slate-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImageModal(activeCard.imageUrl || null);
                      }}
                    >
                      <img
                        src={activeCard.imageUrl}
                        alt="Flashcard diagram"
                        className="w-full h-full max-h-48 object-contain hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {activeCard.hint && (
                    <div className="pt-2">
                      {!showHint ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
                        >
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                          <span>Ver pista de {pet.name}</span>
                        </button>
                      ) : (
                        <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2.5">
                          <PetAvatar pet={pet} size="xs" showBg={false} />
                          <span className="pt-0.5">{activeCard.hint}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {activeCard.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                // BACK
                <div
                  className="space-y-4 transform rotate-y-180"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold uppercase tracking-wider">
                    <span>{t.cardBack}</span>
                    <span className="text-slate-400">{t.flip}</span>
                  </div>

                  <div className="text-lg sm:text-xl font-medium text-slate-800 whitespace-pre-line leading-relaxed">
                    {activeCard.back}
                  </div>

                  {activeCard.imageUrl && (
                    <div 
                      className="mt-2 rounded-xl overflow-hidden max-h-36 border border-slate-100 bg-slate-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImageModal(activeCard.imageUrl || null);
                      }}
                    >
                      <img
                        src={activeCard.imageUrl}
                        alt="Flashcard diagram"
                        className="w-full h-full max-h-36 object-contain"
                      />
                    </div>
                  )}

                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      ¡Buen intento! Evalúa qué tan bien lo recordaste abajo para que Tuddy ajuste tu repaso espaciado.
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Repasos hechos: {activeCard.reviewCount || 0}</span>
                <span>Tuddy Spaced Repetition</span>
              </div>
            </motion.div>
          </div>

          {/* Spaced Repetition Rating Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleRateCard(0)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-all font-semibold active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <XCircle className="h-5 w-5 text-rose-500 mb-1" />
              <span>Difícil / Repetir</span>
              <span className="text-[10px] opacity-75">Nivel 0</span>
            </button>

            <button
              type="button"
              onClick={() => handleRateCard(1)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all font-semibold active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <RotateCw className="h-5 w-5 text-amber-500 mb-1" />
              <span>Con esfuerzo</span>
              <span className="text-[10px] opacity-75">Nivel 1</span>
            </button>

            <button
              type="button"
              onClick={() => handleRateCard(2)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-all font-semibold active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5 text-blue-500 mb-1" />
              <span>Bien / Normal</span>
              <span className="text-[10px] opacity-75">Nivel 2</span>
            </button>

            <button
              type="button"
              onClick={() => handleRateCard(3)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all font-semibold active:scale-95 text-xs shadow-xs cursor-pointer"
            >
              <Sparkles className="h-5 w-5 text-emerald-500 mb-1" />
              <span>¡Fácil! Dominada</span>
              <span className="text-[10px] opacity-75">+5 🥕</span>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setIsFlipped(false);
                  setShowHint(false);
                }
              }}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> {t.back}
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentIndex < filteredCards.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  setIsFlipped(false);
                  setShowHint(false);
                }
              }}
              disabled={currentIndex === filteredCards.length - 1}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
            >
              {t.next} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* NORMAL GRID VIEW OF CARDS */
        <div>
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <div className="mx-auto flex items-center justify-center">
                <PetAvatar pet={pet} size="md" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-800">{t.emptyFlashcards}</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {t.flashcardsSubtitle}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                >
                  {t.newCard}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiGenOpen(true)}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-600 cursor-pointer"
                >
                  {t.generate}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => {
                const deck = decks.find((d) => d.id === card.deckId);
                return (
                  <div
                    key={card.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-amber-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: (deck?.color || "#94a3b8") + "18",
                            color: deck?.color || "#475569",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: deck?.color || "#94a3b8" }}
                          />
                          {deck?.name || "General"}
                        </span>

                        {/* Always visible and accessible action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(card)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Editar ficha"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar ficha"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2">
                        {card.front}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {card.back}
                      </p>

                      {card.imageUrl && (
                        <div 
                          className="mt-2 rounded-xl overflow-hidden max-h-24 border border-amber-200/60 bg-amber-50/30 flex items-center justify-between p-1.5 cursor-pointer hover:bg-amber-50"
                          onClick={() => setPreviewImageModal(card.imageUrl || null)}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={card.imageUrl}
                              alt="Thumbnail"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <span className="text-[11px] text-amber-900 font-semibold flex items-center gap-1">
                              <ImageIcon className="h-3 w-3 text-amber-600" />
                              Ver imagen adjunta
                            </span>
                          </div>
                          <Eye className="h-3.5 w-3.5 text-slate-400 mr-1" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {card.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-slate-500 font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {["🌱 Nvl 0", "📖 Nvl 1", "⭐ Nvl 2", "🏆 Dominado"][card.masteryLevel]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE / EDIT CARD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCard ? "Editar Ficha de Estudio" : "Nueva Ficha de Estudio"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mazo / Asignatura
                  </label>
                  <select
                    value={cardDeckId}
                    onChange={(e) => setCardDeckId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  >
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.subject})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multimodal Image Section */}
                <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                      Imagen o Esquema Visual (Opcional)
                    </label>

                    <button
                      type="button"
                      onClick={() => cardImageInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl bg-white border border-amber-300 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
                    >
                      <Upload className="h-3 w-3 text-amber-600" />
                      <span>Subir Foto / Archivo</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="O escribe o pega una URL de imagen..."
                      value={imageUrl.startsWith("data:") ? "(Imagen cargada desde tu dispositivo)" : imageUrl}
                      onChange={(e) => {
                        if (!imageUrl.startsWith("data:")) {
                          setImageUrl(e.target.value);
                          setCardImageAnalysis(null);
                        }
                      }}
                      disabled={imageUrl.startsWith("data:")}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 disabled:bg-amber-50/50"
                    />

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl("");
                          setCardImageAnalysis(null);
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl"
                        title="Quitar imagen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Image Preview & AI Analysis Button */}
                  {imageUrl && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between bg-white/90 p-2 rounded-xl border border-amber-200/80">
                        <div className="flex items-center gap-2">
                          <img
                            src={imageUrl}
                            alt="Vista previa"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="text-[11px] font-semibold text-slate-700">
                            Imagen vinculada a la ficha
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isAnalyzingCardImage}
                          onClick={handleAnalyzeCardImage}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-xs font-bold shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isAnalyzingCardImage ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Analizando...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              <span>Analizar con Tuddy IA</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Analysis Results */}
                      {cardImageAnalysis && (
                        <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                          {cardImageAnalysis.ocrText && (
                            <div>
                              <span className="font-bold text-slate-700 block text-[10px]">📝 Texto detectado (OCR):</span>
                              <p className="text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded-lg font-mono line-clamp-2">
                                {cardImageAnalysis.ocrText}
                              </p>
                            </div>
                          )}

                          {cardImageAnalysis.visualDescription && (
                            <div>
                              <span className="font-bold text-slate-700 block text-[10px]">🔍 Esquema / Diagrama:</span>
                              <p className="text-slate-600 text-[11px] line-clamp-2">
                                {cardImageAnalysis.visualDescription}
                              </p>
                            </div>
                          )}

                          {cardImageAnalysis.relatedConcepts && cardImageAnalysis.relatedConcepts.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-700 block text-[10px] mb-1">🔗 Conceptos Relacionados:</span>
                              <div className="flex flex-wrap gap-1">
                                {cardImageAnalysis.relatedConcepts.map((c, idx) => (
                                  <span key={idx} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                    #{c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleApplyCardAnalysis}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            <span>Autocompletar Frente y Dorso con esta Imagen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Frente (Pregunta, Término o Enunciado) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    placeholder="Ej: ¿Qué es la mitosis y cuáles son sus fases?"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dorso (Respuesta, Definición o Explicación) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    placeholder="Ej: Es el proceso de división celular... Profase, Metafase, Anafase, Telofase."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pista de Tuddy (Opcional)
                    </label>
                    <input
                      type="text"
                      value={hintText}
                      onChange={(e) => setHintText(e.target.value)}
                      placeholder="Ej: Piensa en 'PRO-METE-ANA-TEJER' 🐰"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Etiquetas (separadas por comas)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="celula, biologia, examen"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Footer with PROMINENT Delete Button when editing */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  {editingCard ? (
                    <button
                      type="button"
                      onClick={() => {
                        const cardId = editingCard.id;
                        setIsModalOpen(false);
                        handleDeleteCard(cardId);
                      }}
                      className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>Eliminar Ficha</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 cursor-pointer"
                    >
                      {editingCard ? "Guardar Cambios" : "Crear Ficha"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE DECK */}
      <AnimatePresence>
        {isNewDeckOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-3">Nuevo Mazo de Estudio</h3>
              <form onSubmit={handleCreateDeck} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Mazo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Anatomía Humana"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asignatura / Área</label>
                  <input
                    type="text"
                    placeholder="Ej: Medicina, Matemáticas, Idiomas"
                    value={newDeckSubject}
                    onChange={(e) => setNewDeckSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color distintivo</label>
                  <div className="flex items-center gap-2">
                    {["#10b981", "#f59e0b", "#6366f1", "#ec4899", "#3b82f6", "#8b5cf6"].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewDeckColor(col)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform cursor-pointer ${
                          newDeckColor === col ? "scale-110 border-slate-900" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewDeckOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Crear Mazo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GENERATE WITH AI */}
      <AnimatePresence>
        {isAiGenOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-lg font-bold text-slate-900">Tuddy IA: Generador de Fichas</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Escribe un tema o concepto que quieras aprender y Tuddy creará fichas listas para estudiar con explicaciones y pistas.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ¿Qué quieres estudiar hoy?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Las leyes de Newton, La Mitosis, Gramática Francesa B1..."
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2.5 border border-amber-200">
                  <PetAvatar pet={pet} size="xs" showBg={false} />
                  <span className="pt-0.5">
                    {pet.name} seleccionará las preguntas más comunes de exámenes y las formulará con pedagogía activa.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => setIsAiGenOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={aiLoading || !aiTopic.trim()}
                    onClick={handleGenerateWithAI}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                  >
                    {aiLoading ? (
                      <>
                        <RotateCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Tuddy pensando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Crear Fichas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PREVIEW IMAGE FULL SIZE */}
      <AnimatePresence>
        {previewImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setPreviewImageModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImageModal}
                alt="Vista completa"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-app Confirmation Modal (Reliable across all devices and sandboxed iframes) */}
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
