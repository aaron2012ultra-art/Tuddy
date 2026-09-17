import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Edit3, 
  PanelLeftClose, 
  Crown, 
  Sparkles,
  Check,
  X
} from "lucide-react";
import { ChatSession, PetCustomization } from "../../types";
import { PetAvatar } from "../AnthropomorphicBunny";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  pet: PetCustomization;
  isPro?: boolean;
  onOpenSubscriptionModal?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  isOpen,
  onClose,
  pet,
  isPro = false,
  onOpenSubscriptionModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  // Filter sessions by query
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || 
      s.messages.some((m) => m.content.toLowerCase().includes(q));
  });

  // Group sessions chronologically
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfLast7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  const pinned = filteredSessions.filter((s) => s.pinned);
  const unpinned = filteredSessions.filter((s) => !s.pinned);

  const todayChats = unpinned.filter((s) => new Date(s.updatedAt).getTime() >= startOfToday);
  const yesterdayChats = unpinned.filter((s) => {
    const t = new Date(s.updatedAt).getTime();
    return t < startOfToday && t >= startOfYesterday;
  });
  const last7DaysChats = unpinned.filter((s) => {
    const t = new Date(s.updatedAt).getTime();
    return t < startOfYesterday && t >= startOfLast7Days;
  });
  const olderChats = unpinned.filter((s) => new Date(s.updatedAt).getTime() < startOfLast7Days);

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = editingId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (!isEditing) onSelectSession(session.id);
        }}
        className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition-all border ${
          isActive
            ? "bg-amber-100/70 text-slate-900 border-amber-300 font-semibold shadow-2xs"
            : "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-amber-700" : "text-slate-400 group-hover:text-slate-600"}`} />
          
          {isEditing ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename(session.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-full bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleSaveRename(session.id)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="truncate">{session.title || "Nueva conversación"}</span>
          )}
        </div>

        {/* Hover / Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-white/80 transition-colors ${session.pinned ? "text-amber-600 opacity-100" : "text-slate-400 hover:text-slate-700"}`}
              title={session.pinned ? "Desfijar" : "Fijar arriba"}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => handleStartRename(session, e)}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded transition-colors"
              title="Renombrar"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white/80 rounded transition-colors"
              title="Eliminar chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-slate-900/40 z-30 backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 bg-slate-50 border-r border-slate-200/90 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        }`}
      >
        {/* Top Header */}
        <div className="p-3 border-b border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PetAvatar pet={pet} size="xs" showBg={false} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-black text-xs text-purple-950">
                  <span>TuddyACI</span>
                  <span className="text-[9px] bg-purple-200 text-purple-900 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Chat IA
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 font-medium leading-none">Advanced Chat Intelligence</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Cerrar barra lateral"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button (ChatGPT style) */}
          <button
            type="button"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en conversaciones..."
              className="w-full rounded-xl bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
          {pinned.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-amber-800/80 uppercase tracking-wider flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" />
                <span>Fijados</span>
              </div>
              {pinned.map(renderSessionItem)}
            </div>
          )}

          {todayChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Hoy
              </div>
              {todayChats.map(renderSessionItem)}
            </div>
          )}

          {yesterdayChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ayer
              </div>
              {yesterdayChats.map(renderSessionItem)}
            </div>
          )}

          {last7DaysChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Últimos 7 días
              </div>
              {last7DaysChats.map(renderSessionItem)}
            </div>
          )}

          {olderChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Anteriores
              </div>
              {olderChats.map(renderSessionItem)}
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 px-4 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-semibold">Sin conversaciones</p>
              <p className="text-[11px] mt-0.5">Inicia un chat nuevo para estudiar cualquier materia</p>
            </div>
          )}
        </div>

        {/* Footer info & Subscription Status */}
        <div className="p-3 border-t border-slate-200/80 bg-white/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <PetAvatar pet={pet} size="xs" showBg={true} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              </div>
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">{pet.name}</div>
                <div className="text-[10px] text-slate-500">Tutor Académico</div>
              </div>
            </div>

            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2 py-0.5 text-[10px] font-black shadow-2xs">
                <Crown className="w-3 h-3" />
                <span>PLUS</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenSubscriptionModal}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
                title="Desbloquea exámenes de 100 preguntas"
              >
                <Crown className="w-3 h-3 text-amber-600" />
                <span>Plus ($3.50)</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
