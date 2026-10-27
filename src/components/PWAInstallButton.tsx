import React, { useState } from "react";
import { Download, Smartphone, Check } from "lucide-react";
import { usePWAInstall } from "../utils/usePWAInstall";
import { useTranslation } from "../utils/translations";
import { PWAInstallModal } from "./PWAInstallModal";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "header" | "pill" | "banner";
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = "",
  variant = "header",
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode (installed), render a discreet badge if requested, or return null in header
  if (isInstalled) {
    if (variant === "header") {
      return (
        <div 
          className={`hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-bold ${className}`}
          title="App Tuddy instalada y lista"
        >
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>App Instalada</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    // If native prompt is ready and not on iOS, trigger prompt or show modal
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === "banner") {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>{t.installApp || "Instalar App"}</span>
        </button>
        <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        id="top-nav-pwa-install-btn"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
          isInstallable
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-600 hover:brightness-105 animate-pulse"
            : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
        } ${className}`}
        title="Instalar Tuddy como aplicación en tu celular o computadora"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-extrabold">{t.installApp || "Instalar App"}</span>
        <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-black uppercase hidden sm:inline">
          PWA
        </span>
      </button>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
