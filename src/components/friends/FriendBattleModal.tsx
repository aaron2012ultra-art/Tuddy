import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Swords, 
  Trophy, 
  Timer, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Clock,
  Check,
  Send,
  Smartphone
} from "lucide-react";
import { FriendItem, PetCustomization } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";
import { 
  createDuelChallenge, 
  setDuelAcceptedByFriend, 
  completeDuelChallenge 
} from "../../utils/friendsStorage";
import { notifyDuelAccepted } from "../../utils/deviceNotification";
import confetti from "canvas-confetti";

interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DEFAULT_BATTLE_QUESTIONS: BattleQuestion[] = [
  {
    question: "¿Cuál es la función principal de la mitocondria en la célula eucariota?",
    options: [
      "Síntesis de proteínas",
      "Producción de ATP (respiración celular)",
      "Digestión celular",
      "Almacenamiento de agua",
    ],
    correctIndex: 1,
    explanation: "La mitocondria es conocida como la central energética celular donde ocurre la respiración celular y producción de ATP.",
  },
  {
    question: "¿En qué año comenzó la Revolución Francesa con la toma de la Bastilla?",
    options: ["1776", "1789", "1804", "1812"],
    correctIndex: 1,
    explanation: "La Revolución Francesa inició en 1789 con la histórica toma de la Bastilla el 14 de julio.",
  },
  {
    question: "¿Cuál es el valor del número Pi (π) aproximado a dos cifras decimales?",
    options: ["3.12", "3.14", "3.16", "3.18"],
    correctIndex: 1,
    explanation: "El valor de Pi es aproximadamente 3.14159, redondeado comúnmente a 3.14.",
  },
  {
    question: "¿Cuál de estos elementos químicos tiene el símbolo 'Au' en la tabla periódica?",
    options: ["Plata", "Oro", "Cobre", "Hierro"],
    correctIndex: 1,
    explanation: "Au proviene del latín 'Aurum', que significa oro.",
  },
  {
    question: "¿Cómo se llama la figura retórica que consiste en exagerar desmesuradamente la realidad?",
    options: ["Metáfora", "Hipérbole", "Anáfora", "Paradoja"],
    correctIndex: 1,
    explanation: "La hipérbole es una exageración intencionada para dar mayor fuerza expresiva a un mensaje.",
  },
];

type BattleStage = "waiting_acceptance" | "accepted_countdown" | "in_battle" | "finished";

interface FriendBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem;
  userPet: PetCustomization;
  onRewardCarrot?: (amount: number) => void;
  onBattleFinish?: (winner: "user" | "friend" | "tie", scoreUser: number, scoreFriend: number) => void;
  autoAccepted?: boolean;
}

export const FriendBattleModal: React.FC<FriendBattleModalProps> = ({
  isOpen,
  onClose,
  friend,
  userPet,
  onRewardCarrot,
  onBattleFinish,
  autoAccepted = false,
}) => {
  const [stage, setStage] = useState<BattleStage>("waiting_acceptance");
  const [countdown, setCountdown] = useState(3);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scoreUser, setScoreUser] = useState(0);
  const [scoreFriend, setScoreFriend] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [friendChoice, setFriendChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [friendAcceptanceText, setFriendAcceptanceText] = useState("");

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setScoreUser(0);
      setScoreFriend(0);
      setSelectedOption(null);
      setFriendChoice(null);
      setIsAnswered(false);
      setTimerSeconds(15);
      setCountdown(3);

      if (autoAccepted) {
        setStage("accepted_countdown");
      } else {
        setStage("waiting_acceptance");
        setFriendAcceptanceText("");
        // Create duel invitation challenge
        createDuelChallenge(friend.id, friend.favoriteSubject || "Conocimiento General");

        // Simulate friend receiving the invitation and accepting
        const timer = setTimeout(() => {
          setDuelAcceptedByFriend(friend.id);
          notifyDuelAccepted(friend.name);
          setFriendAcceptanceText(
            `¡${friend.name} ha aceptado el duelo! "¡Acepto el reto de 5 preguntas sobre ${friend.favoriteSubject || "estudio general"}! ¡Que gane el mejor! 🐰🔥"`
          );
        }, 2200);

        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, friend, autoAccepted]);

  // Countdown timer when duel is accepted
  useEffect(() => {
    if (stage === "accepted_countdown") {
      if (countdown > 1) {
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 1) {
        const timer = setTimeout(() => {
          setStage("in_battle");
          setTimerSeconds(15);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, countdown]);

  // Question countdown timer in battle
  useEffect(() => {
    if (!isOpen || stage !== "in_battle" || isAnswered) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleSelectOption(-1); // Timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, stage, currentIdx, isAnswered]);

  if (!isOpen) return null;

  const currentQ = DEFAULT_BATTLE_QUESTIONS[currentIdx];

  const handleStartCountdown = () => {
    setStage("accepted_countdown");
    setCountdown(3);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(idx);

    // Simulate friend's answer (smart student, 80% chance of correct)
    const friendCorrect = Math.random() < 0.8;
    const friendAnswer = friendCorrect
      ? currentQ.correctIndex
      : (currentQ.correctIndex + 1) % currentQ.options.length;
    setFriendChoice(friendAnswer);

    const userIsCorrect = idx === currentQ.correctIndex;
    if (userIsCorrect) setScoreUser((prev) => prev + 1);
    if (friendCorrect) setScoreFriend((prev) => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < DEFAULT_BATTLE_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setFriendChoice(null);
      setIsAnswered(false);
      setTimerSeconds(15);
    } else {
      // Battle finished
      setStage("finished");
      const winner = scoreUser > scoreFriend ? "user" : scoreUser < scoreFriend ? "friend" : "tie";
      if (winner === "user") {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        if (onRewardCarrot) onRewardCarrot(15);
      } else if (onRewardCarrot) {
        onRewardCarrot(5); // Consolation prize
      }
      completeDuelChallenge(friend.id, scoreUser, scoreFriend);
      if (onBattleFinish) onBattleFinish(winner, scoreUser, scoreFriend);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDF9F3] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-200" />
            <h2 className="text-base font-black tracking-tight">Duelo de Fichas (5 Preguntas)</h2>
            {stage === "in_battle" && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                Pregunta {currentIdx + 1} de {DEFAULT_BATTLE_QUESTIONS.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STAGE 1: WAITING FOR FRIEND TO ACCEPT DUEL */}
        {stage === "waiting_acceptance" && (
          <div className="p-6 sm:p-8 text-center space-y-6 overflow-y-auto">
            <div className="flex items-center justify-center gap-4 py-3">
              <div className="flex flex-col items-center">
                <div className="w-18 h-18 rounded-2xl bg-[#FFB7B2] p-1 flex items-center justify-center border-2 border-white shadow-md">
                  <PetAvatar pet={userPet} size="sm" />
                </div>
                <span className="text-xs font-black text-slate-800 mt-1">{userPet.name} (Tú)</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-base font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                  ⚔️ VS ⚔️
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-1">5 Preguntas</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-18 h-18 rounded-2xl bg-[#B2E2F2] p-1 flex items-center justify-center border-2 border-white shadow-md relative">
                  <PetAvatar pet={friend.pet} size="sm" />
                  <span className="w-4 h-4 rounded-full bg-purple-500 absolute -bottom-1 -right-1 border-2 border-white animate-pulse" />
                </div>
                <span className="text-xs font-black text-slate-800 mt-1">{friend.name}</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border-2 border-[#E8E2D9] shadow-xs space-y-3 max-w-md mx-auto">
              {!friendAcceptanceText ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-orange-600 font-black text-sm">
                    <Clock className="w-4 h-4 animate-spin text-orange-500" />
                    <span>Esperando que {friend.name} acepte el duelo...</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Se ha enviado la notificación de desafío al celular y perfil de {friend.name}. El combate iniciará tan pronto como confirme su participación.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Alerta enviada a la pantalla de bloqueo</span>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>¡Duelo Aceptado por {friend.name}!</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-amber-50 p-3 rounded-2xl border border-amber-200 font-medium italic">
                    {friendAcceptanceText}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Actions: Start battle if accepted or force start */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancelar Reto
              </button>

              <button
                type="button"
                onClick={handleStartCountdown}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-105 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>{friendAcceptanceText ? "¡Entrar a la Batalla Ahora! ➔" : "Aceptar Duelo y Comenzar ➔"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: COUNTDOWN 3, 2, 1 */}
        {stage === "accepted_countdown" && (
          <div className="p-10 text-center space-y-4 my-auto">
            <span className="text-xs uppercase font-black tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              ¡Duelo Aceptado! Prepárate
            </span>
            <div className="text-7xl font-black text-amber-500 font-mono animate-bounce drop-shadow-md">
              {countdown}
            </div>
            <p className="text-xs text-slate-500">
              5 preguntas de agilidad mental • 15 segundos por pregunta
            </p>
          </div>
        )}

        {/* STAGE 3: IN BATTLE */}
        {stage === "in_battle" && (
          <>
            {/* Scoreboard VS Bar */}
            <div className="bg-white px-6 py-3 border-b border-[#E8E2D9] flex items-center justify-between">
              {/* User Side */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFB7B2] flex items-center justify-center overflow-hidden border border-[#FFB7B2] shadow-xs">
                  <PetAvatar pet={userPet} size="xs" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 block">Tú ({userPet.name})</span>
                  <span className="text-sm font-black text-orange-600">{scoreUser} pts</span>
                </div>
              </div>

              {/* VS Center */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200">
                  VS
                </span>
                <span className="text-[11px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {timerSeconds}s
                </span>
              </div>

              {/* Friend Side */}
              <div className="flex items-center gap-2.5 text-right">
                <div>
                  <span className="text-xs font-black text-slate-800 block">{friend.name}</span>
                  <span className="text-sm font-black text-indigo-600">{scoreFriend} pts</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#B2E2F2] flex items-center justify-center overflow-hidden border border-[#B2E2F2] shadow-xs">
                  <PetAvatar pet={friend.pet} size="xs" />
                </div>
              </div>
            </div>

            {/* Questions & Options Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Question Text */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#E8E2D9] shadow-xs text-center">
                <span className="text-[10px] uppercase font-black tracking-wider text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Reto Rápido
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const isFriendPick = isAnswered && friendChoice === idx;

                  let btnStyle = "bg-white hover:bg-slate-50 text-slate-800 border-[#E8E2D9]";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md font-black";
                    } else if (isSelected) {
                      btnStyle = "bg-rose-500 text-white border-rose-600";
                    } else {
                      btnStyle = "bg-slate-50 text-slate-400 border-slate-200 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border-2 text-left text-xs font-bold transition-all relative cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white shrink-0" />}
                      </div>

                      {isFriendPick && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full font-black mt-2 inline-block">
                          {friend.name} eligió esto
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                  <p className="text-xs text-amber-950 font-medium">
                    💡 <strong>Explicación:</strong> {currentQ.explanation}
                  </p>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>{currentIdx + 1 < DEFAULT_BATTLE_QUESTIONS.length ? "Siguiente Pregunta" : "Ver Resultados"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* STAGE 4: RESULTS */}
        {stage === "finished" && (
          <div className="text-center py-8 p-6 space-y-5 overflow-y-auto">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
              {scoreUser > scoreFriend ? "🏆" : scoreUser === scoreFriend ? "🤝" : "🥈"}
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-800">
                {scoreUser > scoreFriend
                  ? "¡Victoria! ¡Has ganado el duelo!"
                  : scoreUser === scoreFriend
                  ? "¡Empate Técnico! ¡Grandes cerebros!"
                  : `¡Buen intento! ${friend.name} se llevó la victoria.`}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Puntuación final: <strong>{scoreUser}</strong> vs <strong>{scoreFriend}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E8E2D9] max-w-sm mx-auto shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Recompensa del Duelo:</span>
              <span className="text-sm font-black text-amber-600 flex items-center justify-center gap-1">
                <span>🥕 +{scoreUser > scoreFriend ? 15 : 5} Zanahorias</span>
                <span>•</span>
                <span>⭐ +25 Pts de Afinidad</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md cursor-pointer"
            >
              Volver a Amigos
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
