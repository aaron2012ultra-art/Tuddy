import React from "react";

export interface OutfitColors {
  vest: string;
  shirt: string;
  trim: string;
  buttons: string;
  collar?: string;
}

export interface FurColors {
  main: string;
  shadow: string;
  stroke: string;
  innerEar: string;
  belly: string;
  cheeks: string;
}

interface BunnyOutfitRendererProps {
  outfitId: string;
  outfit: OutfitColors;
  fur: FurColors;
}

export const BunnyOutfitRenderer: React.FC<BunnyOutfitRendererProps> = ({
  outfitId,
  outfit,
  fur,
}) => {
  // 1. BATA DE LABORATORIO CUÁNTICO (Científico / Investigador)
  if (outfitId === "lab_coat") {
    return (
      <g id="outfit-lab-coat">
        {/* Cyan/Blue shirt inside */}
        <path d="M48 90 Q70 85 92 90 L95 144 Q70 148 45 144 Z" fill={outfit.shirt || "#38BDF8"} stroke={fur.stroke} strokeWidth="1.5" />
        
        {/* Shirt collar */}
        <polygon points="58,90 70,102 64,95" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <polygon points="82,90 70,102 76,95" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

        {/* Crisp open white lab coat */}
        <path d="M44 92 C48 92 56 104 56 120 L56 145 L41 144 Z" fill={outfit.vest || "#F8FAFC"} stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M96 92 C92 92 84 104 84 120 L84 145 L99 144 Z" fill={outfit.vest || "#F8FAFC"} stroke="#CBD5E1" strokeWidth="1.5" />
        
        {/* Wide folded lapels of the coat */}
        <polygon points="44,92 58,114 48,118 42,96" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />
        <polygon points="96,92 82,114 92,118 98,96" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.2" />

        {/* Left chest pocket with pens */}
        <rect x="85" y="112" width="10" height="12" rx="1.5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1" />
        {/* Pens: blue & red */}
        <line x1="87" y1="108" x2="87" y2="114" stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="91" y1="109" x2="91" y2="114" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />

        {/* Scientist Atom / Molecule symbol on right chest */}
        <ellipse cx="51" cy="115" rx="4" ry="1.8" fill="none" stroke="#0284C7" strokeWidth="0.8" transform="rotate(30 51 115)" />
        <ellipse cx="51" cy="115" rx="4" ry="1.8" fill="none" stroke="#0284C7" strokeWidth="0.8" transform="rotate(-30 51 115)" />
        <circle cx="51" cy="115" r="1.2" fill="#0284C7" />

        {/* Lower coat pockets */}
        <rect x="43" y="132" width="11" height="8" rx="1" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="86" y="132" width="11" height="8" rx="1" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      </g>
    );
  }

  // 2. TRAJE DE ASTRONAUTA / PRO GALAXY VOYAGER
  if (outfitId === "astronaut_suit" || outfitId === "pro_galaxy_voyager") {
    return (
      <g id="outfit-astronaut">
        {/* Padded high-tech space suit body */}
        <path d="M45 88 Q70 82 95 88 L99 144 Q70 148 41 144 Z" fill={outfit.vest || "#F8FAFC"} stroke="#94A3B8" strokeWidth="2" />

        {/* Thick metallic helmet neck ring */}
        <rect x="48" y="86" width="44" height="6" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
        <line x1="56" y1="89" x2="84" y2="89" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3 2" />

        {/* Padded shoulder ribbing */}
        <path d="M44 94 Q48 94 48 104" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <path d="M96 94 Q92 94 92 104" stroke="#CBD5E1" strokeWidth="2" fill="none" />

        {/* Life-Support Chest Module / Computer Box */}
        <rect x="54" y="102" width="32" height="24" rx="3" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
        {/* Glowing mini monitor screen */}
        <rect x="57" y="105" width="16" height="9" rx="1.5" fill="#0284C7" />
        <path d="M59 109 L62 107 L65 111 L68 108 L71 110" stroke="#38BDF8" strokeWidth="1" fill="none" />
        {/* Status LED lights */}
        <circle cx="78" cy="107" r="1.5" fill="#22C55E" />
        <circle cx="83" cy="107" r="1.5" fill="#F59E0B" />
        <circle cx="78" cy="112" r="1.5" fill="#EF4444" />
        <circle cx="83" cy="112" r="1.5" fill="#38BDF8" />

        {/* Oxygen connector valves (red & blue) */}
        <circle cx="60" cy="120" r="2.2" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="0.8" />
        <circle cx="67" cy="120" r="2.2" fill="#EF4444" stroke="#B91C1C" strokeWidth="0.8" />
        <path d="M60 122 Q58 132 54 136" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
        <path d="M67 122 Q65 132 63 138" stroke="#EF4444" strokeWidth="1.5" fill="none" />

        {/* Mission Patch / NASA style logo on right chest */}
        <circle cx="78" cy="120" r="3.5" fill="#1D4ED8" />
        <polygon points="76,122 80,119 79,122" fill="#EF4444" />
        <circle cx="78" cy="120" r="1" fill="#FFFFFF" />

        {/* Heavy utility harness belt with metallic buckle */}
        <rect x="42" y="138" width="56" height="6" fill="#334155" rx="1" />
        <rect x="65" y="137" width="10" height="8" rx="1" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
      </g>
    );
  }

  // 3. GABARDINA SHERLOCK (Detective / Gabardina Clásica)
  if (outfitId === "detective_coat") {
    return (
      <g id="outfit-detective">
        {/* Under shirt / turtleneck */}
        <path d="M48 90 Q70 85 92 90 L96 144 Q70 148 44 144 Z" fill={outfit.shirt || "#E8D5C4"} stroke={fur.stroke} strokeWidth="1.5" />

        {/* Plaid / Houndstooth Scarf peeking */}
        <path d="M58 88 Q70 94 82 88 L78 106 Q70 110 62 106 Z" fill="#78350F" stroke="#92400E" strokeWidth="1" />
        <line x1="64" y1="91" x2="68" y2="107" stroke="#FDE68A" strokeWidth="1" />
        <line x1="72" y1="91" x2="76" y2="107" stroke="#FDE68A" strokeWidth="1" />

        {/* Double-Breasted Trench Coat body */}
        <path d="M44 94 L58 144 L41 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />
        <path d="M96 94 L82 144 L99 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />

        {/* Large notched detective lapels */}
        <polygon points="44,92 64,106 50,116 42,98" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />
        <polygon points="96,92 76,106 90,116 98,98" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />

        {/* Epaulets on shoulders */}
        <polygon points="44,92 52,94 48,96 42,94" fill="#6F4E37" stroke="#3F2E21" strokeWidth="1" />
        <polygon points="96,92 88,94 92,96 98,94" fill="#6F4E37" stroke="#3F2E21" strokeWidth="1" />

        {/* Double-breasted buttons (two columns) */}
        <circle cx="63" cy="116" r="2.2" fill={outfit.buttons || "#3F2E21"} />
        <circle cx="77" cy="116" r="2.2" fill={outfit.buttons || "#3F2E21"} />
        <circle cx="63" cy="127" r="2.2" fill={outfit.buttons || "#3F2E21"} />
        <circle cx="77" cy="127" r="2.2" fill={outfit.buttons || "#3F2E21"} />

        {/* Trench coat waist belt with silver buckle and belt loops */}
        <rect x="42" y="136" width="56" height="7" fill="#6F4E37" stroke="#3F2E21" strokeWidth="1" rx="1" />
        <rect x="66" y="134" width="8" height="11" fill="#E2E8F0" stroke="#475569" strokeWidth="1" rx="1" />
      </g>
    );
  }

  // 4. TOGA DE GRADUADO MAGNA CUM LAUDE
  if (outfitId === "graduation_gown") {
    return (
      <g id="outfit-graduation">
        {/* Flowing black academic gown */}
        <path d="M44 88 Q70 82 96 88 L101 145 Q70 149 39 145 Z" fill={outfit.vest || "#1E293B"} stroke="#0F172A" strokeWidth="2" />

        {/* Pleated robe folds */}
        <line x1="56" y1="110" x2="54" y2="144" stroke="#334155" strokeWidth="1.5" />
        <line x1="84" y1="110" x2="86" y2="144" stroke="#334155" strokeWidth="1.5" />
        <line x1="70" y1="120" x2="70" y2="145" stroke="#334155" strokeWidth="1.5" />

        {/* Golden Academic Honor Sash / Stole (V-neck drape) */}
        <path d="M50 90 L67 124 L73 124 L90 90 L82 89 L70 114 L58 89 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.2" />
        
        {/* Golden Medallion dangling at point of V-stole */}
        <line x1="70" y1="124" x2="70" y2="129" stroke="#D97706" strokeWidth="1.5" />
        <circle cx="70" cy="133" r="4.5" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
        <polygon points="70,130 71.5,133 74,133 72,134.5 73,137 70,135.5 67,137 68,134.5 66,133 68.5,133" fill="#D97706" />

        {/* White shirt collar peeking at throat */}
        <polygon points="62,88 70,95 67,90" fill="#FFFFFF" />
        <polygon points="78,88 70,95 73,90" fill="#FFFFFF" />
      </g>
    );
  }

  // 5. SUDADERA CON CAPUCHA / GAMER HOODIE / ATLETIC
  if (outfitId === "hoodie" || outfitId === "gamer_hoodie" || outfitId === "athletic_tracksuit") {
    const isGamer = outfitId === "gamer_hoodie";
    const isTrack = outfitId === "athletic_tracksuit";

    return (
      <g id="outfit-hoodie">
        {/* Thick cozy hoodie body */}
        <path d="M44 88 Q70 82 96 88 L99 144 Q70 148 41 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="2" />

        {/* Folded hood collar around neck */}
        <path d="M46 90 Q70 102 94 90 C90 84 50 84 46 90 Z" fill={outfit.trim} stroke={outfit.vest} strokeWidth="1.2" />

        {/* White Braided Drawstrings dangling with metal tips */}
        <path d="M62 98 Q60 110 63 118" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="63" cy="119" r="1.2" fill="#CBD5E1" />

        <path d="M78 98 Q80 110 77 118" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="77" cy="119" r="1.2" fill="#CBD5E1" />

        {/* Front Kangaroo Pouch Pocket across belly */}
        <path d="M50 124 Q70 120 90 124 L86 142 Q70 144 54 142 Z" fill={outfit.trim} stroke={outfit.vest} strokeWidth="1.2" opacity="0.9" />

        {/* Specific details */}
        {isGamer ? (
          /* Glowing Neon Cyan Pixel Gamepad Emblem */
          <g transform="translate(62, 104)">
            <rect x="0" y="2" width="16" height="9" rx="3" fill="#0F172A" stroke="#22D3EE" strokeWidth="1" />
            <line x1="3" y1="6" x2="7" y2="6" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="4" x2="5" y2="8" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="11" cy="5" r="1" fill="#F43F5E" />
            <circle cx="13" cy="7" r="1" fill="#FACC15" />
          </g>
        ) : isTrack ? (
          /* Athletic dual white racing stripes down the ribs */
          <g>
            <line x1="48" y1="96" x2="44" y2="142" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
            <line x1="51" y1="96" x2="47" y2="142" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
            <line x1="92" y1="96" x2="96" y2="142" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
            <line x1="89" y1="96" x2="93" y2="142" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.9" />
          </g>
        ) : (
          /* Classic Tuddy Carrot Crest on chest */
          <g transform="translate(66, 106)">
            <polygon points="4,2 6,8 2,8" fill="#F97316" />
            <path d="M4 2 L3 0 M4 2 L5 0" stroke="#22C55E" strokeWidth="1" />
          </g>
        )}

        {/* Ribbed knit bottom hem */}
        <rect x="42" y="141" width="56" height="4" fill={outfit.trim} rx="1" />
      </g>
    );
  }

  // 6. CHALECO DE EXPLORADOR SAFARI / BOTÁNICO FLORAL
  if (outfitId === "safari_explorer" || outfitId === "botanist_vest" || outfitId === "jungle_ranger") {
    const isBotanist = outfitId === "botanist_vest";

    return (
      <g id="outfit-safari">
        {/* Khaki / Olive Safari vest body */}
        <path d="M45 88 Q70 82 95 88 L99 144 Q70 148 41 144 Z" fill={outfit.shirt || "#FEF3C7"} stroke="#78350F" strokeWidth="1.5" />
        
        {/* Open vest flaps */}
        <path d="M44 92 C52 92 56 106 56 122 L56 144 L41 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />
        <path d="M96 92 C88 92 84 106 84 122 L84 144 L99 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="1.5" />

        {/* Safari Upper Chest Cargo Flap Pockets */}
        <rect x="44" y="98" width="9" height="8" rx="1" fill={outfit.trim} stroke="#451A03" strokeWidth="0.8" />
        <path d="M44 100 L48.5 102 L53 100" stroke="#FEF3C7" strokeWidth="0.8" fill="none" />
        <circle cx="48.5" cy="102" r="0.8" fill="#FCD34D" />

        <rect x="87" y="98" width="9" height="8" rx="1" fill={outfit.trim} stroke="#451A03" strokeWidth="0.8" />
        <path d="M87 100 L91.5 102 L96 100" stroke="#FEF3C7" strokeWidth="0.8" fill="none" />
        <circle cx="91.5" cy="102" r="0.8" fill="#FCD34D" />

        {/* Lower Bellows Cargo Pockets with button flaps */}
        <rect x="43" y="122" width="11" height="12" rx="1.5" fill={outfit.trim} stroke="#451A03" strokeWidth="0.8" />
        <path d="M43 125 L48.5 128 L54 125" stroke="#FEF3C7" strokeWidth="0.8" fill="none" />
        <circle cx="48.5" cy="128" r="1" fill="#FCD34D" />

        <rect x="86" y="122" width="11" height="12" rx="1.5" fill={outfit.trim} stroke="#451A03" strokeWidth="0.8" />
        <path d="M86 125 L91.5 128 L97 125" stroke="#FEF3C7" strokeWidth="0.8" fill="none" />
        <circle cx="91.5" cy="128" r="1" fill="#FCD34D" />

        {/* Badge in center: Leaf for botanist, Compass for explorer */}
        {isBotanist ? (
          <g transform="translate(66, 102)">
            <ellipse cx="4" cy="6" rx="3" ry="5" fill="#84CC16" transform="rotate(-20 4 6)" />
            <line x1="2" y1="10" x2="6" y2="2" stroke="#365314" strokeWidth="0.8" />
          </g>
        ) : (
          <g transform="translate(66, 102)">
            <circle cx="4" cy="6" r="4.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <polygon points="4,3 5.5,6 4,9 2.5,6" fill="#DC2626" />
          </g>
        )}

        {/* Heavy webbed expedition belt with utility buckle */}
        <rect x="42" y="137" width="56" height="6" fill="#451A03" rx="1" />
        <rect x="66" y="136" width="8" height="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1" rx="1" />
      </g>
    );
  }

  // 7. CHAQUETA DE PILOTO DE AVIÓN / BOMBER JACKET
  if (outfitId === "pilot_jacket" || outfitId === "bomber_jacket") {
    return (
      <g id="outfit-pilot">
        {/* Leather flight bomber jacket body */}
        <path d="M44 92 Q70 86 96 92 L99 144 Q70 147 41 144 Z" fill={outfit.vest || "#78350F"} stroke="#451A03" strokeWidth="2" />

        {/* Fluffy Shearling / Sherpa Fur Collar around neck */}
        <path d="M44 90 Q70 102 96 90 C98 84 92 82 70 84 C48 82 42 84 44 90 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
        {/* Soft cloud bumps on fleece collar */}
        <circle cx="50" cy="88" r="3.5" fill="#FFFBEB" />
        <circle cx="58" cy="90" r="3.5" fill="#FFFBEB" />
        <circle cx="66" cy="92" r="3.5" fill="#FFFBEB" />
        <circle cx="74" cy="92" r="3.5" fill="#FFFBEB" />
        <circle cx="82" cy="90" r="3.5" fill="#FFFBEB" />
        <circle cx="90" cy="88" r="3.5" fill="#FFFBEB" />

        {/* Heavy duty central metallic brass zipper */}
        <line x1="70" y1="92" x2="70" y2="140" stroke="#E2E8F0" strokeWidth="2.5" />
        <line x1="70" y1="92" x2="70" y2="140" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="2 1.5" />
        <rect x="68.5" y="104" width="3" height="5" rx="1" fill="#F59E0B" />

        {/* Aviator Golden Wings Badge on left chest */}
        <g transform="translate(50, 108)">
          <circle cx="8" cy="4" r="3" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          <path d="M0 4 Q4 1 8 4 Q4 7 0 4 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="0.6" />
          <path d="M16 4 Q12 1 8 4 Q12 7 16 4 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="0.6" />
          <polygon points="8,2 9.5,4 8,6 6.5,4" fill="#DC2626" />
        </g>

        {/* Ribbed knit waistband hem */}
        <rect x="42" y="140" width="56" height="5" fill="#451A03" rx="1" />
        <line x1="44" y1="140" x2="44" y2="145" stroke="#78350F" strokeWidth="1" strokeDasharray="1 1" />
      </g>
    );
  }

  // 8. PETO DE JARDINERO / DUNGARREES OVERALLS
  if (outfitId === "overalls_gardener") {
    return (
      <g id="outfit-overalls">
        {/* Striped farmer t-shirt underneath */}
        <path d="M45 88 Q70 82 95 88 L99 144 Q70 148 41 144 Z" fill="#FFFFFF" stroke={fur.stroke} strokeWidth="1.5" />
        {/* Red or green shirt stripes */}
        <line x1="45" y1="94" x2="95" y2="94" stroke="#EF4444" strokeWidth="2.5" />
        <line x1="43" y1="102" x2="97" y2="102" stroke="#EF4444" strokeWidth="2.5" />

        {/* Denim Bib Overalls */}
        <path d="M50 106 L90 106 L95 145 Q70 148 45 145 L50 106 Z" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.8" />

        {/* Two thick denim shoulder straps */}
        <path d="M52 88 L52 108" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" />
        <path d="M52 88 L52 108" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
        {/* Brass buckle loops */}
        <rect x="49.5" y="104" width="5" height="5" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="52" cy="106.5" r="1" fill="#451A03" />

        <path d="M88 88 L88 108" stroke="#1D4ED8" strokeWidth="6" strokeLinecap="round" />
        <path d="M88 88 L88 108" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
        <rect x="85.5" y="104" width="5" height="5" rx="1" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
        <circle cx="88" cy="106.5" r="1" fill="#451A03" />

        {/* Large front bib pocket with adorable green sprout plant peeking out! */}
        <rect x="58" y="116" width="24" height="18" rx="2" fill="#1D4ED8" stroke="#FCD34D" strokeWidth="1" strokeDasharray="2 1.5" />
        {/* Green seedling plant sprout */}
        <g transform="translate(68, 108)">
          <path d="M2 8 Q0 4 4 1 Q6 4 2 8 Z" fill="#22C55E" />
          <path d="M2 8 Q5 6 8 3 Q6 1 2 8 Z" fill="#4ADE80" />
          <line x1="2" y1="8" x2="2" y2="12" stroke="#15803D" strokeWidth="1.5" />
        </g>
      </g>
    );
  }

  // 9. CHAQUETA DE CUERO ROCKERA
  if (outfitId === "rocker_leather") {
    return (
      <g id="outfit-rocker">
        {/* Black leather motorcycle jacket */}
        <path d="M44 88 Q70 82 96 88 L100 144 Q70 148 40 144 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />

        {/* Diagonal metallic zipper track */}
        <line x1="56" y1="88" x2="74" y2="140" stroke="#94A3B8" strokeWidth="2" />
        <line x1="56" y1="88" x2="74" y2="140" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 1.5" />

        {/* Asymmetrical biker collar with chrome metallic studs */}
        <polygon points="44,88 64,106 50,114 42,94" fill="#27272A" stroke="#52525B" strokeWidth="1.2" />
        <circle cx="48" cy="98" r="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
        <circle cx="56" cy="106" r="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />

        <polygon points="96,88 72,110 88,118 98,94" fill="#27272A" stroke="#52525B" strokeWidth="1.2" />
        <circle cx="92" cy="98" r="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
        <circle cx="82" cy="108" r="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />

        {/* Zippered slash pocket on right chest */}
        <line x1="78" y1="120" x2="90" y2="126" stroke="#94A3B8" strokeWidth="1.8" />
        <circle cx="84" cy="123" r="1" fill="#E2E8F0" />

        {/* Heavy biker belt with chrome rectangular buckle */}
        <rect x="42" y="137" width="56" height="7" fill="#09090B" rx="1" />
        <rect x="64" y="135" width="12" height="10" rx="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <rect x="67" y="137" width="6" height="6" fill="#09090B" />
      </g>
    );
  }

  // 10. ESMOQUIN REAL / PRO STELLAR TUXEDO / CEO BLAZER
  if (outfitId === "royal_tuxedo" || outfitId === "pro_stellar_tuxedo" || outfitId === "ceo_blazer") {
    return (
      <g id="outfit-tuxedo">
        {/* Crisp white pleated wing-collar bib shirt */}
        <path d="M48 88 Q70 84 92 88 L95 144 Q70 147 45 144 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        {/* Tiny black stud buttons */}
        <circle cx="70" cy="108" r="1.2" fill="#09090B" />
        <circle cx="70" cy="118" r="1.2" fill="#09090B" />
        <circle cx="70" cy="128" r="1.2" fill="#09090B" />

        {/* Elegant peak-lapel tuxedo jacket in jet black */}
        <path d="M44 90 C54 90 56 108 56 128 L56 145 L41 144 Z" fill={outfit.vest || "#0F172A"} stroke="#020617" strokeWidth="1.8" />
        <path d="M96 90 C86 90 84 108 84 128 L84 145 L99 144 Z" fill={outfit.vest || "#0F172A"} stroke="#020617" strokeWidth="1.8" />

        {/* Shiny silk shawl lapels */}
        <polygon points="44,90 58,118 48,124 42,94" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
        <polygon points="96,90 82,118 92,124 98,94" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />

        {/* White silk pocket square in breast pocket */}
        <rect x="47" y="112" width="8" height="2" fill="#0F172A" />
        <polygon points="49,112 51,108 53,112" fill="#FFFFFF" />

        {/* Deep ruby silk bow tie at throat */}
        <polygon points="64,92 70,95 64,98" fill="#E11D48" stroke="#9F1239" strokeWidth="0.8" />
        <polygon points="76,92 70,95 76,98" fill="#E11D48" stroke="#9F1239" strokeWidth="0.8" />
        <circle cx="70" cy="95" r="2.2" fill="#BE123C" />

        {/* Satin cummerbund across the waist */}
        <rect x="54" y="134" width="32" height="10" fill="#E11D48" stroke="#9F1239" strokeWidth="1" rx="1" />
        <line x1="56" y1="137" x2="84" y2="137" stroke="#BE123C" strokeWidth="1" />
        <line x1="56" y1="140" x2="84" y2="140" stroke="#BE123C" strokeWidth="1" />
      </g>
    );
  }

  // 11. CHAQUETA DE CHEF PASTELERO
  if (outfitId === "pastry_chef") {
    return (
      <g id="outfit-chef">
        {/* Double-breasted white chef jacket */}
        <path d="M44 88 Q70 82 96 88 L100 144 Q70 148 40 144 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />

        {/* Red knotted chef neckerchief scarf */}
        <polygon points="62,88 70,102 78,88" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
        <polygon points="67,98 70,108 73,98" fill="#DC2626" />

        {/* Two parallel vertical columns of 4 round buttons */}
        <circle cx="60" cy="108" r="2" fill="#0F172A" />
        <circle cx="74" cy="108" r="2" fill="#0F172A" />
        <circle cx="60" cy="118" r="2" fill="#0F172A" />
        <circle cx="74" cy="118" r="2" fill="#0F172A" />
        <circle cx="60" cy="128" r="2" fill="#0F172A" />
        <circle cx="74" cy="128" r="2" fill="#0F172A" />
        <circle cx="60" cy="138" r="2" fill="#0F172A" />
        <circle cx="74" cy="138" r="2" fill="#0F172A" />

        {/* Chef apron waist line */}
        <line x1="42" y1="142" x2="98" y2="142" stroke="#EF4444" strokeWidth="2" />
      </g>
    );
  }

  // 12. PIJAMA QUIRÚRGICO MÉDICO (DOCTOR SCRUBS)
  if (outfitId === "doctor_scrubs") {
    return (
      <g id="outfit-doctor">
        {/* Medical scrub top with distinctive V-neck */}
        <path d="M44 88 Q70 82 96 88 L99 144 Q70 148 41 144 Z" fill={outfit.vest || "#0D9488"} stroke="#0F766E" strokeWidth="2" />

        {/* V-neck collar */}
        <polygon points="60,88 70,104 80,88 74,88 70,98 66,88" fill="#14B8A6" stroke="#0F766E" strokeWidth="1" />

        {/* Medical stethoscope draped around neck */}
        <path d="M54 88 Q50 105 58 122 Q64 130 70 126" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M86 88 Q90 105 82 122 Q76 130 70 126" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Silver stethoscope chest piece */}
        <circle cx="70" cy="126" r="4" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.2" />
        <circle cx="70" cy="126" r="2" fill="#94A3B8" />

        {/* Hospital ID Badge clipped to chest */}
        <rect x="83" y="104" width="10" height="13" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="85" y="106" width="6" height="5" fill="#0284C7" />
        <line x1="85" y1="113" x2="91" y2="113" stroke="#94A3B8" strokeWidth="1" />
        <line x1="87" y1="102" x2="89" y2="104" stroke="#475569" strokeWidth="1" />
      </g>
    );
  }

  // 13. TÚNICA DE MAGO / ASTRÓNOMO / PRO CELESTIAL
  if (outfitId === "wizard_robe" || outfitId === "astronomer_cloak" || outfitId === "pro_celestial_scholar") {
    return (
      <g id="outfit-wizard">
        {/* Mystic midnight robe */}
        <path d="M43 88 Q70 80 97 88 L101 145 Q70 149 39 145 Z" fill={outfit.vest || "#312E81"} stroke="#4338CA" strokeWidth="2" />

        {/* Golden Embroidered Celestial Stars and Crescents */}
        <g fill="#FDE047" stroke="#EAB308" strokeWidth="0.5">
          {/* Crescent Moon */}
          <path d="M50 106 A 4 4 0 0 0 54 114 A 3.5 3.5 0 0 1 50 106 Z" />
          {/* Stars */}
          <polygon points="88,102 89,105 92,105 89.5,107 90.5,110 88,108 85.5,110 86.5,107 84,105 87,105" />
          <polygon points="56,128 57,130 60,130 57.5,132 58.5,135 56,133 53.5,135 54.5,132 52,130 55,130" />
          <polygon points="86,132 87,134 89,134 87.5,135.5 88.5,138 86,136.5 83.5,138 84.5,135.5 83,134 85,134" />
        </g>

        {/* Robe Golden Trim Center Opening */}
        <line x1="70" y1="92" x2="70" y2="145" stroke="#FDE047" strokeWidth="2" />

        {/* Glowing Crystal Gem Amulet Talisman hanging from neck */}
        <line x1="70" y1="88" x2="70" y2="104" stroke="#F59E0B" strokeWidth="1.5" />
        <polygon points="70,104 74,109 70,116 66,109" fill="#06B6D4" stroke="#22D3EE" strokeWidth="1.2" />
        <circle cx="70" cy="110" r="1.5" fill="#FFFFFF" />

        {/* Ornate mystic belt with runes */}
        <rect x="41" y="136" width="58" height="6" fill="#1E1B4B" stroke="#FDE047" strokeWidth="1" rx="1" />
        <circle cx="70" cy="139" r="3.5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
      </g>
    );
  }

  // 14. GI DE NINJA DE LAS SOMBRAS
  if (outfitId === "shadow_ninja") {
    return (
      <g id="outfit-ninja">
        {/* Stealth dark shinobi wrapped gi */}
        <path d="M44 88 Q70 82 96 88 L99 144 Q70 148 41 144 Z" fill="#18181B" stroke="#09090B" strokeWidth="2" />

        {/* Crossed wrap diagonal collar */}
        <path d="M45 88 L85 130" stroke="#27272A" strokeWidth="3" />
        <path d="M95 88 L55 130" stroke="#27272A" strokeWidth="3" />

        {/* Mesh armor chain underlayer */}
        <polygon points="62,88 70,98 78,88" fill="#3F3F46" stroke="#52525B" strokeWidth="1" strokeDasharray="1.5 1.5" />

        {/* Silver Shuriken Throwing Star Crest in center */}
        <g transform="translate(70, 114)">
          <polygon points="0,-5 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="1.2" fill="#09090B" />
        </g>

        {/* Crimson ninja fabric sash belt with scroll */}
        <rect x="42" y="134" width="56" height="8" fill="#DC2626" stroke="#991B1B" strokeWidth="1" rx="1" />
        {/* Mini ninja scroll tucked in belt */}
        <rect x="52" y="132" width="12" height="5" rx="2" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.8" />
        <rect x="56" y="132" width="4" height="5" fill="#DC2626" />
      </g>
    );
  }

  // 15. ARMADURA DE CABALLERO
  if (outfitId === "knight_armor") {
    return (
      <g id="outfit-knight">
        {/* Polished steel breastplate plate armor */}
        <path d="M45 88 Q70 82 95 88 L98 144 Q70 147 42 144 Z" fill="#94A3B8" stroke="#475569" strokeWidth="2" />

        {/* Center vertical crease ridge */}
        <line x1="70" y1="88" x2="70" y2="140" stroke="#E2E8F0" strokeWidth="2" />

        {/* Layered steel shoulder pauldrons with gold edge trim */}
        <path d="M42 90 Q48 88 54 94 Q48 98 42 94 Z" fill="#CBD5E1" stroke="#F59E0B" strokeWidth="1.2" />
        <path d="M98 90 Q92 88 86 94 Q92 98 98 94 Z" fill="#CBD5E1" stroke="#F59E0B" strokeWidth="1.2" />

        {/* Embossed knight heraldic golden cross shield on chest */}
        <rect x="65" y="104" width="10" height="14" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        <line x1="70" y1="105" x2="70" y2="117" stroke="#FCD34D" strokeWidth="2" />
        <line x1="66" y1="110" x2="74" y2="110" stroke="#FCD34D" strokeWidth="2" />

        {/* Metal rivets around perimeter */}
        <circle cx="48" cy="100" r="1.2" fill="#475569" />
        <circle cx="48" cy="115" r="1.2" fill="#475569" />
        <circle cx="48" cy="130" r="1.2" fill="#475569" />
        <circle cx="92" cy="100" r="1.2" fill="#475569" />
        <circle cx="92" cy="115" r="1.2" fill="#475569" />
        <circle cx="92" cy="130" r="1.2" fill="#475569" />

        {/* Steel waist plates / fauld */}
        <rect x="43" y="137" width="54" height="6" fill="#64748B" stroke="#334155" strokeWidth="1" rx="1" />
      </g>
    );
  }

  // 16. TRAJE DE SUPERHÉROE
  if (outfitId === "superhero_cape") {
    return (
      <g id="outfit-superhero">
        {/* Flowing crimson superhero cape peeking behind shoulders */}
        <path d="M38 90 L32 148 L46 142 L42 96 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
        <path d="M102 90 L108 148 L94 142 L98 96 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />

        {/* Aerodynamic muscle superhero suit body */}
        <path d="M45 88 Q70 82 95 88 L98 144 Q70 148 42 144 Z" fill={outfit.vest || "#2563EB"} stroke="#1D4ED8" strokeWidth="2" />

        {/* Chest emblem: Glowing golden diamond with lightning bolt and star */}
        <polygon points="70,98 84,112 70,126 56,112" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        {/* Lightning bolt inside */}
        <polygon points="71,102 65,113 71,113 69,122 75,111 70,111" fill="#DC2626" />

        {/* Gold superhero power belt with energy capsule cylinders */}
        <rect x="42" y="136" width="56" height="7" fill="#F59E0B" stroke="#B45309" strokeWidth="1" rx="1" />
        <circle cx="70" cy="139.5" r="3.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
        <circle cx="58" cy="139.5" r="2" fill="#FCD34D" />
        <circle cx="82" cy="139.5" r="2" fill="#FCD34D" />
      </g>
    );
  }

  // 17. PONCHO ANDINO TRADICIONAL
  if (outfitId === "andine_poncho") {
    return (
      <g id="outfit-poncho">
        {/* Wide draped triangular poncho */}
        <polygon points="40,88 70,84 100,88 104,142 70,149 36,142" fill={outfit.vest || "#B91C1C"} stroke="#7F1D1D" strokeWidth="2" />

        {/* Geometric Inca Diamond Pattern Bands */}
        <g fill="#FDE047" stroke="#D97706" strokeWidth="0.8">
          <polygon points="50,114 54,110 58,114 54,118" />
          <polygon points="62,114 66,110 70,114 66,118" />
          <polygon points="74,114 78,110 82,114 78,118" />
          <polygon points="86,114 90,110 94,114 90,118" />
        </g>
        <line x1="38" y1="122" x2="102" y2="122" stroke="#059669" strokeWidth="2.5" />
        <line x1="38" y1="126" x2="102" y2="126" stroke="#F59E0B" strokeWidth="1.5" />

        {/* Tassel Fringe along bottom hem */}
        <g stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round">
          <line x1="42" y1="143" x2="42" y2="147" />
          <line x1="50" y1="145" x2="50" y2="149" />
          <line x1="60" y1="147" x2="60" y2="151" />
          <line x1="70" y1="149" x2="70" y2="153" />
          <line x1="80" y1="147" x2="80" y2="151" />
          <line x1="90" y1="145" x2="90" y2="149" />
          <line x1="98" y1="143" x2="98" y2="147" />
        </g>
      </g>
    );
  }

  // 18. CYBER CYBORG 3000 / PRO CYBER PHANTOM
  if (outfitId === "cyber_cyborg_3000" || outfitId === "pro_cyber_phantom") {
    return (
      <g id="outfit-cyborg">
        {/* Futuristic titanium cyber chassis */}
        <path d="M45 88 Q70 82 95 88 L98 144 Q70 148 42 144 Z" fill="#09090B" stroke="#06B6D4" strokeWidth="2" />

        {/* Glowing circular neon cyan arc-reactor core in chest with pulsing rings */}
        <circle cx="70" cy="115" r="10" fill="#083344" stroke="#06B6D4" strokeWidth="1.8" />
        <circle cx="70" cy="115" r="6" fill="#0E7490" stroke="#22D3EE" strokeWidth="1.2" />
        <circle cx="70" cy="115" r="3" fill="#67E8F9" />

        {/* Neon cyan circuit traces branching across shoulders and ribs */}
        <path d="M70 105 L70 94 L58 92" stroke="#22D3EE" strokeWidth="1.2" fill="none" />
        <path d="M70 105 L70 94 L82 92" stroke="#22D3EE" strokeWidth="1.2" fill="none" />
        <path d="M60 115 L48 115 L45 125" stroke="#22D3EE" strokeWidth="1.2" fill="none" />
        <path d="M80 115 L92 115 L95 125" stroke="#22D3EE" strokeWidth="1.2" fill="none" />
        <path d="M70 125 L70 138" stroke="#22D3EE" strokeWidth="1.2" fill="none" />

        {/* Glowing circuit nodes */}
        <circle cx="58" cy="92" r="1.5" fill="#A5F3FC" />
        <circle cx="82" cy="92" r="1.5" fill="#A5F3FC" />
        <circle cx="45" cy="125" r="1.5" fill="#A5F3FC" />
        <circle cx="95" cy="125" r="1.5" fill="#A5F3FC" />
      </g>
    );
  }

  // 19. MANTO DEL EMPERADOR ZANAHORIA / PRO AURUM ROYALTY
  if (outfitId === "carrot_emperor" || outfitId === "pro_aurum_royalty") {
    return (
      <g id="outfit-emperor">
        {/* Regal crimson velvet coronation mantle */}
        <path d="M42 88 Q70 80 98 88 L101 145 Q70 149 39 145 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="2" />

        {/* Royal Ermine Fur Trim along collar and front (white with black spots) */}
        <path d="M42 88 Q70 100 98 88 L94 100 Q70 110 46 100 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        {/* Ermine tail black spots */}
        <circle cx="54" cy="94" r="1.2" fill="#09090B" />
        <circle cx="64" cy="97" r="1.2" fill="#09090B" />
        <circle cx="76" cy="97" r="1.2" fill="#09090B" />
        <circle cx="86" cy="94" r="1.2" fill="#09090B" />

        {/* Thick golden chain of state collar */}
        <path d="M50 96 Q70 114 90 96" stroke="#F59E0B" strokeWidth="3" fill="none" strokeDasharray="3 2" />

        {/* Giant Sparkling Golden Carrot Royal Medallion */}
        <g transform="translate(70, 120)">
          <polygon points="0,-2 5,-8 0,-14 -5,-8" fill="#15803D" />
          <polygon points="-6,-6 6,-6 0,10" fill="#F97316" stroke="#C2410C" strokeWidth="1.2" />
          <line x1="-3" y1="-2" x2="1" y2="-2" stroke="#FDBA74" strokeWidth="1" />
          <line x1="-2" y1="2" x2="2" y2="2" stroke="#FDBA74" strokeWidth="1" />
          <circle cx="0" cy="-6" r="2.5" fill="#FCD34D" stroke="#D97706" strokeWidth="0.8" />
        </g>

        {/* Gold royal belt */}
        <rect x="41" y="138" width="58" height="6" fill="#F59E0B" stroke="#B45309" strokeWidth="1" rx="1" />
      </g>
    );
  }

  // 20. SUÉTER UNIVERSITARIO OXFORD / CÁRDIGAN
  if (outfitId === "academic_sweater" || outfitId === "linguist_cardigan" || outfitId === "cozy_sweater") {
    return (
      <g id="outfit-sweater">
        {/* Crisp white shirt with necktie underneath */}
        <polygon points="62,88 70,98 78,88" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        {/* Striped collegiate necktie */}
        <polygon points="68,96 72,96 74,116 70,120 66,116" fill="#DC2626" />
        <line x1="68" y1="102" x2="72" y2="105" stroke="#FCD34D" strokeWidth="1.5" />
        <line x1="67" y1="110" x2="73" y2="113" stroke="#FCD34D" strokeWidth="1.5" />

        {/* Knitted V-Neck collegiate sweater */}
        <path d="M44 88 Q70 82 96 88 L99 144 Q70 148 41 144 Z" fill={outfit.vest} stroke={outfit.trim} strokeWidth="2" />

        {/* Deep V-Neck cut opening */}
        <polygon points="56,88 70,110 84,88 78,88 70,102 62,88" fill="#F1F5F9" stroke={outfit.trim} strokeWidth="1" />

        {/* Cable knit or diamond argyle pattern on sweater */}
        <g stroke={outfit.trim} strokeWidth="0.8" fill="none" opacity="0.6">
          <polygon points="70,112 76,120 70,128 64,120" />
          <polygon points="70,128 76,136 70,144 64,136" />
          <polygon points="56,120 62,128 56,136 50,128" />
          <polygon points="84,120 90,128 84,136 78,128" />
        </g>

        {/* Ribbed hem at waist */}
        <rect x="42" y="141" width="56" height="4" fill={outfit.trim} rx="1" />
      </g>
    );
  }

  // 21. CAMISA HAWAIANA
  if (outfitId === "hawaiian_shirt") {
    return (
      <g id="outfit-hawaiian">
        {/* Colorful tropical beach shirt */}
        <path d="M44 88 Q70 82 96 88 L100 144 Q70 148 40 144 Z" fill={outfit.vest || "#06B6D4"} stroke={outfit.trim} strokeWidth="2" />

        {/* Open notched camp collar */}
        <polygon points="48,88 64,102 52,108 42,92" fill="#22D3EE" stroke="#0891B2" strokeWidth="1.2" />
        <polygon points="92,88 76,102 88,108 98,92" fill="#22D3EE" stroke="#0891B2" strokeWidth="1.2" />

        {/* Tropical palm leaf and hibiscus flower prints */}
        <g fill="#FACC15" stroke="#EAB308" strokeWidth="0.5">
          <circle cx="56" cy="116" r="3" />
          <circle cx="53" cy="114" r="2" fill="#F43F5E" />
          <circle cx="59" cy="114" r="2" fill="#F43F5E" />
          <circle cx="56" cy="119" r="2" fill="#F43F5E" />

          <circle cx="84" cy="126" r="3" />
          <circle cx="81" cy="124" r="2" fill="#F43F5E" />
          <circle cx="87" cy="124" r="2" fill="#F43F5E" />
          <circle cx="84" cy="129" r="2" fill="#F43F5E" />
        </g>
        {/* Palm fronds */}
        <path d="M72 108 Q68 114 62 116" stroke="#22C55E" strokeWidth="1.5" fill="none" />
        <path d="M78 120 Q82 126 88 128" stroke="#22C55E" strokeWidth="1.5" fill="none" />

        {/* Coconut shell buttons */}
        <circle cx="70" cy="118" r="1.5" fill="#78350F" />
        <circle cx="70" cy="128" r="1.5" fill="#78350F" />
        <circle cx="70" cy="138" r="1.5" fill="#78350F" />
      </g>
    );
  }

  // 22. DEFAULT / CHALECO ESCOLAR CLÁSICO (BENTO / ACADÉMICO)
  // Rendered for `school_vest`, `math_tutor_blazer`, and any other customized outfits
  return (
    <g id="outfit-classic-vest">
      {/* Inner white collared shirt */}
      <path
        d="M45 88 Q70 82 95 88 L100 144 Q70 148 40 144 Z"
        fill={outfit.shirt || "#FFFFFF"}
        stroke={fur.stroke}
        strokeWidth="2"
      />

      {/* Classic tailored school uniform vest */}
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

      {/* Shirt Collar */}
      <polygon points="56,88 70,100 62,93" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <polygon points="84,88 70,100 78,93" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Collegiate striped tie */}
      <polygon points="68,98 72,98 74,116 70,120 66,116" fill="#3B82F6" />
      <line x1="68" y1="104" x2="72" y2="106" stroke="#F59E0B" strokeWidth="1" />
      <line x1="67" y1="110" x2="73" y2="112" stroke="#F59E0B" strokeWidth="1" />

      {/* School Crest on left chest */}
      <circle cx="50" cy="110" r="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
      <polygon points="50,108 51,110 50,112 49,110" fill="#FFFFFF" />

      {/* Polished Gold Vest Buttons */}
      <circle cx="70" cy="124" r="2.2" fill={outfit.buttons || "#F59E0B"} />
      <circle cx="70" cy="132" r="2.2" fill={outfit.buttons || "#F59E0B"} />

      {/* Belt / Waistline */}
      <rect x="42" y="140" width="56" height="5" fill="#334155" rx="1" />
      <rect x="66" y="139" width="8" height="7" fill="#F59E0B" rx="1" />
    </g>
  );
};
