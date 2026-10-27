import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Trophy, 
  Flame, 
  Layers, 
  Clock, 
  Sparkles, 
  Hand, 
  Award,
  Crown
} from "lucide-react";
import { FriendItem, PetCustomization, UserStats } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";
import confetti from "canvas-confetti";

interface FriendLeaderboardProps {
  friends: FriendItem[];
  userStats: UserStats;
  userPet: PetCustomization;
  onOpenPetRoom?: (friend: FriendItem) => void;
  onOpenChat?: (friend: FriendItem) => void;
}

type LeaderboardMetric = "carrots" | "streak" | "cards" | "time";

export const FriendLeaderboard: React.FC<FriendLeaderboardProps> = ({
  friends,
  userStats,
  userPet,
  onOpenPetRoom,
  onOpenChat,
}) => {
  const [metric, setMetric] = useState<LeaderboardMetric>("carrots");
  const [cheeredIds, setCheeredIds] = useState<Set<string>>(new Set());

  // Build combined list of friends + user
  const userAsCompetitor: FriendItem = {
    id: "user-self",
    friendCode: "TÚ",
    name: "Tú (Usuario)",
    avatarEmoji: "⭐",
    bio: "Mi perfil de estudio",
    status: "online",
    currentActivity: "Estudiando con Tuddy 📚",
    streakDays: userStats.streakDays,
    level: Math.max(1, Math.floor((userStats.cardsMastered * 5 + userStats.carrotCoins * 2) / 20) + 1),
    carrotCoins: userStats.carrotCoins,
    cardsMastered: userStats.cardsMastered,
    studyMinutesToday: userStats.todayStudyMinutes || 35,
    favoriteSubject: "Mi Enfoque",
    pet: userPet,
    friendshipLevel: 5,
    affinityPoints: 100,
    petPettedToday: true,
    carrotsGiftedToday: 0,
    stickyNotes: [],
    joinedDate: "Hoy",
  };

  const allCompetitors = [userAsCompetitor, ...friends];

  // Sort by selected metric
  const sorted = [...allCompetitors].sort((a, b) => {
    switch (metric) {
      case "carrots":
        return b.carrotCoins - a.carrotCoins;
      case "streak":
        return b.streakDays - a.streakDays;
      case "cards":
        return b.cardsMastered - a.cardsMastered;
      case "time":
        return b.studyMinutesToday - a.studyMinutesToday;
      default:
        return b.carrotCoins - a.carrotCoins;
    }
  });

  const top3 = sorted.slice(0, 3);
  const remaining = sorted.slice(3);

  const getMetricValue = (item: FriendItem) => {
    switch (metric) {
      case "carrots":
        return `${item.carrotCoins} 🥕`;
      case "streak":
        return `${item.streakDays} días 🔥`;
      case "cards":
        return `${item.cardsMastered} fichas 📚`;
      case "time":
        return `${item.studyMinutesToday} min ⏱️`;
    }
  };

  const handleSendHighFive = (id: string, name: string) => {
    setCheeredIds((prev) => new Set([...prev, id]));
    confetti({ particleCount: 25, spread: 45 });
  };

  return (
    <div className="space-y-6">
      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-[#E8E2D9] shadow-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black text-[#4A4A4A]">Clasificación Semanal entre Amigos</h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "carrots", label: "🥕 Zanahorias" },
            { id: "streak", label: "🔥 Racha Días" },
            { id: "cards", label: "📚 Fichas Dominadas" },
            { id: "time", label: "⏱️ Tiempo Hoy" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMetric(tab.id as LeaderboardMetric)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                metric === tab.id
                  ? "bg-amber-400 text-amber-950 font-black shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 pt-6 pb-2 items-end max-w-2xl mx-auto">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-3 border-slate-300 p-1 flex items-center justify-center shadow-md">
                <PetAvatar pet={top3[1].pet} size="sm" />
              </div>
              <span className="absolute -top-2 -right-1 bg-slate-300 text-slate-800 text-xs font-black px-1.5 py-0.2 rounded-full border border-white">
                2º
              </span>
            </div>
            <span className="text-xs font-black text-slate-800 truncate max-w-[90px] text-center">
              {top3[1].name}
            </span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">
              {getMetricValue(top3[1])}
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 flex items-center justify-center font-black text-2xl text-slate-400 border border-slate-200">
              🥈
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-400 p-1 flex items-center justify-center shadow-lg ring-4 ring-amber-200/60">
                <PetAvatar pet={top3[0].pet} size="md" />
              </div>
              <span className="absolute -top-2 -right-1 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.2 rounded-full border border-white">
                1º
              </span>
            </div>
            <span className="text-sm font-black text-amber-950 truncate max-w-[110px] text-center">
              {top3[0].name}
            </span>
            <span className="text-xs font-black text-amber-600 mt-0.5">
              {getMetricValue(top3[0])}
            </span>
            <div className="w-full h-32 bg-gradient-to-t from-amber-300 to-amber-200 rounded-t-2xl mt-2 flex items-center justify-center font-black text-3xl text-amber-700 border border-amber-300 shadow-md">
              🥇
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full bg-amber-900/10 border-3 border-amber-600 p-1 flex items-center justify-center shadow-md">
                <PetAvatar pet={top3[2].pet} size="sm" />
              </div>
              <span className="absolute -top-2 -right-1 bg-amber-700 text-white text-xs font-black px-1.5 py-0.2 rounded-full border border-white">
                3º
              </span>
            </div>
            <span className="text-xs font-black text-slate-800 truncate max-w-[90px] text-center">
              {top3[2].name}
            </span>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5">
              {getMetricValue(top3[2])}
            </span>
            <div className="w-full h-18 bg-gradient-to-t from-amber-700/20 to-amber-700/10 rounded-t-2xl mt-2 flex items-center justify-center font-black text-2xl text-amber-800 border border-amber-700/20">
              🥉
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl border-2 border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-[#E8E2D9] text-xs font-black text-slate-600 grid grid-cols-12 gap-2">
          <span className="col-span-1 text-center">#</span>
          <span className="col-span-6">Compañero & Mascota</span>
          <span className="col-span-3 text-right">Rendimiento</span>
          <span className="col-span-2 text-right">Interacción</span>
        </div>

        <div className="divide-y divide-[#E8E2D9]">
          {sorted.map((item, idx) => {
            const isUser = item.id === "user-self";
            const rank = idx + 1;
            const hasCheered = cheeredIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-3.5 grid grid-cols-12 gap-2 items-center text-xs transition-colors ${
                  isUser ? "bg-amber-50/70 font-bold border-l-4 border-amber-500" : "hover:bg-slate-50"
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 text-center font-black">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </div>

                {/* Friend Info */}
                <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                    <PetAvatar pet={item.pet} size="xs" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-800 truncate">
                        {item.name}
                      </span>
                      {isUser && (
                        <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full font-black">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Mascota: {item.pet.name} • {item.favoriteSubject}
                    </span>
                  </div>
                </div>

                {/* Metric Value */}
                <div className="col-span-3 text-right font-black text-amber-600">
                  {getMetricValue(item)}
                </div>

                {/* Interaction Button */}
                <div className="col-span-2 text-right">
                  {!isUser && (
                    <button
                      type="button"
                      disabled={hasCheered}
                      onClick={() => handleSendHighFive(item.id, item.name)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                        hasCheered
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                      title="Chocar los cinco con este compañero"
                    >
                      <Hand className="w-3 h-3 text-amber-600" />
                      <span>{hasCheered ? "¡Chocado!" : "Chocar"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
