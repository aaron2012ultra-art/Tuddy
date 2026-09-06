import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Globe, Volume2, Clock, Trash2, Check, Sparkles, ShieldAlert, User, Cloud } from "lucide-react";
import { AppSettings, UserAccount } from "../types";
import { TRANSLATIONS, LanguageCode } from "../utils/translations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onResetAllData: () => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

const AVAILABLE_LANGUAGES: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: "es", name: "Español", nativeName: "Español", flag: "🇪🇸" },
  { code: "en", name: "Inglés", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "Francés", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "Alemán", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japonés", nativeName: "日本語", flag: "🇯🇵" },
  { code: "pt", name: "Portugués", nativeName: "Português", flag: "🇧🇷" },
  { code: "it", name: "Italiano", nativeName: "Italiano", flag: "🇮🇹" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData,
  currentUser,
  onOpenAuthModal,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Synchronize when opened
  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setShowResetConfirm(false);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[localSettings.language] || TRANSLATIONS.es;

  const handleLanguageChange = (lang: LanguageCode) => {
    const updated = { ...localSettings, language: lang };
    setLocalSettings(updated);
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleToggleSound = () => {
    const updated = { ...localSettings, soundEffects: !localSettings.soundEffects };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleSpeedChange = (speed: number) => {
    const updated = { ...localSettings, speechSpeed: speed };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handlePomodoroChange = (work: number, rest: number) => {
    const updated = { ...localSettings, pomodoroWorkMinutes: work, pomodoroBreakMinutes: rest };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border-2 border-[#E8E2D9] relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0284C7]">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#4A4A4A]">{t.settings}</h2>
              <p className="text-xs text-[#7A7A7A]">Personaliza tu experiencia de estudio con Tuddy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#7A7A7A] hover:bg-[#F8F9FA] hover:text-[#4A4A4A] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 py-4 space-y-6 pr-1">
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium"
            >
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Ajustes guardados instantáneamente</span>
            </motion.div>
          )}

          {/* 1. SELECCIÓN DE IDIOMA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#0284C7]" />
                {t.languageSettingTitle}
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700">
                {AVAILABLE_LANGUAGES.find((l) => l.code === localSettings.language)?.flag}{" "}
                {AVAILABLE_LANGUAGES.find((l) => l.code === localSettings.language)?.nativeName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = localSettings.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-[#E0F2FE] border-[#0284C7] shadow-xs text-[#0369A1] font-bold ring-2 ring-sky-200"
                        : "bg-[#FDFBF7] border-[#E8E2D9] text-[#4A4A4A] hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl select-none">{lang.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">{lang.nativeName}</p>
                      <p className="text-[10px] text-[#7A7A7A] truncate">{lang.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. EFECTOS & CONFETI */}
          <div className="pt-2 border-t border-[#E8E2D9]/60">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {t.soundEffects}
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#E8E2D9]">
              <div className="pr-4">
                <p className="text-xs font-semibold text-[#4A4A4A]">Animaciones de celebración y confeti</p>
                <p className="text-[11px] text-[#7A7A7A]">Muestra lluvia de confeti y animaciones cuando apruebas retos.</p>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  localSettings.soundEffects ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                }`}
              >
                <motion.div
                  layout
                  className="w-4 h-4 rounded-full bg-white shadow-xs"
                />
              </button>
            </div>
          </div>

          {/* 3. VELOCIDAD DE PRONUNCIACIÓN */}
          <div className="pt-2 border-t border-[#E8E2D9]/60">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] flex items-center gap-2 mb-3">
              <Volume2 className="h-4 w-4 text-purple-500" />
              {t.speechSpeed}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { speed: 0.8, label: "Lenta (0.8x)", hint: "Para captar cada fonema" },
                { speed: 1.0, label: "Normal (1.0x)", hint: "Conversación natural" },
                { speed: 1.2, label: "Rápida (1.2x)", hint: "Oído avanzado nativo" },
              ].map((item) => (
                <button
                  key={item.speed}
                  type="button"
                  onClick={() => handleSpeedChange(item.speed)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    localSettings.speechSpeed === item.speed
                      ? "bg-purple-50 border-purple-500 text-purple-800 font-bold ring-2 ring-purple-200"
                      : "bg-[#FDFBF7] border-[#E8E2D9] text-[#4A4A4A] hover:bg-white"
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-[#7A7A7A] mt-0.5">{item.hint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. PREFERENCIA DE POMODORO */}
          <div className="pt-2 border-t border-[#E8E2D9]/60">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-orange-500" />
              {t.pomodoroConfig}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { work: 25, rest: 5, label: "Clásico: 25 / 5 min" },
                { work: 50, rest: 10, label: "Profundo: 50 / 10 min" },
                { work: 15, rest: 3, label: "Exprés: 15 / 3 min" },
              ].map((cfg) => {
                const isSelected =
                  localSettings.pomodoroWorkMinutes === cfg.work &&
                  localSettings.pomodoroBreakMinutes === cfg.rest;
                return (
                  <button
                    key={cfg.work}
                    type="button"
                    onClick={() => handlePomodoroChange(cfg.work, cfg.rest)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? "bg-orange-50 border-orange-500 text-orange-800 font-bold ring-2 ring-orange-200"
                        : "bg-[#FDFBF7] border-[#E8E2D9] text-[#4A4A4A] hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold">{cfg.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. CUENTA Y RESPALDO EN LA NUBE */}
          <div className="pt-4 border-t border-[#E8E2D9]">
            <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <span>Cuenta & Sincronización</span>
                      {currentUser?.isVerified && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Activa
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-sky-800 leading-relaxed mt-0.5">
                      {currentUser
                        ? `Conectado como ${currentUser.displayName} (${currentUser.provider.toUpperCase()}). Tus datos se respaldan en la nube.`
                        : "Estás usando Tuddy en Modo Invitado. Puedes crear una cuenta opcional con correo, teléfono, Google, GitHub, Apple o Facebook para no perder tu progreso."}
                    </p>
                  </div>
                </div>

                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{currentUser ? "Ver Perfil" : "Crear Cuenta"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 6. VACIAR TODOS LOS DATOS (Reinicio Limpio) */}
          <div className="pt-4 border-t border-rose-100">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-rose-900">Empezar con la App Vacía</h4>
                  <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                    ¿Deseas vaciar todas las fichas, notas y materias de prueba para llenar la app tú mismo desde cero?
                  </p>

                  {!showResetConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.clearAllData}</span>
                    </button>
                  ) : (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-rose-300 space-y-2">
                      <p className="text-xs text-rose-950 font-bold">
                        ⚠️ ¿Confirmas que deseas vaciar todos los datos de prueba?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onResetAllData();
                            setShowResetConfirm(false);
                            onClose();
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                        >
                          Sí, vaciar app ahora
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(false)}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                        >
                          {t.cancel}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E8E2D9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#FFB7B2] hover:bg-[#FFA5A0] text-slate-800 font-bold text-xs shadow-xs transition-all hover:scale-102"
          >
            {t.close}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
