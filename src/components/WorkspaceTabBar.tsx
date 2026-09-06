import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  X, 
  LayoutGrid, 
  Layers, 
  FileText, 
  HelpCircle, 
  Flame, 
  Calendar, 
  Languages, 
  TrendingUp, 
  Palette, 
  BookOpen,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import { WorkspaceTab, PetCustomization } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { useTranslation } from "../utils/translations";

interface WorkspaceTabBarProps {
  tabs: WorkspaceTab[];
  activeTabId: string;
  pet: PetCustomization;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenNewTab: (type: WorkspaceTab["type"], customTitle?: string, extraData?: Record<string, any>) => void;
  onOpenPetCustomizer: () => void;
  onOpenSubjectManager: () => void;
}

export const WorkspaceTabBar: React.FC<WorkspaceTabBarProps> = ({
  tabs,
  activeTabId,
  pet,
  onSelectTab,
  onCloseTab,
  onOpenNewTab,
  onOpenPetCustomizer,
  onOpenSubjectManager,
}) => {
  const { t } = useTranslation();
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getTabDisplayTitle = (tab: WorkspaceTab) => {
    if (tab.customTopic) return tab.customTopic;
    if (tab.deckId || tab.noteId) return tab.title;
    switch (tab.type) {
      case "bento": return t.navBento || tab.title;
      case "flashcards": return t.navFlashcards || tab.title;
      case "notes": return t.navNotes || tab.title;
      case "tutor": return t.navTutor || tab.title;
      case "exams": return t.navExams || tab.title;
      case "schedule": return t.navSchedule || tab.title;
      case "languages": return t.navLanguages || tab.title;
      case "analytics": return t.navAnalytics || tab.title;
      case "games": return "Juegos IA (20 Modelos)";
      default: return tab.title;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    if (isNewMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNewMenuOpen]);

  const getTabIcon = (tab: WorkspaceTab) => {
    switch (tab.type) {
      case "bento":
        return <PetAvatar pet={pet} size="icon" showBg={false} className="w-5 h-5 -translate-y-0.5" />;
      case "flashcards":
        return <Layers className="w-3.5 h-3.5 text-emerald-600" />;
      case "notes":
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case "tutor":
        return <HelpCircle className="w-3.5 h-3.5 text-purple-600" />;
      case "exams":
        return <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />;
      case "schedule":
        return <Calendar className="w-3.5 h-3.5 text-sky-600" />;
      case "languages":
        return <Languages className="w-3.5 h-3.5 text-rose-500" />;
      case "analytics":
        return <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />;
      case "games":
        return <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <div className="bg-[#FAF6F0] border-b border-[#E8E2D9] px-3 sm:px-6 pt-2 select-none">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
        {/* Scrollable Tabs Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                id={`tab-item-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-semibold cursor-pointer transition-all border-t border-x shrink-0 ${
                  isActive
                    ? "bg-white border-[#E8E2D9] text-[#2D2D2D] shadow-xs font-bold -mb-[1px] pb-2.5 z-10"
                    : "bg-[#F3EDE2]/60 hover:bg-[#F3EDE2] border-transparent text-[#6B6B6B] hover:text-[#2D2D2D]"
                }`}
                title={tab.subtitle ? `${tab.title} (${tab.subtitle})` : tab.title}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute top-0 left-3 right-3 h-[2px] bg-[#FFB7B2] rounded-full" />
                )}

                {/* Icon or Mini Mascot */}
                <span className="flex items-center justify-center shrink-0">
                  {getTabIcon(tab)}
                </span>

                {/* Title */}
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {getTabDisplayTitle(tab)}
                </span>

                {/* Subtitle pill if any */}
                {tab.subtitle && (
                  <span className="hidden md:inline px-1.5 py-0.2 bg-[#FAF6F0] rounded text-[10px] text-[#8A8A8A] font-medium truncate max-w-[90px]">
                    {tab.subtitle}
                  </span>
                )}

                {/* Close Button */}
                {tab.closable ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-0.5 rounded-md text-[#9B9B9B] hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                    title={t.close || "Cerrar"}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Tab" />
                )}
              </div>
            );
          })}

          {/* New Tab Button */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              id="new-workspace-tab-btn"
              onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
              className="p-2 rounded-xl text-[#7A7A7A] hover:text-[#2D2D2D] hover:bg-[#F3EDE2] transition-colors border border-dashed border-[#D5CFC5] flex items-center justify-center gap-1 text-xs font-semibold ml-1"
              title={t.newTab || "Nueva pestaña"}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{t.newTab || "Nueva pestaña"}</span>
            </button>

            {/* Quick Open Dropdown Menu */}
            {isNewMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E2D9] p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A8A8A] border-b border-[#F0EAE1] mb-1">
                  {t.newTab || "Abrir en nueva pestaña"}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("flashcards", t.navFlashcards);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-emerald-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navFlashcards}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("exams", t.navExams);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-orange-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navExams}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("languages", t.navLanguages);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-rose-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                      <Languages className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navLanguages}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("notes", t.navNotes);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-amber-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navNotes}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("tutor", t.navTutor);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-purple-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navTutor}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("schedule", t.navSchedule);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-sky-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navSchedule}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("analytics", t.navAnalytics);
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#FAF6F0] hover:text-indigo-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.navAnalytics}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNewTab("games", "Modelos de Juego (20 Juegos)");
                    setIsNewMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/60 hover:bg-amber-100 transition-colors text-left border border-amber-200/60"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                      <Gamepad2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Juegos IA (20 Modelos)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-black">
                    Nuevo
                  </span>
                </button>

                <div className="border-t border-[#F0EAE1] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSubjectManager();
                      setIsNewMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#5A5A5A] hover:bg-[#FAF6F0] hover:text-sky-600 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Administrar Materias Infinitas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenPetCustomizer();
                      setIsNewMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#5A5A5A] hover:bg-[#FAF6F0] hover:text-[#FF7043] transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#FF7043]" />
                    <span>Personalizar a {pet.name}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Tab Quick Stats / Mascot Status */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 pb-1">
          <div 
            onClick={onOpenPetCustomizer}
            className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-[#E8E2D9] text-xs font-medium text-[#4A4A4A] cursor-pointer hover:bg-[#FAF6F0] transition-colors shadow-2xs"
            title={`Compañero activo: ${pet.name}`}
          >
            <PetAvatar pet={pet} size="icon" showBg={false} className="w-5 h-5 -translate-y-0.5" />
            <span className="font-bold text-[#2D2D2D]">{pet.name}</span>
            <span className="text-[11px] text-[#8A8A8A]">
              {pet.personality === "enthusiastic" ? "Entusiasta" : pet.personality === "calm_wise" ? "Tranquilo" : "Enérgico"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
