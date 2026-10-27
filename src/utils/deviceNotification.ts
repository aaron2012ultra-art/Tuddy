// Device & Mobile Phone Native Push Notifications Engine
// Delivers notifications directly to the phone's OS status bar, lock screen, and notification shade.

const NOTIFICATION_SETTINGS_KEY = "tuddy_device_notifications_settings_v1";

export interface DeviceNotificationSettings {
  enabled: boolean;
  duelChallenges: boolean;
  friendMessages: boolean;
  petCareGifts: boolean;
  studyStreakReminders: boolean;
}

const DEFAULT_SETTINGS: DeviceNotificationSettings = {
  enabled: true,
  duelChallenges: true,
  friendMessages: true,
  petCareGifts: true,
  studyStreakReminders: true,
};

// Check if browser/device supports native Notification API
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && ("Notification" in window || "serviceWorker" in navigator);
}

// Get current permission state: "granted" | "denied" | "default"
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  return Notification.permission;
}

// Request permission to send alerts to the device OS
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    // Register service worker if available
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (e) {
        console.warn("Service worker registration note:", e);
      }
    }

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  } catch (error) {
    console.error("Error requesting device notification permission:", error);
    return false;
  }
}

// Get stored preferences
export function getStoredNotificationSettings(): DeviceNotificationSettings {
  if (typeof window === "undefined" || !window.localStorage) {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Save stored preferences
export function saveNotificationSettings(settings: DeviceNotificationSettings): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving notification settings:", e);
  }
}

// Core helper to dispatch a native notification to the phone / operating system
export async function sendDeviceNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    vibrate?: number[];
    data?: any;
    requireInteraction?: boolean;
  } = {}
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (getNotificationPermission() !== "granted") return false;

  const defaultIcon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23FFB7B2'/><text x='50%' y='62%' font-size='50' text-anchor='middle'>🐰</text></svg>";

  const notificationOptions = {
    body: options.body || "Aviso importante de estudio en Tuddy",
    icon: options.icon || defaultIcon,
    badge: options.badge || defaultIcon,
    tag: options.tag || "tuddy-" + Date.now(),
    vibrate: options.vibrate || [200, 100, 200, 100, 200], // Phone vibration pattern
    data: options.data || { url: "/" },
    requireInteraction: options.requireInteraction || false,
  };

  try {
    // Try via ServiceWorkerRegistration (preferred for mobile phone background execution)
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }

    // Direct Notification fallback
    if ("Notification" in window) {
      new Notification(title, notificationOptions);
      return true;
    }
  } catch (err) {
    console.warn("Standard notification dispatch attempt note:", err);
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

// Test notification sent directly to mobile phone
export async function sendTestNotificationToDevice(): Promise<boolean> {
  const perm = getNotificationPermission();
  if (perm !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
  }

  return sendDeviceNotification("🐰 ¡Notificación recibida en tu celular!", {
    body: "Tuddy está conectado con tu teléfono. Aquí recibirás alertas de duelos, mensajes de amigos y recordatorios de racha 🥕✨",
    tag: "test-notification",
    vibrate: [300, 150, 300],
  });
}

// Specific event notifiers:
export function notifyDuelInvitation(friendName: string, subject?: string) {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled || !settings.duelChallenges) return;

  sendDeviceNotification(`⚔️ ¡${friendName} te ha retado a un Duelo de Fichas!`, {
    body: `¿Aceptas el desafío sobre ${subject || "estudio general"}? Toca aquí para responder al reto.`,
    tag: `duel-invite-${friendName}`,
    vibrate: [250, 100, 250, 100, 400],
    data: { action: "duel_invite", friendName },
  });
}

export function notifyDuelAccepted(friendName: string) {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled || !settings.duelChallenges) return;

  sendDeviceNotification(`⚔️ ¡${friendName} ha ACEPTADO tu duelo!`, {
    body: "¡El combate de 5 preguntas ha sido aceptado! Entra ahora mismo para comenzar el duelo.",
    tag: `duel-accepted-${friendName}`,
    vibrate: [150, 100, 150, 100, 300],
    data: { action: "duel_start", friendName },
  });
}

export function notifyNewFriendMessage(friendName: string, messageText: string) {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled || !settings.friendMessages) return;

  sendDeviceNotification(`💬 Mensaje de ${friendName}`, {
    body: messageText.length > 80 ? messageText.slice(0, 77) + "..." : messageText,
    tag: `msg-${friendName}`,
    vibrate: [100, 80, 100],
    data: { action: "chat", friendName },
  });
}

export function notifyCarrotsReceived(friendName: string, petName: string, amount: number) {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled || !settings.petCareGifts) return;

  sendDeviceNotification(`🥕 ¡${friendName} le regaló zanahorias a ${petName}!`, {
    body: `Recibiste +${amount} zanahorias para tu reserva y subiste tu afinidad de amistad ✨`,
    tag: `carrot-gift-${friendName}`,
    vibrate: [200, 100, 200],
  });
}

export function notifyStreakReminder(streakDays: number) {
  const settings = getStoredNotificationSettings();
  if (!settings.enabled || !settings.studyStreakReminders) return;

  sendDeviceNotification(`🔥 ¡Protege tu racha de ${streakDays} días en Tuddy!`, {
    body: "Solo te faltan 5 minutos de repaso con fichas o simulador para asegurar tu racha de hoy 🐰🥕",
    tag: "streak-reminder",
    vibrate: [300, 200, 300],
  });
}
