import { Flashcard, Deck, StudyNote, ScheduleItem, ExamSession, UserStats, PetCustomization, CustomSubject, AppSettings, SubscriptionStatus } from "../types";

const STORAGE_KEYS = {
  DECKS: "tuddy_decks_v2",
  FLASHCARDS: "tuddy_flashcards_v2",
  NOTES: "tuddy_notes_v2",
  SCHEDULE: "tuddy_schedule_v2",
  EXAM_HISTORY: "tuddy_exam_history_v2",
  USER_STATS: "tuddy_stats_v2",
  PET: "tuddy_pet_customization_v2",
  SUBJECTS: "tuddy_infinite_subjects_v2",
  SETTINGS: "tuddy_settings_v2",
  CAMPAIGN: "tuddy_campaign_progress_v2",
  SUBSCRIPTION: "tuddy_subscription_v2",
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: "es",
  soundEffects: true,
  speechSpeed: 1.0,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  airplaneAnimationSpeed: "normal",
};

export const DEFAULT_PET: PetCustomization = {
  name: "Tuddy",
  personality: "enthusiastic",
  furColor: "white",
  accessory: "study_glasses",
  outfit: "school_vest",
  unlockedOutfits: ["school_vest"],
};

// Start with 0 subjects - the user defines their own subjects
export const DEFAULT_SUBJECTS: CustomSubject[] = [];

// Initial empty decks
const INITIAL_DECKS: Deck[] = [];

// Initial empty flashcards
const INITIAL_FLASHCARDS: Flashcard[] = [];

// Initial empty notes
const INITIAL_NOTES: StudyNote[] = [];

// Initial empty schedule
const INITIAL_SCHEDULE: ScheduleItem[] = [];

// Initial clean user stats
const INITIAL_STATS: UserStats = {
  streakDays: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
  totalStudyMinutes: 0,
  todayStudyMinutes: 0,
  carrotCoins: 0,
  cardsMastered: 0,
  quizzesCompleted: 0,
  averageScore: 0,
  subjectProgress: {},
};

export function getStoredDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DECKS);
    return raw ? JSON.parse(raw) : INITIAL_DECKS;
  } catch {
    return INITIAL_DECKS;
  }
}

export function saveDecks(decks: Deck[]): void {
  localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(decks));
}

export function getStoredFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return raw ? JSON.parse(raw) : INITIAL_FLASHCARDS;
  } catch {
    return INITIAL_FLASHCARDS;
  }
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
}

export function getStoredNotes(): StudyNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : INITIAL_NOTES;
  } catch {
    return INITIAL_NOTES;
  }
}

export function saveNotes(notes: StudyNote[]): void {
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
}

export function getStoredSchedule(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return raw ? JSON.parse(raw) : INITIAL_SCHEDULE;
  } catch {
    return INITIAL_SCHEDULE;
  }
}

export function saveSchedule(schedule: ScheduleItem[]): void {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
}

export function getStoredExamHistory(): ExamSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExamSession(session: ExamSession): void {
  const current = getStoredExamHistory();
  const updated = [session, ...current];
  localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(updated));
}

export function getStoredStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATS, ...parsed };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
}

export function getStoredPet(): PetCustomization {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PET);
    if (!raw) return DEFAULT_PET;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PET, ...parsed };
  } catch {
    return DEFAULT_PET;
  }
}

export function savePet(pet: PetCustomization): void {
  localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet));
}

export function getStoredSubjects(): CustomSubject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!raw) return DEFAULT_SUBJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SUBJECTS;
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: CustomSubject[]): void {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export interface CampaignProgress {
  currentStageId: string;
  completedStages: string[];
  starsEarned: Record<string, number>;
  claimedChests?: string[];
  selectedLanguage?: string;
  languageProgress?: Record<string, { currentStageId: string; completedStages: string[]; claimedChests: string[] }>;
}

export const DEFAULT_CAMPAIGN_PROGRESS: CampaignProgress = {
  currentStageId: "node-en-1",
  completedStages: [],
  starsEarned: {},
  claimedChests: [],
  selectedLanguage: "English",
  languageProgress: {},
};

export function getStoredCampaignProgress(): CampaignProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGN);
    if (!raw) return DEFAULT_CAMPAIGN_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAMPAIGN_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_CAMPAIGN_PROGRESS;
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  localStorage.setItem(STORAGE_KEYS.CAMPAIGN, JSON.stringify(progress));
}

export const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  isPro: false,
  plan: "free",
  price: "$3.50 / mes",
  revivesLeft: 0,
  revivesMax: 3,
};

export function getStoredSubscription(): SubscriptionStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) return DEFAULT_SUBSCRIPTION;
    const parsed = JSON.parse(raw) as SubscriptionStatus;
    
    // Check monthly reset for revives if active pro
    if (parsed.isPro) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      if (parsed.lastReviveMonth !== currentMonth) {
        parsed.revivesLeft = 3;
        parsed.lastReviveMonth = currentMonth;
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(parsed));
      }
    }
    
    return { ...DEFAULT_SUBSCRIPTION, ...parsed };
  } catch {
    return DEFAULT_SUBSCRIPTION;
  }
}

export function saveSubscription(sub: SubscriptionStatus): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function useStreakRevive(): { success: boolean; remaining: number } {
  const current = getStoredSubscription();
  if (!current.isPro || current.revivesLeft <= 0) {
    return { success: false, remaining: current.revivesLeft };
  }
  const updated: SubscriptionStatus = {
    ...current,
    revivesLeft: Math.max(0, current.revivesLeft - 1),
  };
  saveSubscription(updated);
  return { success: true, remaining: updated.revivesLeft };
}

export function clearAllStorageData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Also clean up any legacy v1 keys
    [
      "tuddy_decks_v1",
      "tuddy_flashcards_v1",
      "tuddy_notes_v1",
      "tuddy_schedule_v1",
      "tuddy_exam_history_v1",
      "tuddy_stats_v1",
      "tuddy_pet_customization_v1",
      "tuddy_infinite_subjects_v1",
    ].forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Error clearing storage:", e);
  }
}
