import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Languages, 
  Sparkles, 
  Volume2, 
  RotateCw, 
  MessageCircle, 
  BookOpen, 
  Plane, 
  Check,
  Play,
  PenTool,
  Target
} from "lucide-react";
import { LanguageLesson, PetCustomization, AppSettings, CampaignPathNode } from "../types";
import { DEFAULT_PET, getStoredCampaignProgress, saveCampaignProgress, getStoredSettings } from "../utils/storage";
import { getCurriculumForLanguage } from "../data/campaignCurriculum";
import { CampaignFlightMap } from "./CampaignFlightMap";
import { InteractiveLessonModal } from "./InteractiveLessonModal";
import { useTranslation } from "../utils/translations";
import confetti from "canvas-confetti";

interface LanguageLearningProps {
  onRewardCarrot: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  pet?: PetCustomization;
  settings?: AppSettings;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

export interface SupportedLearningLanguage {
  id: string;
  name: string;
  flag: string;
  langCode: string;
  appLangCode: string;
  isPro?: boolean;
}

const ALL_SUPPORTED_LANGUAGES: SupportedLearningLanguage[] = [
  { id: "Spanish", name: "Español", flag: "🇪🇸", langCode: "es-ES", appLangCode: "es" },
  { id: "English", name: "Inglés", flag: "🇬🇧", langCode: "en-US", appLangCode: "en" },
  { id: "French", name: "Francés", flag: "🇫🇷", langCode: "fr-FR", appLangCode: "fr" },
  { id: "German", name: "Alemán", flag: "🇩🇪", langCode: "de-DE", appLangCode: "de" },
  { id: "Japanese", name: "Japonés", flag: "🇯🇵", langCode: "ja-JP", appLangCode: "ja" },
  { id: "Italian", name: "Italiano", flag: "🇮🇹", langCode: "it-IT", appLangCode: "it" },
  { id: "Portuguese", name: "Portugués", flag: "🇧🇷", langCode: "pt-BR", appLangCode: "pt" },
  // 10 NUEVOS IDIOMAS PRO EXCLUSIVOS 👑
  { id: "Korean", name: "Coreano", flag: "🇰🇷", langCode: "ko-KR", appLangCode: "ko", isPro: true },
  { id: "Chinese", name: "Chino Mandarín", flag: "🇨🇳", langCode: "zh-CN", appLangCode: "zh", isPro: true },
  { id: "Russian", name: "Ruso", flag: "🇷🇺", langCode: "ru-RU", appLangCode: "ru", isPro: true },
  { id: "Arabic", name: "Árabe", flag: "🇸🇦", langCode: "ar-SA", appLangCode: "ar", isPro: true },
  { id: "Dutch", name: "Holandés", flag: "🇳🇱", langCode: "nl-NL", appLangCode: "nl", isPro: true },
  { id: "Swedish", name: "Sueco", flag: "🇸🇪", langCode: "sv-SE", appLangCode: "sv", isPro: true },
  { id: "Greek", name: "Griego", flag: "🇬🇷", langCode: "el-GR", appLangCode: "el", isPro: true },
  { id: "Turkish", name: "Turco", flag: "🇹🇷", langCode: "tr-TR", appLangCode: "tr", isPro: true },
  { id: "Polish", name: "Polaco", flag: "🇵🇱", langCode: "pl-PL", appLangCode: "pl", isPro: true },
  { id: "Hindi", name: "Hindi", flag: "🇮🇳", langCode: "hi-IN", appLangCode: "hi", isPro: true },
];

export const LanguageLearning: React.FC<LanguageLearningProps> = ({
  onRewardCarrot,
  onTuddyCheer,
  pet = DEFAULT_PET,
  settings = getStoredSettings(),
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const { language, t } = useTranslation();

  // Filter available languages: Cannot learn the language the app is currently in!
  // If app is in Spanish ('es'), Spanish is removed and user can learn English, French, German, etc.
  // If app is in English ('en'), English is removed and user can learn Spanish, French, German, etc.
  const supportedLanguages = ALL_SUPPORTED_LANGUAGES.filter((l) => l.appLangCode !== language);

  // Main Mode: Campaign (Vuelo de Tuddy) vs Manual Lesson
  const [learningMode, setLearningMode] = useState<"campaign" | "manual">("campaign");

  // CAMPAIGN STATE (A1 ➔ C1 + Infinite progression for selected language)
  const [campaignProgress, setCampaignProgress] = useState(() => getStoredCampaignProgress());
  const [campaignLanguage, setCampaignLanguage] = useState<string>(() => {
    const prog = getStoredCampaignProgress();
    const stored = prog.selectedLanguage;
    if (stored) {
      const match = ALL_SUPPORTED_LANGUAGES.find((l) => l.name === stored || l.id === stored);
      if (match && match.appLangCode !== language) {
        return match.name;
      }
    }
    // Default to first supported language
    return language === "en" ? "Español" : "Inglés";
  });

  // Calculate infinite required units dynamically: ensures there are always units ahead of the user
  const completedCount = campaignProgress.completedStages?.length || 0;
  const minUnitsRequired = Math.max(10, Math.ceil((completedCount + 5) / 5) + 5);
  const currentCurriculum = getCurriculumForLanguage(campaignLanguage, minUnitsRequired);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => {
    const prog = getStoredCampaignProgress();
    return prog.currentStageId || currentCurriculum[0]?.id || "es-a1-1";
  });
  const [stageClearedNotice, setStageClearedNotice] = useState<string | null>(null);

  // MANUAL LESSON STATE
  const [manualLang, setManualLang] = useState<SupportedLearningLanguage>(() => {
    return supportedLanguages[0] || ALL_SUPPORTED_LANGUAGES[0];
  });
  const [manualLevel, setManualLevel] = useState("A2");
  const [manualTopic, setManualTopic] = useState("Daily Routine & Habits");
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [manualLesson, setManualLesson] = useState<LanguageLesson | null>(null);
  const [manualErrorMessage, setManualErrorMessage] = useState<string | null>(null);

  // Automatically switch learning language if app language changes to match current learning language
  useEffect(() => {
    const currentMatchesAppLang = ALL_SUPPORTED_LANGUAGES.find(
      (l) => (l.name.toLowerCase() === campaignLanguage.toLowerCase() || l.id.toLowerCase() === campaignLanguage.toLowerCase()) && l.appLangCode === language
    );

    if (currentMatchesAppLang) {
      // Must switch to another language that is not the app language
      const fallback = supportedLanguages[0]?.name || (language === "en" ? "Español" : "Inglés");
      handleSelectLanguage(fallback);
    }
  }, [language, campaignLanguage, supportedLanguages]);

  // Update manualLang if it matches app language
  useEffect(() => {
    if (manualLang.appLangCode === language) {
      if (supportedLanguages[0]) {
        setManualLang(supportedLanguages[0]);
      }
    }
  }, [language, manualLang, supportedLanguages]);

  // FLOATING INTERACTIVE LESSON MODAL STATE
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [modalLessonConfig, setModalLessonConfig] = useState<{
    lesson: LanguageLesson;
    cityTitle: string;
    countryName?: string;
    flagEmoji: string;
    carrotsReward: number;
    isCampaignStage: boolean;
    stageId?: string;
  } | null>(null);

  // Resolve current active node object
  const activeNode: CampaignPathNode =
    currentCurriculum.find((s) => s.id === selectedNodeId) ||
    currentCurriculum.find((s) => s.id === campaignProgress.currentStageId) ||
    currentCurriculum[0];

  // Speech helper respecting settings
  const speakText = (text: string, langCode: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = settings?.speechSpeed || 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Language selection in campaign
  const handleSelectLanguage = (langName: string) => {
    setCampaignLanguage(langName);
    const newCurriculum = getCurriculumForLanguage(langName, minUnitsRequired);
    const langProg = campaignProgress.languageProgress?.[langName];

    let newCurrentId = newCurriculum[0].id;
    let newCompleted: string[] = [];
    let newChests: string[] = [];

    if (langProg) {
      newCurrentId = langProg.currentStageId || newCurriculum[0].id;
      newCompleted = langProg.completedStages || [];
      newChests = langProg.claimedChests || [];
    }

    const updated = {
      ...campaignProgress,
      selectedLanguage: langName,
      currentStageId: newCurrentId,
      completedStages: newCompleted,
      claimedChests: newChests,
    };

    setSelectedNodeId(newCurrentId);
    setCampaignProgress(updated);
    saveCampaignProgress(updated);
    setStageClearedNotice(null);
  };

  // Node selection in campaign
  const handleSelectNode = (node: CampaignPathNode) => {
    setSelectedNodeId(node.id);
    setStageClearedNotice(null);
  };

  // Claim chest in campaign
  const handleClaimChest = (node: CampaignPathNode) => {
    const reward = node.carrotsReward || 15;
    onRewardCarrot(reward);

    const updatedClaimed = Array.from(new Set([...(campaignProgress.claimedChests || []), node.id]));
    const currentIndex = currentCurriculum.findIndex((s) => s.id === node.id);
    let nextStage = currentCurriculum[currentIndex + 1];
    if (!nextStage) {
      const expandedCurriculum = getCurriculumForLanguage(campaignLanguage, minUnitsRequired + 5);
      nextStage = expandedCurriculum[currentIndex + 1];
    }
    const nextStageId = nextStage ? nextStage.id : campaignProgress.currentStageId;

    const updatedProgress = {
      ...campaignProgress,
      currentStageId: nextStageId,
      claimedChests: updatedClaimed,
      languageProgress: {
        ...campaignProgress.languageProgress,
        [campaignLanguage]: {
          currentStageId: nextStageId,
          completedStages: campaignProgress.completedStages,
          claimedChests: updatedClaimed,
        },
      },
    };

    setCampaignProgress(updatedProgress);
    saveCampaignProgress(updatedProgress);

    if (nextStage) {
      setSelectedNodeId(nextStage.id);
    }

    if (onTuddyCheer) {
      onTuddyCheer(`¡Cofre abierto con éxito! Ganaste ${reward} zanahorias para vestir a Tuddy 🥕🎁`);
    }
  };

  // Launch campaign floating lesson modal
  const handleStartCampaignLesson = (node: CampaignPathNode) => {
    if (!node.lesson) return;
    const isCompleted = campaignProgress.completedStages.includes(node.id);
    setModalLessonConfig({
      lesson: node.lesson,
      cityTitle: node.title,
      countryName: `${node.targetLanguage} • ${node.levelBadge}`,
      flagEmoji: "✈️",
      carrotsReward: isCompleted ? 5 : node.carrotsReward,
      isCampaignStage: true,
      stageId: node.id,
    });
    setIsLessonModalOpen(true);
  };

  // Launch manual floating lesson modal
  const handleStartManualLesson = (lessonToOpen: LanguageLesson) => {
    setModalLessonConfig({
      lesson: lessonToOpen,
      cityTitle: `Lección Libre en ${manualLang.name}`,
      countryName: manualTopic,
      flagEmoji: manualLang.flag,
      carrotsReward: 15,
      isCampaignStage: false,
    });
    setIsLessonModalOpen(true);
  };

  // Complete lesson in floating modal
  const handleCompleteModalLesson = (carrotsEarned: number) => {
    onRewardCarrot(carrotsEarned);

    if (modalLessonConfig?.isCampaignStage && modalLessonConfig.stageId) {
      const stageId = modalLessonConfig.stageId;
      const currentIndex = currentCurriculum.findIndex((s) => s.id === stageId);
      let nextStage = currentCurriculum[currentIndex + 1];
      if (!nextStage) {
        const expandedCurriculum = getCurriculumForLanguage(campaignLanguage, minUnitsRequired + 5);
        nextStage = expandedCurriculum[currentIndex + 1];
      }
      const nextStageId = nextStage ? nextStage.id : stageId;

      const updatedCompleted = Array.from(new Set([...campaignProgress.completedStages, stageId]));
      const updatedProgress = {
        ...campaignProgress,
        currentStageId: nextStageId,
        completedStages: updatedCompleted,
        starsEarned: {
          ...campaignProgress.starsEarned,
          [stageId]: 3,
        },
        languageProgress: {
          ...campaignProgress.languageProgress,
          [campaignLanguage]: {
            currentStageId: nextStageId,
            completedStages: updatedCompleted,
            claimedChests: campaignProgress.claimedChests || [],
          },
        },
      };

      setCampaignProgress(updatedProgress);
      saveCampaignProgress(updatedProgress);

      const victoryMsg = nextStage
        ? `¡Nivel "${modalLessonConfig.cityTitle}" superado con éxito! Ganaste ${carrotsEarned} 🥕. ¡El avión de Tuddy avanza al siguiente hito de ${campaignLanguage}! ✈️`
        : `¡Nivel "${modalLessonConfig.cityTitle}" superado con éxito! Ganaste ${carrotsEarned} 🥕. ¡Nuevos niveles infinitos generados para ${campaignLanguage}! ✈️`;

      setStageClearedNotice(victoryMsg);
      if (onTuddyCheer) onTuddyCheer(modalLessonConfig.lesson.tuddyEncouragement);

      // Advance selected stage if there's a next stage
      if (nextStage) {
        setSelectedNodeId(nextStage.id);
      }
    } else {
      if (onTuddyCheer) onTuddyCheer("¡Excelente progreso en tu lección de idiomas! Sigue volando alto 🐰🌟");
    }
  };

  // MANUAL LESSON GENERATION VIA AI
  const handleGenerateManualLesson = async () => {
    setIsLoadingManual(true);
    setManualErrorMessage(null);
    setManualLesson(null);

    try {
      const res = await fetch("/api/ai/language-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: manualLang.id,
          nativeLanguage: "Spanish",
          level: manualLevel,
          topic: manualTopic,
        }),
      });

      const data = await res.json();
      if (data.topicTitle) {
        const enrichedLesson: LanguageLesson = {
          ...data,
          targetLanguage: manualLang.name,
          level: manualLevel,
          listeningExercise: {
            audioText: data.vocabulary[0]?.exampleSentence || data.vocabulary[0]?.word || "Hello",
            question: `¿Qué significa o expresa la frase escuchada en ${manualLang.name}?`,
            options: [
              data.vocabulary[0]?.exampleTranslation || data.vocabulary[0]?.translation || "Traducción adecuada",
              "Una despedida informal de noche",
              "Pedir una reserva de hotel",
              "Una expresión de desagrado",
            ],
            correctOptionIndex: 0,
            tip: data.pronunciationTip || "Escucha la entonación nativa",
          },
          readingExercise: {
            passageTitle: `Diálogo Situacional en ${manualLang.name}`,
            passageText: (data.dialogue || []).map((d: any) => `${d.speaker}: "${d.text}"`).join("\n\n"),
            question: `Según la conversación, ¿cuál es el tema principal?`,
            options: [
              data.dialogue[0]?.translation ? `Relacionado con: "${data.dialogue[0].translation}"` : "Comunicación fluida y cortés",
              "Un desacuerdo en una estación",
              "Cancelar una suscripción",
              "Preguntar la hora exacta",
            ],
            correctOptionIndex: 0,
            explanation: "El diálogo pone en práctica las estructuras clave del nivel.",
          },
          writingExercise: {
            prompt: `Traduce o escribe en ${manualLang.name}: "${data.vocabulary[0]?.translation || "Hola"}"`,
            expectedAnswer: data.vocabulary[0]?.word || "Hello",
            alternativeAcceptable: [data.vocabulary[0]?.word?.toLowerCase() || "hello"],
            hint: `Inicia con la letra "${(data.vocabulary[0]?.word || "H").charAt(0)}"`,
          },
        };

        setManualLesson(enrichedLesson);
        if (settings?.soundEffects !== false) {
          confetti({ particleCount: 30, spread: 50 });
        }
        onRewardCarrot(2);
        if (onTuddyCheer) onTuddyCheer(data.tuddyEncouragement || `¡Lección de ${manualLang.name} lista para ti! 🐰🌍`);

        // Automatically offer to launch the floating interactive window!
        handleStartManualLesson(enrichedLesson);
      } else if (data.error) {
        setManualErrorMessage(data.error);
      }
    } catch (err) {
      console.warn("Error fetching manual language lesson:", err);
      setManualErrorMessage("El tutor de IA está ocupado. Intenta de nuevo en unos segundos.");
    } finally {
      setIsLoadingManual(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="border-b border-[#E8E2D9] pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#4A4A4A] flex items-center gap-2.5">
            <Languages className="h-7 w-7 text-sky-600" />
            <span>{t.languagesTitle}</span>
          </h2>
          <p className="text-xs text-[#7A7A7A] mt-0.5">
            {t.languagesSubtitle}
          </p>
        </div>

        {/* MODE SWITCH TOGGLE */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#F4EFE6] border border-[#E8E2D9] shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setLearningMode("campaign")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              learningMode === "campaign"
                ? "bg-white text-[#0284C7] shadow-xs ring-2 ring-sky-200"
                : "text-[#7A7A7A] hover:text-[#4A4A4A]"
            }`}
          >
            <Plane className="h-4 w-4" />
            <span>{t.campaignMode}</span>
          </button>

          <button
            type="button"
            onClick={() => setLearningMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              learningMode === "manual"
                ? "bg-white text-emerald-700 shadow-xs ring-2 ring-emerald-200"
                : "text-[#7A7A7A] hover:text-[#4A4A4A]"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{t.manualMode}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODO CAMPAÑA AÉREA (EL VUELO DE TUDDY CON CAMINO DE A1 A C1) */}
      {/* ========================================================================= */}
      {learningMode === "campaign" && (
        <div className="space-y-6">
          {/* Visual Flight Map Component with Sinuous Path matching image */}
          <CampaignFlightMap
            nodes={currentCurriculum}
            currentNodeId={campaignProgress.currentStageId}
            completedNodeIds={campaignProgress.completedStages}
            claimedChestIds={campaignProgress.claimedChests || []}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            onStartLesson={handleStartCampaignLesson}
            onClaimChest={handleClaimChest}
            pet={pet}
            selectedLanguage={campaignLanguage}
            onSelectLanguage={handleSelectLanguage}
            languages={supportedLanguages}
            isPro={isPro}
            onOpenSubscriptionModal={onOpenSubscriptionModal}
          />

          {/* Victory Stage Cleared Alert */}
          {stageClearedNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl select-none">🎉</span>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700">¡Hito Aprobado!</h4>
                  <p className="text-xs font-bold mt-0.5">{stageClearedNotice}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStageClearedNotice(null)}
                className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Entendido
              </button>
            </motion.div>
          )}

          {/* QUICK OVERVIEW CARD OF THE ACTIVE NODE */}
          <div className="rounded-3xl border-2 border-[#E8E2D9] bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E2D9]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl select-none shrink-0 shadow-2xs">
                  {activeNode.type === "story" ? "📖" : activeNode.type === "chest" ? "🎁" : activeNode.type === "checkpoint" ? "👑" : "✈️"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0284C7] bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                      Nodo #{activeNode.nodeIndex}: {activeNode.levelBadge}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <span>🥕</span>
                      <span>+{activeNode.carrotsReward} zanahorias</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#4A4A4A] mt-1">{activeNode.title}</h3>
                  <p className="text-xs text-[#7A7A7A]">{activeNode.subtitle}</p>
                </div>
              </div>

              {activeNode.lesson && (
                <button
                  type="button"
                  onClick={() => handleStartCampaignLesson(activeNode)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Abrir Lección Flotante 🚀</span>
                </button>
              )}
            </div>

            {/* Vocab preview if node has lesson */}
            {activeNode.lesson && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#0284C7]" />
                  <span>Vocabulario Clave del Nivel ({activeNode.targetLanguage})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeNode.lesson.vocabulary.map((vocab, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#E8E2D9] bg-[#FDFBF7] p-3.5 hover:border-sky-300 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-slate-800">{vocab.word}</span>
                          {vocab.phoneticOrPronunciationGuide && (
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">
                              {vocab.phoneticOrPronunciationGuide}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => speakText(vocab.word, activeNode.langCode)}
                          className="p-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Escuchar pronunciación"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-sky-900 font-semibold bg-sky-100/60 px-2 py-0.5 rounded-md w-fit">
                        {vocab.translation}
                      </div>

                      <div className="text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
                        <p className="font-medium text-slate-800 flex items-center justify-between">
                          <span>"{vocab.exampleSentence}"</span>
                          <button
                            type="button"
                            onClick={() => speakText(vocab.exampleSentence, activeNode.langCode)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            title="Escuchar frase completa"
                          >
                            <Volume2 className="h-3 w-3" />
                          </button>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{vocab.exampleTranslation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Launch Banner to floating window */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-amber-50 border-2 border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lección Flotante con 4 Habilidades</span>
                </span>
                <p className="text-[11px] text-slate-600 font-medium">
                  Partes <strong>Auditivas</strong> con control de velocidad, <strong>Lectura</strong> de historias, <strong>Escritura</strong> interactiva y <strong>Retos de Despegue</strong>.
                </p>
              </div>

              {activeNode.lesson && (
                <button
                  type="button"
                  onClick={() => handleStartCampaignLesson(activeNode)}
                  className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Despegar en Ventana Flotante 🚀</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODO LECCIÓN MANUAL LIBRE */}
      {/* ========================================================================= */}
      {learningMode === "manual" && (
        <div className="space-y-6">
          {/* Language & Level Selector */}
          <div className="rounded-3xl border border-[#E8E2D9] bg-white p-6 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#4A4A4A] mb-2">
                1. Selecciona el Idioma a Practicar:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {supportedLanguages.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      if (l.isPro && !isPro) {
                        if (onOpenSubscriptionModal) onOpenSubscriptionModal();
                        return;
                      }
                      setManualLang(l);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      manualLang.id === l.id
                        ? "bg-emerald-50 border-emerald-500 shadow-xs text-emerald-900 font-bold ring-2 ring-emerald-200"
                        : l.isPro
                        ? "bg-amber-50/70 border-amber-300 text-amber-950 hover:bg-amber-100/80"
                        : "bg-[#FDFBF7] border-[#E8E2D9] text-[#4A4A4A] hover:bg-white"
                    }`}
                  >
                    <span className="text-xl select-none">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{l.name}</div>
                      {l.isPro && (
                        <span className="text-[10px] text-amber-800 font-black block">👑 PLUS</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4A4A4A] mb-1.5">
                  2. Nivel de Competencia (MCER):
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["A1", "A2", "B1", "B2", "C1"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setManualLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        manualLevel === lvl
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-[#FDFBF7] border-[#E8E2D9] text-[#4A4A4A] hover:bg-white"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A4A4A] mb-1.5">
                  3. Tema Libre o Situación:
                </label>
                <input
                  type="text"
                  value={manualTopic}
                  onChange={(e) => setManualTopic(e.target.value)}
                  placeholder="Ej: Pedir comida, Entrevistas de trabajo, En el aeropuerto..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] text-xs text-[#4A4A4A] focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isLoadingManual}
                onClick={handleGenerateManualLesson}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoadingManual ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Preparando lección interactiva...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generar Lección Flotante con IA (+2 🥕)</span>
                  </>
                )}
              </button>
            </div>

            {manualErrorMessage && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {manualErrorMessage}
              </p>
            )}
          </div>

          {/* MANUAL LESSON RESULT */}
          {manualLesson && (
            <div className="rounded-3xl border border-[#E8E2D9] bg-white p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E8E2D9] pb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                      {manualLesson.targetLanguage} • {manualLesson.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#4A4A4A] mt-1">{manualLesson.topicTitle}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartManualLesson(manualLesson)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Abrir en Ventana Flotante 🚀</span>
                </button>
              </div>

              {/* Vocab */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A]">Vocabulario Clave:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {manualLesson.vocabulary.map((vocab, i) => (
                    <div key={i} className="rounded-2xl border border-[#E8E2D9] bg-[#FDFBF7] p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#4A4A4A]">{vocab.word}</span>
                        <button
                          type="button"
                          onClick={() => speakText(vocab.word, manualLang.langCode)}
                          className="p-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-xs text-emerald-800 font-semibold">{vocab.translation}</div>
                      <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-1.5">
                        <p className="font-medium text-slate-800">"{vocab.exampleSentence}"</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{vocab.exampleTranslation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING INTERACTIVE LESSON MODAL */}
      {/* ========================================================================= */}
      {modalLessonConfig && (
        <InteractiveLessonModal
          isOpen={isLessonModalOpen}
          onClose={() => setIsLessonModalOpen(false)}
          lesson={modalLessonConfig.lesson}
          cityTitle={modalLessonConfig.cityTitle}
          countryName={modalLessonConfig.countryName}
          flagEmoji={modalLessonConfig.flagEmoji}
          carrotsReward={modalLessonConfig.carrotsReward}
          pet={pet}
          settings={settings}
          onCompleteLesson={handleCompleteModalLesson}
        />
      )}
    </div>
  );
};
