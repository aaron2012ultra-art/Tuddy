import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layers, 
  FileText, 
  HelpCircle, 
  Flame, 
  Calendar as CalendarIcon, 
  Languages, 
  TrendingUp, 
  Sparkles, 
  X,
  LayoutGrid,
  Award,
  Palette,
  BookOpen,
  Settings,
  Crown,
  User,
  Gamepad2
} from "lucide-react";
import { 
  Flashcard, 
  Deck, 
  StudyNote, 
  ScheduleItem, 
  ExamSession, 
  UserStats,
  PetCustomization,
  CustomSubject,
  WorkspaceTab,
  AppSettings,
  SubscriptionStatus,
  UserAccount,
  AccountBackupData
} from "./types";
import { 
  getStoredDecks, 
  saveDecks, 
  getStoredFlashcards, 
  saveFlashcards, 
  getStoredNotes, 
  saveNotes, 
  getStoredSchedule, 
  saveSchedule, 
  getStoredExamHistory, 
  saveExamSession, 
  getStoredStats, 
  saveStats,
  getStoredPet,
  savePet,
  getStoredSubjects,
  saveSubjects,
  getStoredSettings,
  saveSettings,
  getStoredSubscription,
  saveSubscription,
  clearAllStorageData,
  DEFAULT_SETTINGS,
  DEFAULT_PET
} from "./utils/storage";
import { WorkspaceTabBar } from "./components/WorkspaceTabBar";
import { AnthropomorphicBunny, PetAvatar } from "./components/AnthropomorphicBunny";
import { TuddyMascot } from "./components/TuddyMascot";
import { BentoDashboard } from "./components/BentoDashboard";
import { FlashcardsModule } from "./components/FlashcardsModule";
import { NotesAndSummarizer } from "./components/NotesAndSummarizer";
import { AITutorExplainer } from "./components/AITutorExplainer";
import { ExamSimulator } from "./components/ExamSimulator";
import { ScheduleModule } from "./components/ScheduleModule";
import { LanguageLearning } from "./components/LanguageLearning";
import { LongTermEvaluation } from "./components/LongTermEvaluation";
import { PetCustomizerModal } from "./components/PetCustomizerModal";
import { SubjectManagerModal } from "./components/SubjectManagerModal";
import { SettingsModal } from "./components/SettingsModal";
import { SubscriptionModal } from "./components/SubscriptionModal";
import { CornerMascotPopup } from "./components/CornerMascotPopup";
import { AuthModal } from "./components/AuthModal";
import { GameModelsSection } from "./components/GameModelsSection";
import { getCurrentUser, syncAccountData } from "./utils/authStorage";
import { TRANSLATIONS, LanguageContext, LanguageCode } from "./utils/translations";
import confetti from "canvas-confetti";

type ActiveTab = "bento" | "flashcards" | "notes" | "tutor" | "exams" | "schedule" | "languages" | "analytics" | "games";

export default function App() {
  // Account & Authentication (100% Optional)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // State from LocalStorage
  const [decks, setDecks] = useState<Deck[]>(() => getStoredDecks());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => getStoredFlashcards());
  const [notes, setNotes] = useState<StudyNote[]>(() => getStoredNotes());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => getStoredSchedule());
  const [examHistory, setExamHistory] = useState<ExamSession[]>(() => getStoredExamHistory());
  const [stats, setStats] = useState<UserStats>(() => getStoredStats());
  const [pet, setPet] = useState<PetCustomization>(() => getStoredPet());
  const [subjects, setSubjects] = useState<CustomSubject[]>(() => getStoredSubjects());
  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>(() => getStoredSubscription());
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [subscriptionFocusPerk, setSubscriptionFocusPerk] = useState<"flashcards" | "exams" | "languages" | "colors" | "outfits" | "streak" | "general">("general");

  const handleOpenSubscription = (perk: "flashcards" | "exams" | "languages" | "colors" | "outfits" | "streak" | "general" = "general") => {
    setSubscriptionFocusPerk(perk);
    setIsSubscriptionModalOpen(true);
  };

  const handleUpdateSubscription = (updated: SubscriptionStatus) => {
    setSubscription(updated);
    saveSubscription(updated);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Active translation dictionary
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.es;

  // Navigation & Workspace Tabs - default to Bento Grid dashboard overview
  const [workspaceTabs, setWorkspaceTabs] = useState<WorkspaceTab[]>([
    { id: "tab-bento", type: "bento", title: "Inicio Bento", closable: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-bento");

  const currentTab = workspaceTabs.find((t) => t.id === activeTabId) || workspaceTabs[0] || {
    id: "tab-bento",
    type: "bento",
    title: "Inicio Bento",
    closable: false,
  };
  const activeTab = currentTab.type;

  const handleOpenTab = (
    type: WorkspaceTab["type"],
    customTitle?: string,
    extraData?: Record<string, any>
  ) => {
    if (type === "bento") {
      setActiveTabId("tab-bento");
      return;
    }

    // Check if an identical tab already exists
    const existing = workspaceTabs.find((t) => {
      if (extraData?.deckId && t.deckId === extraData.deckId) return true;
      if (extraData?.noteId && t.noteId === extraData.noteId) return true;
      if (extraData?.customTopic && t.customTopic === extraData.customTopic) return true;
      if (!extraData && t.type === type && !t.deckId && !t.noteId && !t.customTopic) return true;
      return false;
    });

    if (existing) {
      setActiveTabId(existing.id);
      return;
    }

    const defaultTitles: Record<WorkspaceTab["type"], string> = {
      bento: "Inicio Bento",
      flashcards: "Fichas de Estudio",
      notes: "Notas & IA",
      tutor: "Tutor IA",
      exams: "Exámenes",
      schedule: "Horario & Pomodoro",
      languages: "Idiomas",
      games: "Modelos de Juego",
      analytics: "Progreso a Largo Plazo",
    };

    const newTab: WorkspaceTab = {
      id: `tab-${type}-${Date.now()}`,
      type,
      title: customTitle || defaultTitles[type] || "Módulo",
      subtitle: extraData?.subtitle,
      closable: true,
      deckId: extraData?.deckId,
      subject: extraData?.subject,
      noteId: extraData?.noteId,
      customTopic: extraData?.customTopic,
    };

    setWorkspaceTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCloseTab = (tabId: string) => {
    const targetTab = workspaceTabs.find((t) => t.id === tabId);
    if (!targetTab || !targetTab.closable) return;

    const remainingTabs = workspaceTabs.filter((t) => t.id !== tabId);
    setWorkspaceTabs(remainingTabs);

    if (activeTabId === tabId) {
      const closedIndex = workspaceTabs.findIndex((t) => t.id === tabId);
      const nextTab = remainingTabs[closedIndex - 1] || remainingTabs[0] || {
        id: "tab-bento",
        type: "bento",
        title: "Inicio Bento",
        closable: false,
      };
      setActiveTabId(nextTab.id);
    }
  };

  // Cross-module states
  const [examPrefillTopic, setExamPrefillTopic] = useState("");
  const [examPrefillNotes, setExamPrefillNotes] = useState("");

  // Mascot & Modal controls
  const [mascotBubbleMessage, setMascotBubbleMessage] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<"happy" | "studying" | "cheering" | "relaxed" | "proud" | "thinking">("happy");
  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [isPetCustomizerOpen, setIsPetCustomizerOpen] = useState(false);
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);

  // Persistence triggers
  const handleUpdateDecks = (newDecks: Deck[]) => {
    setDecks(newDecks);
    saveDecks(newDecks);
  };

  const handleUpdateFlashcards = (newCards: Flashcard[]) => {
    setFlashcards(newCards);
    saveFlashcards(newCards);
    const mastered = newCards.filter((c) => c.masteryLevel === 3).length;
    const updatedStats: UserStats = {
      ...stats,
      cardsMastered: mastered,
    };
    setStats(updatedStats);
    saveStats(updatedStats);
  };

  const handleUpdateNotes = (newNotes: StudyNote[]) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const handleUpdateSchedule = (newItems: ScheduleItem[]) => {
    setSchedule(newItems);
    saveSchedule(newItems);
  };

  const handleUpdatePet = (updatedPet: PetCustomization) => {
    setPet(updatedPet);
    savePet(updatedPet);
  };

  const handleUpdateSubjects = (updatedSubjects: CustomSubject[]) => {
    setSubjects(updatedSubjects);
    saveSubjects(updatedSubjects);
  };

  const handleAddSingleSubject = (newSubj: CustomSubject) => {
    setSubjects((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === newSubj.name.toLowerCase())) return prev;
      const updated = [newSubj, ...prev];
      saveSubjects(updated);
      return updated;
    });
  };

  const handleSaveExamResult = (session: ExamSession) => {
    saveExamSession(session);
    const updatedSessions = [session, ...examHistory];
    setExamHistory(updatedSessions);

    // Recalculate average
    const avg = Math.round(
      updatedSessions.reduce((sum, s) => sum + s.percentage, 0) / updatedSessions.length
    );
    const updatedStats: UserStats = {
      ...stats,
      averageScore: avg,
      quizzesCompleted: stats.quizzesCompleted + 1,
      totalStudyMinutes: stats.totalStudyMinutes + Math.round(session.durationSeconds / 60),
    };
    setStats(updatedStats);
    saveStats(updatedStats);
  };

  // Carrots & Gamification Reward
  const handleRewardCarrots = (amount: number) => {
    setStats((prev) => {
      const nextCoins = Math.max(0, prev.carrotCoins + amount);
      const nextStats = { ...prev, carrotCoins: nextCoins };
      saveStats(nextStats);
      return nextStats;
    });
  };

  const handleTuddyCheer = (message: string) => {
    setMascotBubbleMessage(message);
    setMascotMood("cheering");
    setTimeout(() => {
      setMascotMood("happy");
    }, 4500);
  };

  // Reset entire app data for a fresh start (Usuario solicita app vacía)
  const handleResetAllData = () => {
    clearAllStorageData();
    setDecks([]);
    setFlashcards([]);
    setNotes([]);
    setSchedule([]);
    setExamHistory([]);
    setSubjects([]);
    setStats({
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split("T")[0],
      totalStudyMinutes: 0,
      todayStudyMinutes: 0,
      carrotCoins: 0,
      cardsMastered: 0,
      quizzesCompleted: 0,
      averageScore: 0,
      subjectProgress: {},
    });
    setPet(DEFAULT_PET);
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    confetti({ particleCount: 30, spread: 50 });
    handleTuddyCheer("¡Aplicación vaciada! Ahora tienes un lienzo limpio para tus propias materias 🐰✨");
  };

  // Data snapshot for Account backups & Cloud syncing
  const getCurrentDataSnapshot = (): Omit<AccountBackupData, "account" | "savedAt"> => {
    let campaign = null;
    try {
      const rawCamp = localStorage.getItem("tuddy_campaign_progress_v2");
      if (rawCamp) campaign = JSON.parse(rawCamp);
    } catch {
      // ignore
    }
    return {
      decks,
      flashcards,
      notes,
      schedule,
      examHistory,
      stats,
      pet,
      subjects,
      settings,
      campaign,
      subscription,
    };
  };

  const handleRestoreAccountData = (backup: AccountBackupData) => {
    if (backup.decks) { setDecks(backup.decks); saveDecks(backup.decks); }
    if (backup.flashcards) { setFlashcards(backup.flashcards); saveFlashcards(backup.flashcards); }
    if (backup.notes) { setNotes(backup.notes); saveNotes(backup.notes); }
    if (backup.schedule) { setSchedule(backup.schedule); saveSchedule(backup.schedule); }
    if (backup.examHistory) { setExamHistory(backup.examHistory); }
    if (backup.stats) { setStats(backup.stats); saveStats(backup.stats); }
    if (backup.pet) { setPet(backup.pet); savePet(backup.pet); }
    if (backup.subjects) { setSubjects(backup.subjects); saveSubjects(backup.subjects); }
    if (backup.settings) { setSettings(backup.settings); saveSettings(backup.settings); }
    if (backup.subscription) { setSubscription(backup.subscription); saveSubscription(backup.subscription); }
    if (backup.campaign) {
      try {
        localStorage.setItem("tuddy_campaign_progress_v2", JSON.stringify(backup.campaign));
      } catch {
        // ignore
      }
    }
    handleTuddyCheer(`¡Bienvenido de nuevo, ${backup.account.displayName}! Progreso sincronizado 🐰☁️`);
  };

  // Switch to exam simulator from a note - opens as a workspace tab
  const handleLaunchExamFromNote = (title: string, content: string) => {
    setExamPrefillTopic(title);
    setExamPrefillNotes(content.slice(0, 1500));
    handleOpenTab("exams", `Examen: ${title}`, { subtitle: "Simulacro", customTopic: title });
    handleTuddyCheer(`¡Preparando el examen para "${title}" con ${pet.name}! 🔥`);
  };

  const navItems = [
    { id: "bento", label: t.navBento || "Inicio Bento", icon: LayoutGrid },
    { id: "flashcards", label: t.navFlashcards || "Fichas", icon: Layers, count: flashcards.length },
    { id: "notes", label: t.navNotes || "Notas & IA", icon: FileText, count: notes.length },
    { id: "tutor", label: t.navTutor || "Tutor IA", icon: HelpCircle },
    { id: "exams", label: t.navExams || "Exámenes", icon: Flame },
    { id: "schedule", label: t.navSchedule || "Horario & Pomodoro", icon: CalendarIcon },
    { id: "languages", label: t.navLanguages || "Idiomas", icon: Languages },
    { id: "games", label: "Juegos IA", icon: Gamepad2, count: 20 },
    { id: "analytics", label: t.navAnalytics || "Progreso a Largo Plazo", icon: TrendingUp },
  ];

  // User Level
  const userLevel = Math.max(1, Math.floor((stats.cardsMastered * 5 + stats.quizzesCompleted * 10 + stats.carrotCoins * 2) / 20) + 1);

  const handleSetLanguage = (newLang: LanguageCode) => {
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: settings.language,
        setLanguage: handleSetLanguage,
        t,
      }}
    >
      <div className="min-h-screen bg-[#FDF9F3] text-[#4A4A4A] flex flex-col font-sans">
      {/* TOP APPLICATION BAR - BENTO GRID HEADER */}
      <header className="sticky top-0 z-40 border-b-2 border-[#E8E2D9] bg-[#FDF9F3]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo & App Name matching Design HTML */}
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setIsPetCustomizerOpen(true)}
                className="w-10 h-10 bg-[#FFB7B2] rounded-2xl flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                title={`Personalizar a ${pet.name}`}
              >
                <PetAvatar pet={pet} size="sm" showBg={false} />
              </div>

              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl font-black tracking-tight text-[#FFB7B2] font-heading leading-none">
                  Tuddy
                </h1>
                <span className="text-xs font-bold text-[#7A7A7A] hidden sm:inline">
                  • Bento Studio
                </span>
              </div>
            </div>

            {/* Right side stats badges & quick action pills */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Tuddy Plus / VIP Subscription Button */}
              {subscription.isPro ? (
                <button
                  type="button"
                  onClick={() => handleOpenSubscription("general")}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black px-2.5 sm:px-3 py-1.5 rounded-full shadow-2xs border border-amber-300 text-xs hover:brightness-105 transition-all cursor-pointer"
                  title="Membresía Tuddy Plus Activa"
                >
                  <Crown className="w-3.5 h-3.5 fill-amber-950" />
                  <span className="hidden sm:inline">PLUS VIP</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSubscription("general")}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-amber-200/90 text-amber-900 font-black px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-300/80 text-xs hover:from-amber-200 hover:to-amber-300 transition-all cursor-pointer shadow-2xs group"
                  title="Desbloquear Tuddy Plus ($3.50/mes)"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Tuddy Plus</span>
                  <span className="text-[10px] bg-amber-400/50 text-amber-950 px-1 py-0.5 rounded-sm font-black">$3.50</span>
                </button>
              )}

              {/* Account & Cloud Sync Quick Button (100% Optional) */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  currentUser
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                    : "bg-white border-[#E8E2D9] text-[#4A4A4A] hover:bg-[#FAF6F0]"
                }`}
                title={
                  currentUser
                    ? `Perfil: ${currentUser.displayName} (${currentUser.provider.toUpperCase()}) - Sincronizado`
                    : "Crear Cuenta o Iniciar Sesión (Opcional)"
                }
              >
                {currentUser ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      ✓
                    </span>
                    <span className="max-w-[85px] truncate hidden sm:inline">{currentUser.displayName}</span>
                    <span className="text-emerald-700 text-xs">☁️</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span className="hidden sm:inline">{t.loginOrRegister || "Cuenta"}</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 px-1 py-0.5 rounded-sm font-semibold">Opcional</span>
                  </>
                )}
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-bold text-[#4A4A4A] shadow-2xs hover:bg-[#FAF6F0] transition-colors"
                title="Ajustes y Configuración"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">{t.settings || "Ajustes"}</span>
              </button>

              {/* Infinite Subjects Quick Button */}
              <button
                type="button"
                onClick={() => setIsSubjectManagerOpen(true)}
                className="hidden md:flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-bold text-[#4A4A4A] shadow-2xs hover:bg-[#FAF6F0] transition-colors"
                title="Administrar materias infinitas"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.subjects || "Materias"} ({subjects.length})</span>
              </button>

              {/* Pet Customizer Quick Button */}
              <button
                type="button"
                onClick={() => setIsPetCustomizerOpen(true)}
                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#E8E2D9] text-xs font-bold text-[#4A4A4A] shadow-2xs hover:bg-[#FAF6F0] transition-colors"
                title={`Personalizar mascota (${pet.name})`}
              >
                <Palette className="w-3.5 h-3.5 text-[#FFB7B2]" />
                <span className="hidden sm:inline">{pet.name}</span>
              </button>

              {/* Carrot Counter */}
              <div
                className="flex items-center gap-1 rounded-full bg-white border border-[#E8E2D9] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#4A4A4A] shadow-2xs"
                title="Zanahorias ganadas estudiando"
              >
                <span className="text-sm leading-none">🥕</span>
                <span>{stats.carrotCoins}</span>
              </div>

              {/* Streak Counter */}
              <div
                className="flex items-center gap-1 rounded-full bg-white border border-[#E8E2D9] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-orange-600 shadow-2xs"
                title="Racha de días de estudio continuo"
              >
                <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                <span>{stats.streakDays}d</span>
              </div>

              {/* Mascot interactive button */}
              <div
                onClick={() => setIsMascotModalOpen(true)}
                className="w-9 h-9 rounded-full bg-[#B2E2F2] border-2 border-white shadow-xs flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform overflow-hidden"
                title={`Hablar con ${pet.name}`}
              >
                <PetAvatar pet={pet} size="xs" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar with Bento Pills */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-2.5 pt-1 border-t border-[#E8E2D9]/60 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenTab(item.id as WorkspaceTab["type"])}
                  className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#FFB7B2] text-white font-bold shadow-xs border border-[#FFB7B2]"
                      : "bg-white text-[#4A4A4A] hover:bg-[#FAF6F0] border border-[#E8E2D9] font-medium"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#7A7A7A]"}`} />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-white/30 text-white" : "bg-[#F8F9FA] text-[#7A7A7A] border border-[#E8E2D9]"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* WORKSPACE TAB BAR: Tabs within the app */}
      <WorkspaceTabBar
        tabs={workspaceTabs}
        activeTabId={activeTabId}
        pet={pet}
        onSelectTab={(tabId) => setActiveTabId(tabId)}
        onCloseTab={handleCloseTab}
        onOpenNewTab={handleOpenTab}
        onOpenPetCustomizer={() => setIsPetCustomizerOpen(true)}
        onOpenSubjectManager={() => setIsSubjectManagerOpen(true)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "bento" && (
              <BentoDashboard
                schedule={schedule}
                notes={notes}
                examHistory={examHistory}
                stats={stats}
                flashcards={flashcards}
                pet={pet}
                subjects={subjects}
                onNavigate={(tab, title, extra) => handleOpenTab(tab as any, title, extra)}
                onLaunchExam={handleLaunchExamFromNote}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                onOpenMascotModal={() => setIsMascotModalOpen(true)}
                onOpenPetCustomizer={() => setIsPetCustomizerOpen(true)}
                onOpenSubjectManager={() => setIsSubjectManagerOpen(true)}
              />
            )}

            {activeTab === "flashcards" && (
              <FlashcardsModule
                decks={decks}
                flashcards={flashcards}
                onSaveDecks={handleUpdateDecks}
                onSaveFlashcards={handleUpdateFlashcards}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
                isPro={subscription.isPro}
                onOpenSubscriptionModal={() => handleOpenSubscription("flashcards")}
              />
            )}

            {activeTab === "notes" && (
              <NotesAndSummarizer
                notes={notes}
                onSaveNotes={handleUpdateNotes}
                onLaunchExamFromNote={handleLaunchExamFromNote}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
              />
            )}

            {activeTab === "tutor" && (
              <AITutorExplainer
                onSaveAsNote={(newNote) => {
                  handleUpdateNotes([newNote, ...notes]);
                }}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
              />
            )}

            {activeTab === "exams" && (
              <ExamSimulator
                initialTopic={currentTab.customTopic || examPrefillTopic}
                initialNotes={examPrefillNotes}
                onSaveExamResult={handleSaveExamResult}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
                isPro={subscription.isPro}
                onOpenSubscriptionModal={() => handleOpenSubscription("exams")}
              />
            )}

            {activeTab === "schedule" && (
              <ScheduleModule
                schedule={schedule}
                onSaveSchedule={handleUpdateSchedule}
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
                subjects={subjects}
                onOpenSubjectManager={() => setIsSubjectManagerOpen(true)}
                onAddCustomSubject={handleAddSingleSubject}
              />
            )}

            {activeTab === "languages" && (
              <LanguageLearning
                onRewardCarrot={handleRewardCarrots}
                onTuddyCheer={handleTuddyCheer}
                pet={pet}
                settings={settings}
                isPro={subscription.isPro}
                onOpenSubscriptionModal={() => handleOpenSubscription("languages")}
              />
            )}

            {activeTab === "games" && (
              <GameModelsSection
                subjects={subjects}
                subscription={subscription}
                userStats={stats}
                pet={pet}
                onUpdateStats={(newStats) => {
                  setStats(newStats);
                  saveStats(newStats);
                }}
                onOpenUpgradeModal={() => handleOpenSubscription("general")}
                initialTopic={currentTab.customTopic}
                initialSubject={currentTab.subject}
              />
            )}

            {activeTab === "analytics" && (
              <LongTermEvaluation
                stats={stats}
                examHistory={examHistory}
                flashcards={flashcards}
                onRewardCarrot={handleRewardCarrots}
                pet={pet}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FLOATING CORNER MASCOT POPUP (Periodically emerges with advice on user's subjects) */}
      <CornerMascotPopup
        pet={pet}
        subjects={subjects}
        schedule={schedule}
        onRewardCarrot={handleRewardCarrots}
        onNavigateToSubject={(subj) => {
          handleOpenTab("schedule", `Horario: ${subj}`);
        }}
      />

      {/* FLOATING MASCOT COMPANION BUTTON */}
      <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3">
        {mascotBubbleMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-xs rounded-3xl bg-white p-4 shadow-xl border-2 border-[#E8E2D9] text-xs text-[#4A4A4A] relative mb-2"
          >
            <div className="font-bold text-[#FFB7B2] text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{pet.name} te anima</span>
              <button
                type="button"
                onClick={() => setMascotBubbleMessage(null)}
                className="text-[#7A7A7A] hover:text-[#4A4A4A]"
              >
                ✕
              </button>
            </div>
            <p className="leading-snug font-medium">{mascotBubbleMessage}</p>
            {/* Speech bubble arrow */}
            <div className="absolute right-4 -bottom-2 h-3.5 w-3.5 rotate-45 bg-white border-r-2 border-b-2 border-[#E8E2D9]" />
          </motion.div>
        )}

        <button
          type="button"
          onClick={() => setIsMascotModalOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-3xl bg-[#FFB7B2] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-[#FFD1CF] overflow-hidden"
          title={`Abrir a ${pet.name} tu compañero de estudio`}
        >
          <div className="w-10 h-10 flex items-center justify-center select-none group-hover:scale-110 transition-transform">
            <AnthropomorphicBunny 
              pet={pet} 
              size="xs" 
              mood={mascotMood} 
              isBouncing={mascotMood === "cheering"} 
              showShadow={false} 
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#B2F2BB] text-[9px] font-bold text-[#3E7D46] border border-white">
            ✓
          </span>
        </button>
      </div>

      {/* MASCOT INTERACTIVE MODAL */}
      <AnimatePresence>
        {isMascotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-2 border-[#E8E2D9] relative"
            >
              <button
                type="button"
                onClick={() => setIsMascotModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1 text-[#7A7A7A] hover:text-[#4A4A4A] hover:bg-[#F8F9FA]"
              >
                <X className="h-5 w-5" />
              </button>

              <TuddyMascot
                carrotCoins={stats.carrotCoins}
                mood={mascotMood}
                pet={pet}
                onOpenCustomizer={() => {
                  setIsMascotModalOpen(false);
                  setIsPetCustomizerOpen(true);
                }}
                onCarrotFed={() => {
                  if (stats.carrotCoins > 0) {
                    handleRewardCarrots(-1);
                    confetti({ particleCount: 25, spread: 45 });
                  }
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PET CUSTOMIZER MODAL */}
      <PetCustomizerModal
        isOpen={isPetCustomizerOpen}
        onClose={() => setIsPetCustomizerOpen(false)}
        pet={pet}
        onSavePet={handleUpdatePet}
        carrotCoins={stats.carrotCoins}
        onRewardCarrot={handleRewardCarrots}
        isPro={subscription.isPro}
        onOpenSubscriptionModal={() => handleOpenSubscription("colors")}
      />

      {/* INFINITE SUBJECTS MANAGER MODAL */}
      <SubjectManagerModal
        isOpen={isSubjectManagerOpen}
        onClose={() => setIsSubjectManagerOpen(false)}
        subjects={subjects}
        onSaveSubjects={handleUpdateSubjects}
        pet={pet}
        onRewardCarrot={handleRewardCarrots}
        onAddScheduleItem={(item) => {
          handleUpdateSchedule([...schedule, item]);
        }}
      />

      {/* SETTINGS & CONFIGURATION MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onResetAllData={handleResetAllData}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* OPTIONAL ACCOUNT & CLOUD BACKUP MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={settings.language}
        currentDataSnapshot={getCurrentDataSnapshot()}
        onRestoreData={handleRestoreAccountData}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* SUBSCRIPTION MODAL (TUDDY PLUS 👑 - $3.50/mes) */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        pet={pet}
        initialFocusPerk={subscriptionFocusPerk}
        carrotCoins={stats.carrotCoins}
        onDeductCarrots={(amt) => handleRewardCarrots(-amt)}
      />
    </div>
    </LanguageContext.Provider>
  );
}

