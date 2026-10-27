import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Check, 
  Palette, 
  Grid, 
  Paintbrush, 
  RotateCcw,
  SlidersHorizontal,
  Sun,
  Moon,
  LayoutGrid
} from "lucide-react";
import { PetCustomization } from "../types";
import { 
  BENTO_BACKGROUND_OPTIONS, 
  BENTO_PATTERNS, 
  BENTO_BOARD_THEMES,
  getBentoBackground, 
  getPatternStyle,
  BentoBackgroundOption
} from "../data/bentoBackgrounds";
import { AnthropomorphicBunny } from "./AnthropomorphicBunny";
import confetti from "canvas-confetti";

interface BentoBackgroundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetCustomization;
  onSavePet: (updated: PetCustomization) => void;
}

export const BentoBackgroundSelectorModal: React.FC<BentoBackgroundSelectorModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSavePet,
}) => {
  const currentBgId = pet.bentoBackground || "classic_peach";
  const [selectedBgId, setSelectedBgId] = useState<string>(currentBgId);
  const [selectedPattern, setSelectedPattern] = useState<string>(
    pet.bentoPattern || getBentoBackground(currentBgId).defaultPattern
  );
  const [customColor1, setCustomColor1] = useState<string>(pet.bentoCustomColor || "#FFB7B2");
  const [customColor2, setCustomColor2] = useState<string>(pet.bentoCustomColor2 || "#B2E2F2");
  const [customGradientAngle, setCustomGradientAngle] = useState<string>("135deg");
  const [textColor, setTextColor] = useState<"white" | "dark">(pet.bentoTextColor || "white");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBoardTheme, setSelectedBoardTheme] = useState<string>(pet.bentoBoardTheme || "default");
  const [activeTab, setActiveTab] = useState<"presets" | "custom" | "board">("presets");

  // Synchronize when opened
  useEffect(() => {
    if (isOpen) {
      const bgId = pet.bentoBackground || "classic_peach";
      setSelectedBgId(bgId);
      setSelectedPattern(pet.bentoPattern || getBentoBackground(bgId).defaultPattern);
      setCustomColor1(pet.bentoCustomColor || "#FFB7B2");
      setCustomColor2(pet.bentoCustomColor2 || "#B2E2F2");
      setTextColor(pet.bentoTextColor || getBentoBackground(bgId).textColor);
      setSelectedBoardTheme(pet.bentoBoardTheme || "default");
    }
  }, [isOpen, pet]);

  if (!isOpen) return null;

  const activeBg = getBentoBackground(selectedBgId);
  const isCustom = selectedBgId === "custom";

  // Compute live card background style
  const cardStyle: React.CSSProperties = isCustom
    ? {
        background: `linear-gradient(${customGradientAngle}, ${customColor1}, ${customColor2})`,
      }
    : activeBg.style || {};

  const handleSelectPreset = (preset: BentoBackgroundOption) => {
    setSelectedBgId(preset.id);
    setSelectedPattern(preset.defaultPattern);
    setTextColor(preset.textColor);
  };

  const handleSave = () => {
    const updated: PetCustomization = {
      ...pet,
      bentoBackground: selectedBgId,
      bentoPattern: selectedPattern as any,
      bentoCustomColor: customColor1,
      bentoCustomColor2: customColor2,
      bentoTextColor: textColor,
      bentoBoardTheme: selectedBoardTheme,
    };

    onSavePet(updated);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
    });
    onClose();
  };

  const handleResetToDefault = () => {
    setSelectedBgId("classic_peach");
    setSelectedPattern("dots");
    setTextColor("white");
    setSelectedBoardTheme("default");
  };

  // Filter presets
  const filteredPresets = BENTO_BACKGROUND_OPTIONS.filter((bg) => {
    if (selectedCategory === "all") return true;
    return bg.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border-2 border-[#E8E2D9] relative max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFB7B2]/30 text-[#E11D48] shadow-2xs">
              <Palette className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#4A4A4A]">
                Personalizar Fondo del Bento de Tuddy
              </h2>
              <p className="text-xs text-[#7A7A7A]">
                Elige temas estéticos, gradientes dinámicos, texturas y colores personalizados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Layout: Preview + Controls */}
        <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 pt-4 overflow-hidden">
          
          {/* LEFT: Live Interactive Bento Card Preview */}
          <div className="lg:w-80 shrink-0 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Vista Previa Real
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Tarjeta de Tuddy
              </span>
            </div>

            {/* PREVIEW CONTAINER */}
            <div
              className={`w-full rounded-3xl p-5 flex flex-col items-center justify-center text-center relative shadow-md overflow-hidden min-h-[300px] border-2 ${
                isCustom ? "" : activeBg.bgClass
              } ${isCustom ? "border-white/40" : activeBg.accentBorder} transition-all duration-300`}
              style={cardStyle}
            >
              {/* Pattern Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25 transition-opacity"
                style={getPatternStyle(selectedPattern, textColor === "dark")}
              />

              {/* Tuddy Mascot Badge */}
              <div className="w-32 h-32 bg-white/95 rounded-full flex items-center justify-center mb-3 shadow-inner relative cursor-pointer hover:scale-105 transition-transform p-2 border-2 border-white">
                <AnthropomorphicBunny
                  pet={pet}
                  mood="cheering"
                  size="md"
                  isBouncing={false}
                  showShadow={false}
                />
                <div className="absolute -top-1 -right-1 bg-yellow-300 text-[#4A4A4A] px-2 py-0.5 rounded-xl rotate-12 text-[10px] font-black border-2 border-white shadow-xs">
                  TUDDY!
                </div>
              </div>

              {/* Title & Personality */}
              <div className="flex items-center gap-1.5 mb-1 z-10">
                <h3 className={`text-xl font-black tracking-tight font-heading ${
                  textColor === "dark" ? "text-slate-900" : "text-white"
                }`}>
                  {pet.name}
                </h3>
              </div>

              <div className={`inline-block text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider mb-2 z-10 ${
                isCustom
                  ? textColor === "dark" ? "bg-black/10 text-slate-900" : "bg-white/25 text-white"
                  : activeBg.badgeBg
              }`}>
                {isCustom ? "Tema Personalizado" : activeBg.name}
              </div>

              <p className={`text-[11px] font-medium leading-relaxed mb-3 px-2 z-10 ${
                textColor === "dark" ? "text-slate-700" : isCustom ? "text-white/90" : activeBg.subtext
              }`}>
                ¡Tu compañero diario de estudio con tu estilo favorito! 🥕
              </p>

              {/* Preview Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full z-10">
                <div className={`py-2 px-3 rounded-xl text-center text-xs font-black shadow-xs ${
                  isCustom
                    ? textColor === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
                    : activeBg.buttonBg
                }`}>
                  Estudiar Fichas
                </div>
                <div className={`py-2 px-3 rounded-xl text-center text-xs font-bold border ${
                  textColor === "dark"
                    ? "bg-black/5 text-slate-800 border-black/20"
                    : "bg-white/20 text-white border-white/40"
                }`}>
                  Personalizar
                </div>
              </div>
            </div>

            {/* Pattern Quick Selector */}
            <div className="w-full mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Grid className="w-3 h-3 text-slate-500" /> Textura de Fondo
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {selectedPattern}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {BENTO_PATTERNS.map((pat) => (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setSelectedPattern(pat.id)}
                    title={pat.name}
                    className={`p-1.5 rounded-xl text-center text-xs transition-all cursor-pointer ${
                      selectedPattern === pat.id
                        ? "bg-rose-500 text-white shadow-xs font-bold scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>{pat.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Tabbed Customization Controls */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Top Tabs */}
            <div className="flex items-center gap-1.5 border-b border-[#E8E2D9] pb-2 shrink-0 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("presets")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "presets"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Temas & Fondos ({BENTO_BACKGROUND_OPTIONS.length - 1})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("custom");
                  setSelectedBgId("custom");
                }}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "custom"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <Paintbrush className="h-3.5 w-3.5" />
                <span>Colores Personalizados</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("board")}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "board"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-[#FDFBF7] text-[#4A4A4A] border border-[#E8E2D9] hover:bg-white"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Marco del Tablero Bento</span>
              </button>
            </div>

            {/* TAB 1: PRESETS */}
            {activeTab === "presets" && (
              <div className="flex-1 flex flex-col min-h-0 pt-3">
                {/* Categories */}
                <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: "all", label: "Todos los Estilos" },
                    { id: "clasico", label: "🍑 Clásicos" },
                    { id: "gradiente", label: "🌈 Gradientes" },
                    { id: "naturaleza", label: "🌿 Naturaleza" },
                    { id: "espacial", label: "🌌 Espaciales" },
                    { id: "cozy", label: "☕ Cozy / Cálidos" },
                    { id: "neon", label: "⚡ Neón / Oscuros" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Preset Cards Grid */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[380px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredPresets.map((preset) => {
                      const isSelected = selectedBgId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3 text-left hover:scale-101 ${
                            isSelected
                              ? "border-rose-500 bg-rose-50/50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          {/* Color Swatch */}
                          <div
                            className={`w-12 h-12 rounded-xl shrink-0 shadow-inner flex items-center justify-center text-lg relative overflow-hidden border border-black/10 ${preset.bgClass}`}
                            style={preset.style}
                          >
                            <span>{preset.icon}</span>
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-slate-800 truncate">
                                {preset.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CUSTOM COLOR & GRADIENT */}
            {activeTab === "custom" && (
              <div className="flex-1 overflow-y-auto pr-1 pt-3 space-y-4 max-h-[380px]">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 mb-1">
                      Crea tu Propio Gradiente o Color Sólido
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Combina dos colores para crear un fondo único a tu gusto para el bento de Tuddy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Color 1 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Color Primario
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColor1}
                          onChange={(e) => {
                            setCustomColor1(e.target.value);
                            setSelectedBgId("custom");
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={customColor1}
                          onChange={(e) => {
                            setCustomColor1(e.target.value);
                            setSelectedBgId("custom");
                          }}
                          className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Color 2 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Color Secundario (Gradiente)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customColor2}
                          onChange={(e) => {
                            setCustomColor2(e.target.value);
                            setSelectedBgId("custom");
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={customColor2}
                          onChange={(e) => {
                            setCustomColor2(e.target.value);
                            setSelectedBgId("custom");
                          }}
                          className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gradient Angle */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Dirección del Gradiente
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: "135deg", label: "Diagonal ↘" },
                        { id: "90deg", label: "Horizontal →" },
                        { id: "180deg", label: "Vertical ↓" },
                        { id: "45deg", label: "Diagonal ↗" },
                      ].map((ang) => (
                        <button
                          key={ang.id}
                          type="button"
                          onClick={() => setCustomGradientAngle(ang.id)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            customGradientAngle === ang.id
                              ? "bg-slate-900 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {ang.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Contrast Mode */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Color del Texto & Botones
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTextColor("white")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          textColor === "white"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Texto Claro (Blanco)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTextColor("dark")}
                        className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          textColor === "dark"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Texto Oscuro (Negro/Gris)</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Palettes */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Paletas Rápidas Inspiradas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Candy", c1: "#FF758C", c2: "#FF7EB3", text: "white" },
                        { name: "Ocean", c1: "#2193B0", c2: "#6DD5ED", text: "white" },
                        { name: "Emerald", c1: "#11998E", c2: "#38EF7D", text: "white" },
                        { name: "Sunset", c1: "#F12711", c2: "#F5AF19", text: "white" },
                        { name: "Neon", c1: "#8A2387", c2: "#E94057", text: "white" },
                        { name: "Vanilla", c1: "#FFF2DE", c2: "#FFE0B2", text: "dark" },
                      ].map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => {
                            setCustomColor1(pal.c1);
                            setCustomColor2(pal.c2);
                            setTextColor(pal.text as any);
                            setSelectedBgId("custom");
                          }}
                          className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200 flex items-center gap-1.5 bg-white hover:scale-105 transition-transform cursor-pointer"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ background: `linear-gradient(135deg, ${pal.c1}, ${pal.c2})` }}
                          />
                          <span>{pal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BENTO BOARD THEME */}
            {activeTab === "board" && (
              <div className="flex-1 overflow-y-auto pr-1 pt-3 space-y-3 max-h-[380px]">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  💡 Además de la tarjeta de Tuddy, puedes elegir el marco decorativo general de todo tu tablero Bento.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BENTO_BOARD_THEMES.map((theme) => {
                    const isSelected = selectedBoardTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() => setSelectedBoardTheme(theme.id)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3 text-left ${
                          isSelected
                            ? "border-rose-500 bg-rose-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl shrink-0 shadow-inner flex items-center justify-center text-lg border border-black/10"
                          style={{ backgroundColor: theme.previewColor }}
                        >
                          <span>{theme.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">
                            {theme.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {theme.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#E8E2D9] shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Original (Melocotón)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Guardar Fondo</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
