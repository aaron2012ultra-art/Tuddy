import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Smartphone, Monitor, Share, PlusSquare, CheckCircle2, X, Sparkles } from "lucide-react";
import { usePWAInstall } from "../utils/usePWAInstall";
import { useTranslation } from "../utils/translations";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useTranslation();
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-[#E8E2D9] relative overflow-hidden"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFB7B2] to-[#FFE2DE] border border-[#FFA5A0] flex items-center justify-center text-2xl shadow-xs">
              🐰
            </div>
            <div>
              <h3 className="text-lg font-black text-[#4A4A4A] tracking-tight font-heading">
                {t.installApp || "Instalar Tuddy en tu Dispositivo"}
              </h3>
              <p className="text-xs text-[#7A7A7A]">
                {t.installAppDesc || "Úsala como una app nativa sin barras de navegador"}
              </p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="bg-[#FDF9F3] rounded-2xl p-4 border border-[#E8E2D9] space-y-2.5 mb-5 text-xs text-[#4A4A4A]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Acceso directo:</strong> Ícono en tu pantalla de inicio o cajón de aplicaciones de tu celular.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Experiencia pantalla completa:</strong> Sin barras de direcciones ni marcos de navegador.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Notificaciones nativas:</strong> Alertas de duelos y rachas directo a tu pantalla de bloqueo.</span>
            </div>
          </div>

          {/* Condition: Already installed */}
          {isInstalled || installSuccess ? (
            <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">
                {t.installedPwa || "¡Tuddy ya está instalada!"}
              </h4>
              <p className="text-xs text-emerald-700 mt-1">
                Puedes abrirla directamente desde el icono en tu pantalla de inicio.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                {t.close || "Entendido"}
              </button>
            </div>
          ) : isInstallable ? (
            // Native prompt flow (Chrome / Edge / Android)
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? "Instalando..." : "📲 Instalar en mi Celular / PC"}</span>
              </button>
              <p className="text-[11px] text-center text-[#7A7A7A]">
                Compatible con Android, Windows, Mac, Linux y Chromebook.
              </p>
            </div>
          ) : isIOS ? (
            // iOS Safari guide
            <div className="space-y-3">
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  {t.iosInstallGuideTitle || "Instalación en iPhone / iPad:"}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-sky-900 leading-relaxed">
                  <li>
                    Pulsa el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline text-sky-700" /> en la barra inferior de Safari.
                  </li>
                  <li>
                    Baja en las opciones y selecciona <strong>"Añadir a pantalla de inicio"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-sky-700" />.
                  </li>
                  <li>
                    Toca <strong>"Añadir"</strong> arriba a la derecha. ¡Listo!
                  </li>
                </ol>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                {t.close || "Cerrar"}
              </button>
            </div>
          ) : (
            // Desktop browser menu guide fallback
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-amber-600" />
                  Instalar desde tu navegador:
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Haz clic en el icono de <strong>Instalar</strong> en la barra de direcciones de tu navegador (arriba a la derecha), o abre el menú ⋮ y pulsa <strong>"Instalar Tuddy"</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                {t.close || "Cerrar"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
