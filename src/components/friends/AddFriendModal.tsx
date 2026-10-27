import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  X, 
  UserPlus, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  BookOpen, 
  Flame,
  Share2,
  Users,
  ShieldCheck
} from "lucide-react";
import { FriendItem } from "../../types";
import { getUserFriendCode, addFriendByCodeOrName } from "../../utils/friendsStorage";
import confetti from "canvas-confetti";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: (friend: FriendItem) => void;
  existingFriends: FriendItem[];
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onFriendAdded,
  existingFriends,
}) => {
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const userCode = getUserFriendCode();

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAddByInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!friendCodeInput.trim()) return;

    const result = addFriendByCodeOrName(friendCodeInput);
    if (result.success && result.friend) {
      setFeedback({ type: "success", text: result.message });
      setFriendCodeInput("");
      confetti({ particleCount: 40, spread: 60 });
      onFriendAdded(result.friend);
    } else {
      setFeedback({ type: "error", text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDF9F3] w-full max-w-xl rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-white px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#4A4A4A] tracking-tight">
                Añadir Compañero de Estudio
              </h2>
              <p className="text-xs text-[#7A7A7A]">
                Conecta mediante Código de Amigo con tus compañeros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Your Own Friend Code Card */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#FFB7B2] rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Tu Código Único de Amigo
              </span>
              <div className="text-2xl font-black tracking-widest font-mono">
                {userCode}
              </div>
              <p className="text-xs text-amber-100 mt-1">
                Comparte este código con tus compañeros para que te agreguen y estudien juntos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-2xl bg-white text-orange-950 font-black text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-orange-600" />}
              <span>{copiedCode ? "¡Copiado!" : "Copiar Código"}</span>
            </button>
          </div>

          {/* Add by Code Input */}
          <form onSubmit={handleAddByInput} className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              Introduce el Código de Amigo o Nombre de tu compañero:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={friendCodeInput}
                  onChange={(e) => setFriendCodeInput(e.target.value)}
                  placeholder="Ej: TUDDY-8921 o nombre del compañero..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]"
                />
              </div>

              <button
                type="submit"
                disabled={!friendCodeInput.trim()}
                className="px-5 py-2.5 rounded-2xl bg-[#FFB7B2] hover:bg-[#ff9d96] disabled:opacity-50 text-white text-xs font-black shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Conectar
              </button>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl text-xs font-bold ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {feedback.text}
              </motion.div>
            )}
          </form>

          {/* How Friend Codes Work Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E2D9] space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-black text-slate-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>¿Cómo funciona la conexión con amigos?</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-slate-500 pl-1">
              <li>Pídele a tu compañero su código de amigo personal de Tuddy (formato <strong>TUDDY-XXXX</strong>).</li>
              <li>Al introducirlo, se enlazará a tu lista de amigos para compartir fichas, notas y retarse a duelos.</li>
              <li>Ambos recibirán notificaciones en sus celulares cuando se envíen retos o mensajes.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
