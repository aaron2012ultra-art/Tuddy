import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CampaignPathNode, 
  PetCustomization 
} from "../types";
import { TuddyAirplane } from "./TuddyAirplane";
import { CampaignPathThemedBackground } from "./CampaignPathThemedBackground";
import { 
  BookOpen, 
  Check, 
  Lock, 
  Plane, 
  Sparkles, 
  Umbrella, 
  Crown, 
  Gift, 
  Play, 
  Compass, 
  RotateCcw,
  Volume2
} from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslation } from "../utils/translations";

interface LanguageOption {
  id: string;
  name: string;
  flag: string;
  langCode: string;
  isPro?: boolean;
}

interface CampaignFlightMapProps {
  nodes: CampaignPathNode[];
  currentNodeId: string;
  completedNodeIds: string[];
  claimedChestIds: string[];
  selectedNodeId: string;
  onSelectNode: (node: CampaignPathNode) => void;
  onStartLesson: (node: CampaignPathNode) => void;
  onClaimChest: (node: CampaignPathNode) => void;
  pet: PetCustomization;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  languages: LanguageOption[];
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

export const CampaignFlightMap: React.FC<CampaignFlightMapProps> = ({
  nodes,
  currentNodeId,
  completedNodeIds,
  claimedChestIds,
  selectedNodeId,
  onSelectNode,
  onStartLesson,
  onClaimChest,
  pet,
  selectedLanguage,
  onSelectLanguage,
  languages,
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const { t } = useTranslation();
  const [chestJustClaimedId, setChestJustClaimedId] = useState<string | null>(null);

  // Determine current active node
  const activeNodeIndex = Math.max(
    0,
    nodes.findIndex((n) => n.id === currentNodeId)
  );
  const currentNode = nodes[activeNodeIndex] || nodes[0];

  // Helper to check unlocked status
  const isNodeUnlocked = (node: CampaignPathNode, idx: number): boolean => {
    if (idx === 0) return true;
    if (completedNodeIds.includes(node.id)) return true;
    if (node.id === currentNodeId) return true;
    const prevNode = nodes[idx - 1];
    return prevNode ? completedNodeIds.includes(prevNode.id) || claimedChestIds.includes(prevNode.id) : false;
  };

  const handleChestClick = (node: CampaignPathNode, idx: number) => {
    const isUnlocked = isNodeUnlocked(node, idx);
    const isClaimed = claimedChestIds.includes(node.id);

    if (!isUnlocked) return;
    if (isClaimed) return;

    // Trigger reward
    setChestJustClaimedId(node.id);
    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    onClaimChest(node);

    setTimeout(() => {
      setChestJustClaimedId(null);
    }, 2500);
  };

  // Group nodes by Unit (1 to 5: A1, A2, B1, B2, C1)
  const unitGroups: Array<{ unitNumber: number; level: string; unitTitle: string; nodes: CampaignPathNode[] }> = [];
  nodes.forEach((n) => {
    let grp = unitGroups.find((g) => g.unitNumber === n.unitNumber);
    if (!grp) {
      grp = {
        unitNumber: n.unitNumber,
        level: n.level,
        unitTitle: n.unitTitle,
        nodes: [],
      };
      unitGroups.push(grp);
    }
    grp.nodes.push(n);
  });

  // Calculate total completed
  const totalCompleted = nodes.filter((n) => completedNodeIds.includes(n.id)).length;
  const progressPercent = Math.round((totalCompleted / Math.max(1, nodes.length)) * 100);

  return (
    <div className="space-y-4 select-none">
      
      {/* 1. TOP HEADER & LANGUAGE SELECTOR (Del mismo idioma de A1 a C1) */}
      <div className="rounded-3xl bg-white border-2 border-[#E8E2D9] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-xs shrink-0">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#2D3748]">
                  {t.campaignPath} (A1 ➔ C1)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  {t.sameLanguageContinuous}
                </span>
              </div>
              <p className="text-xs text-[#718096]">
                {t.languagesSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="flex items-center gap-3 bg-[#F8FAFC] px-3.5 py-2 rounded-2xl border border-slate-200 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">{t.globalProgress}</span>
              <span className="text-xs font-black text-slate-800">{totalCompleted} / {nodes.length} {t.levelsCompleted} ({progressPercent}%)</span>
            </div>
            <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Language Switcher Tabs */}
        <div className="pt-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-[#4A5568] whitespace-nowrap shrink-0 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-sky-600" />
            <span>{t.languageInProgress}:</span>
          </span>
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {languages.map((lang) => {
              const isSelected = selectedLanguage.toLowerCase() === lang.name.toLowerCase() || selectedLanguage.toLowerCase() === lang.id.toLowerCase();
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    if (lang.isPro && !isPro) {
                      if (onOpenSubscriptionModal) onOpenSubscriptionModal();
                      return;
                    }
                    onSelectLanguage(lang.name);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-400"
                      : lang.isPro
                      ? "bg-amber-50/80 text-amber-900 border border-amber-300 hover:bg-amber-100"
                      : "bg-[#F7FAFC] text-[#4A5568] border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  title={lang.isPro ? `Idioma Exclusivo Tuddy Plus 👑 ($3.50/mes)` : lang.name}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {lang.isPro && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5">
                      👑 PLUS
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. THE VERTICAL SERPENTINE PATH (Matching Levels-in-path--1--1.png) */}
      <div className="rounded-3xl border-2 border-[#CBD5E1]/80 p-4 sm:p-8 shadow-inner relative overflow-hidden transition-all duration-700">
        {/* Dynamic Themed Background based on the current learning language */}
        <CampaignPathThemedBackground language={selectedLanguage} />
        
        {/* Unit-by-Unit Path Sections */}
        <div className="max-w-xl mx-auto space-y-12 relative z-10">
          
          {unitGroups.map((unit) => {
            return (
              <div key={unit.unitNumber} className="relative space-y-6">
                
                {/* Unit Sticky Header / Banner */}
                <div className="sticky top-2 z-20 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-[#CBD5E1] shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-xs shadow-2xs">
                      {unit.level}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-[#1E293B] leading-tight">
                        {unit.unitTitle}
                      </h3>
                      <p className="text-[11px] font-medium text-[#64748B]">
                        {unit.level === "A1" ? "Nivel 1a • Fundamentos, saludos y supervivencia" :
                         unit.level === "A2" ? "Nivel A2 • Desplazamientos, cafeterías y rutinas" :
                         unit.level === "B1" ? "Nivel B1 • Experiencias pasadas, anécdotas y opiniones" :
                         unit.level === "B2" ? "Nivel B2 • Argumentación sólida, matices y sociedad" :
                         "Nivel C1 • Dominio operativo eficaz y modismos nativos"}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0">
                    {t.levelUnit} {unit.unitNumber}
                  </span>
                </div>

                {/* Vertical Path Nodes for this Unit */}
                <div className="relative py-4 flex flex-col items-center gap-7">
                  
                  {/* Visual S-curve guideline background dots */}
                  <div className="absolute inset-0 flex justify-center pointer-events-none opacity-40">
                    <div className="w-1 border-r-2 border-dashed border-slate-300 h-full" />
                  </div>

                  {unit.nodes.map((node) => {
                    const globalIdx = nodes.findIndex((n) => n.id === node.id);
                    const isCompleted = completedNodeIds.includes(node.id);
                    const isCurrent = node.id === currentNodeId;
                    const isUnlocked = isNodeUnlocked(node, globalIdx);
                    const isChestClaimed = claimedChestIds.includes(node.id);

                    // Sinusoidal X-offset (in pixels)
                    // Offset shifts node left or right like in the reference image
                    const xOffsetPx = node.xOffsetPercent * 2.8;

                    return (
                      <div
                        key={node.id}
                        className="relative flex items-center justify-center w-full z-10"
                        style={{ transform: `translateX(${xOffsetPx}px)` }}
                      >
                        {/* ======================================================== */}
                        {/* NODE TYPE 1 & 2: REGULAR LESSON DISC OR READING (BOOK)   */}
                        {/* ======================================================== */}
                        {(node.type === "lesson" || node.type === "story") && (
                          <div className="relative flex flex-col items-center">
                            
                            {/* Tuddy's Airplane hovering right above the ACTIVE node */}
                            {isCurrent && (
                              <motion.div
                                initial={{ y: -6 }}
                                animate={{ y: [ -6, 2, -6 ] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-16 z-30 flex flex-col items-center pointer-events-none"
                              >
                                <div className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider shadow-md mb-1 whitespace-nowrap flex items-center gap-1">
                                  <span>{t.youAreHere}</span>
                                  <span>✈️</span>
                                </div>
                                <div className="scale-75 drop-shadow-md">
                                  <TuddyAirplane pet={pet} size="sm" isFlying={true} />
                                </div>
                              </motion.div>
                            )}

                            {/* 3D Stepping Stone Disc */}
                            <motion.button
                              type="button"
                              whileHover={isUnlocked ? { scale: 1.08 } : {}}
                              whileTap={isUnlocked ? { scale: 0.94 } : {}}
                              onClick={() => {
                                if (isUnlocked) {
                                  onSelectNode(node);
                                  onStartLesson(node);
                                }
                              }}
                              className={`relative group rounded-full flex items-center justify-center transition-all cursor-pointer select-none ${
                                isCurrent
                                  ? "w-16 h-16 bg-[#38BDF8] border-b-6 border-[#0284C7] shadow-lg ring-4 ring-sky-300 text-white animate-pulse"
                                  : isCompleted
                                  ? "w-14 h-14 bg-[#10B981] border-b-6 border-[#059669] shadow-md text-white"
                                  : isUnlocked
                                  ? "w-14 h-14 bg-[#E2E8F0] border-b-6 border-[#CBD5E1] hover:bg-[#CBD5E1] text-[#64748B] shadow-xs"
                                  : "w-14 h-14 bg-[#E2E8F0] border-b-6 border-[#CBD5E1] text-[#94A3B8] opacity-75 cursor-not-allowed"
                              }`}
                              title={node.title}
                            >
                              {/* Inner Icon: Book for story, checkmark if completed, lock if locked */}
                              {isCompleted ? (
                                <Check className="w-6 h-6 stroke-[3]" />
                              ) : !isUnlocked ? (
                                <Lock className="w-5 h-5 text-slate-400" />
                              ) : node.type === "story" ? (
                                <BookOpen className={`w-6 h-6 ${isCurrent ? "text-white" : "text-slate-600"}`} />
                              ) : (
                                <span className="text-base font-black">
                                  {isCurrent ? <Play className="w-6 h-6 fill-white text-white translate-x-0.5" /> : node.nodeIndex}
                                </span>
                              )}
                            </motion.button>

                            {/* Clean Node Label beneath */}
                            <div className="mt-2 text-center max-w-[140px]">
                              <span className={`text-[11px] font-bold block leading-tight truncate ${
                                isCurrent ? "text-sky-700 font-black" : isCompleted ? "text-slate-700" : "text-slate-400"
                              }`}>
                                {node.title}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ======================================================== */}
                        {/* NODE TYPE 3: CHEST NODE (TREASURE CHEST LIKE IN PICTURE) */}
                        {/* ======================================================== */}
                        {node.type === "chest" && (
                          <div className="relative flex flex-col items-center">
                            
                            <motion.button
                              type="button"
                              whileHover={isUnlocked && !isChestClaimed ? { scale: 1.12, rotate: [0, -3, 3, 0] } : {}}
                              whileTap={isUnlocked && !isChestClaimed ? { scale: 0.92 } : {}}
                              onClick={() => handleChestClick(node, globalIdx)}
                              className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center cursor-pointer select-none ${
                                isChestClaimed
                                  ? "bg-slate-100 border-slate-300 text-slate-400 opacity-80"
                                  : isUnlocked
                                  ? "bg-gradient-to-b from-[#FFFBEB] to-[#FEF3C7] border-amber-400 shadow-md ring-3 ring-amber-300/60 animate-bounce"
                                  : "bg-slate-100 border-slate-300 text-slate-400 opacity-60 cursor-not-allowed"
                              }`}
                              title={node.title}
                            >
                              {/* Chest Icon / Illustration */}
                              <div className="text-3xl select-none">
                                {isChestClaimed ? "🎁" : isUnlocked ? "📦" : "🔒"}
                              </div>

                              <div className="mt-1 flex items-center gap-1 text-[10px] font-black">
                                {isChestClaimed ? (
                                  <span className="text-emerald-600 flex items-center gap-0.5">
                                    <Check className="w-3 h-3" /> Reclamado
                                  </span>
                                ) : isUnlocked ? (
                                  <span className="text-amber-800 flex items-center gap-0.5 animate-pulse">
                                    <span>🥕</span> +{node.carrotsReward}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">Bloqueado</span>
                                )}
                              </div>
                            </motion.button>

                            {/* Floating Carrot Claim Notification */}
                            <AnimatePresence>
                              {chestJustClaimedId === node.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                  animate={{ opacity: 1, y: -35, scale: 1.1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute -top-6 bg-amber-500 text-white px-3 py-1 rounded-xl text-xs font-black shadow-lg flex items-center gap-1 z-30"
                                >
                                  <span>🥕 +{node.carrotsReward} Zanahorias!</span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <span className="text-[10px] font-bold text-slate-600 mt-1">
                              Cofre de Recompensas
                            </span>
                          </div>
                        )}

                        {/* ======================================================== */}
                        {/* NODE TYPE 4: CHECKPOINT WITH '=' CONNECTOR & CROWN BADGE */}
                        {/* (Exactly matching the right-side crown badges in image)   */}
                        {/* ======================================================== */}
                        {node.type === "checkpoint" && (
                          <div className="relative flex items-center gap-3">
                            
                            {/* Stepping disc for checkpoint */}
                            <motion.button
                              type="button"
                              whileHover={isUnlocked ? { scale: 1.08 } : {}}
                              whileTap={isUnlocked ? { scale: 0.94 } : {}}
                              onClick={() => {
                                if (isUnlocked) {
                                  onSelectNode(node);
                                  onStartLesson(node);
                                }
                              }}
                              className={`relative rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isCompleted
                                  ? "w-14 h-14 bg-[#8B5CF6] border-b-6 border-[#7C3AED] shadow-md text-white"
                                  : isCurrent
                                  ? "w-16 h-16 bg-[#A855F7] border-b-6 border-[#9333EA] shadow-lg ring-4 ring-purple-300 text-white animate-pulse"
                                  : isUnlocked
                                  ? "w-14 h-14 bg-[#E2E8F0] border-b-6 border-[#CBD5E1] text-[#64748B]"
                                  : "w-14 h-14 bg-[#E2E8F0] border-b-6 border-[#CBD5E1] text-[#94A3B8] opacity-75 cursor-not-allowed"
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-6 h-6 stroke-[3]" />
                              ) : !isUnlocked ? (
                                <Lock className="w-5 h-5 text-slate-400" />
                              ) : (
                                <Crown className="w-6 h-6 text-white" />
                              )}
                            </motion.button>

                            {/* DOUBLE HORIZONTAL CONNECTOR '=' LIKE IN THE REFERENCE IMAGE */}
                            <div className="flex flex-col gap-1 px-1">
                              <div className="w-6 h-1 bg-slate-400 rounded-full" />
                              <div className="w-6 h-1 bg-slate-400 rounded-full" />
                            </div>

                            {/* LARGE CIRCULAR BADGE WITH UMBRELLA & CROWN BADGE NUMBER */}
                            <motion.button
                              type="button"
                              whileHover={isUnlocked ? { scale: 1.06 } : {}}
                              whileTap={isUnlocked ? { scale: 0.96 } : {}}
                              onClick={() => {
                                if (isUnlocked) {
                                  onSelectNode(node);
                                  onStartLesson(node);
                                }
                              }}
                              className={`relative flex items-center justify-center w-18 h-18 rounded-full border-4 transition-all cursor-pointer shadow-md ${
                                node.crownNumber === 1
                                  ? "border-[#38BDF8] bg-sky-50"
                                  : node.crownNumber === 2
                                  ? "border-[#10B981] bg-emerald-50"
                                  : node.crownNumber === 3
                                  ? "border-[#F59E0B] bg-amber-50"
                                  : node.crownNumber === 4
                                  ? "border-[#EC4899] bg-pink-50"
                                  : "border-[#8B5CF6] bg-purple-50"
                              } ${!isUnlocked ? "opacity-60 grayscale cursor-not-allowed" : ""}`}
                              title={node.title}
                            >
                              {/* Central Umbrella Icon from reference image */}
                              <div className={`p-2 rounded-full ${
                                node.crownNumber === 1 ? "text-sky-700" :
                                node.crownNumber === 2 ? "text-emerald-700" :
                                node.crownNumber === 3 ? "text-amber-700" :
                                node.crownNumber === 4 ? "text-pink-700" :
                                "text-purple-700"
                              }`}>
                                <Umbrella className="w-7 h-7 stroke-[2.2]" />
                              </div>

                              {/* Crown Badge on bottom-right corner with level number */}
                              <div className={`absolute -bottom-1.5 -right-1.5 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-xs border border-white ${
                                isCompleted ? "bg-amber-500" : "bg-slate-700"
                              }`}>
                                <span>👑</span>
                                <span>{node.crownNumber}</span>
                              </div>
                            </motion.button>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* 3. QUICK FOOTER ACTIONS & STATS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white border-2 border-[#E8E2D9]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#4A5568]">
            {t.globalProgress} ({selectedLanguage}):
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
            {currentNode.title} ({currentNode.levelBadge})
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelectNode(currentNode);
            onStartLesson(currentNode);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB7B2] to-[#FF9AA2] text-white font-bold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{t.startLesson} ✈️</span>
        </button>
      </div>

    </div>
  );
};
