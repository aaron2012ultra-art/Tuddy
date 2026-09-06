import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CampaignCityLevel } from "../types";

interface CampaignSceneryProps {
  stage: CampaignCityLevel;
}

export const CampaignScenery: React.FC<CampaignSceneryProps> = ({ stage }) => {
  const cityId = stage.id;

  return (
    <div className="relative w-full h-44 sm:h-52 md:h-60 rounded-3xl overflow-hidden border-2 border-white/60 shadow-md select-none transition-all duration-700">
      <AnimatePresence mode="wait">
        {/* LONDRES 🇬🇧 */}
        {cityId === "stage-1-london" && (
          <motion.div
            key="scenery-london"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#1E293B] via-[#334155] to-[#475569] overflow-hidden"
          >
            {/* Rainy / Misty atmospheric overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.25),transparent_60%)]" />
            
            {/* Animated English drizzle */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-0.5 h-6 bg-sky-200/50 rounded-full"
                  style={{ left: `${(i * 8.5) % 100}%`, top: `${(i * 15) % 80}%` }}
                  animate={{ y: [0, 40], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: (i * 0.15) % 1 }}
                />
              ))}
            </div>

            {/* London Skyline Silhouettes */}
            <svg
              className="absolute bottom-0 w-full h-36 text-[#0F172A]/80 fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* London Eye */}
              <circle cx="220" cy="110" r="55" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.6" />
              <line x1="220" y1="110" x2="200" y2="190" stroke="currentColor" strokeWidth="4" opacity="0.6" />
              <line x1="220" y1="110" x2="240" y2="190" stroke="currentColor" strokeWidth="4" opacity="0.6" />

              {/* Big Ben Clock Tower */}
              <rect x="720" y="30" width="46" height="190" rx="3" />
              <polygon points="720,30 743,2 766,30" />
              {/* Clock face */}
              <circle cx="743" cy="65" r="13" fill="#FEF08A" opacity="0.9" />
              <circle cx="743" cy="65" r="3" fill="#1E293B" />

              {/* Westminster & Bridge arches */}
              <rect x="620" y="100" width="90" height="120" />
              <polygon points="630,100 640,80 650,100" />
              <polygon points="660,100 670,80 680,100" />
              <polygon points="690,100 700,80 710,100" />

              {/* Base embankment / Thames river */}
              <rect x="0" y="210" width="1000" height="30" fill="#090D16" />
            </svg>

            {/* Red phone booth accent */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#991B1B]/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-red-400/40 backdrop-blur-xs">
              <span className="text-base">🇬🇧</span>
              <span>Londres • Heathrow A1</span>
            </div>
          </motion.div>
        )}

        {/* NUEVA YORK 🇺🇸 */}
        {cityId === "stage-2-nyc" && (
          <motion.div
            key="scenery-nyc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#312E81] overflow-hidden"
          >
            {/* Glowing urban lights & stars */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,191,36,0.2),transparent_50%)]" />

            {/* Manhattan Skyscraper Skyline */}
            <svg
              className="absolute bottom-0 w-full h-40 text-[#090D16] fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Chrysler building spire */}
              <rect x="180" y="40" width="48" height="180" />
              <polygon points="180,40 204,10 228,40" fill="#CBD5E1" opacity="0.3" />
              <line x1="204" y1="10" x2="204" y2="0" stroke="#F8FAFC" strokeWidth="2" />

              {/* Empire State building */}
              <rect x="470" y="20" width="60" height="200" />
              <rect x="485" y="0" width="30" height="30" />
              <line x1="500" y1="0" x2="500" y2="-15" stroke="#F8FAFC" strokeWidth="3" />

              {/* Glowing window dots */}
              <rect x="480" y="60" width="6" height="6" fill="#FDE047" opacity="0.8" />
              <rect x="495" y="60" width="6" height="6" fill="#FDE047" opacity="0.8" />
              <rect x="510" y="60" width="6" height="6" fill="#FDE047" opacity="0.8" />
              <rect x="480" y="85" width="6" height="6" fill="#FDE047" opacity="0.8" />
              <rect x="510" y="85" width="6" height="6" fill="#FDE047" opacity="0.8" />
              <rect x="495" y="110" width="6" height="6" fill="#FDE047" opacity="0.8" />

              {/* Highrises */}
              <rect x="50" y="80" width="80" height="140" />
              <rect x="270" y="70" width="90" height="150" />
              <rect x="380" y="90" width="70" height="130" />
              <rect x="570" y="60" width="95" height="160" />
              <rect x="690" y="90" width="110" height="130" />
              <rect x="830" y="50" width="85" height="170" />

              {/* Street ground */}
              <rect x="0" y="220" width="1000" height="20" fill="#020617" />
            </svg>

            {/* Yellow Taxi & NYC Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#EAB308]/90 text-slate-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-md border border-amber-300 backdrop-blur-xs">
              <span className="text-base">🇺🇸</span>
              <span>Nueva York • Manhattan A1+</span>
            </div>
          </motion.div>
        )}

        {/* PARÍS 🇫🇷 */}
        {cityId === "stage-3-paris" && (
          <motion.div
            key="scenery-paris"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#F472B6] via-[#FB7185] to-[#FED7AA] overflow-hidden"
          >
            {/* Romantic Sunset Glow */}
            <div className="absolute top-6 left-1/4 w-32 h-32 rounded-full bg-amber-100/60 blur-xl pointer-events-none" />

            {/* Parisian Eiffel Tower & Mansard Rooftops */}
            <svg
              className="absolute bottom-0 w-full h-42 text-[#4A1D2F]/85 fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Eiffel Tower */}
              <polygon points="490,20 510,20 525,120 475,120" />
              <rect x="465" y="120" width="70" height="15" />
              <polygon points="475,135 525,135 550,225 450,225" />
              {/* Arch base */}
              <path d="M 470 225 Q 500 170 530 225 Z" fill="#F472B6" opacity="0.3" />
              <line x1="500" y1="20" x2="500" y2="0" stroke="currentColor" strokeWidth="3" />

              {/* Arc de Triomphe silhouette */}
              <rect x="180" y="110" width="80" height="110" />
              <path d="M 205 220 Q 220 160 235 220 Z" fill="#F472B6" opacity="0.3" />

              {/* Parisian Haussmann classic buildings */}
              <rect x="20" y="130" width="130" height="90" />
              <polygon points="20,130 85,100 150,130" />
              <rect x="620" y="140" width="140" height="80" />
              <polygon points="620,140 690,110 760,140" />
              <rect x="800" y="130" width="180" height="90" />

              {/* Seine River / Street */}
              <rect x="0" y="220" width="1000" height="20" fill="#2E1065" />
            </svg>

            {/* Parisian Café Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#BE185D]/90 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-pink-300 backdrop-blur-xs">
              <span className="text-base">🇫🇷</span>
              <span>París • Tour Eiffel A2</span>
            </div>
          </motion.div>
        )}

        {/* BERLÍN 🇩🇪 */}
        {cityId === "stage-4-berlin" && (
          <motion.div
            key="scenery-berlin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#064E3B] via-[#047857] to-[#10B981] overflow-hidden"
          >
            {/* Brandenburg Gate & Fernsehturm TV Tower */}
            <svg
              className="absolute bottom-0 w-full h-42 text-[#022C22]/90 fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Fernsehturm Needle */}
              <rect x="740" y="20" width="6" height="190" />
              <circle cx="743" cy="70" r="22" />
              <line x1="743" y1="20" x2="743" y2="-10" stroke="currentColor" strokeWidth="2" />

              {/* Brandenburg Gate columns */}
              <rect x="250" y="90" width="180" height="20" rx="3" />
              <rect x="260" y="110" width="14" height="110" />
              <rect x="290" y="110" width="14" height="110" />
              <rect x="320" y="110" width="14" height="110" />
              <rect x="350" y="110" width="14" height="110" />
              <rect x="380" y="110" width="14" height="110" />
              <rect x="410" y="110" width="14" height="110" />
              {/* Quadriga statue on top */}
              <polygon points="320,90 340,65 360,90" />

              {/* Modern Bauhaus architectural blocks */}
              <rect x="40" y="120" width="150" height="100" />
              <rect x="520" y="110" width="140" height="110" />
              <rect x="830" y="130" width="140" height="90" />

              {/* Ground */}
              <rect x="0" y="220" width="1000" height="20" fill="#011F17" />
            </svg>

            {/* Berlin Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#065F46]/90 text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-emerald-300/40 backdrop-blur-xs">
              <span className="text-base">🇩🇪</span>
              <span>Berlín • Brandenburger Tor B1</span>
            </div>
          </motion.div>
        )}

        {/* ROMA 🇮🇹 */}
        {cityId === "stage-5-rome" && (
          <motion.div
            key="scenery-rome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#EA580C] via-[#F97316] to-[#FDE047] overflow-hidden"
          >
            {/* Tuscan golden sun */}
            <div className="absolute top-4 right-1/4 w-24 h-24 rounded-full bg-yellow-200/80 blur-md pointer-events-none" />

            {/* Colosseum & Mediterranean Cypress Trees */}
            <svg
              className="absolute bottom-0 w-full h-42 text-[#431407]/85 fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Colosseum Oval Façade */}
              <path d="M 180 220 L 180 120 Q 360 80 540 120 L 540 220 Z" />
              {/* Arches layer 1 */}
              <path d="M 210 160 Q 230 130 250 160 Z" fill="#F97316" />
              <path d="M 270 155 Q 290 125 310 155 Z" fill="#F97316" />
              <path d="M 330 150 Q 350 120 370 150 Z" fill="#F97316" />
              <path d="M 390 155 Q 410 125 430 155 Z" fill="#F97316" />
              <path d="M 450 160 Q 470 130 490 160 Z" fill="#F97316" />

              {/* Tuscan Pines (Cypresses) */}
              <ellipse cx="640" cy="140" rx="14" ry="45" />
              <rect x="637" y="180" width="6" height="40" />

              <ellipse cx="690" cy="130" rx="16" ry="55" />
              <rect x="687" y="175" width="6" height="45" />

              <ellipse cx="740" cy="145" rx="13" ry="40" />
              <rect x="737" y="180" width="6" height="40" />

              {/* Roman columns */}
              <rect x="820" y="110" width="16" height="110" />
              <rect x="850" y="110" width="16" height="110" />
              <rect x="880" y="110" width="16" height="110" />
              <rect x="810" y="95" width="95" height="15" />

              {/* Ground */}
              <rect x="0" y="220" width="1000" height="20" fill="#270902" />
            </svg>

            {/* Roma Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#C2410C]/90 text-amber-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-orange-300 backdrop-blur-xs">
              <span className="text-base">🇮🇹</span>
              <span>Roma • Colosseo B1+</span>
            </div>
          </motion.div>
        )}

        {/* TOKIO 🇯🇵 */}
        {cityId === "stage-6-tokyo" && (
          <motion.div
            key="scenery-tokyo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#4C1D95] via-[#7C3AED] to-[#F472B6] overflow-hidden"
          >
            {/* Mount Fuji snow silhouette */}
            <svg
              className="absolute bottom-0 w-full h-44 text-[#2E1065] fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Mount Fuji volcano shape */}
              <polygon points="350,220 500,45 650,220" fill="#3B0764" />
              {/* Snow cap */}
              <polygon points="460,95 500,45 540,95 520,110 500,90 480,110" fill="#FDF4FF" />

              {/* Scarlet Torii Gate in foreground */}
              <rect x="180" y="120" width="14" height="100" fill="#DC2626" />
              <rect x="250" y="120" width="14" height="100" fill="#DC2626" />
              <rect x="160" y="110" width="124" height="12" rx="2" fill="#B91C1C" />
              <rect x="170" y="135" width="104" height="8" fill="#DC2626" />

              {/* Pagoda roof silhouettes on right */}
              <polygon points="800,100 850,70 900,100" fill="#1E1B4B" />
              <polygon points="790,130 850,100 910,130" fill="#1E1B4B" />
              <polygon points="780,160 850,130 920,160" fill="#1E1B4B" />
              <rect x="810" y="160" width="80" height="60" fill="#1E1B4B" />

              {/* Ground */}
              <rect x="0" y="220" width="1000" height="20" fill="#180D38" />
            </svg>

            {/* Falling Sakura petals animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-3 bg-pink-200 rounded-full blur-[0.3px]"
                  style={{ left: `${(i * 11) % 95}%`, top: `${(i * 12) % 60}%` }}
                  animate={{
                    y: [0, 80],
                    x: [0, (i % 2 === 0 ? 15 : -15)],
                    rotate: [0, 360],
                    opacity: [0.8, 0],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            {/* Tokyo Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#6D28D9]/90 text-pink-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border border-pink-300/40 backdrop-blur-xs">
              <span className="text-base">🇯🇵</span>
              <span>Tokio • Fuji & Shinkansen B2</span>
            </div>
          </motion.div>
        )}

        {/* RÍO DE JANEIRO 🇧🇷 */}
        {cityId === "stage-7-rio" && (
          <motion.div
            key="scenery-rio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-[#0284C7] via-[#06B6D4] to-[#FACC15] overflow-hidden"
          >
            {/* Tropical Ocean, Sugarloaf Mountain & Christ on Corcovado */}
            <svg
              className="absolute bottom-0 w-full h-44 text-[#064E3B] fill-current"
              viewBox="0 0 1000 240"
              preserveAspectRatio="none"
            >
              {/* Corcovado mountain with Christ the Redeemer */}
              <polygon points="120,220 280,50 440,220" fill="#047857" />
              {/* Christ the Redeemer silhouette */}
              <line x1="280" y1="50" x2="280" y2="28" stroke="#F8FAFC" strokeWidth="5" />
              <line x1="262" y1="36" x2="298" y2="36" stroke="#F8FAFC" strokeWidth="4" />

              {/* Sugarloaf Mountain (Pão de Açúcar) */}
              <ellipse cx="720" cy="150" rx="140" ry="100" fill="#065F46" />
              <ellipse cx="880" cy="180" rx="90" ry="70" fill="#047857" />

              {/* Palm trees silhouettes */}
              <path d="M 520 220 Q 525 150 515 130" stroke="#022C22" strokeWidth="5" fill="none" />
              <ellipse cx="510" cy="125" rx="25" ry="8" fill="#022C22" />
              <ellipse cx="525" cy="120" rx="25" ry="8" fill="#022C22" />
              <ellipse cx="505" cy="135" rx="20" ry="8" fill="#022C22" />

              {/* Beach sand ground & Atlantic blue waves */}
              <rect x="0" y="215" width="1000" height="25" fill="#EAB308" />
            </svg>

            {/* Rio Badge */}
            <div className="absolute bottom-4 left-8 sm:left-12 flex items-center gap-2 bg-[#059669]/90 text-yellow-200 px-3 py-1.5 rounded-xl text-xs font-black shadow-md border border-emerald-300 backdrop-blur-xs">
              <span className="text-base">🇧🇷</span>
              <span>Río de Janeiro • Pão de Açúcar C1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
