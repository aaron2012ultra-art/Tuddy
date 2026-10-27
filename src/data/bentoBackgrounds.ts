import React from "react";

export interface BentoBackgroundOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "clasico" | "gradiente" | "naturaleza" | "espacial" | "cozy" | "neon" | "especial" | "pastel";
  bgClass: string;
  style?: React.CSSProperties;
  defaultPattern: "dots" | "grid" | "stars" | "stripes" | "waves" | "none";
  textColor: "white" | "dark";
  accentBorder: string;
  buttonBg: string;
  buttonText: string;
  subtext: string;
  badgeBg: string;
  badgeText: string;
  previewColors: [string, string];
  isPro?: boolean;
}

export const BENTO_BACKGROUND_OPTIONS: BentoBackgroundOption[] = [
  {
    id: "classic_peach",
    name: "Melocotón Pastel Original",
    description: "El color insignia y cálido de Tuddy con motas suaves.",
    icon: "🍑",
    category: "clasico",
    bgClass: "bg-[#FFB7B2]",
    defaultPattern: "dots",
    textColor: "white",
    accentBorder: "border-white/30",
    buttonBg: "bg-white hover:bg-[#FAF6F0] text-[#FFB7B2]",
    buttonText: "text-[#FFB7B2]",
    subtext: "text-white/90",
    badgeBg: "bg-white/25 text-white",
    badgeText: "text-white",
    previewColors: ["#FFB7B2", "#FFA8A2"],
  },
  {
    id: "mint_garden",
    name: "Jardín Botánico & Menta",
    description: "Verde menta y esmeralda relajante que reduce la fatiga visual.",
    icon: "🌿",
    category: "naturaleza",
    bgClass: "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700",
    defaultPattern: "dots",
    textColor: "white",
    accentBorder: "border-emerald-300/30",
    buttonBg: "bg-white hover:bg-emerald-50 text-emerald-800",
    buttonText: "text-emerald-800",
    subtext: "text-emerald-100",
    badgeBg: "bg-emerald-400/30 text-emerald-50",
    badgeText: "text-emerald-50",
    previewColors: ["#10B981", "#0D9488"],
  },
  {
    id: "cosmic_galaxy",
    name: "Galaxia & Cielo Estrellado",
    description: "Índigo profundo, violeta cósmico y constelaciones brillantes.",
    icon: "🌌",
    category: "espacial",
    bgClass: "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950",
    defaultPattern: "stars",
    textColor: "white",
    accentBorder: "border-indigo-400/30",
    buttonBg: "bg-white hover:bg-indigo-50 text-indigo-950",
    buttonText: "text-indigo-950",
    subtext: "text-indigo-200",
    badgeBg: "bg-indigo-500/30 text-indigo-200",
    badgeText: "text-indigo-200",
    previewColors: ["#0F172A", "#312E81"],
  },
  {
    id: "golden_sunset",
    name: "Atardecer Dorado & Miel",
    description: "Energía vibrante y dorada de fin de tarde para enfocarse.",
    icon: "🌅",
    category: "gradiente",
    bgClass: "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500",
    defaultPattern: "waves",
    textColor: "white",
    accentBorder: "border-amber-200/40",
    buttonBg: "bg-white hover:bg-amber-50 text-orange-950",
    buttonText: "text-orange-950",
    subtext: "text-amber-100",
    badgeBg: "bg-black/20 text-amber-100",
    badgeText: "text-amber-100",
    previewColors: ["#F59E0B", "#F43F5E"],
  },
  {
    id: "ocean_breeze",
    name: "Brisa Marina & Turquesa",
    description: "Tonos acuáticos refrescantes para mantener la mente despejada.",
    icon: "🌊",
    category: "gradiente",
    bgClass: "bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600",
    defaultPattern: "waves",
    textColor: "white",
    accentBorder: "border-cyan-200/40",
    buttonBg: "bg-white hover:bg-cyan-50 text-cyan-950",
    buttonText: "text-cyan-950",
    subtext: "text-cyan-100",
    badgeBg: "bg-white/25 text-white",
    badgeText: "text-white",
    previewColors: ["#38BDF8", "#2563EB"],
  },
  {
    id: "mystic_lavender",
    name: "Lavanda Mística & Ensueño",
    description: "Elegante violeta pastel que inspira calma y creatividad artística.",
    icon: "💜",
    category: "pastel",
    bgClass: "bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600",
    defaultPattern: "stars",
    textColor: "white",
    accentBorder: "border-purple-300/30",
    buttonBg: "bg-white hover:bg-purple-50 text-purple-950",
    buttonText: "text-purple-950",
    subtext: "text-purple-100",
    badgeBg: "bg-white/20 text-purple-100",
    badgeText: "text-purple-100",
    previewColors: ["#A855F7", "#7C3AED"],
  },
  {
    id: "cozy_coffee",
    name: "Cafetería & Apuntes de Cuero",
    description: "Ambiente cálido estilo biblioteca británica con olor a café.",
    icon: "☕",
    category: "cozy",
    bgClass: "bg-gradient-to-br from-[#785448] via-[#5D4037] to-[#3E2723]",
    defaultPattern: "grid",
    textColor: "white",
    accentBorder: "border-amber-200/20",
    buttonBg: "bg-[#FFF8E7] hover:bg-white text-[#3E2723]",
    buttonText: "text-[#3E2723]",
    subtext: "text-amber-100/90",
    badgeBg: "bg-black/30 text-amber-200",
    badgeText: "text-amber-200",
    previewColors: ["#795548", "#3E2723"],
  },
  {
    id: "cyber_neon",
    name: "Cyberpunk Studio Dark",
    description: "Modo oscuro futurista con cuadrícula y acentos cian.",
    icon: "⚡",
    category: "neon",
    bgClass: "bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950",
    defaultPattern: "grid",
    textColor: "white",
    accentBorder: "border-cyan-400/40",
    buttonBg: "bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black",
    buttonText: "text-slate-950",
    subtext: "text-cyan-300/90",
    badgeBg: "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40",
    badgeText: "text-cyan-300",
    previewColors: ["#020617", "#06B6D4"],
  },
  {
    id: "cherry_sakura",
    name: "Flor de Cerezo (Sakura)",
    description: "Rosa japonés sutil y elegante con pétalos de primavera.",
    icon: "🌸",
    category: "pastel",
    bgClass: "bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500",
    defaultPattern: "dots",
    textColor: "white",
    accentBorder: "border-pink-200/40",
    buttonBg: "bg-white hover:bg-pink-50 text-pink-950",
    buttonText: "text-pink-950",
    subtext: "text-pink-100",
    badgeBg: "bg-white/25 text-white",
    badgeText: "text-white",
    previewColors: ["#F472B6", "#FB7185"],
  },
  {
    id: "matcha_latte",
    name: "Matcha Latte & Bosque Zen",
    description: "Té verde reconfortante para sesiones de estudio de alta inmersión.",
    icon: "🍵",
    category: "naturaleza",
    bgClass: "bg-gradient-to-br from-[#849B74] via-[#657F56] to-[#485E3B]",
    defaultPattern: "stripes",
    textColor: "white",
    accentBorder: "border-lime-200/30",
    buttonBg: "bg-white hover:bg-lime-50 text-emerald-950",
    buttonText: "text-emerald-950",
    subtext: "text-lime-100",
    badgeBg: "bg-white/20 text-lime-100",
    badgeText: "text-lime-100",
    previewColors: ["#849B74", "#485E3B"],
  },
  {
    id: "sweet_strawberry",
    name: "Fresa Pop & Caramelo",
    description: "Carmín alegre y enérgico para motivar tus repasos diarios.",
    icon: "🍓",
    category: "gradiente",
    bgClass: "bg-gradient-to-br from-rose-500 via-pink-600 to-red-600",
    defaultPattern: "dots",
    textColor: "white",
    accentBorder: "border-rose-300/40",
    buttonBg: "bg-white hover:bg-rose-50 text-rose-900",
    buttonText: "text-rose-900",
    subtext: "text-rose-100",
    badgeBg: "bg-white/25 text-white",
    badgeText: "text-white",
    previewColors: ["#F43F5E", "#E11D48"],
  },
  {
    id: "pastel_cream",
    name: "Crema Vainilla & Caramelo",
    description: "Fondo claro y acogedor con contraste suave y elegante.",
    icon: "🍦",
    category: "cozy",
    bgClass: "bg-gradient-to-br from-[#FFF5E6] via-[#FFEED1] to-[#FFE2BA]",
    defaultPattern: "dots",
    textColor: "dark",
    accentBorder: "border-amber-300/50",
    buttonBg: "bg-amber-900 hover:bg-amber-800 text-white",
    buttonText: "text-white",
    subtext: "text-stone-600",
    badgeBg: "bg-amber-200/80 text-amber-900 border border-amber-300",
    badgeText: "text-amber-900",
    previewColors: ["#FFF5E6", "#FFE2BA"],
  },
  {
    id: "royal_aurora",
    name: "Aurora Boreal Nórdica",
    description: "Luces del norte verdes y cian en la noche ártica.",
    icon: "✨",
    category: "especial",
    bgClass: "bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900",
    defaultPattern: "stars",
    textColor: "white",
    accentBorder: "border-teal-400/40",
    buttonBg: "bg-teal-300 hover:bg-teal-200 text-slate-950 font-black",
    buttonText: "text-slate-950",
    subtext: "text-teal-200",
    badgeBg: "bg-teal-950 text-teal-300 border border-teal-500/40",
    badgeText: "text-teal-300",
    previewColors: ["#064E3B", "#164E63"],
  },
  {
    id: "chalkboard_study",
    name: "Pizarra de Matemáticas",
    description: "Pizarra verde oscura clásica con cuadrícula escolar.",
    icon: "📐",
    category: "clasico",
    bgClass: "bg-gradient-to-br from-[#203D2E] via-[#172D22] to-[#0F1E16]",
    defaultPattern: "grid",
    textColor: "white",
    accentBorder: "border-emerald-500/30",
    buttonBg: "bg-[#F3EFE0] hover:bg-white text-[#172D22] font-black",
    buttonText: "text-[#172D22]",
    subtext: "text-emerald-200/90",
    badgeBg: "bg-emerald-900/80 text-emerald-200 border border-emerald-500/40",
    badgeText: "text-emerald-200",
    previewColors: ["#203D2E", "#0F1E16"],
  },
  {
    id: "custom",
    name: "Personalizado a Medida",
    description: "Elige tu propio color, gradiente y textura favorita.",
    icon: "🎨",
    category: "especial",
    bgClass: "bg-[#FFB7B2]",
    defaultPattern: "dots",
    textColor: "white",
    accentBorder: "border-white/40",
    buttonBg: "bg-white hover:bg-slate-50 text-slate-900",
    buttonText: "text-slate-900",
    subtext: "text-white/90",
    badgeBg: "bg-black/25 text-white",
    badgeText: "text-white",
    previewColors: ["#FFB7B2", "#B2E2F2"],
  },
];

export const BENTO_PATTERNS: Array<{
  id: "dots" | "grid" | "stars" | "stripes" | "waves" | "none";
  name: string;
  icon: string;
  description: string;
}> = [
  { id: "dots", name: "Puntos Suaves", icon: "⚪", description: "Puntillismo delicado estilo bento japonés" },
  { id: "grid", name: "Cuadrícula de Libreta", icon: "📐", description: "Líneas de cuaderno milimetrado" },
  { id: "stars", name: "Estrellitas Mágicas", icon: "✨", description: "Destellos estelares nocturnos" },
  { id: "stripes", name: "Rayas Diagonales", icon: "〰️", description: "Textura geométrica activa" },
  { id: "waves", name: "Ondas Zen", icon: "🌊", description: "Líneas orgánicas fluidas y relajantes" },
  { id: "none", name: "Liso Minimalista", icon: "🚫", description: "Gradiente puro sin texturas" },
];

export const BENTO_BOARD_THEMES: Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  wrapperClass: string;
  cardBorder: string;
  previewColor: string;
}> = [
  {
    id: "default",
    name: "Clásico Bento Warm",
    icon: "☀️",
    description: "Estilo original off-white acogedor y suave",
    wrapperClass: "bg-transparent",
    cardBorder: "border-[#E8E2D9]",
    previewColor: "#FAF8F5",
  },
  {
    id: "notebook_paper",
    name: "Cuaderno Escolar",
    icon: "📝",
    description: "Textura sutil de papel milimetrado en el fondo",
    wrapperClass: "bg-[#FAF7F2] p-4 rounded-3xl border border-[#E8E2D9]",
    cardBorder: "border-[#E2DDD3]",
    previewColor: "#F5F0E6",
  },
  {
    id: "dark_slate",
    name: "Pizarra Nocturna",
    icon: "🌙",
    description: "Fondo oscuro pizarra para menor cansancio ocular",
    wrapperClass: "bg-slate-900/60 p-4 rounded-3xl border border-slate-800 text-slate-200",
    cardBorder: "border-slate-800",
    previewColor: "#0F172A",
  },
  {
    id: "soft_mint",
    name: "Brisa Menta",
    icon: "🍃",
    description: "Ambiente fresco con suaves acentos botánicos",
    wrapperClass: "bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100",
    cardBorder: "border-emerald-200/70",
    previewColor: "#ECFDF5",
  },
  {
    id: "cozy_lavender",
    name: "Lavanda Zen",
    icon: "💜",
    description: "Aroma visual lila para máxima relajación",
    wrapperClass: "bg-purple-50/40 p-4 rounded-3xl border border-purple-100",
    cardBorder: "border-purple-200/70",
    previewColor: "#FAF5FF",
  },
];

export function getBentoBackground(id?: string): BentoBackgroundOption {
  if (!id) return BENTO_BACKGROUND_OPTIONS[0];
  const found = BENTO_BACKGROUND_OPTIONS.find((b) => b.id === id);
  return found || BENTO_BACKGROUND_OPTIONS[0];
}

export function getPatternStyle(pattern: string = "dots", isDarkText: boolean = false): React.CSSProperties {
  const dotColor = isDarkText ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";
  const lineColor = isDarkText ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.12)";

  switch (pattern) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
        backgroundSize: "20px 20px",
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px), linear-gradient(90deg, ${lineColor} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      };
    case "stars":
      return {
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px), radial-gradient(${isDarkText ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.25)"} 2.5px, transparent 2.5px)`,
        backgroundSize: "32px 32px, 64px 64px",
        backgroundPosition: "0 0, 16px 16px",
      };
    case "stripes":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${lineColor} 10px, ${lineColor} 12px)`,
      };
    case "waves":
      return {
        backgroundImage: `radial-gradient(circle at 50% 120%, ${lineColor} 10px, transparent 11px), radial-gradient(circle at 50% 0%, ${lineColor} 10px, transparent 11px)`,
        backgroundSize: "30px 30px",
      };
    case "none":
    default:
      return {};
  }
}
