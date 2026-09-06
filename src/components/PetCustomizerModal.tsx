import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  X, 
  Sparkles, 
  Check, 
  Palette, 
  Shirt, 
  Glasses, 
  Flame, 
  Smile, 
  Compass, 
  ShoppingBag,
  Search,
  CheckCircle2
} from "lucide-react";
import { 
  PetCustomization, 
  RabbitPersonality, 
  RabbitFurColor, 
  RabbitAccessory, 
  RabbitOutfit 
} from "../types";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import { CLOTHING_ITEMS } from "../data/clothingItems";
import confetti from "canvas-confetti";

interface PetCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetCustomization;
  onSavePet: (updated: PetCustomization) => void;
  carrotCoins: number;
  onRewardCarrot?: (delta: number) => void;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

const FUR_OPTIONS: Array<{ id: RabbitFurColor; label: string; bg: string; border: string; isPro?: boolean; desc?: string }> = [
  { id: "white", label: "Blanco Nieve", bg: "#FFFFFF", border: "#CBD5E1", desc: "Clásico y puro" },
  { id: "cinnamon", label: "Canela Suave", bg: "#E8A87C", border: "#C27848", desc: "Cálido y amigable" },
  { id: "lavender", label: "Lavanda Pastel", bg: "#D8B4E2", border: "#9A6FB0", desc: "Místico y relajante" },
  { id: "ash_gray", label: "Gris Ceniza", bg: "#CBD5E1", border: "#64748B", desc: "Sereno y formal" },
  { id: "mint", label: "Menta Fresca", bg: "#A7F3D0", border: "#10B981", desc: "Fresco y enérgico" },
  { id: "golden", label: "Dorado Miel", bg: "#FDE68A", border: "#D97706", desc: "Dulce y brillante" },
  // NUEVOS COLORES PRO EXCLUSIVOS 👑
  { id: "golden_royal", label: "Oro Imperial 24K", bg: "#F59E0B", border: "#D97706", isPro: true, desc: "Aura divina de realeza Tuddy" },
  { id: "cosmic_galaxy", label: "Galaxia Cósmica", bg: "#581C87", border: "#A855F7", isPro: true, desc: "Estrellas y nebulosas moradas" },
  { id: "rose_gold", label: "Oro Rosa Aperlado", bg: "#FB7185", border: "#E11D48", isPro: true, desc: "Reflejos rosados y lujo radiante" },
  { id: "obsidian_glow", label: "Obsidiana Neón", bg: "#18181B", border: "#06B6D4", isPro: true, desc: "Cuerpo carbón con brillo cian" },
  { id: "rainbow_crystal", label: "Prisma Iridiscente", bg: "#C084FC", border: "#EC4899", isPro: true, desc: "Cristales translúcidos de luz" },
  { id: "cyber_cyan", label: "Diamante Celeste", bg: "#06B6D4", border: "#0891B2", isPro: true, desc: "Ciber-cristal de máxima pureza" },
];

const ACCESSORY_OPTIONS: Array<{ id: RabbitAccessory; label: string; icon: string; desc: string }> = [
  { id: "study_glasses", label: "Gafas de Estudio", icon: "👓", desc: "Aumenta la concentración intelectual" },
  { id: "cozy_scarf", label: "Bufanda Cálida", icon: "🧣", desc: "Comodidad para largas sesiones de estudio" },
  { id: "student_cap", label: "Birrete de Graduación", icon: "🎓", desc: "Para aspirantes a la excelencia" },
  { id: "bowtie", label: "Corbatín Elegante", icon: "🎀", desc: "Estilo formal y refinado" },
  { id: "carrot_crown", label: "Corona de Zanahoria", icon: "👑", desc: "La realeza de los mejores estudiantes" },
  { id: "backpack", label: "Mochila Escolar", icon: "🎒", desc: "Listo para cualquier materia" },
  { id: "none", label: "Sin Accesorio", icon: "✨", desc: "Estilo natural minimalista" },
];

const PERSONALITY_OPTIONS: Array<{
  id: RabbitPersonality;
  title: string;
  subtitle: string;
  badge: string;
  icon: typeof Flame;
  quoteSample: string;
  accent: string;
}> = [
  {
    id: "enthusiastic",
    title: "Entusiasta y Motivador",
    subtitle: "Celebra cada logro, energía contagiosa y optimismo inquebrantable.",
    badge: "Energía 100%",
    icon: Flame,
    quoteSample: "¡Eres increíble! ¡Cada minuto de estudio te acerca más a tu meta! ¡Vamos con todo! 🐰🔥",
    accent: "bg-[#FFB7B2] text-white border-[#FFB7B2]",
  },
  {
    id: "calm_wise",
    title: "Tranquilo y Sabio",
    subtitle: "Pausas conscientes, respiración profunda, citas sabias y serenidad mental.",
    badge: "Paz Zen",
    icon: Compass,
    quoteSample: "La constancia serena supera a la prisa. Respira hondo y permite que tu mente comprenda. 🐰🍃",
    accent: "bg-[#B2E2F2] text-[#1E3A8A] border-[#93C5FD]",
  },
  {
    id: "fun_energetic",
    title: "Divertido y Dinámico",
    subtitle: "Bromas ingeniosas, nemotecnias disparatadas, retos rápidos y buen humor.",
    badge: "Chispa & Humor",
    icon: Smile,
    quoteSample: "¡Si las neuronas tuvieran zapatillas, las tuyas tendrían récords olímpicos! ¡A comerse este tema! 🥕⚡",
    accent: "bg-[#FFF8E6] text-[#B45309] border-[#FDE68A]",
  },
];

const CLOTHING_CATEGORIES = [
  { id: "all", label: "Todas (56)" },
  { id: "pro", label: "👑 Tuddy Plus VIP (6)" },
  { id: "academico", label: "Académico" },
  { id: "aventura", label: "Aventura" },
  { id: "urbano", label: "Urbano" },
  { id: "elegante", label: "Elegante" },
  { id: "profesiones", label: "Profesiones" },
  { id: "fantasia", label: "Fantasía" },
  { id: "festivo", label: "Festivo" },
];

export const PetCustomizerModal: React.FC<PetCustomizerModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSavePet,
  carrotCoins,
  onRewardCarrot,
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const [activeTab, setActiveTab] = useState<"wardrobe" | "personality" | "appearance" | "accessories">("wardrobe");
  
  // Staged customization state
  const [name, setName] = useState(pet.name);
  const [personality, setPersonality] = useState<RabbitPersonality>(pet.personality);
  const [furColor, setFurColor] = useState<RabbitFurColor>(pet.furColor);
  const [accessory, setAccessory] = useState<RabbitAccessory>(pet.accessory);
  const [outfit, setOutfit] = useState<RabbitOutfit>(pet.outfit);
  const [unlockedOutfits, setUnlockedOutfits] = useState<string[]>(
    pet.unlockedOutfits && pet.unlockedOutfits.length > 0 ? pet.unlockedOutfits : ["school_vest"]
  );

  // Clothing store filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchaseNotice, setPurchaseNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Synchronize with external changes
  useEffect(() => {
    if (isOpen) {
      setName(pet.name);
      setPersonality(pet.personality);
      setFurColor(pet.furColor);
      setAccessory(pet.accessory);
      setOutfit(pet.outfit);
      setUnlockedOutfits(pet.unlockedOutfits && pet.unlockedOutfits.length > 0 ? pet.unlockedOutfits : ["school_vest"]);
      setPurchaseNotice(null);
    }
  }, [isOpen, pet]);

  if (!isOpen) return null;

  const currentPreviewPet: PetCustomization = {
    name: name.trim() || "Tuddy",
    personality,
    furColor,
    accessory,
    outfit,
    unlockedOutfits,
  };

  const handleSave = () => {
    onSavePet(currentPreviewPet);
    confetti({ particleCount: 35, spread: 60 });
    onClose();
  };

  const handleBuyOutfit = (itemId: string, price: number) => {
    if (unlockedOutfits.includes(itemId) || price === 0) {
      // Already unlocked, simply equip
      setOutfit(itemId);
      setPurchaseNotice({ text: "¡Atuendo equipado con éxito!" });
      onSavePet({
        ...currentPreviewPet,
        outfit: itemId,
      });
      return;
    }

    if (carrotCoins < price) {
      setPurchaseNotice({
        text: `¡Te faltan ${price - carrotCoins} zanahorias! Completa lecciones o fichas para ganar más.`,
        error: true,
      });
      return;
    }

    // Deduct carrots and unlock
    if (onRewardCarrot) {
      onRewardCarrot(-price);
    }
    const newUnlocked = [...unlockedOutfits, itemId];
    setUnlockedOutfits(newUnlocked);
    setOutfit(itemId);
    confetti({ particleCount: 35, spread: 55 });
    setPurchaseNotice({ text: "¡Comprado y equipado! 🎉 ¡Tuddy luce genial!" });

    // Auto-save unlock state
    onSavePet({
      ...currentPreviewPet,
      outfit: itemId,
      unlockedOutfits: newUnlocked,
    });
  };

  const handleEquipOutfit = (itemId: string) => {
    setOutfit(itemId);
    setPurchaseNotice({ text: "¡Atuendo equipado!" });
    onSavePet({
      ...currentPreviewPet,
      outfit: itemId,
    });
  };

  // Filter items
  const filteredClothing = CLOTHING_ITEMS.filter((item) => {
    const matchesCat =
      selectedCategory === "all" ||
      (selectedCategory === "pro" ? item.isProOnly : item.category === selectedCategory);
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentOutfitObj = CLOTHING_ITEMS.find((c) => c.id === outfit) || CLOTHING_ITEMS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-2 border-[#E8E2D9] relative max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFE4E6] text-[#E11D48] shadow-2xs">
              <Shirt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#4A4A4A]">Armario & Tienda de Tuddy</h2>
              <p className="text-xs text-[#7A7A7A]">50 trajes exclusivos, pelajes, accesorios y personalidad</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-amber-900 shadow-2xs">
              <span className="text-base">🥕</span>
              <span>{carrotCoins} Zanahorias</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notice Alert */}
        {purchaseNotice && (
          <div
            className={`mt-2 p-2.5 rounded-2xl text-xs flex items-center justify-between shrink-0 ${
              purchaseNotice.error
                ? "bg-rose-50 border border-rose-200 text-rose-800"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            <span className="font-semibold">{purchaseNotice.text}</span>
            <button
              type="button"
              onClick={() => setPurchaseNotice(null)}
              className="font-bold text-xs hover:opacity-75 cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content: Responsive Split Layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 min-h-0 pt-3 overflow-hidden">
          
          {/* SIDEBAR: Live Mascot Preview */}
          <div className="sm:w-56 md:w-60 shrink-0 flex sm:flex-col items-center justify-between sm:justify-start gap-3 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-b from-[#FFF9F5] to-[#FDF4EE] border-2 border-[#FFE8DC] shadow-xs">
            <div className="text-left sm:text-center w-full">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF9AA2]">Vista en Vivo</span>
              <h3 className="text-sm font-black text-[#4A4A4A] truncate">{currentPreviewPet.name}</h3>
            </div>

            {/* Bunny SVG */}
            <div className="shrink-0 flex items-center justify-center my-1">
              <AnthropomorphicBunny
                pet={currentPreviewPet}
                size="md"
                mood="cheering"
                isBouncing={true}
              />
            </div>

            {/* Current details */}
            <div className="w-full text-right sm:text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E8E2D9] text-[11px] font-bold text-[#4A4A4A] shadow-2xs">
                <span>Traje:</span>
                <span className="text-[#0284C7] max-w-[120px] truncate">
                  {currentOutfitObj.name}
                </span>
              </div>
              <div className="text-[10px] text-[#7A7A7A] block truncate">
                {currentOutfitObj.iconEmoji} {currentOutfitObj.category}
              </div>
            </div>
          </div>

          {/* MAIN COLUMN: Tabs & Options Grid */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2 shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("wardrobe")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "wardrobe"
                    ? "bg-[#FFB7B2] text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Tienda de Ropa (50) 🥕</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("appearance")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "appearance"
                    ? "bg-[#FFB7B2] text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Color de Pelaje</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("accessories")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "accessories"
                    ? "bg-[#FFB7B2] text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <Glasses className="h-3.5 w-3.5" />
                <span>Accesorios</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("personality")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "personality"
                    ? "bg-[#FFB7B2] text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Nombre & Rol</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0 pt-3 pr-1 space-y-3">
              
              {/* TAB 1: 50 CLOTHING WARDROBE SHOP */}
              {activeTab === "wardrobe" && (
                <div className="space-y-3">
                  {/* Search & Category Filter */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar entre los 50 trajes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] text-xs text-[#4A4A4A] focus:outline-hidden focus:border-[#FFB7B2]"
                      />
                    </div>
                    {/* Category pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
                      {CLOTHING_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat.id
                              ? "bg-slate-800 text-white shadow-2xs"
                              : "bg-[#F4EFE6] text-[#4A4A4A] hover:bg-[#EAE4D8]"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfits Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
                    {filteredClothing.map((item) => {
                      const isEquipped = outfit === item.id;
                      const isUnlocked = unlockedOutfits.includes(item.id) || item.priceInCarrots === 0;
                      const canAfford = carrotCoins >= item.priceInCarrots;

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                            isEquipped
                              ? "border-[#FFB7B2] bg-[#FFF8E6] ring-2 ring-[#FFD1CF]/50 shadow-xs"
                              : "border-[#E8E2D9] bg-white hover:border-[#FFB7B2]/70"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Color Swatch & Icon */}
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] border border-slate-200 overflow-hidden shadow-2xs">
                              <span className="text-xl select-none">{item.iconEmoji}</span>
                              <div
                                className="absolute bottom-0 inset-x-0 h-1.5"
                                style={{ backgroundColor: item.colors.vest }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-[#4A4A4A] truncate">{item.name}</h4>
                                {item.isProOnly && (
                                  <span className="text-[9px] bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                                    👑 PRO
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#7A7A7A] truncate max-w-[170px]">{item.description}</p>
                              
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.isProOnly ? (
                                  <span className="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                    Suscripción Pro ($3.50/m)
                                  </span>
                                ) : item.priceInCarrots === 0 ? (
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                    Gratis inicial
                                  </span>
                                ) : isUnlocked ? (
                                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md">
                                    Desbloqueado
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                    <span>🥕</span>
                                    <span>{item.priceInCarrots} zanahorias</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="shrink-0">
                            {isEquipped ? (
                              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Puesto</span>
                              </div>
                            ) : item.isProOnly ? (
                              !isPro ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenSubscriptionModal?.()}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 text-[11px] font-black shadow-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                                >
                                  <span>👑 Plus</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleEquipOutfit(item.id)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-black transition-all active:scale-95 cursor-pointer border border-amber-300"
                                >
                                  Equipar
                                </button>
                              )
                            ) : isUnlocked ? (
                              <button
                                type="button"
                                onClick={() => handleEquipOutfit(item.id)}
                                className="px-3 py-1.5 rounded-xl bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0284C7] text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                              >
                                Equipar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBuyOutfit(item.id, item.priceInCarrots)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                                  canAfford
                                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                }`}
                              >
                                <span>Comprar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FUR COLOR */}
              {activeTab === "appearance" && (
                <div className="bg-white p-4 rounded-2xl border-2 border-[#E8E2D9] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#4A4A4A]">Color del Pelaje de Tuddy:</label>
                    <span className="text-[11px] text-amber-800 font-bold">Incluye 6 colores VIP con Tuddy Plus 👑</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {FUR_OPTIONS.map((f) => {
                      const isSelected = furColor === f.id;
                      const isLockedPro = f.isPro && !isPro;

                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            if (isLockedPro) {
                              onOpenSubscriptionModal?.();
                              return;
                            }
                            setFurColor(f.id);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left cursor-pointer relative ${
                            isSelected
                              ? "border-[#FFB7B2] shadow-xs bg-[#FFF8E6] ring-2 ring-[#FFB7B2]/30"
                              : f.isPro
                              ? "border-amber-200 bg-amber-50/40 hover:border-amber-400"
                              : "border-[#E8E2D9] hover:border-[#FFB7B2]/60"
                          }`}
                        >
                          <span
                            className="w-8 h-8 rounded-full border border-[#CBD5E1] shadow-2xs shrink-0"
                            style={{ backgroundColor: f.bg }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-[#4A4A4A] truncate leading-tight">{f.label}</span>
                              {f.isPro && (
                                <span className="text-[9px] font-black text-amber-900 bg-amber-200 px-1 rounded-sm shrink-0">
                                  👑
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#7A7A7A] block truncate">{f.desc || "Tono suave"}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ACCESSORIES */}
              {activeTab === "accessories" && (
                <div className="bg-white p-4 rounded-2xl border-2 border-[#E8E2D9] space-y-2.5">
                  <label className="block text-xs font-bold text-[#4A4A4A]">Accesorios para la Cabeza y Espalda:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ACCESSORY_OPTIONS.map((acc) => {
                      const isSelected = accessory === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setAccessory(acc.id)}
                          className={`cursor-pointer rounded-2xl p-3 border-2 flex items-center gap-3 transition-all ${
                            isSelected
                              ? "border-[#FFB7B2] bg-[#FFF8E6] shadow-xs ring-2 ring-[#FFB7B2]/20"
                              : "border-[#E8E2D9] bg-white hover:border-[#FFB7B2]/50"
                          }`}
                        >
                          <span className="text-2xl select-none">{acc.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#4A4A4A] truncate">{acc.label}</div>
                            <div className="text-[10px] text-[#7A7A7A] truncate">{acc.desc}</div>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#FFB7B2] text-white flex items-center justify-center text-xs shrink-0 font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: PERSONALITY & NAME */}
              {activeTab === "personality" && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#E8E2D9]">
                    <label className="block text-xs font-bold text-[#4A4A4A] mb-1">Nombre de tu Mascota 🏷️</label>
                    <input
                      type="text"
                      maxLength={20}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Tuddy, Copito, Barnaby, Lumi..."
                      className="w-full rounded-xl border-2 border-[#E8E2D9] bg-[#FDF9F3] p-2.5 text-sm font-bold text-[#4A4A4A] focus:outline-hidden focus:border-[#FFB7B2] transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#4A4A4A]">Elige el Rol y Comportamiento:</label>
                    <div className="space-y-2">
                      {PERSONALITY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = personality === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setPersonality(opt.id)}
                            className={`cursor-pointer rounded-2xl p-3 border-2 transition-all ${
                              isSelected
                                ? "border-[#FFB7B2] bg-white shadow-xs ring-2 ring-[#FFB7B2]/30"
                                : "border-[#E8E2D9] bg-white hover:border-[#FFB7B2]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl ${opt.accent}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-[#4A4A4A]">{opt.title}</h5>
                                  <p className="text-[11px] text-[#7A7A7A]">{opt.subtitle}</p>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#FFB7B2] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                                  ✓
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t-2 border-[#E8E2D9] pt-3 mt-3 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#7A7A7A] font-medium flex items-center gap-1">
            <span>🥕 Saldo: <strong>{carrotCoins} zanahorias</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border-2 border-[#E8E2D9] bg-white px-4 py-2 text-xs font-bold text-[#4A4A4A] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FFB7B2] px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#ffa5a0] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
