import React from "react";
import { motion } from "motion/react";

interface CampaignPathThemedBackgroundProps {
  language: string;
}

export const CampaignPathThemedBackground: React.FC<CampaignPathThemedBackgroundProps> = ({
  language,
}) => {
  const normalized = (language || "").toLowerCase();

  const isSpanish = normalized.includes("españ") || normalized.includes("span");
  const isEnglish = normalized.includes("ingl") || normalized.includes("eng");
  const isFrench = normalized.includes("fran") || normalized.includes("fren");
  const isGerman = normalized.includes("alem") || normalized.includes("germ");
  const isJapanese = normalized.includes("jap") || normalized.includes("nihon");
  const isItalian = normalized.includes("ital");
  const isPortuguese = normalized.includes("port");
  const isKorean = normalized.includes("core") || normalized.includes("kore");
  const isChinese = normalized.includes("chin") || normalized.includes("mand");
  const isRussian = normalized.includes("rus");
  const isArabic = normalized.includes("arab") || normalized.includes("árab");
  const isOther = !isSpanish && !isEnglish && !isFrench && !isGerman && !isJapanese && !isItalian && !isPortuguese && !isKorean && !isChinese && !isRussian && !isArabic;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* =================================================================== */}
      {/* 🇪🇸 ESPAÑOL (Madrid, Sevilla, Sol ibérico, Guitarras y Azulejos) */}
      {/* =================================================================== */}
      {isSpanish && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFF8EB]/80 to-[#FEF3C7]/40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(251,191,36,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_65%,rgba(245,158,11,0.15),transparent_55%)]" />

          {/* Postal stamp / Airmail watermark badge */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-amber-500/30 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs rotate-2">
            <span className="text-2xl">🇪🇸</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-amber-900/60 uppercase">Ruta Ibérica del Sol</div>
              <div className="text-[11px] font-black text-slate-700/70">Madrid • A1 ➔ C1 Infinito</div>
            </div>
          </div>

          {/* Golden Sun & Warm Rays */}
          <div className="absolute top-12 left-12 w-20 h-20 rounded-full bg-amber-400/20 blur-lg" />
          <div className="absolute top-16 left-16 w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center">
            <span className="text-xl opacity-40">☀️</span>
          </div>

          {/* Spanish arch / plaza silhouette */}
          <div className="absolute bottom-0 left-0 w-44 sm:w-56 h-[550px] opacity-[0.11] text-amber-900">
            <svg viewBox="0 0 200 600" className="w-full h-full fill-current" preserveAspectRatio="none">
              <rect x="20" y="240" width="160" height="360" rx="4" />
              <path d="M 40,380 A 60,60 0 0,1 160,380 L 160,600 L 40,600 Z" fill="#FFFDF5" />
              <polygon points="100,80 180,240 20,240" />
            </svg>
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* 1. 🇬🇧 INGLÉS (Londres, Big Ben, London Eye, Niebla suave y lluvia) */}
      {/* =================================================================== */}
      {isEnglish && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F4F8] via-[#E2E8F0]/80 to-[#EDF2F7]">
          {/* Subtle London Sky Tint */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_15%,rgba(186,230,253,0.35),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_65%,rgba(203,213,225,0.4),transparent_55%)]" />

          {/* Postal stamp / Airmail watermark badge at top right */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-sky-400/30 rounded-2xl p-3 flex items-center gap-2.5 bg-white/40 backdrop-blur-xs rotate-2">
            <span className="text-2xl">🇬🇧</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-sky-900/60 uppercase">Royal Flight Airmail</div>
              <div className="text-[11px] font-black text-slate-700/70">London • A1 ➔ C1 Route</div>
            </div>
          </div>

          {/* Animated subtle London drizzle */}
          <div className="absolute inset-0 opacity-25">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-6 bg-sky-400/50 rounded-full"
                style={{
                  left: `${(i * 7.3) % 96 + 2}%`,
                  top: `${(i * 18.2) % 85}%`,
                }}
                animate={{
                  y: [0, 60],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: (i * 0.22) % 2,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Drifting British Cumulus Clouds */}
          <motion.div
            className="absolute top-24 -left-20 w-72 h-24 bg-white/50 rounded-full blur-xl"
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[38%] -right-16 w-80 h-28 bg-white/40 rounded-full blur-xl"
            animate={{ x: [0, -40, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Left Silhouette: Big Ben Spire & Parliament Arches */}
          <div className="absolute bottom-0 left-0 w-36 sm:w-48 h-[680px] opacity-[0.14] text-slate-800">
            <svg viewBox="0 0 200 800" className="w-full h-full fill-current" preserveAspectRatio="none">
              {/* Big Ben Tower */}
              <rect x="30" y="220" width="60" height="580" rx="3" />
              <polygon points="30,220 60,110 90,220" />
              <line x1="60" y1="110" x2="60" y2="70" stroke="currentColor" strokeWidth="4" />
              <circle cx="60" cy="270" r="16" fill="#FEF08A" opacity="0.6" />
              <circle cx="60" cy="270" r="3" fill="#1E293B" />
              {/* Gothic spires on side */}
              <polygon points="90,380 110,290 130,380" />
              <rect x="90" y="380" width="40" height="420" />
              <polygon points="130,440 150,350 170,440" />
              <rect x="130" y="440" width="40" height="360" />
            </svg>
          </div>

          {/* Right Silhouette: London Eye & River Bridge */}
          <div className="absolute top-[28%] right-0 w-40 sm:w-52 h-[550px] opacity-[0.12] text-slate-800">
            <svg viewBox="0 0 200 600" className="w-full h-full fill-current">
              {/* London Eye Wheel */}
              <circle cx="120" cy="180" r="75" fill="none" stroke="currentColor" strokeWidth="6" />
              <circle cx="120" cy="180" r="6" fill="currentColor" />
              <line x1="120" y1="180" x2="90" y2="340" stroke="currentColor" strokeWidth="6" />
              <line x1="120" y1="180" x2="150" y2="340" stroke="currentColor" strokeWidth="6" />
              {/* Pods */}
              <circle cx="120" cy="105" r="7" />
              <circle cx="195" cy="180" r="7" />
              <circle cx="120" cy="255" r="7" />
              <circle cx="45" cy="180" r="7" />
              <circle cx="173" cy="127" r="6" />
              <circle cx="67" cy="127" r="6" />
              <circle cx="173" cy="233" r="6" />
              <circle cx="67" cy="233" r="6" />
              {/* English Double-decker bus silhouette */}
              <rect x="30" y="480" width="110" height="55" rx="6" />
              <circle cx="55" cy="540" r="11" />
              <circle cx="115" cy="540" r="11" />
            </svg>
          </div>

          {/* Bottom Skyline: Thames River & London Cityline */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-28 text-slate-900/[0.08] fill-current" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,70 L60,70 L60,40 L100,40 L100,70 L220,70 L250,20 L280,70 L400,70 L430,50 L460,70 L600,70 L640,10 L680,70 L800,70 L830,30 L870,70 L1000,70 L1000,120 L0,120 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. 🇫🇷 FRANCÉS (París, Torre Eiffel, Louvre, Farolas y Tarde Rosa)  */}
      {/* =================================================================== */}
      {isFrench && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F6] via-[#FAF5FF]/90 to-[#F5F3FF]">
          {/* Parisian Pastel Twilight Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(244,114,182,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(192,132,252,0.18),transparent_50%)]" />

          {/* Airmail stamp: Paris Fleur-de-lis */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-purple-300/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs -rotate-2">
            <span className="text-2xl">🇫🇷</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-purple-900/60 uppercase">Poste Aérienne</div>
              <div className="text-[11px] font-black text-slate-700/70">Paris • A1 ➔ C1 Escapade</div>
            </div>
          </div>

          {/* Floating Parisian Sparkling Stars / Autumn Glow */}
          <div className="absolute inset-0 opacity-40">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-300/60 rounded-full blur-[1px]"
                style={{
                  left: `${(i * 11) % 94 + 3}%`,
                  top: `${(i * 17) % 86 + 5}%`,
                }}
                animate={{
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.3, 0.9, 0.3],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: (i * 0.4) % 3,
                }}
              />
            ))}
          </div>

          {/* Left Silhouette: Eiffel Tower Majestic Outline */}
          <div className="absolute top-[18%] left-0 w-44 sm:w-56 h-[720px] opacity-[0.14] text-purple-950">
            <svg viewBox="0 0 240 800" className="w-full h-full fill-current" preserveAspectRatio="none">
              {/* Spire */}
              <polygon points="100,50 110,10 120,50" />
              <line x1="110" y1="10" x2="110" y2="0" stroke="currentColor" strokeWidth="4" />
              {/* Upper Section */}
              <polygon points="95,50 125,50 130,220 90,220" />
              <rect x="80" y="220" width="60" height="20" rx="3" />
              {/* Middle Section */}
              <polygon points="85,240 135,240 155,460 65,460" />
              <rect x="50" y="460" width="120" height="25" rx="4" />
              {/* Arch & Legs */}
              <path d="M50,485 L15,780 L65,780 L85,620 Q110,580 135,620 L155,780 L205,780 L170,485 Z" />
            </svg>
          </div>

          {/* Right Silhouette: Arc de Triomphe & Parisian Café Terrace */}
          <div className="absolute top-[45%] right-0 w-40 sm:w-52 h-[500px] opacity-[0.13] text-purple-950">
            <svg viewBox="0 0 200 500" className="w-full h-full fill-current">
              {/* Arc de Triomphe */}
              <rect x="30" y="80" width="140" height="150" rx="4" />
              {/* Arch cut-out */}
              <path d="M70,230 L70,160 Q100,120 130,160 L130,230 Z" fill="#FAF5FF" />
              {/* Top cornice */}
              <rect x="20" y="65" width="160" height="15" rx="2" />
              {/* Parisian Street Lamp */}
              <rect x="140" y="320" width="6" height="140" rx="2" />
              <circle cx="143" cy="315" r="14" fill="#FEF08A" opacity="0.6" />
              <circle cx="143" cy="315" r="4" fill="currentColor" />
              <polygon points="130,305 143,290 156,305" />
            </svg>
          </div>

          {/* Bottom Skyline: Montmartre Dome & Haussmann Rooftops */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-28 text-purple-950/[0.08] fill-current" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,80 L120,80 L150,55 L180,80 L350,80 L400,30 Q450,5 500,30 L550,80 L720,80 L760,50 L800,80 L1000,80 L1000,120 L0,120 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. 🇩🇪 ALEMÁN (Berlín, Puerta de Brandeburgo, Selva Negra y Cumbres) */}
      {/* =================================================================== */}
      {isGerman && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F2F8F5] via-[#EBF4EE]/90 to-[#E5EFE9]">
          {/* Alpine pine & golden light glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(245,158,11,0.16),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_65%,rgba(16,185,129,0.14),transparent_55%)]" />

          {/* Airmail stamp: Berlin Bear & German Crest */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-emerald-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs rotate-1">
            <span className="text-2xl">🇩🇪</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-emerald-900/60 uppercase">Deutsche Luftpost</div>
              <div className="text-[11px] font-black text-slate-700/70">Berlin • A1 ➔ C1 Reise</div>
            </div>
          </div>

          {/* Left Silhouette: Pine Trees of Black Forest (Schwarzwald) */}
          <div className="absolute top-[16%] left-0 w-36 sm:w-48 h-[650px] opacity-[0.14] text-emerald-950">
            <svg viewBox="0 0 200 700" className="w-full h-full fill-current">
              {/* Tall Pine Tree 1 */}
              <polygon points="60,60 75,120 45,120" />
              <polygon points="60,110 85,180 35,180" />
              <polygon points="60,170 95,260 25,260" />
              <polygon points="60,250 105,350 15,350" />
              <rect x="54" y="350" width="12" height="150" />
              {/* Smaller Pine Tree 2 */}
              <polygon points="130,220 145,270 115,270" />
              <polygon points="130,260 155,320 105,320" />
              <polygon points="130,310 165,390 95,390" />
              <rect x="125" y="390" width="10" height="100" />
            </svg>
          </div>

          {/* Right Silhouette: Brandenburg Gate & Neuschwanstein Turrets */}
          <div className="absolute top-[35%] right-0 w-44 sm:w-56 h-[520px] opacity-[0.13] text-emerald-950">
            <svg viewBox="0 0 220 520" className="w-full h-full fill-current">
              {/* Brandenburg Gate Columns */}
              <rect x="20" y="100" width="180" height="20" rx="3" />
              {/* Quadriga Chariot on top */}
              <polygon points="90,75 110,50 130,75" />
              <rect x="30" y="120" width="16" height="140" />
              <rect x="60" y="120" width="16" height="140" />
              <rect x="90" y="120" width="16" height="140" />
              <rect x="120" y="120" width="16" height="140" />
              <rect x="150" y="120" width="16" height="140" />
              <rect x="180" y="120" width="16" height="140" />
              <rect x="15" y="260" width="190" height="15" rx="3" />
              {/* Fairy-tale Castle Turret Spire */}
              <polygon points="140,320 160,260 180,320" />
              <rect x="140" y="320" width="40" height="160" />
              <rect x="150" y="340" width="20" height="30" rx="4" fill="#EBF4EE" />
            </svg>
          </div>

          {/* Bottom Mountain Ridge Skyline (Alps) */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-28 text-emerald-950/[0.08] fill-current" viewBox="0 0 1000 120" preserveAspectRatio="none">
            <path d="M0,90 L100,50 L180,85 L280,35 L380,80 L520,20 L640,75 L760,30 L880,70 L1000,45 L1000,120 L0,120 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. 🇯🇵 JAPONÉS (Tokio, Monte Fuji, Torii, Pagoda y Pétalos Sakura)    */}
      {/* =================================================================== */}
      {isJapanese && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF5F6] via-[#FFF0F2]/90 to-[#FCE7EB]">
          {/* Dawn rising sun & blossom glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(244,63,94,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(251,113,133,0.15),transparent_50%)]" />

          {/* Airmail stamp: Tokyo Japan post */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-rose-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/55 backdrop-blur-xs rotate-2">
            <span className="text-2xl">🇯🇵</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-rose-900/60 uppercase">Japan Air Travel</div>
              <div className="text-[11px] font-black text-slate-700/70">Tokyo • A1 ➔ C1 道</div>
            </div>
          </div>

          {/* Floating animated Sakura petals drifting gently */}
          <div className="absolute inset-0 opacity-70 overflow-hidden">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-2 bg-pink-300/80 rounded-full"
                style={{
                  left: `${(i * 6.8) % 95 + 2}%`,
                  top: `${(i * 12.3) % 85}%`,
                  rotate: `${(i * 35) % 360}deg`,
                  borderRadius: "70% 30% 60% 40% / 60% 40% 60% 40%",
                }}
                animate={{
                  y: [0, 80],
                  x: [(i % 2 === 0 ? -12 : 12), (i % 2 === 0 ? 12 : -12)],
                  rotate: [0, 180, 360],
                  opacity: [0, 0.85, 0],
                }}
                transition={{
                  duration: 6 + (i % 4),
                  repeat: Infinity,
                  delay: (i * 0.45) % 5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Left Silhouette: Mount Fuji with curved slopes */}
          <div className="absolute top-[20%] left-0 w-48 sm:w-64 h-[450px] opacity-[0.14] text-rose-950">
            <svg viewBox="0 0 300 400" className="w-full h-full fill-current">
              {/* Mount Fuji Profile */}
              <path d="M20,380 Q120,300 135,160 L165,160 Q180,300 280,380 Z" />
              {/* Snowy Peak Cap */}
              <polygon points="135,160 165,160 172,210 158,195 150,215 142,195 128,210" fill="#FFF0F2" opacity="0.9" />
              {/* Bamboo grove in foreground */}
              <rect x="35" y="240" width="5" height="150" rx="1" />
              <rect x="50" y="220" width="5" height="170" rx="1" />
              <rect x="65" y="250" width="5" height="140" rx="1" />
            </svg>
          </div>

          {/* Right Silhouette: Traditional Torii Gate & Pagoda */}
          <div className="absolute top-[42%] right-0 w-44 sm:w-56 h-[520px] opacity-[0.13] text-rose-950">
            <svg viewBox="0 0 220 520" className="w-full h-full fill-current">
              {/* Torii Gate */}
              {/* Top curved lintel (kasagi) */}
              <path d="M30,110 Q110,95 190,110 L190,122 Q110,110 30,122 Z" />
              <rect x="45" y="128" width="130" height="10" />
              {/* Main Pillars */}
              <rect x="65" y="128" width="14" height="140" rx="2" />
              <rect x="140" y="128" width="14" height="140" rx="2" />

              {/* Classic 5-Story Pagoda below */}
              {/* Roof 1 */}
              <path d="M80,320 Q110,310 140,320 L135,330 L85,330 Z" />
              {/* Roof 2 */}
              <path d="M70,345 Q110,332 150,345 L145,355 L75,355 Z" />
              {/* Roof 3 */}
              <path d="M60,370 Q110,355 160,370 L155,382 L65,382 Z" />
              {/* Base */}
              <rect x="85" y="382" width="50" height="80" />
              {/* Pagoda Finial Spire */}
              <line x1="110" y1="280" x2="110" y2="320" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>

          {/* Bottom Silhouette: Japanese Pine & Bridge */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-24 text-rose-950/[0.08] fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M0,60 L200,60 Q350,20 500,60 L700,60 L850,45 L1000,60 L1000,100 L0,100 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. 🇮🇹 ITALIANO (Roma, Coliseo, Cipreses Toscanos y Sol Mediterráneo) */}
      {/* =================================================================== */}
      {isItalian && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF5] via-[#FFF8E7]/90 to-[#FEF3C7]/60">
          {/* Tuscan Terracotta & warm golden sun glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(245,158,11,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(234,88,12,0.14),transparent_50%)]" />

          {/* Airmail stamp: Italy Roma seal */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-amber-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/60 backdrop-blur-xs -rotate-1">
            <span className="text-2xl">🇮🇹</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-amber-900/60 uppercase">Posta Aerea d'Italia</div>
              <div className="text-[11px] font-black text-slate-700/70">Roma • A1 ➔ C1 Viaggio</div>
            </div>
          </div>

          {/* Left Silhouette: Tuscan Slender Cypress Trees & Rolling Hills */}
          <div className="absolute top-[18%] left-0 w-36 sm:w-48 h-[650px] opacity-[0.15] text-amber-950">
            <svg viewBox="0 0 200 700" className="w-full h-full fill-current">
              {/* Slender Italian Cypress 1 */}
              <ellipse cx="60" cy="220" rx="22" ry="140" />
              <rect x="56" y="340" width="8" height="120" />
              {/* Slender Italian Cypress 2 */}
              <ellipse cx="110" cy="300" rx="18" ry="110" />
              <rect x="107" y="400" width="6" height="90" />
              {/* Tuscan farmhouse roof */}
              <polygon points="30,500 70,470 110,500" />
              <rect x="35" y="500" width="70" height="50" />
            </svg>
          </div>

          {/* Right Silhouette: Roman Colosseum with ancient arches */}
          <div className="absolute top-[38%] right-0 w-48 sm:w-60 h-[480px] opacity-[0.14] text-amber-950">
            <svg viewBox="0 0 240 480" className="w-full h-full fill-current">
              {/* Colosseum Oval Wall */}
              <path d="M20,180 L220,180 L220,330 L20,330 Z" rx="8" />
              {/* Top broken cornice curve */}
              <path d="M20,180 Q120,165 220,180 L220,195 L20,195 Z" />
              {/* Row 1 of Arches */}
              <rect x="35" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="65" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="95" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="125" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="155" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="185" y="210" width="18" height="30" rx="8" fill="#FFF8E7" />
              {/* Row 2 of Arches */}
              <rect x="35" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="65" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="95" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="125" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="155" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              <rect x="185" y="260" width="18" height="30" rx="8" fill="#FFF8E7" />
              {/* Italian Scooter (Vespa) silhouette */}
              <circle cx="90" cy="420" r="14" />
              <circle cx="150" cy="420" r="14" />
              <path d="M90,410 L120,400 L140,360 L148,360 L145,410 Z" />
            </svg>
          </div>

          {/* Bottom Tuscan Rolling Hills */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-24 text-amber-950/[0.08] fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M0,50 Q250,20 500,55 Q750,20 1000,50 L1000,100 L0,100 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. 🇧🇷 PORTUGUÉS (Río, Pan de Azúcar, Palmeras, Olas y Lisboa)      */}
      {/* =================================================================== */}
      {isPortuguese && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0FDF4] via-[#ECFEFF]/90 to-[#E0F2FE]">
          {/* Tropical Atlantic Ocean & golden coast glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(14,165,233,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_65%,rgba(34,197,94,0.15),transparent_50%)]" />

          {/* Airmail stamp: Correio Aéreo Brasil / Portugal */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-teal-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/60 backdrop-blur-xs rotate-2">
            <span className="text-2xl">🇧🇷</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-teal-900/60 uppercase">Correio Aéreo</div>
              <div className="text-[11px] font-black text-slate-700/70">Rio & Lisboa • A1 ➔ C1</div>
            </div>
          </div>

          {/* Left Silhouette: Sugarloaf Mountain (Pão de Açúcar) & Cable Car */}
          <div className="absolute top-[16%] left-0 w-44 sm:w-56 h-[500px] opacity-[0.14] text-teal-950">
            <svg viewBox="0 0 240 500" className="w-full h-full fill-current">
              {/* Sugarloaf Distinctive Rounded Mountain Peak */}
              <path d="M10,420 Q60,180 130,160 Q200,180 230,420 Z" />
              {/* Cable car rope & bondinho */}
              <line x1="40" y1="180" x2="220" y2="280" stroke="currentColor" strokeWidth="3" />
              <rect x="110" y="220" width="22" height="15" rx="3" />
              <line x1="121" y1="210" x2="121" y2="220" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Right Silhouette: Tropical Coconut Palm Trees & Belém Tower */}
          <div className="absolute top-[36%] right-0 w-40 sm:w-52 h-[550px] opacity-[0.13] text-teal-950">
            <svg viewBox="0 0 200 550" className="w-full h-full fill-current">
              {/* Curved Palm Tree Trunk */}
              <path d="M150,500 Q110,350 130,220" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Palm Fronds radiating from top */}
              <path d="M130,220 Q80,180 50,220" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M130,220 Q100,150 140,140" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M130,220 Q160,160 190,200" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M130,220 Q180,210 195,260" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M130,220 Q110,230 70,270" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Belém Tower dome / turret */}
              <rect x="60" y="380" width="60" height="70" rx="3" />
              <polygon points="50,380 90,340 130,380" />
            </svg>
          </div>

          {/* Bottom Wave Mosaic (Copacabana Calçadão style waves) */}
          <svg className="absolute bottom-0 inset-x-0 w-full h-24 text-teal-950/[0.08] fill-current" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M0,60 Q125,20 250,60 T500,60 T750,60 T1000,60 L1000,100 L0,100 Z" />
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. 🇰🇷 COREANO (Seúl, N Seoul Tower, Palacios Hanok y Flores de Cerezo) */}
      {/* =================================================================== */}
      {isKorean && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F3FF] via-[#EDE9FE]/70 to-[#FAF5FF]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,180,254,0.35),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(165,180,252,0.3),transparent_60%)]" />

          {/* Airmail Badge */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-purple-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs">
            <span className="text-2xl">🇰🇷</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-purple-900/60 uppercase">Tuddy Seoul Airmail</div>
              <div className="text-[11px] font-black text-slate-700/70">Seúl • Hangeul A1 ➔ C1</div>
            </div>
          </div>

          {/* Floating Cherry Blossom Petals */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2.5 h-3 bg-pink-300 rounded-full"
                style={{
                  left: `${(i * 9 + 4) % 94}%`,
                  top: `${(i * 12 + 8) % 88}%`,
                  transform: "rotate(25deg)",
                }}
                animate={{
                  y: [0, 40, 0],
                  x: [0, 15, 0],
                  rotate: [20, 60, 20],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          {/* Left Silhouette: N Seoul Tower on Mountain Peak */}
          <div className="absolute top-[20%] left-0 w-44 sm:w-56 h-[520px] opacity-[0.14] text-purple-950">
            <svg viewBox="0 0 200 600" className="w-full h-full fill-current">
              <path d="M0,450 Q60,340 100,320 Q140,340 200,450 Z" />
              <rect x="96" y="160" width="8" height="160" />
              <circle cx="100" cy="190" r="18" />
              <line x1="100" y1="160" x2="100" y2="100" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. 🇨🇳 CHINO MANDARÍN (La Gran Muralla, Farolillos Rojos y Montañas) */}
      {/* =================================================================== */}
      {isChinese && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF1F2] via-[#FFE4E6]/60 to-[#FFF7ED]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(254,205,211,0.4),transparent_55%)]" />

          {/* Airmail Badge */}
          <div className="absolute top-6 right-6 border-2 border-dashed border-rose-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs">
            <span className="text-2xl">🇨🇳</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-rose-900/60 uppercase">Dynasty Sky Express</div>
              <div className="text-[11px] font-black text-slate-700/70">Beijing • A1 ➔ C1 Route</div>
            </div>
          </div>

          {/* Hanging Red Lanterns Silhouette */}
          <div className="absolute top-0 right-16 w-20 h-48 opacity-[0.18] text-red-900">
            <svg viewBox="0 0 100 200" className="w-full h-full fill-current">
              <line x1="50" y1="0" x2="50" y2="60" stroke="currentColor" strokeWidth="3" />
              <ellipse cx="50" cy="90" rx="30" ry="36" />
              <line x1="50" y1="126" x2="50" y2="160" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>

          {/* Great Wall Steps Silhouette on the left */}
          <div className="absolute bottom-0 left-0 w-52 sm:w-64 h-[420px] opacity-[0.14] text-rose-950">
            <svg viewBox="0 0 300 450" className="w-full h-full fill-current">
              <path d="M0,450 L0,320 L50,300 L90,310 L140,260 L180,270 L240,210 L300,220 L300,450 Z" />
              <rect x="130" y="240" width="30" height="25" />
              <rect x="230" y="190" width="30" height="25" />
            </svg>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. 🇷🇺 RUSO (Cúpulas de Bulbo de San Basilio y Nieve Brillante) */}
      {/* =================================================================== */}
      {isRussian && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE]/65 to-[#EFF6FF]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(186,230,253,0.4),transparent_55%)]" />

          <div className="absolute top-6 right-6 border-2 border-dashed border-sky-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs">
            <span className="text-2xl">🇷🇺</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-sky-900/60 uppercase">Imperial Frost Flight</div>
              <div className="text-[11px] font-black text-slate-700/70">Moscú • A1 ➔ C1 Route</div>
            </div>
          </div>

          {/* Saint Basil Onion Domes Silhouette */}
          <div className="absolute top-[25%] left-0 w-48 sm:w-60 h-[480px] opacity-[0.15] text-sky-950">
            <svg viewBox="0 0 250 500" className="w-full h-full fill-current">
              {/* Central high tower with spire */}
              <polygon points="125,80 110,180 140,180" />
              <rect x="110" y="180" width="30" height="320" />
              {/* Left onion dome */}
              <path d="M60,200 Q40,240 60,260 Q80,240 60,200 Z" />
              <rect x="45" y="260" width="30" height="240" />
              {/* Right onion dome */}
              <path d="M190,200 Q170,240 190,260 Q210,240 190,200 Z" />
              <rect x="175" y="260" width="30" height="240" />
            </svg>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. 🇸🇦 ÁRABE (Dunas Doradas, Media Luna y Oasis) */}
      {/* =================================================================== */}
      {isArabic && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7]/60 to-[#FDF6E2]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(253,230,138,0.4),transparent_55%)]" />

          <div className="absolute top-6 right-6 border-2 border-dashed border-amber-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs">
            <span className="text-2xl">🇸🇦</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-amber-900/60 uppercase">Oasis Desert Flight</div>
              <div className="text-[11px] font-black text-slate-700/70">Arabia • A1 ➔ C1 Route</div>
            </div>
          </div>

          {/* Crescent Moon in Sky */}
          <div className="absolute top-12 left-12 w-14 h-14 opacity-[0.2] text-amber-800">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M50,10 A40,40 0 1,0 90,50 A30,30 0 1,1 50,10 Z" />
            </svg>
          </div>

          {/* Desert Dunes Silhouettes */}
          <div className="absolute bottom-0 inset-x-0 h-40 opacity-[0.14] text-amber-900">
            <svg viewBox="0 0 1000 200" className="w-full h-full fill-current" preserveAspectRatio="none">
              <path d="M0,120 Q200,40 450,100 Q700,160 1000,80 L1000,200 L0,200 Z" />
            </svg>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. 🌍 VUELO GLOBAL PRO (Para Holandés, Sueco, Griego, Turco, etc.) */}
      {/* =================================================================== */}
      {isOther && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9]/75 to-[#EFF6FF]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(199,210,254,0.3),transparent_60%)]" />

          <div className="absolute top-6 right-6 border-2 border-dashed border-indigo-400/40 rounded-2xl p-3 flex items-center gap-2.5 bg-white/50 backdrop-blur-xs">
            <span className="text-2xl">🌍</span>
            <div>
              <div className="text-[9px] font-black tracking-widest text-indigo-900/60 uppercase">World Tour Express</div>
              <div className="text-[11px] font-black text-slate-700/70">{language} • A1 ➔ C1</div>
            </div>
          </div>

          {/* Compass Rose Silhouettes */}
          <div className="absolute top-20 left-10 w-24 h-24 opacity-[0.12] text-indigo-900">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <polygon points="50,10 56,44 90,50 56,56 50,90 44,56 10,50 44,44" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* World Horizon Latitude Lines */}
          <div className="absolute bottom-0 inset-x-0 h-48 opacity-[0.08] text-slate-900">
            <svg viewBox="0 0 1000 240" className="w-full h-full stroke-current fill-none" strokeWidth="2" preserveAspectRatio="none">
              <path d="M0,180 Q500,80 1000,180" />
              <path d="M0,210 Q500,120 1000,210" />
              <path d="M0,240 Q500,160 1000,240" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
