import { FriendItem, FriendMessage, FriendStickyNote, PetCustomization } from "../types";
import { 
  notifyDuelInvitation, 
  notifyDuelAccepted, 
  notifyNewFriendMessage, 
  notifyCarrotsReceived 
} from "./deviceNotification";

const STORAGE_KEYS = {
  FRIENDS: "tuddy_friends_v1",
  MESSAGES: "tuddy_friend_messages_v1",
  USER_CODE: "tuddy_user_friend_code_v1",
  DUEL_CHALLENGES: "tuddy_duel_challenges_v1",
};

// Auto-purge any legacy demo or test friends
const DEMO_FRIEND_IDS = new Set([
  "friend-lucia",
  "friend-mateo",
  "friend-valeria",
  "friend-david",
  "friend-camila",
  "friend-santiago",
  "friend-elena",
  "friend-lucas",
]);

if (typeof window !== "undefined" && window.localStorage) {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((f) => f && !DEMO_FRIEND_IDS.has(f.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(cleaned));
        }
      }
    }
  } catch {
    // Ignore storage parse errors
  }
}

// Default initial state: Clean and empty (no demo/test friends)
const DEFAULT_FRIENDS: FriendItem[] = [];

// Duel Challenge Interface
export interface DuelChallenge {
  id: string;
  friendId: string;
  friendName: string;
  petName: string;
  subject: string;
  challenger: "me" | "friend";
  status: "pending_acceptance" | "accepted" | "declined" | "completed";
  createdAt: string;
  scoreMe?: number;
  scoreFriend?: number;
}

export function getStoredFriends(): FriendItem[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_FRIENDS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIENDS);
    if (!raw) {
      return DEFAULT_FRIENDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any demo accounts
      return parsed.filter((f) => f && !DEMO_FRIEND_IDS.has(f.id));
    }
    return DEFAULT_FRIENDS;
  } catch {
    return DEFAULT_FRIENDS;
  }
}

export function saveFriends(friends: FriendItem[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const cleaned = friends.filter((f) => f && !DEMO_FRIEND_IDS.has(f.id));
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(cleaned));
  } catch (e) {
    console.error("Error saving friends to localStorage", e);
  }
}

export function getUserFriendCode(): string {
  if (typeof window === "undefined" || !window.localStorage) {
    return "TUDDY-7721";
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.USER_CODE);
    if (existing) return existing;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `TUDDY-${randomNum}`;
    localStorage.setItem(STORAGE_KEYS.USER_CODE, code);
    return code;
  } catch {
    return "TUDDY-7721";
  }
}

export function addFriendByCodeOrName(query: string): {
  success: boolean;
  message: string;
  friend?: FriendItem;
} {
  const cleanQuery = query.trim().toUpperCase();
  if (!cleanQuery) {
    return { success: false, message: "Por favor introduce un código de amigo válido." };
  }

  const currentFriends = getStoredFriends();

  // Check if already friends
  const alreadyFriend = currentFriends.find(
    (f) => f.friendCode.toUpperCase() === cleanQuery || f.name.toUpperCase() === cleanQuery
  );
  if (alreadyFriend) {
    return {
      success: false,
      message: `Ya tienes a ${alreadyFriend.name} en tu lista de amigos.`,
    };
  }

  // Create real connected friend from the entered code or student username
  const studentName = query.trim().startsWith("TUDDY-") 
    ? `Compañero ${query.trim().slice(-4)}` 
    : query.trim();

  const furColors = ["white", "cinnamon", "lavender", "ash_gray", "mint", "golden"] as const;
  const fur = furColors[Math.floor(Math.random() * furColors.length)];

  const generatedFriend: FriendItem = {
    id: `friend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    friendCode: cleanQuery.startsWith("TUDDY-") ? cleanQuery : `TUDDY-${Math.floor(1000 + Math.random() * 9000)}`,
    name: studentName,
    avatarEmoji: "🎓",
    bio: "Compañero de estudio conectado con Tuddy | Preparando materias y metas académicas 📚✨",
    status: "online",
    currentActivity: "Estudiando con Tuddy 📚",
    streakDays: 1,
    level: 2,
    carrotCoins: 150,
    cardsMastered: 10,
    studyMinutesToday: 20,
    favoriteSubject: "General",
    pet: {
      name: `Tuddy-${studentName.slice(0, 4)}`,
      personality: "enthusiastic",
      furColor: fur,
      accessory: "study_glasses",
      outfit: "academico_clasico",
      bentoBackground: "classic_peach",
      bentoPattern: "dots",
      bentoTextColor: "white",
    },
    friendshipLevel: 1,
    affinityPoints: 10,
    petPettedToday: false,
    carrotsGiftedToday: 0,
    stickyNotes: [],
    joinedDate: "Hoy",
  };

  const updated = [generatedFriend, ...currentFriends];
  saveFriends(updated);

  return {
    success: true,
    message: `¡Amigo añadido correctamente! Conectaste con ${generatedFriend.name} (${generatedFriend.friendCode}) 🎉`,
    friend: generatedFriend,
  };
}

export function removeFriend(friendId: string): void {
  const current = getStoredFriends();
  const updated = current.filter((f) => f.id !== friendId);
  saveFriends(updated);
}

export function toggleFriendFavorite(friendId: string): void {
  const current = getStoredFriends();
  const updated = current.map((f) =>
    f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f
  );
  saveFriends(updated);
}

// Interacting with a friend's pet
export function interactWithFriendPet(
  friendId: string,
  action: "pet" | "carrot" | "highfive",
  carrotsAmount: number = 1
): {
  success: boolean;
  speechQuote: string;
  newAffinity: number;
  newLevel: number;
  friendName: string;
  petName: string;
} {
  const friends = getStoredFriends();
  const targetFriend = friends.find((f) => f.id === friendId);
  if (!targetFriend) {
    return {
      success: false,
      speechQuote: "¡No se encontró la mascota!",
      newAffinity: 0,
      newLevel: 1,
      friendName: "Amigo",
      petName: "Mascota",
    };
  }

  let affinityGain = 0;
  let quote = "";

  if (action === "pet") {
    affinityGain = 15;
    targetFriend.petPettedToday = true;
    quote = `¡A ${targetFriend.pet.name} le encanta cuando le acaricias! Mueve la nariz de felicidad 🐰💕`;
  } else if (action === "carrot") {
    affinityGain = carrotsAmount * 10;
    targetFriend.carrotCoins += carrotsAmount;
    targetFriend.carrotsGiftedToday = (targetFriend.carrotsGiftedToday || 0) + carrotsAmount;
    quote = `¡Crunch crunch! ${targetFriend.pet.name} devora las ${carrotsAmount} zanahorias con alegría 🥕✨ ¡${targetFriend.name} te lo agradece mucho!`;
    
    // Trigger mobile phone native notification alert
    notifyCarrotsReceived(targetFriend.name, targetFriend.pet.name, carrotsAmount);
  } else if (action === "highfive") {
    affinityGain = 10;
    quote = `¡CHOCAS LOS CINCO! ✋🐾 ${targetFriend.pet.name} y tú chocan patita con energía máxima. ¡A por todas!`;
  }

  let totalAffinity = targetFriend.affinityPoints + affinityGain;
  let currentLevel = targetFriend.friendshipLevel;

  while (totalAffinity >= 100 && currentLevel < 5) {
    totalAffinity -= 100;
    currentLevel += 1;
  }

  targetFriend.affinityPoints = totalAffinity;
  targetFriend.friendshipLevel = currentLevel;

  saveFriends(friends);

  return {
    success: true,
    speechQuote: quote,
    newAffinity: totalAffinity,
    newLevel: currentLevel,
    friendName: targetFriend.name,
    petName: targetFriend.pet.name,
  };
}

// Add sticky note to friend's room
export function addStickyNoteToFriend(
  friendId: string,
  authorName: string,
  text: string,
  color: FriendStickyNote["color"] = "yellow"
): FriendStickyNote {
  const friends = getStoredFriends();
  const targetFriend = friends.find((f) => f.id === friendId);
  const newNote: FriendStickyNote = {
    id: `sn-${Date.now()}`,
    authorName: authorName || "Tú",
    text,
    color,
    createdAt: "Hace un momento",
  };

  if (targetFriend) {
    targetFriend.stickyNotes = [newNote, ...(targetFriend.stickyNotes || [])];
    targetFriend.affinityPoints = Math.min(100, targetFriend.affinityPoints + 10);
    saveFriends(friends);
  }

  return newNote;
}

// Friend Messages
export function getStoredFriendMessages(friendId: string): FriendMessage[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.MESSAGES}_${friendId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFriendMessages(friendId: string, messages: FriendMessage[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(`${STORAGE_KEYS.MESSAGES}_${friendId}`, JSON.stringify(messages));
  } catch (e) {
    console.error("Error saving friend messages", e);
  }
}

export function sendFriendMessage(
  friendId: string,
  text: string,
  options?: {
    sticker?: string;
    sharedDeck?: FriendMessage["sharedDeck"];
    sharedNote?: FriendMessage["sharedNote"];
    battleInvite?: FriendMessage["battleInvite"];
  },
  onFriendReply?: (reply: FriendMessage) => void
): FriendMessage {
  const currentMessages = getStoredFriendMessages(friendId);
  const newMsg: FriendMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    friendId,
    sender: "me",
    text,
    timestamp: "Hoy " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    sticker: options?.sticker,
    sharedDeck: options?.sharedDeck,
    sharedNote: options?.sharedNote,
    battleInvite: options?.battleInvite,
  };

  const updated = [...currentMessages, newMsg];
  saveFriendMessages(friendId, updated);

  // If sending a battle invitation, create the pending duel challenge
  if (options?.battleInvite) {
    createDuelChallenge(friendId, options.battleInvite.subject);
  }

  // Simulated interactive reply from connected friend
  setTimeout(() => {
    const friends = getStoredFriends();
    const friend = friends.find((f) => f.id === friendId);
    const friendName = friend ? friend.name : "Compañero";

    let replyText = "";
    if (options?.battleInvite) {
      replyText = `¡He visto tu invitación al duelo de 5 preguntas! ⚔️ ¡Acepto el reto con ganas, que empiece la batalla! 🥕🔥`;
      // Mark duel accepted & trigger native push notification to mobile phone!
      setDuelAcceptedByFriend(friendId);
      notifyDuelAccepted(friendName);
    } else if (options?.sharedDeck) {
      replyText = `¡Gracias por compartir el mazo "${options.sharedDeck.name}"! Lo estudiaré hoy mismo 📚✨`;
    } else if (options?.sharedNote) {
      replyText = `¡Buenísimo apunte! Me ayuda mucho con el repaso 📝`;
    } else {
      const friendlyResponses = [
        `¡Hola! Me alegro de conectar contigo. ¡Vamos a darle caña al estudio hoy! 🐰💪`,
        `¡Genial! Si quieres luego hacemos un duelo de 5 preguntas o una sesión de Pomodoro ⏱️`,
        `¡A tope! Cada minuto de estudio cuenta para la racha 🔥`,
      ];
      replyText = friendlyResponses[Math.floor(Math.random() * friendlyResponses.length)];
    }

    const replyMsg: FriendMessage = {
      id: `reply-${Date.now()}`,
      friendId,
      sender: "friend",
      text: replyText,
      timestamp: "Hace un momento",
      sticker: options?.sticker ? "🥕" : undefined,
    };

    const refreshed = getStoredFriendMessages(friendId);
    saveFriendMessages(friendId, [...refreshed, replyMsg]);

    // Send native device push alert
    notifyNewFriendMessage(friendName, replyText);

    if (onFriendReply) {
      onFriendReply(replyMsg);
    }
  }, 1800);

  return newMsg;
}

// --- DUEL CHALLENGES WITH EXPLICIT ACCEPTANCE REQUIREMENT ---

export function getStoredDuelChallenges(): DuelChallenge[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DUEL_CHALLENGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredDuelChallenges(challenges: DuelChallenge[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_KEYS.DUEL_CHALLENGES, JSON.stringify(challenges));
  } catch (e) {
    console.error("Error saving duel challenges", e);
  }
}

export function createDuelChallenge(friendId: string, subject: string = "Conocimiento General"): DuelChallenge {
  const friends = getStoredFriends();
  const friend = friends.find((f) => f.id === friendId);
  const friendName = friend ? friend.name : "Compañero";
  const petName = friend?.pet?.name || "Mascota";

  const newChallenge: DuelChallenge = {
    id: `duel-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    friendId,
    friendName,
    petName,
    subject,
    challenger: "me",
    status: "pending_acceptance", // Must be accepted before starting!
    createdAt: "Ahora mismo",
  };

  const current = getStoredDuelChallenges();
  saveStoredDuelChallenges([newChallenge, ...current.filter((c) => c.friendId !== friendId || c.status === "completed")]);

  // Alert native notification on device
  notifyDuelInvitation(friendName, subject);

  return newChallenge;
}

export function setDuelAcceptedByFriend(friendId: string): void {
  const current = getStoredDuelChallenges();
  const updated = current.map((c) =>
    c.friendId === friendId && c.status === "pending_acceptance"
      ? { ...c, status: "accepted" as const }
      : c
  );
  saveStoredDuelChallenges(updated);
}

export function acceptDuelChallenge(challengeId: string): DuelChallenge | null {
  const current = getStoredDuelChallenges();
  let acceptedChallenge: DuelChallenge | null = null;

  const updated = current.map((c) => {
    if (c.id === challengeId) {
      acceptedChallenge = { ...c, status: "accepted" as const };
      return acceptedChallenge;
    }
    return c;
  });

  saveStoredDuelChallenges(updated);
  return acceptedChallenge;
}

export function declineDuelChallenge(challengeId: string): void {
  const current = getStoredDuelChallenges();
  const updated = current.map((c) =>
    c.id === challengeId ? { ...c, status: "declined" as const } : c
  );
  saveStoredDuelChallenges(updated);
}

export function completeDuelChallenge(challengeId: string, scoreMe: number, scoreFriend: number): void {
  const current = getStoredDuelChallenges();
  const updated = current.map((c) =>
    c.id === challengeId
      ? { ...c, status: "completed" as const, scoreMe, scoreFriend }
      : c
  );
  saveStoredDuelChallenges(updated);
}

export const FRIENDSHIP_TIERS = [
  { level: 1, title: "Compañeros de Clase", badge: "🌱", perk: "Compartir fichas y notas" },
  { level: 2, title: "Amigos de Estudio", badge: "🍃", perk: "Desbloquea Sala Pomodoro en Dúo" },
  { level: 3, title: "Dúo Dinámico", badge: "⚡", perk: "+10% zanahorias en Duelos de Fichas" },
  { level: 4, title: "Mejores Amigos", badge: "🌟", perk: "Post-its dorados y atuendos gemelos" },
  { level: 5, title: "Gemelos de Estudio", badge: "👑", perk: "Multiplicador x1.5 de Afinidad permanente" },
];
