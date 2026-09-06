import { 
  UserAccount, 
  AuthProvider, 
  AccountBackupData, 
  Deck, 
  Flashcard, 
  StudyNote, 
  ScheduleItem, 
  ExamSession, 
  UserStats, 
  PetCustomization, 
  CustomSubject, 
  AppSettings, 
  SubscriptionStatus 
} from "../types";

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: "tuddy_current_user_v2",
  ACCOUNTS_BACKUPS: "tuddy_accounts_backups_v2",
  PENDING_OTP: "tuddy_pending_otp_v2",
};

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  } catch (err) {
    console.error("Failed to save current user:", err);
  }
}

export function getAllAccountBackups(): Record<string, AccountBackupData> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS_BACKUPS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getSavedAccountBackup(identifierKey: string): AccountBackupData | null {
  const all = getAllAccountBackups();
  const normalized = identifierKey.trim().toLowerCase();
  return all[normalized] || null;
}

export function saveAccountBackup(backup: AccountBackupData): void {
  try {
    const all = getAllAccountBackups();
    const key = (backup.account.email || backup.account.phoneNumber || backup.account.id).trim().toLowerCase();
    all[key] = backup;
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCOUNTS_BACKUPS, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save account backup:", err);
  }
}

export interface OtpChallenge {
  destination: string;
  type: "email" | "phone";
  code: string;
  createdAt: number;
  expiresAt: number;
}

export function generateOtpChallenge(destination: string, type: "email" | "phone"): OtpChallenge {
  // Generate random 6-digit number
  const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const challenge: OtpChallenge = {
    destination: destination.trim(),
    type,
    code: randomNum,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
  };
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.PENDING_OTP, JSON.stringify(challenge));
  } catch (e) {
    console.error("Failed to store OTP:", e);
  }
  return challenge;
}

export function getActivePendingOtp(): OtpChallenge | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.PENDING_OTP);
    if (!raw) return null;
    const challenge: OtpChallenge = JSON.parse(raw);
    if (Date.now() > challenge.expiresAt) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_OTP);
      return null;
    }
    return challenge;
  } catch {
    return null;
  }
}

export function verifyOtpCode(destination: string, code: string): { success: boolean; message?: string } {
  const pending = getActivePendingOtp();
  if (!pending) {
    return { success: false, message: "El código ha expirado o no ha sido solicitado." };
  }
  const cleanEntered = code.trim();
  const cleanDest = destination.trim().toLowerCase();
  const cleanPendingDest = pending.destination.trim().toLowerCase();

  if (cleanDest !== cleanPendingDest) {
    return { success: false, message: "El destino no coincide con el código solicitado." };
  }
  if (pending.code !== cleanEntered) {
    return { success: false, message: "El código de seguridad de 6 dígitos es incorrecto." };
  }

  // Clear pending OTP upon success
  localStorage.removeItem(AUTH_STORAGE_KEYS.PENDING_OTP);
  return { success: true };
}

export function createOrLoginWithOtp(
  destination: string,
  type: "email" | "phone",
  existingDataSnapshot: Omit<AccountBackupData, "account" | "savedAt">
): { account: UserAccount; restoredData?: AccountBackupData } {
  const key = destination.trim().toLowerCase();
  const existingBackup = getSavedAccountBackup(key);
  const nowIso = new Date().toISOString();

  if (existingBackup) {
    // Existing user logging back in
    const updatedAccount: UserAccount = {
      ...existingBackup.account,
      lastSyncedAt: nowIso,
    };
    setCurrentUser(updatedAccount);
    return { account: updatedAccount, restoredData: existingBackup };
  }

  // Brand new user registration
  const isEmail = type === "email";
  const rawName = isEmail 
    ? destination.split("@")[0].replace(/[._-]/g, " ") 
    : `Estudiante ${destination.slice(-4)}`;
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    displayName,
    email: isEmail ? destination : undefined,
    phoneNumber: !isEmail ? destination : undefined,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(destination)}`,
    provider: type,
    createdAt: nowIso,
    lastSyncedAt: nowIso,
    isVerified: true,
  };

  const initialBackup: AccountBackupData = {
    account: newAccount,
    ...existingDataSnapshot,
    savedAt: nowIso,
  };

  setCurrentUser(newAccount);
  saveAccountBackup(initialBackup);

  return { account: newAccount };
}

export function createOrLoginSocialAccount(
  provider: "google" | "github" | "apple" | "facebook",
  socialProfile: {
    displayName: string;
    email?: string;
    avatarUrl?: string;
  },
  existingDataSnapshot: Omit<AccountBackupData, "account" | "savedAt">
): { account: UserAccount; restoredData?: AccountBackupData } {
  const nowIso = new Date().toISOString();
  const lookupKey = socialProfile.email 
    ? socialProfile.email.toLowerCase() 
    : `${provider}_${socialProfile.displayName.toLowerCase().replace(/\s+/g, "_")}`;

  const existingBackup = getSavedAccountBackup(lookupKey);

  if (existingBackup) {
    const updatedAccount: UserAccount = {
      ...existingBackup.account,
      displayName: socialProfile.displayName || existingBackup.account.displayName,
      avatarUrl: socialProfile.avatarUrl || existingBackup.account.avatarUrl,
      lastSyncedAt: nowIso,
    };
    setCurrentUser(updatedAccount);
    return { account: updatedAccount, restoredData: existingBackup };
  }

  const newAccount: UserAccount = {
    id: `usr_${provider}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    displayName: socialProfile.displayName,
    email: socialProfile.email,
    avatarUrl: socialProfile.avatarUrl,
    provider,
    createdAt: nowIso,
    lastSyncedAt: nowIso,
    isVerified: true,
  };

  const initialBackup: AccountBackupData = {
    account: newAccount,
    ...existingDataSnapshot,
    savedAt: nowIso,
  };

  setCurrentUser(newAccount);
  saveAccountBackup(initialBackup);

  return { account: newAccount };
}

export function syncAccountData(
  user: UserAccount,
  dataSnapshot: Omit<AccountBackupData, "account" | "savedAt">
): UserAccount {
  const nowIso = new Date().toISOString();
  const updatedAccount: UserAccount = {
    ...user,
    lastSyncedAt: nowIso,
  };

  const backup: AccountBackupData = {
    account: updatedAccount,
    ...dataSnapshot,
    savedAt: nowIso,
  };

  setCurrentUser(updatedAccount);
  saveAccountBackup(backup);
  return updatedAccount;
}

export function exportAccountBackupAsJson(user: UserAccount, data: any): void {
  const exportPayload = {
    app: "Tuddy - Tu compañero de estudio inteligente",
    exportedAt: new Date().toISOString(),
    account: user,
    data,
  };
  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tuddy-copia-seguridad-${user.displayName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
