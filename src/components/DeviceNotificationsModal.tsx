import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  X, 
  Bell, 
  Smartphone, 
  Check, 
  AlertCircle, 
  Swords, 
  MessageCircle, 
  Gift, 
  Flame,
  Send,
  Sparkles
} from "lucide-react";
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendTestNotificationToDevice, 
  getStoredNotificationSettings, 
  saveNotificationSettings,
  DeviceNotificationSettings 
} from "../utils/deviceNotification";
import confetti from "canvas-confetti";

interface DeviceNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceNotificationsModal: React.FC<DeviceNotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<DeviceNotificationSettings>(getStoredNotificationSettings());
  const [testSent, setTestSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
      setSettings(getStoredNotificationSettings());
      setTestSent(false);
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      setStatusMessage("¡Permiso concedido en este celular! Ya recibirás avisos del sistema.");
      confetti({ particleCount: 35, spread: 60 });
    } else {
      setStatusMessage("El permiso fue denegado o cerrado. Puedes activarlo en los ajustes del navegador de tu celular.");
    }
  };

  const handleSendTestNotification = async () => {
    setStatusMessage("Enviando notificación al sistema de tu celular...");
    const success = await sendTestNotificationToDevice();
    setPermission(getNotificationPermission());
    if (success) {
      setTestSent(true);
      setStatusMessage("¡Notificación enviada a tu celular! Revisa la barra de estado superior o la pantalla de bloqueo de tu teléfono 📲✨");
      confetti({ particleCount: 40, spread: 60 });
      setTimeout(() => setTestSent(false), 4000);
    } else {
      setStatusMessage("No se pudo enviar. Asegúrate de permitir las notificaciones en este celular.");
    }
  };

  const handleToggle = (key: keyof DeviceNotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDF9F3] w-full max-w-lg rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📲
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                Notificaciones al Celular
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full uppercase font-bold">
                  Directo al Teléfono
                </span>
              </h2>
              <p className="text-xs text-sky-100">
                Llegan a la pantalla de bloqueo y barra de estado de tu móvil
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Permission Status Box */}
          <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            permission === "granted"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : permission === "denied"
              ? "bg-rose-50 border-rose-300 text-rose-950"
              : "bg-amber-50 border-amber-300 text-amber-950"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                permission === "granted" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"
              }`}>
                {permission === "granted" ? "✓" : "🔔"}
              </div>
              <div>
                <span className="text-xs font-black block">
                  {permission === "granted"
                    ? "Notificaciones Permitidas en este Dispositivo"
                    : permission === "denied"
                    ? "Notificaciones Bloqueadas en el Navegador"
                    : "Permiso de Notificación Pendiente"}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {permission === "granted"
                    ? "Tu celular recibirá vibraciones y alertas del sistema de Tuddy."
                    : "Necesitas pulsar 'Activar' para que lleguen a la barra de tu móvil."}
                </span>
              </div>
            </div>

            {permission !== "granted" ? (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
              >
                Activar en Celular
              </button>
            ) : (
              <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full text-xs font-black shrink-0">
                Activo 📲
              </span>
            )}
          </div>

          {/* Test Notification Button */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#E8E2D9] shadow-xs text-center space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              ¿Quieres probar cómo suena y vibra en tu celular?
            </h3>
            <p className="text-xs text-slate-500">
              Enviaremos una notificación de prueba directamente a la barra de estado y pantalla de bloqueo de tu dispositivo móvil.
            </p>

            <button
              type="button"
              onClick={handleSendTestNotification}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                testSent
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-105 text-white"
              }`}
            >
              {testSent ? <Check className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              <span>{testSent ? "¡Notificación Enviada a tu Móvil!" : "📲 Enviar Notificación de Prueba a mi Celular"}</span>
            </button>

            {statusMessage && (
              <p className="text-[11px] font-bold text-indigo-700 pt-1">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Preferences Toggles */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#E8E2D9] shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Alertas que llegarán a tu celular</span>
              <span className="text-[10px] text-slate-400 normal-case font-normal">Personalizable</span>
            </h3>

            <div className="space-y-2.5">
              {/* Toggle 1: Duels */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                    <Swords className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Duelos de Estudio</span>
                    <span className="text-[10px] text-slate-500">Cuando un amigo te reta o acepta tu duelo</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.duelChallenges}
                  onChange={() => handleToggle("duelChallenges")}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Toggle 2: Messages */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Mensajes en Chat</span>
                    <span className="text-[10px] text-slate-500">Nuevos mensajes o fichas compartidas</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.friendMessages}
                  onChange={() => handleToggle("friendMessages")}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Toggle 3: Pet care & carrots */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Cuidado de Mascota</span>
                    <span className="text-[10px] text-slate-500">Cuando alguien acaricia a tu conejito o le regala zanahorias</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.petCareGifts}
                  onChange={() => handleToggle("petCareGifts")}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Toggle 4: Study streak */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">Recordatorio de Racha</span>
                    <span className="text-[10px] text-slate-500">Aviso para no perder tus días continuos de estudio</span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={settings.studyStreakReminders}
                  onChange={() => handleToggle("studyStreakReminders")}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
