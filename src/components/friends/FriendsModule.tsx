import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Heart, 
  Swords, 
  Flame, 
  Trophy, 
  Sparkles, 
  Search, 
  Star, 
  Clock, 
  BookOpen, 
  Layers, 
  Share2, 
  Filter,
  CheckCircle2,
  Smartphone,
  Copy,
  Check
} from "lucide-react";
import { FriendItem, PetCustomization, Deck, StudyNote, UserStats } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";
import { 
  getStoredFriends, 
  saveFriends, 
  toggleFriendFavorite, 
  getUserFriendCode,
  FRIENDSHIP_TIERS,
  getStoredDuelChallenges,
  acceptDuelChallenge,
  DuelChallenge
} from "../../utils/friendsStorage";
import { FriendPetRoomModal } from "./FriendPetRoomModal";
import { FriendChatModal } from "./FriendChatModal";
import { FriendBattleModal } from "./FriendBattleModal";
import { FriendDuoStudyRoom } from "./FriendDuoStudyRoom";
import { AddFriendModal } from "./AddFriendModal";
import { FriendLeaderboard } from "./FriendLeaderboard";
import { DeviceNotificationsModal } from "../DeviceNotificationsModal";

interface FriendsModuleProps {
  userPet: PetCustomization;
  userStats: UserStats;
  decks: Deck[];
  notes: StudyNote[];
  onRewardCarrot?: (amount: number) => void;
  onTuddyCheer?: (message: string) => void;
  initialFriendId?: string;
  initialSubtab?: "list" | "pet" | "chat" | "battle" | "study_room" | "leaderboard";
}

type MainSubtab = "friends" | "leaderboard" | "duo" | "battles";

export const FriendsModule: React.FC<FriendsModuleProps> = ({
  userPet,
  userStats,
  decks,
  notes,
  onRewardCarrot,
  onTuddyCheer,
  initialFriendId,
  initialSubtab,
}) => {
  const [friends, setFriends] = useState<FriendItem[]>(() => getStoredFriends());
  const [activeSubtab, setActiveSubtab] = useState<MainSubtab>("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "studying" | "online" | "favorites">("all");

  // Modals state
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isDeviceNotificationsOpen, setIsDeviceNotificationsOpen] = useState(false);
  const [selectedFriendForPetRoom, setSelectedFriendForPetRoom] = useState<FriendItem | null>(null);
  const [selectedFriendForChat, setSelectedFriendForChat] = useState<FriendItem | null>(null);
  const [selectedFriendForBattle, setSelectedFriendForBattle] = useState<FriendItem | null>(null);
  const [selectedFriendForDuo, setSelectedFriendForDuo] = useState<FriendItem | null>(null);
  const [copiedUserCode, setCopiedUserCode] = useState(false);

  const userCode = getUserFriendCode();

  // Handle initial deep-linking
  useEffect(() => {
    if (initialFriendId) {
      const match = friends.find((f) => f.id === initialFriendId);
      if (match) {
        if (initialSubtab === "pet") setSelectedFriendForPetRoom(match);
        else if (initialSubtab === "chat") setSelectedFriendForChat(match);
        else if (initialSubtab === "battle") setSelectedFriendForBattle(match);
        else if (initialSubtab === "study_room") setSelectedFriendForDuo(match);
      }
    }
    if (initialSubtab === "leaderboard") {
      setActiveSubtab("leaderboard");
    }
  }, [initialFriendId, initialSubtab]);

  const handleRefreshFriends = () => {
    setFriends(getStoredFriends());
  };

  const handleToggleFavorite = (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFriendFavorite(friendId);
    handleRefreshFriends();
  };

  const handleFriendAdded = (newFriend: FriendItem) => {
    handleRefreshFriends();
    if (onTuddyCheer) {
      onTuddyCheer(`¡${newFriend.name} y su mascota ${newFriend.pet.name} son ahora tus compañeros de estudio! 🎉🐰`);
    }
  };

  // Filter friends
  const filteredFriends = friends.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.friendCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.favoriteSubject.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "studying") return f.status === "studying";
    if (filterStatus === "online") return f.status === "online" || f.status === "studying";
    if (filterStatus === "favorites") return Boolean(f.isFavorite);
    return true;
  });

  const studyingCount = friends.filter((f) => f.status === "studying").length;
  const onlineCount = friends.filter((f) => f.status === "online" || f.status === "studying").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Top Banner & Stats Overview */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden border-2 border-indigo-500/30">
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FFB7B2] to-amber-300 p-1 flex items-center justify-center shadow-lg shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-[#FFB7B2]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight font-heading">
                  Tuddy Amigos & Red de Estudio
                </h1>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold">
                  Comunidad de Aprendizaje
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Conecta con compañeros de clase, visita e interactúa con sus mascotas Bento, habla por chat, comparte fichas y desafíalos a duelos amistosos.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* User Friend Code Pill with Copy */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(userCode);
                setCopiedUserCode(true);
                setTimeout(() => setCopiedUserCode(false), 2000);
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-xs flex items-center gap-2 transition-colors cursor-pointer"
              title="Copiar mi código de amigo"
            >
              <span className="text-slate-300">Tu Código:</span>
              <span className="font-mono font-black text-amber-300 tracking-wider">{userCode}</span>
              {copiedUserCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>

            {/* Mobile Phone Notifications Modal trigger */}
            <button
              type="button"
              onClick={() => setIsDeviceNotificationsOpen(true)}
              className="px-3.5 py-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 font-bold text-xs rounded-2xl border border-indigo-400/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Activar o probar notificaciones enviadas a tu teléfono móvil"
            >
              <Smartphone className="w-3.5 h-3.5 text-sky-300" />
              <span>Notificaciones Celular</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddFriendOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-[#FFB7B2] hover:brightness-105 text-slate-950 font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Amigo</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Total Compañeros</span>
            <span className="text-lg font-black text-white">{friends.length} amigos</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Estudiando Ahora</span>
            <span className="text-lg font-black text-purple-300 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              {studyingCount} activos
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">En Línea</span>
            <span className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {onlineCount} conectados
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-slate-400 block font-medium">Nivel de Afinidad Máx.</span>
            <span className="text-lg font-black text-amber-300 flex items-center gap-1">
              <span>⭐ Nivel {Math.max(...friends.map((f) => f.friendshipLevel), 1)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "friends", label: "👥 Mis Compañeros", count: friends.length },
          { id: "leaderboard", label: "🏆 Clasificación Semanal" },
          { id: "duo", label: "⏱️ Sala Pomodoro en Dúo" },
          { id: "battles", label: "⚔️ Duelos de Estudio" },
        ].map((subtab) => (
          <button
            key={subtab.id}
            type="button"
            onClick={() => setActiveSubtab(subtab.id as MainSubtab)}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSubtab === subtab.id
                ? "bg-[#FFB7B2] text-white shadow-xs border border-[#FFB7B2]"
                : "bg-white text-[#4A4A4A] hover:bg-[#FAF6F0] border border-[#E8E2D9]"
            }`}
          >
            <span>{subtab.label}</span>
            {subtab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubtab === subtab.id ? "bg-white/30 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {subtab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: FRIENDS DIRECTORY */}
      {activeSubtab === "friends" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#E8E2D9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código o materia..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {[
                { id: "all", label: "Todos" },
                { id: "studying", label: "Estudiando 📚" },
                { id: "online", label: "En línea 🟢" },
                { id: "favorites", label: "Favoritos ⭐" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStatus(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    filterStatus === f.id
                      ? "bg-slate-800 text-white font-black"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Friends Cards Grid */}
          {filteredFriends.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-[#E8E2D9] text-center space-y-4 max-w-2xl mx-auto shadow-xs">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-100 to-[#FFB7B2]/30 text-purple-600 flex items-center justify-center text-4xl mx-auto border-2 border-purple-200">
                👥
              </div>
              <h3 className="text-lg font-black text-slate-800">
                {friends.length === 0 ? "Aún no tienes amigos añadidos" : "No se encontraron compañeros con este filtro"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {friends.length === 0
                  ? "Conecta con tus compañeros de clase para compartir apuntes y fichas, visitar las habitaciones de sus mascotas Bento y retarse a duelos de estudio donde ambos deben aceptar para iniciar."
                  : "Prueba a cambiar el filtro de búsqueda o buscar por otro código."}
              </p>

              {friends.length === 0 && (
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-amber-200/80 max-w-sm mx-auto flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Tu Código de Amigo:</span>
                    <span className="font-mono font-black text-sm text-amber-900">{userCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(userCode);
                      setCopiedUserCode(true);
                      setTimeout(() => setCopiedUserCode(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedUserCode ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUserCode ? "¡Copiado!" : "Copiar"}</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddFriendOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-[#FFB7B2] text-white font-black text-xs shadow-md hover:bg-[#ff9d96] cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Añadir Compañero por Código</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeviceNotificationsOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Configurar Notificaciones Celular</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((f) => {
                const tier = FRIENDSHIP_TIERS.find((t) => t.level === f.friendshipLevel) || FRIENDSHIP_TIERS[0];
                return (
                  <motion.div
                    key={f.id}
                    layout
                    className="bg-white rounded-3xl p-5 border-2 border-[#E8E2D9] hover:border-[#FFB7B2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Avatar & Status & Star */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => setSelectedFriendForPetRoom(f)}
                            className="relative cursor-pointer hover:scale-105 transition-transform"
                            title={`Visitar a ${f.pet.name}`}
                          >
                            <div className="w-13 h-13 rounded-2xl bg-[#FFB7B2]/20 border-2 border-[#FFB7B2]/40 p-1 flex items-center justify-center overflow-hidden shadow-xs">
                              <PetAvatar pet={f.pet} size="sm" />
                            </div>
                            <span className={`w-3.5 h-3.5 rounded-full absolute -bottom-1 -right-1 border-2 border-white ${
                              f.status === "studying" ? "bg-purple-500" : f.status === "online" ? "bg-emerald-500" : "bg-amber-400"
                            }`} />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-black text-slate-800">{f.name}</h3>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                                {f.friendCode}
                              </span>
                            </div>
                            <span className="text-[11px] text-purple-700 font-bold block mt-0.5">
                              Mascota: {f.pet.name} 🐰
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(f.id, e)}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            f.isFavorite ? "text-amber-500 fill-amber-400 bg-amber-50" : "text-slate-300 hover:text-slate-500"
                          }`}
                          title={f.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                        >
                          <Star className={`w-4 h-4 ${f.isFavorite ? "fill-amber-400" : ""}`} />
                        </button>
                      </div>

                      {/* Current Activity Pill */}
                      <div className="p-2.5 rounded-2xl bg-[#FAF6EE] border border-[#E8E2D9] mb-3 text-xs">
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">
                          Actividad actual
                        </span>
                        <p className="text-slate-800 font-bold leading-tight">
                          {f.currentActivity}
                        </p>
                      </div>

                      {/* Stats row: Streak, Carrots, Cards */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">Racha</span>
                          <span className="font-black text-orange-600 flex items-center justify-center gap-0.5">
                            <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                            {f.streakDays}d
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">Zanahorias</span>
                          <span className="font-black text-amber-600">
                            🥕 {f.carrotCoins}
                          </span>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-400 block font-medium">Fichas</span>
                          <span className="font-black text-emerald-600">
                            📚 {f.cardsMastered}
                          </span>
                        </div>
                      </div>

                      {/* Friendship Tier Level */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-4 bg-amber-50/60 px-3 py-1.5 rounded-xl border border-amber-200/60">
                        <span className="flex items-center gap-1">
                          <span>{tier.badge}</span>
                          <span>Nivel {f.friendshipLevel}: {tier.title}</span>
                        </span>
                        <span className="text-amber-800 font-black">{f.affinityPoints}%</span>
                      </div>
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedFriendForPetRoom(f)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                        title="Visitar su habitación Bento y acariciar su mascota"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>Visitar Mascota</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFriendForChat(f)}
                        className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-sky-200"
                        title="Hablar por chat y compartir recursos"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFriendForBattle(f)}
                        className="py-2 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-orange-200"
                        title="Desafiar a un duelo de estudio"
                      >
                        <Swords className="w-3.5 h-3.5 text-orange-600" />
                        <span>Duelo ⚔️</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFriendForDuo(f)}
                        className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                        title="Estudiar juntos con Pomodoro"
                      >
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Estudiar ⏱️</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEADERBOARD */}
      {activeSubtab === "leaderboard" && (
        <FriendLeaderboard
          friends={friends}
          userStats={userStats}
          userPet={userPet}
          onOpenPetRoom={(f) => setSelectedFriendForPetRoom(f)}
          onOpenChat={(f) => setSelectedFriendForChat(f)}
        />
      )}

      {/* TAB 3: DUO POMODORO SELECTOR */}
      {activeSubtab === "duo" && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-xs space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Selecciona a un compañero para la Sala Pomodoro en Dúo
              </h3>
              <p className="text-xs text-slate-500">
                Ambos escritorios se sincronizarán con sonidos ambiente lofi y temporizador de 25 minutos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {friends.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedFriendForDuo(f)}
                className="p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                    <PetAvatar pet={f.pet} size="xs" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 group-hover:text-indigo-900">{f.name}</h4>
                    <span className="text-[11px] text-slate-500 block">Mascota: {f.pet.name}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  Entrar ➔
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BATTLES SELECTOR */}
      {activeSubtab === "battles" && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#E8E2D9] shadow-xs space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-800">
                  Duelos de Estudio de 5 Preguntas
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Requiere Aceptación Previa
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Al retar a un compañero, se le envía una notificación al celular. El combate de 5 preguntas solo comenzará cuando la otra persona acepte el duelo.
              </p>
            </div>
          </div>

          {friends.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <span className="text-2xl">⚔️</span>
              <h4 className="text-sm font-black text-slate-800">No tienes compañeros añadidos para retar</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Añade a un compañero con su Código de Amigo para poder enviarle desafíos de estudio.
              </p>
              <button
                type="button"
                onClick={() => setIsAddFriendOpen(true)}
                className="px-4 py-2 bg-[#FFB7B2] hover:bg-[#ff9d96] text-white text-xs font-black rounded-xl cursor-pointer"
              >
                + Añadir Amigo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {friends.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFriendForBattle(f)}
                  className="p-4 rounded-2xl border-2 border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                      <PetAvatar pet={f.pet} size="xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 group-hover:text-orange-900">{f.name}</h4>
                      <span className="text-[11px] text-slate-500 block">Especialidad: {f.favoriteSubject}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-orange-500 group-hover:bg-orange-600 text-white font-bold text-xs shadow-xs"
                  >
                    Retar ⚔️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}

      {/* Device & Phone Notifications Modal */}
      <DeviceNotificationsModal
        isOpen={isDeviceNotificationsOpen}
        onClose={() => setIsDeviceNotificationsOpen(false)}
      />

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onFriendAdded={handleFriendAdded}
        existingFriends={friends}
      />

      {/* Friend's Bento Pet Room Modal */}
      {selectedFriendForPetRoom && (
        <FriendPetRoomModal
          isOpen={Boolean(selectedFriendForPetRoom)}
          onClose={() => setSelectedFriendForPetRoom(null)}
          friend={selectedFriendForPetRoom}
          userCarrotCoins={userStats.carrotCoins}
          onDeductCarrots={(amount) => {
            if (onRewardCarrot) onRewardCarrot(-amount);
          }}
          onOpenChat={(fId) => {
            const f = friends.find((item) => item.id === fId);
            if (f) setSelectedFriendForChat(f);
          }}
          onRefreshFriend={handleRefreshFriends}
        />
      )}

      {/* Friend Chat Modal */}
      {selectedFriendForChat && (
        <FriendChatModal
          isOpen={Boolean(selectedFriendForChat)}
          onClose={() => setSelectedFriendForChat(null)}
          friend={selectedFriendForChat}
          decks={decks}
          notes={notes}
          onOpenPetRoom={(f) => setSelectedFriendForPetRoom(f)}
          onStartBattle={(f) => setSelectedFriendForBattle(f)}
          onStartStudyRoom={(f) => setSelectedFriendForDuo(f)}
        />
      )}

      {/* Friend Flashcard Battle Modal */}
      {selectedFriendForBattle && (
        <FriendBattleModal
          isOpen={Boolean(selectedFriendForBattle)}
          onClose={() => setSelectedFriendForBattle(null)}
          friend={selectedFriendForBattle}
          userPet={userPet}
          onRewardCarrot={onRewardCarrot}
          onBattleFinish={(winner) => {
            handleRefreshFriends();
            if (onTuddyCheer && winner === "user") {
              onTuddyCheer(`¡Has ganado el duelo contra ${selectedFriendForBattle.name}! 🏆🐰`);
            }
          }}
        />
      )}

      {/* Friend Duo Study Room Modal */}
      {selectedFriendForDuo && (
        <FriendDuoStudyRoom
          isOpen={Boolean(selectedFriendForDuo)}
          onClose={() => setSelectedFriendForDuo(null)}
          friend={selectedFriendForDuo}
          userPet={userPet}
          onRewardCarrot={onRewardCarrot}
        />
      )}
    </div>
  );
};
