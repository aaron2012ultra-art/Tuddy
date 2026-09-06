import React from "react";
import { motion } from "motion/react";
import { PetCustomization } from "../types";
import { CLOTHING_ITEMS } from "../data/clothingItems";

// Quick lookup map for 50 clothing customizations
const CLOTHING_MAP: Record<string, { vest: string; shirt: string; trim: string; buttons: string; collar?: string }> = {};
CLOTHING_ITEMS.forEach((item) => {
  CLOTHING_MAP[item.id] = {
    vest: item.colors.vest,
    shirt: item.colors.shirt,
    trim: item.colors.trim,
    buttons: item.colors.buttons,
    collar: item.colors.collar,
  };
});

export interface AnthropomorphicBunnyProps {
  pet: PetCustomization;
  mood?: "happy" | "studying" | "cheering" | "relaxed" | "proud" | "thinking";
  size?: "icon" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
  isBouncing?: boolean;
  onClick?: () => void;
  className?: string;
  showShadow?: boolean;
}

// Color palettes for rabbit fur
const FUR_PALETTES = {
  white: {
    main: "#FFFFFF",
    shadow: "#F1F5F9",
    stroke: "#E2E8F0",
    innerEar: "#FDA4AF",
    belly: "#F8FAFC",
    cheeks: "#FDA4AF",
  },
  cinnamon: {
    main: "#E8A87C",
    shadow: "#D79264",
    stroke: "#B87343",
    innerEar: "#FCE7D8",
    belly: "#FCE7D8",
    cheeks: "#FB7185",
  },
  lavender: {
    main: "#D8B4E2",
    shadow: "#C392D3",
    stroke: "#9D6CB3",
    innerEar: "#FCE7F3",
    belly: "#F5EBFA",
    cheeks: "#F472B6",
  },
  ash_gray: {
    main: "#CBD5E1",
    shadow: "#94A3B8",
    stroke: "#64748B",
    innerEar: "#F1F5F9",
    belly: "#F8FAFC",
    cheeks: "#FDA4AF",
  },
  mint: {
    main: "#A7F3D0",
    shadow: "#6EE7B7",
    stroke: "#10B981",
    innerEar: "#ECFDF5",
    belly: "#ECFDF5",
    cheeks: "#FB7185",
  },
  golden: {
    main: "#FDE68A",
    shadow: "#FCD34D",
    stroke: "#D97706",
    innerEar: "#FEF9C3",
    belly: "#FEFCE8",
    cheeks: "#FB7185",
  },
  golden_royal: {
    main: "#F59E0B",
    shadow: "#D97706",
    stroke: "#B45309",
    innerEar: "#FEF08A",
    belly: "#FEF9C3",
    cheeks: "#F97316",
  },
  cosmic_galaxy: {
    main: "#581C87",
    shadow: "#3B0764",
    stroke: "#7E22CE",
    innerEar: "#E9D5FF",
    belly: "#F3E8FF",
    cheeks: "#C084FC",
  },
  rose_gold: {
    main: "#FB7185",
    shadow: "#E11D48",
    stroke: "#BE123C",
    innerEar: "#FFE4E6",
    belly: "#FFF1F2",
    cheeks: "#F43F5E",
  },
  obsidian_glow: {
    main: "#18181B",
    shadow: "#09090B",
    stroke: "#22D3EE",
    innerEar: "#0891B2",
    belly: "#27272A",
    cheeks: "#06B6D4",
  },
  rainbow_crystal: {
    main: "#E0E7FF",
    shadow: "#C7D2FE",
    stroke: "#818CF8",
    innerEar: "#FCE7F3",
    belly: "#F0FDF4",
    cheeks: "#F472B6",
  },
  cyber_cyan: {
    main: "#06B6D4",
    shadow: "#0891B2",
    stroke: "#0E7490",
    innerEar: "#CFFAFE",
    belly: "#E0F2FE",
    cheeks: "#22D3EE",
  },
};

// Fallback legacy styles
const DEFAULT_OUTFIT_STYLE = {
  vest: "#3E7D46",
  shirt: "#FFFFFF",
  trim: "#2D5E34",
  buttons: "#F59E0B",
  collar: undefined as string | undefined,
};

export const AnthropomorphicBunny: React.FC<AnthropomorphicBunnyProps> = ({
  pet,
  mood = "happy",
  size = "md",
  isBouncing = false,
  onClick,
  className = "",
  showShadow = true,
}) => {
  const fur = FUR_PALETTES[pet.furColor] || FUR_PALETTES.white;
  const outfit = CLOTHING_MAP[pet.outfit] || DEFAULT_OUTFIT_STYLE;

  const sizeMap = {
    icon: { w: 26, h: 34 },
    "2xs": { w: 32, h: 42 },
    xs: { w: 48, h: 64 },
    sm: { w: 72, h: 96 },
    md: { w: 120, h: 160 },
    lg: { w: 160, h: 213 },
    xl: { w: 220, h: 293 },
  };

  const { w, h } = sizeMap[size];

  // Personality-specific ear and posture dynamics
  const earWiggle = pet.personality === "enthusiastic" 
    ? { rotate: [-4, 4, -4] }
    : pet.personality === "fun_energetic"
    ? { rotate: [-6, 6, -6] }
    : { rotate: [-1.5, 1.5, -1.5] };

  return (
    <div 
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onClick={onClick}
    >
      <motion.svg
        width={w}
        height={h}
        viewBox="0 0 140 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={
          isBouncing
            ? { y: [-10, 4, -6, 0], rotate: [-4, 4, -2, 0] }
            : pet.personality === "fun_energetic"
            ? { y: [0, -4, 0] }
            : { y: [0, -2, 0] }
        }
        transition={{
          duration: isBouncing ? 0.5 : pet.personality === "fun_energetic" ? 2 : 3.5,
          repeat: isBouncing ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="overflow-visible filter drop-shadow-xs cursor-pointer"
      >
        <defs>
          {/* Subtle soft gradient on fur */}
          <linearGradient id={`furGrad-${pet.furColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fur.main} />
            <stop offset="100%" stopColor={fur.shadow} />
          </linearGradient>

          {/* Glasses glass sheen */}
          <linearGradient id="lensSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 1. BACKPACK (back view layer if equipped) */}
        {pet.accessory === "backpack" && (
          <g id="backpack-back">
            <rect x="25" y="90" width="20" height="35" rx="6" fill="#B45309" stroke="#78350F" strokeWidth="2" />
            <rect x="28" y="95" width="14" height="12" rx="3" fill="#D97706" />
          </g>
        )}

        {/* 2. EARS */}
        {/* Left Ear */}
        <motion.g
          animate={earWiggle}
          transition={{ repeat: Infinity, duration: pet.personality === "fun_energetic" ? 2 : 3, ease: "easeInOut" }}
          style={{ originX: "48px", originY: "48px" }}
        >
          <path
            d="M48 48 C42 16 48 2 56 2 C64 2 68 18 62 48 Z"
            fill={`url(#furGrad-${pet.furColor})`}
            stroke={fur.stroke}
            strokeWidth="2.5"
          />
          <path
            d="M51 40 C47 22 50 10 56 10 C61 10 63 22 59 40 Z"
            fill={fur.innerEar}
            opacity="0.8"
          />
        </motion.g>

        {/* Right Ear (slightly angled for anthropomorphic expressive charm) */}
        <motion.g
          animate={
            pet.personality === "enthusiastic"
              ? { rotate: [4, -4, 4] }
              : pet.personality === "fun_energetic"
              ? { rotate: [8, -3, 8] }
              : { rotate: [2, -2, 2] }
          }
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
          style={{ originX: "88px", originY: "48px" }}
        >
          <path
            d="M86 48 C92 16 86 2 78 2 C70 2 66 18 72 48 Z"
            fill={`url(#furGrad-${pet.furColor})`}
            stroke={fur.stroke}
            strokeWidth="2.5"
          />
          <path
            d="M83 40 C87 22 84 10 78 10 C73 10 71 22 75 40 Z"
            fill={fur.innerEar}
            opacity="0.8"
          />
        </motion.g>

        {/* 3. LEGS & PAWS (Bipedal Anthropomorphic Stance) */}
        <g id="legs-and-feet">
          {/* Left Leg */}
          <rect x="50" y="142" width="14" height="22" rx="6" fill={`url(#furGrad-${pet.furColor})`} stroke={fur.stroke} strokeWidth="2" />
          {/* Left Shoe / Boot */}
          <ellipse cx="54" cy="166" rx="10" ry="6" fill="#4A4A4A" stroke="#2D3748" strokeWidth="1.5" />
          <path d="M46 166 Q54 162 62 166" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* Right Leg */}
          <rect x="76" y="142" width="14" height="22" rx="6" fill={`url(#furGrad-${pet.furColor})`} stroke={fur.stroke} strokeWidth="2" />
          {/* Right Shoe / Boot */}
          <ellipse cx="86" cy="166" rx="10" ry="6" fill="#4A4A4A" stroke="#2D3748" strokeWidth="1.5" />
          <path d="M78 166 Q86 162 94 166" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* 4. TAIL (Peeking behind body) */}
        <circle cx="34" cy="132" r="10" fill="#FFFFFF" stroke={fur.stroke} strokeWidth="2" />

        {/* 5. ANTHROPOMORPHIC TORSO & OUTFIT */}
        <g id="torso-and-clothing">
          {/* Inner body / shirt */}
          <path
            d="M45 88 Q70 82 95 88 L100 144 Q70 148 40 144 Z"
            fill={outfit.shirt}
            stroke={fur.stroke}
            strokeWidth="2"
          />

          {/* Academic Vest / Outfit Layer */}
          <path
            d="M44 94 C54 94 58 108 58 122 L58 144 L41 143 Z"
            fill={outfit.vest}
            stroke={outfit.trim}
            strokeWidth="1.5"
          />
          <path
            d="M96 94 C86 94 82 108 82 122 L82 144 L99 143 Z"
            fill={outfit.vest}
            stroke={outfit.trim}
            strokeWidth="1.5"
          />

          {/* Collar of Shirt */}
          <polygon points="56,88 70,102 62,94" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="84,88 70,102 78,94" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Vest Buttons */}
          <circle cx="70" cy="116" r="2.5" fill={outfit.buttons} />
          <circle cx="70" cy="128" r="2.5" fill={outfit.buttons} />
          <circle cx="70" cy="138" r="2.5" fill={outfit.buttons} />

          {/* Belt / Waistline */}
          <rect x="42" y="140" width="56" height="5" fill="#334155" rx="1" />
          <rect x="66" y="139" width="8" height="7" fill="#F59E0B" rx="1" />
        </g>

        {/* 6. ANTHROPOMORPHIC ARMS & HANDS */}
        {/* Left Arm: Posing based on personality */}
        {pet.personality === "enthusiastic" ? (
          // Left arm raised cheering up
          <motion.g 
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ originX: "44px", originY: "96px" }}
          >
            <path d="M44 96 Q32 80 34 68" stroke={outfit.vest} strokeWidth="10" strokeLinecap="round" />
            <circle cx="34" cy="65" r="7" fill={fur.main} stroke={fur.stroke} strokeWidth="2" />
            {/* Victory fingers gesture */}
            <path d="M31 60 L33 54 M36 60 L38 54" stroke={fur.stroke} strokeWidth="2" strokeLinecap="round" />
          </motion.g>
        ) : pet.personality === "fun_energetic" ? (
          // Left arm holding big carrot pencil
          <g>
            <path d="M44 96 Q34 110 38 124" stroke={outfit.vest} strokeWidth="10" strokeLinecap="round" />
            <circle cx="38" cy="126" r="6" fill={fur.main} stroke={fur.stroke} strokeWidth="2" />
            {/* Big study pencil/carrot */}
            <g transform="translate(22, 102) rotate(-25)">
              <polygon points="10,0 16,0 13,-8" fill="#F43F5E" />
              <rect x="10" y="0" width="6" height="32" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
              <rect x="10" y="28" width="6" height="4" fill="#22C55E" />
            </g>
          </g>
        ) : (
          // Calm & Wise: Left arm relaxed or holding tea cup
          <g>
            <path d="M44 96 Q38 114 48 128" stroke={outfit.vest} strokeWidth="10" strokeLinecap="round" />
            <circle cx="48" cy="130" r="6" fill={fur.main} stroke={fur.stroke} strokeWidth="2" />
            {/* Tiny teacup */}
            <rect x="42" y="124" width="12" height="10" rx="3" fill="#FFFFFF" stroke="#4A8A9E" strokeWidth="1.5" />
            <path d="M54 126 Q58 128 54 132" stroke="#4A8A9E" strokeWidth="1.5" fill="none" />
            {/* Gentle steam */}
            <path d="M48 121 Q46 117 48 113" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
          </g>
        )}

        {/* Right Arm: Holding student notebook or resting */}
        <g id="right-arm">
          <path d="M96 96 Q106 112 96 128" stroke={outfit.vest} strokeWidth="10" strokeLinecap="round" />
          <circle cx="95" cy="130" r="6" fill={fur.main} stroke={fur.stroke} strokeWidth="2" />

          {/* Student Notebook held in arm */}
          <rect x="88" y="118" width="22" height="26" rx="3" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" transform="rotate(-10 88 118)" />
          <line x1="94" y1="120" x2="94" y2="144" stroke="#FFFFFF" strokeWidth="1.5" transform="rotate(-10 88 118)" />
          <line x1="99" y1="126" x2="105" y2="126" stroke="#DBEAFE" strokeWidth="1.2" transform="rotate(-10 88 118)" />
          <line x1="99" y1="132" x2="105" y2="132" stroke="#DBEAFE" strokeWidth="1.2" transform="rotate(-10 88 118)" />
        </g>

        {/* 7. HEAD */}
        <g id="head">
          <ellipse
            cx="70"
            cy="65"
            rx="34"
            ry="31"
            fill={`url(#furGrad-${pet.furColor})`}
            stroke={fur.stroke}
            strokeWidth="2.5"
          />

          {/* Cheeks Blush */}
          <ellipse cx="48" cy="72" rx="7" ry="5" fill={fur.cheeks} opacity="0.45" />
          <ellipse cx="92" cy="72" rx="7" ry="5" fill={fur.cheeks} opacity="0.45" />

          {/* Cute Whiskers */}
          <line x1="38" y1="71" x2="26" y2="68" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="38" y1="75" x2="27" y2="76" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="102" y1="71" x2="114" y2="68" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="102" y1="75" x2="113" y2="76" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Eyes based on Personality & Mood */}
          {mood === "cheering" || pet.personality === "enthusiastic" && mood !== "thinking" ? (
            // Joyful curved anime crescent eyes
            <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round">
              <path d="M53 62 Q59 56 65 62" />
              <path d="M75 62 Q81 56 87 62" />
            </g>
          ) : pet.personality === "calm_wise" ? (
            // Calm, smiling serene eyes
            <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
              <path d="M54 63 Q59 67 64 63" />
              <path d="M76 63 Q81 67 86 63" />
            </g>
          ) : pet.personality === "fun_energetic" ? (
            // Winking mischievous eye + big sparkle eye
            <g>
              {/* Left wink */}
              <path d="M53 63 Q59 58 65 63" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              {/* Right wide sparkling eye */}
              <ellipse cx="81" cy="61" rx="5" ry="6.5" fill="#1E293B" />
              <circle cx="79.5" cy="59" r="2.2" fill="#FFFFFF" />
              <circle cx="83" cy="64" r="1.2" fill="#FFFFFF" />
            </g>
          ) : (
            // Standard expressive big curious eyes
            <g>
              <ellipse cx="58" cy="62" rx="4.5" ry="6" fill="#1E293B" />
              <circle cx="56.5" cy="60" r="1.8" fill="#FFFFFF" />
              <circle cx="59.5" cy="64" r="0.8" fill="#FFFFFF" />

              <ellipse cx="82" cy="62" rx="4.5" ry="6" fill="#1E293B" />
              <circle cx="80.5" cy="60" r="1.8" fill="#FFFFFF" />
              <circle cx="83.5" cy="64" r="0.8" fill="#FFFFFF" />
            </g>
          )}

          {/* Little Pink Nose */}
          <polygon points="70,68 66.5,65 73.5,65" fill="#F43F5E" />

          {/* Anthropomorphic Smile */}
          <path
            d="M66 71 Q70 74 74 71"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* 8. ACCESSORIES (Dynamically rendered based on pet.accessory) */}
        {pet.accessory === "study_glasses" && (
          <g id="accessory-glasses">
            <circle cx="58" cy="62" r="11" fill="url(#lensSheen)" stroke="#D97706" strokeWidth="2.2" />
            <circle cx="82" cy="62" r="11" fill="url(#lensSheen)" stroke="#D97706" strokeWidth="2.2" />
            <path d="M69 62 Q70 60 71 62" stroke="#D97706" strokeWidth="2.5" fill="none" />
            <line x1="47" y1="62" x2="38" y2="60" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
            <line x1="93" y1="62" x2="102" y2="60" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {pet.accessory === "bowtie" && (
          <g id="accessory-bowtie" transform="translate(0, -2)">
            <polygon points="62,94 70,98 62,102" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
            <polygon points="78,94 70,98 78,102" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
            <circle cx="70" cy="98" r="3" fill="#BE123C" />
          </g>
        )}

        {pet.accessory === "cozy_scarf" && (
          <g id="accessory-scarf">
            <path
              d="M48 88 Q70 94 92 88 C94 95 88 102 70 102 C52 102 46 95 48 88 Z"
              fill="#E11D48"
              stroke="#9F1239"
              strokeWidth="2"
            />
            {/* Scarf hanging tail */}
            <path
              d="M74 98 L76 122 L86 122 L82 98 Z"
              fill="#BE123C"
              stroke="#9F1239"
              strokeWidth="1.5"
            />
            {/* Fringe details */}
            <line x1="77" y1="122" x2="77" y2="126" stroke="#9F1239" strokeWidth="1.5" />
            <line x1="81" y1="122" x2="81" y2="126" stroke="#9F1239" strokeWidth="1.5" />
            <line x1="85" y1="122" x2="85" y2="126" stroke="#9F1239" strokeWidth="1.5" />
          </g>
        )}

        {pet.accessory === "student_cap" && (
          <g id="accessory-cap" transform="translate(0, 4)">
            {/* Mortarboard */}
            <polygon points="70,22 102,32 70,42 38,32" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="56" y="38" width="28" height="8" fill="#0F172A" rx="2" />
            {/* Golden Tassel */}
            <line x1="100" y1="32" x2="105" y2="48" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="105" cy="50" r="3" fill="#D97706" />
          </g>
        )}

        {pet.accessory === "carrot_crown" && (
          <g id="accessory-crown" transform="translate(0, 10)">
            <polygon points="52,36 56,22 64,30 70,18 76,30 84,22 88,36" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
            {/* Carrot gemstone */}
            <ellipse cx="70" cy="29" rx="3.5" ry="5" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
            <polygon points="69,24 71,24 70,22" fill="#22C55E" />
          </g>
        )}

        {pet.accessory === "backpack" && (
          <g id="accessory-backpack-straps">
            {/* Leather strap across the chest */}
            <path d="M52 90 L88 138" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            <rect x="67" y="110" width="6" height="6" fill="#F59E0B" rx="1" transform="rotate(45 70 113)" />
          </g>
        )}
      </motion.svg>

      {/* Ground Shadow */}
      {showShadow && (
        <div 
          className="rounded-full bg-[#4A4A4A]/15 blur-[2px] transition-all"
          style={{ 
            width: w * 0.65, 
            height: Math.max(6, h * 0.06),
            marginTop: -Math.max(4, h * 0.04),
          }} 
        />
      )}
    </div>
  );
};

export interface PetAvatarProps {
  pet: PetCustomization;
  mood?: "happy" | "studying" | "cheering" | "relaxed" | "proud" | "thinking";
  size?: "icon" | "xs" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  showBg?: boolean;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  pet,
  mood = "happy",
  size = "sm",
  className = "",
  onClick,
  showBg = true,
}) => {
  const containerSize = {
    icon: "w-6 h-6",
    xs: "w-8 h-8",
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  }[size];

  const bunnySize = {
    icon: "icon" as const,
    xs: "2xs" as const,
    sm: "xs" as const,
    md: "sm" as const,
    lg: "md" as const,
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 ${
        showBg ? "bg-[#FFB7B2]/20 border border-[#FFB7B2]/40 shadow-xs" : ""
      } ${containerSize} ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""} ${className}`}
    >
      <div className="flex items-center justify-center translate-y-1">
        <AnthropomorphicBunny
          pet={pet}
          mood={mood}
          size={bunnySize}
          showShadow={false}
        />
      </div>
    </div>
  );
};

