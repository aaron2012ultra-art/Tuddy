import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Send, 
  Smile, 
  Layers, 
  FileText, 
  Swords, 
  Sparkles, 
  Flame, 
  CheckCheck,
  BookOpen
} from "lucide-react";
import { FriendItem, FriendMessage, Deck, StudyNote } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";
import { 
  getStoredFriendMessages, 
  sendFriendMessage 
} from "../../utils/friendsStorage";

interface FriendChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: FriendItem;
  decks: Deck[];
  notes: StudyNote[];
  onOpenPetRoom?: (friend: FriendItem) => void;
  onStartBattle?: (friend: FriendItem) => void;
  onStartStudyRoom?: (friend: FriendItem) => void;
}

const STUDY_STICKERS = ["🥕", "🏆", "✨", "📚", "☕", "🧠", "⚡", "🎯", "🔥", "🚀"];

export const FriendChatModal: React.FC<FriendChatModalProps> = ({
  isOpen,
  onClose,
  friend,
  decks,
  notes,
  onOpenPetRoom,
  onStartBattle,
  onStartStudyRoom,
}) => {
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showShareDeck, setShowShareDeck] = useState(false);
  const [showShareNote, setShowShareNote] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages on friend change
  useEffect(() => {
    if (friend) {
      setMessages(getStoredFriendMessages(friend.id));
    }
  }, [friend]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string, stickerToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText.trim();
    if (!text && !stickerToSend) return;

    setIsTyping(true);
    const newMsg = sendFriendMessage(
      friend.id,
      text,
      { sticker: stickerToSend },
      (reply) => {
        setIsTyping(false);
        setMessages((prev) => [...prev, reply]);
      }
    );

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowStickers(false);
  };

  const handleShareDeck = (deck: Deck) => {
    setIsTyping(true);
    const newMsg = sendFriendMessage(
      friend.id,
      `¡Hola! Te comparto mi mazo de fichas sobre "${deck.name}" para que practiquemos juntos 📚✨`,
      {
        sharedDeck: {
          deckId: deck.id,
          name: deck.name,
          cardCount: 15,
          subject: deck.subject,
        },
      },
      (reply) => {
        setIsTyping(false);
        setMessages((prev) => [...prev, reply]);
      }
    );
    setMessages((prev) => [...prev, newMsg]);
    setShowShareDeck(false);
  };

  const handleShareNote = (note: StudyNote) => {
    setIsTyping(true);
    const newMsg = sendFriendMessage(
      friend.id,
      `¡Mira este apunte que preparé con IA sobre "${note.title}"! Puede servirte para el repaso 📝`,
      {
        sharedNote: {
          noteId: note.id,
          title: note.title,
          summary: note.aiSummary || note.rawContent.slice(0, 100) + "...",
        },
      },
      (reply) => {
        setIsTyping(false);
        setMessages((prev) => [...prev, reply]);
      }
    );
    setMessages((prev) => [...prev, newMsg]);
    setShowShareNote(false);
  };

  const handleSendBattleInvite = () => {
    setIsTyping(true);
    const newMsg = sendFriendMessage(
      friend.id,
      `¡Te desafío a un Duelo de Fichas de 5 preguntas! ¿Quién sacará mejor puntuación? ⚔️🥕`,
      {
        battleInvite: {
          subject: friend.favoriteSubject || "Conocimiento General",
          questionCount: 5,
          status: "pending",
        },
      },
      (reply) => {
        setIsTyping(false);
        setMessages((prev) => [...prev, reply]);
      }
    );
    setMessages((prev) => [...prev, newMsg]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FDF9F3] w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-[#E8E2D9] overflow-hidden flex flex-col h-[650px] max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-white px-5 py-3.5 border-b border-[#E8E2D9] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => onOpenPetRoom && onOpenPetRoom(friend)}
              className="relative cursor-pointer hover:scale-105 transition-transform"
              title={`Ver mascota de ${friend.name}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#B2E2F2] flex items-center justify-center overflow-hidden border-2 border-white shadow-xs">
                <PetAvatar pet={friend.pet} size="xs" />
              </div>
              <span className={`w-3 h-3 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-white ${
                friend.status === "online" ? "bg-emerald-500" : friend.status === "studying" ? "bg-purple-500" : "bg-amber-400"
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#4A4A4A] tracking-tight">{friend.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full font-bold">
                  {friend.friendCode}
                </span>
              </div>
              <p className="text-[11px] text-[#7A7A7A] truncate max-w-[280px]">
                {friend.currentActivity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onStartBattle && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartBattle(friend);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-1 cursor-pointer transition-colors"
                title="Duelo de estudio"
              >
                <Swords className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Duelo</span>
              </button>
            )}

            {onStartStudyRoom && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartStudyRoom(friend);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1 cursor-pointer transition-colors"
                title="Estudiar juntos con Pomodoro"
              >
                <Flame className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pomodoro</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF6EE]/50">
          {/* Conversation Starter Pill */}
          <div className="text-center my-2">
            <span className="inline-block bg-white border border-[#E8E2D9] px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 shadow-2xs">
              Conectado con {friend.name} • Mascota {friend.pet.name} 🐰
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === "me";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs text-xs leading-relaxed relative ${
                    isMe
                      ? "bg-[#FFB7B2] text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-[#E8E2D9] rounded-tl-xs"
                  }`}
                >
                  {msg.sticker && (
                    <div className="text-3xl mb-1">{msg.sticker}</div>
                  )}

                  <p className="font-medium whitespace-pre-wrap">{msg.text}</p>

                  {/* Shared Deck Card */}
                  {msg.sharedDeck && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-emerald-300" />
                        <span className="font-black text-xs">{msg.sharedDeck.name}</span>
                      </div>
                      <span className="text-[10px] opacity-90 block">
                        Materia: {msg.sharedDeck.subject} • {msg.sharedDeck.cardCount} fichas
                      </span>
                    </div>
                  )}

                  {/* Shared Note Card */}
                  {msg.sharedNote && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/20 border border-white/30 backdrop-blur-xs text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-amber-300" />
                        <span className="font-black text-xs">{msg.sharedNote.title}</span>
                      </div>
                      <p className="text-[10px] opacity-90 line-clamp-2">
                        {msg.sharedNote.summary}
                      </p>
                    </div>
                  )}

                  {/* Battle Invite Card */}
                  {msg.battleInvite && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-orange-400/30 to-amber-400/30 border border-white/40 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Swords className="w-4 h-4 text-orange-200" />
                        <span className="font-black text-xs">Reto de Duelo de 5 Preguntas</span>
                      </div>
                      <span className="text-[10px] block opacity-90 mb-2">
                        Tema: {msg.battleInvite.subject}
                      </span>
                      {onStartBattle && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStartBattle(friend);
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-white text-orange-700 font-black text-xs shadow-xs hover:bg-orange-50 cursor-pointer"
                        >
                          ¡Iniciar Duelo Ahora! ⚔️
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic px-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>{friend.name} está escribiendo...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sharing Popups */}
        {showStickers && (
          <div className="p-3 bg-white border-t border-[#E8E2D9] flex items-center gap-2 overflow-x-auto shadow-inner">
            <span className="text-xs font-bold text-slate-500 shrink-0">Stickers:</span>
            {STUDY_STICKERS.map((stk) => (
              <button
                key={stk}
                type="button"
                onClick={() => handleSendMessage(undefined, stk)}
                className="text-2xl p-1.5 hover:scale-125 transition-transform cursor-pointer"
              >
                {stk}
              </button>
            ))}
          </div>
        )}

        {showShareDeck && (
          <div className="p-3 bg-white border-t border-[#E8E2D9] max-h-40 overflow-y-auto space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Elige un mazo de fichas para compartir:</span>
              <button type="button" onClick={() => setShowShareDeck(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {decks.length === 0 ? (
              <p className="text-xs text-slate-400">No tienes mazos creados aún.</p>
            ) : (
              decks.map((deck) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => handleShareDeck(deck)}
                  className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 border border-slate-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <span>{deck.name} ({deck.subject})</span>
                  <span className="text-emerald-600 text-[11px]">Compartir ➔</span>
                </button>
              ))
            )}
          </div>
        )}

        {showShareNote && (
          <div className="p-3 bg-white border-t border-[#E8E2D9] max-h-40 overflow-y-auto space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
              <span>Elige un apunte para compartir:</span>
              <button type="button" onClick={() => setShowShareNote(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400">No tienes notas creadas aún.</p>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => handleShareNote(note)}
                  className="w-full text-left p-2 rounded-xl hover:bg-amber-50 border border-slate-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate max-w-[80%]">{note.title}</span>
                  <span className="text-amber-600 text-[11px]">Compartir ➔</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Input & Action Bar */}
        <div className="bg-white p-3 border-t border-[#E8E2D9] space-y-2">
          {/* Quick resource action bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setShowStickers(!showStickers)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>Stickers</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShareDeck(!showShareDeck);
                setShowShareNote(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mazo Fichas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowShareNote(!showShareNote);
                setShowShareDeck(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Apunte IA</span>
            </button>

            <button
              type="button"
              onClick={handleSendBattleInvite}
              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5 text-orange-600" />
              <span>Retar Duelo</span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe un mensaje a ${friend.name}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FFB7B2]"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-[#FFB7B2] hover:bg-[#ff9d96] disabled:opacity-40 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
