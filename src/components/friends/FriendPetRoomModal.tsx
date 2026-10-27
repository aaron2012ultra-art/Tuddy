import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Heart, 
  Hand, 
  Sparkles, 
  Send, 
  Award, 
  MessageCircle, 
  Flame, 
  BookOpen, 
  StickyNote,
  Gift,
  Volume2
} from "lucide-react";
import { FriendItem, PetCustomization, FriendStickyNote } from "../../types";
import { AnthropomorphicBunny } from "../AnthropomorphicBunny";
import { getBentoBackground, getPatternStyle } from "../../data/bentoBackgrounds";
import { 
  interactWithFriendPet, 
  addStickyNoteToFriend, 
  FRIENDSHIP_TIERS 
} from "../../utils/friendsStorage";
import confetti from "canvas-confetti";

interface FriendPetRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem;
  userCarrotCoins: number;
  onDeductCarrots?: (amount: number) => void;
  onOpenChat?: (friendId: string) => void;
  onRefreshFriend?: () => void;
}

export const FriendPetRoomModal: React.FC<FriendPetRoomModalProps> = ({
  isOpen,
  onClose,
  friend,
  userCarrotCoins,
  onDeductCarrots,
  onOpenChat,
  onRefreshFriend,
}) => {
  const [currentFriend, setCurrentFriend] = useState<FriendItem>(friend);
  const [petMood, setPetMood] = useState<"happy" | "studying" | "cheering" | "relaxed" | "proud">("cheering");
  const [speechBubble, setSpeechBubble] = useState<string | null>(
    `¡Hola! Soy ${friend.pet.name}, el compañero de estudio de ${friend.name}. ¡Bienvenido a nuestra habitación Bento! 🐰✨`
  );
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isBouncing, setIsBouncing] = useState(false);

  // Sticky notes state
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<FriendStickyNote["color"]>("yellow");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Sync with prop when opened
  React.useEffect(() => {
    setCurrentFriend(friend);
    setSpeechBubble(
      `¡Hola! Soy ${friend.pet.name}, el compañero de estudio de ${friend.name}. ¡Bienvenido a nuestra habitación Bento! 🐰✨`
    );
  }, [friend]);

  if (!isOpen) return null;

  const currentTier = FRIENDSHIP_TIERS.find((t) => t.level === currentFriend.friendshipLevel) || FRIENDSHIP_TIERS[0];
  const nextTier = FRIENDSHIP_TIERS.find((t) => t.level === currentFriend.friendshipLevel + 1);

  // Pet's Bento Background configuration
  const bentoBgConfig = getBentoBackground(currentFriend.pet.bentoBackground || "classic_peach");
  const isCustomBg = currentFriend.pet.bentoBackground === "custom";
  const bentoCardStyle: React.CSSProperties = isCustomBg
    ? { background: `linear-gradient(135deg, ${currentFriend.pet.bentoCustomColor || "#FFB7B2"}, ${currentFriend.pet.bentoCustomColor2 || "#B2E2F2"})` }
    : bentoBgConfig.style || {};
  const isDarkText = (currentFriend.pet.bentoTextColor || bentoBgConfig.textColor) === "dark";
  const textColorClass = isDarkText ? "text-slate-900" : "text-white";

  // Action: Pet the bunny
  const handlePetBunny = (e?: React.MouseEvent) => {
    setIsBouncing(true);
    setPetMood("cheering");

    // Spawn floating heart particles
    const newHearts = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: (e ? e.nativeEvent.offsetX : 80) + (Math.random() * 60 - 30),
      y: (e ? e.nativeEvent.offsetY : 80) - 20 - i * 15,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1200);

    const result = interactWithFriendPet(currentFriend.id, "pet");
    setSpeechBubble(result.speechQuote);
    setCurrentFriend((prev) => ({
      ...prev,
      affinityPoints: result.newAffinity,
      friendshipLevel: result.newLevel,
      petPettedToday: true,
    }));
    if (onRefreshFriend) onRefreshFriend();

    setTimeout(() => setIsBouncing(false), 900);
  };

  // Action: Gift Carrots
  const handleGiftCarrots = (amount: number) => {
    if (userCarrotCoins < amount) {
      setSpeechBubble(`¡Oh! Necesitas al menos ${amount} 🥕 zanahorias para este regalo. ¡Estudia un poco para ganar más!`);
      return;
    }

    if (onDeductCarrots) {
      onDeductCarrots(amount);
    }

    confetti({
      particleCount: amount * 12,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#FFA726", "#FF7043", "#66BB6A"],
    });

    setPetMood("proud");
    const result = interactWithFriendPet(currentFriend.id, "carrot", amount);
    setSpeechBubble(result.speechQuote);
    setCurrentFriend((prev) => ({
      ...prev,
      affinityPoints: result.newAffinity,
      friendshipLevel: result.newLevel,
      carrotCoins: prev.carrotCoins + amount,
      carrotsGiftedToday: (prev.carrotsGiftedToday || 0) + amount,
    }));
    if (onRefreshFriend) onRefreshFriend();
  };

  // Action: High-Five
  const handleHighFive = () => {
    setIsBouncing(true);
    setPetMood("cheering");
    const result = interactWithFriendPet(currentFriend.id, "highfive");
    setSpeechBubble(result.speechQuote);
    setCurrentFriend((prev) => ({
      ...prev,
      affinityPoints: result.newAffinity,
      friendshipLevel: result.newLevel,
    }));
    if (onRefreshFriend) onRefreshFriend();
    setTimeout(() => setIsBouncing(false), 800);
  };

  // Action: Post Sticky Note
  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const note = addStickyNoteToFriend(currentFriend.id, "Tú", newNoteText.trim(), newNoteColor);
    setCurrentFriend((prev) => ({
      ...prev,
      stickyNotes: [note, ...(prev.stickyNotes || [])],
      affinityPoints: Math.min(100, prev.affinityPoints + 10),
    }));
    setNewNoteText("");
    setIsAddingNote(false);
    setSpeechBubble(`¡Nota guardada en el corcho de ${currentFriend.pet.name}! Le encantará leer tu mensaje 📝✨`);
    if (onRefreshFriend) onRefreshFriend();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDF9F3] w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="bg-white px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB7B2]/20 flex items-center justify-center text-2xl border border-[#FFB7B2]/40 shadow-xs">
              {currentFriend.avatarEmoji || "🐰"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#4A4A4A] tracking-tight">
                  Habitación de {currentFriend.pet.name}
                </h2>
                <span className="text-xs bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                  Mascota de {currentFriend.name}
                </span>
              </div>
              <p className="text-xs text-[#7A7A7A]">
                {currentFriend.bio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(currentFriend.id);
                }}
                className="px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Bento Room Hero Area */}
          <div 
            className={`rounded-3xl p-6 sm:p-8 relative shadow-md overflow-hidden min-h-[380px] border-2 flex flex-col items-center justify-between text-center transition-all ${
              isCustomBg ? "border-white/40" : `${bentoBgConfig.bgClass} ${bentoBgConfig.accentBorder}`
            } ${textColorClass}`}
            style={bentoCardStyle}
          >
            {/* Texture/Pattern overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={getPatternStyle(currentFriend.pet.bentoPattern || bentoBgConfig.defaultPattern, isDarkText)}
            />

            {/* Top Room Badges */}
            <div className="w-full flex items-center justify-between relative z-10">
              <div className={`px-3 py-1 rounded-full text-xs font-black backdrop-blur-md flex items-center gap-1.5 ${
                isDarkText ? "bg-black/10 text-slate-900 border border-black/15" : "bg-white/25 text-white border border-white/40"
              }`}>
                <span>{bentoBgConfig.icon}</span>
                <span>Fondo: {bentoBgConfig.name}</span>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-black backdrop-blur-md flex items-center gap-1.5 ${
                isDarkText ? "bg-black/10 text-slate-900 border border-black/15" : "bg-white/25 text-white border border-white/40"
              }`}>
                <span>🥕 {currentFriend.carrotCoins} zanahorias</span>
                <span>•</span>
                <span>🔥 {currentFriend.streakDays}d racha</span>
              </div>
            </div>

            {/* Center: The Pet Mascot + Interactive Hearts */}
            <div className="relative my-4 flex flex-col items-center z-10">
              {/* Speech bubble */}
              {speechBubble && (
                <motion.div
                  key={speechBubble}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`max-w-md p-3.5 rounded-2xl shadow-lg border text-xs font-bold leading-relaxed mb-4 relative ${
                    isDarkText 
                      ? "bg-white text-slate-800 border-slate-200 shadow-slate-200/50" 
                      : "bg-slate-900/90 text-white border-slate-700/80 shadow-black/20"
                  }`}
                >
                  <p>{speechBubble}</p>
                  <div className={`w-3 h-3 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 ${
                    isDarkText ? "bg-white border-r border-b border-slate-200" : "bg-slate-900/90 border-r border-b border-slate-700"
                  }`} />
                </motion.div>
              )}

              {/* Floating Hearts */}
              {floatingHearts.map((heart) => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, scale: 0.7 }}
                  animate={{ opacity: 0, y: -60, scale: 1.4 }}
                  transition={{ duration: 1 }}
                  className="absolute pointer-events-none text-rose-500 z-30"
                  style={{ left: heart.x, top: heart.y }}
                >
                  ❤️
                </motion.div>
              ))}

              {/* Rabbit Mascot Avatar Container */}
              <div
                onClick={handlePetBunny}
                className="w-44 h-44 bg-white/95 rounded-full flex items-center justify-center shadow-2xl relative cursor-pointer hover:scale-105 active:scale-95 transition-transform group p-3 border-4 border-white"
                title={`Haz clic para acariciar a ${currentFriend.pet.name}`}
              >
                <AnthropomorphicBunny
                  pet={currentFriend.pet}
                  mood={petMood}
                  size="lg"
                  isBouncing={isBouncing}
                  showShadow={false}
                />
                
                <div className="absolute -top-1 -right-1 bg-yellow-300 text-slate-800 px-2.5 py-0.5 rounded-xl rotate-12 text-[11px] font-black border-2 border-white shadow-xs group-hover:rotate-6 transition-transform">
                  ¡ACARÍCIAME!
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-black tracking-tight">{currentFriend.pet.name}</h3>
                <span className={`text-xs font-bold opacity-90 block mt-0.5 ${isDarkText ? "text-slate-700" : "text-white/90"}`}>
                  Personalidad {currentFriend.pet.personality === "enthusiastic" ? "🔥 Entusiasta" : currentFriend.pet.personality === "calm_wise" ? "🍃 Sabio y Sereno" : "⚡ Enérgico"}
                </span>
              </div>
            </div>

            {/* Bottom Quick Pet Actions Bar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2.5 relative z-10 pt-2">
              <button
                type="button"
                onClick={handlePetBunny}
                className="px-4 py-2.5 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Acariciar Mascota (+15 pts)</span>
              </button>

              <button
                type="button"
                onClick={handleHighFive}
                className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Hand className="w-4 h-4 text-indigo-600" />
                <span>Chocar los Cinco 👋 (+10 pts)</span>
              </button>

              <div className="relative group">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-xs shadow-md flex items-center gap-1.5 hover:brightness-105 transition-all cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-amber-900" />
                  <span>Regalar Zanahorias 🥕</span>
                </button>

                {/* Dropdown with carrot amounts */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-white rounded-2xl shadow-xl border border-amber-200 p-2 min-w-[140px] z-30">
                  <span className="text-[10px] font-bold text-slate-500 px-2 py-1 text-center">Elige cantidad:</span>
                  <button
                    type="button"
                    onClick={() => handleGiftCarrots(1)}
                    className="px-3 py-1.5 text-xs font-bold text-left hover:bg-amber-50 text-amber-950 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>1 Zanahoria</span>
                    <span>🥕</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGiftCarrots(3)}
                    className="px-3 py-1.5 text-xs font-bold text-left hover:bg-amber-50 text-amber-950 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>3 Zanahorias</span>
                    <span>🥕🥕🥕</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGiftCarrots(5)}
                    className="px-3 py-1.5 text-xs font-bold text-left hover:bg-amber-50 text-amber-950 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>5 Zanahorias</span>
                    <span>⭐ 5x</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Friendship Affinity Level Bar */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#E8E2D9] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
                  {currentTier.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#4A4A4A]">
                      Nivel {currentFriend.friendshipLevel}: {currentTier.title}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                      Beneficio: {currentTier.perk}
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7A7A]">
                    {nextTier
                      ? `Faltan ${100 - currentFriend.affinityPoints} pts para alcanzar Nivel ${nextTier.level} (${nextTier.title})`
                      : "¡Nivel de afinidad máximo alcanzado!"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-amber-600">
                  {currentFriend.affinityPoints} / 100 pts
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentFriend.affinityPoints}%` }}
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 rounded-full"
              />
            </div>
          </div>

          {/* Sticky Notes Study Corkboard */}
          <div className="bg-[#FAF6EE] rounded-3xl p-5 border-2 border-[#E8E2D9] shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-black text-[#4A4A4A]">
                  Pizarra de Notas & Ánimos de {currentFriend.name}
                </h4>
                <span className="text-xs bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {currentFriend.stickyNotes?.length || 0} notas
                </span>
              </div>

              {!isAddingNote && (
                <button
                  type="button"
                  onClick={() => setIsAddingNote(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Dejar Post-it</span>
                </button>
              )}
            </div>

            {/* Note Creation Form */}
            {isAddingNote && (
              <div className="bg-white rounded-2xl p-4 border border-amber-300 shadow-md mb-4">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Escribe un mensaje de ánimo o consejo de estudio para {currentFriend.name}:
                </label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ej: ¡Mucho éxito en el simulacro de Historia! ¡Tu conejito está genial! 🐰✨"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
                  rows={2}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Color:</span>
                    {(["yellow", "pink", "blue", "green", "purple"] as const).map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewNoteColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          color === "yellow" ? "bg-amber-200 border-amber-400" :
                          color === "pink" ? "bg-rose-200 border-rose-400" :
                          color === "blue" ? "bg-sky-200 border-sky-400" :
                          color === "green" ? "bg-emerald-200 border-emerald-400" :
                          "bg-purple-200 border-purple-400"
                        } ${newNoteColor === color ? "scale-115 ring-2 ring-slate-800" : ""}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNote(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      disabled={!newNoteText.trim()}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-black shadow-xs cursor-pointer"
                    >
                      Pegar Nota 📌
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List of Sticky Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(currentFriend.stickyNotes || []).map((note) => {
                const colorMap = {
                  yellow: "bg-amber-100/95 border-amber-300 text-amber-950",
                  pink: "bg-rose-100/95 border-rose-300 text-rose-950",
                  blue: "bg-sky-100/95 border-sky-300 text-sky-950",
                  green: "bg-emerald-100/95 border-emerald-300 text-emerald-950",
                  purple: "bg-purple-100/95 border-purple-300 text-purple-950",
                };
                return (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-2xl border-2 shadow-xs relative flex flex-col justify-between min-h-[90px] rotate-[-0.5deg] hover:rotate-0 transition-transform ${
                      colorMap[note.color] || colorMap.yellow
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 absolute top-2 right-2 shadow-2xs border border-white" />
                    <p className="text-xs font-medium leading-relaxed mb-2 pr-2">
                      "{note.text}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold opacity-80 pt-1 border-t border-black/10">
                      <span>De: {note.authorName}</span>
                      <span>{note.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
