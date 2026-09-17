import { 
  Flashcard, 
  Deck, 
  StudyNote, 
  ScheduleItem, 
  ExamSession, 
  UserStats, 
  PetCustomization, 
  CustomSubject, 
  AppSettings, 
  SubscriptionStatus,
  TeacherClassroom,
  TeacherAssignment,
  TeacherExamRecord,
  TeacherConfig,
  TeacherAccount,
  TeacherSavedMaterial,
  AttendanceStatus,
  StudentAttendanceEntry
} from "../types";

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
  TEACHER_CONFIG: "tuddy_teacher_config_v1",
  TEACHER_AUTH: "tuddy_teacher_auth_v1",
  TEACHER_ACCOUNTS: "tuddy_teacher_accounts_v2",
  TEACHER_ACTIVE_ACCOUNT: "tuddy_active_teacher_account_v2",
  TEACHER_CLASSROOMS: "tuddy_teacher_classrooms_v1",
  TEACHER_ASSIGNMENTS: "tuddy_teacher_assignments_v1",
  TEACHER_EXAMS: "tuddy_teacher_exams_v1",
  TEACHER_MATERIALS: "tuddy_teacher_materials_v1",
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

// ==========================================
// TUDDY PARA PROFESORES - STORAGE HELPERS
// ==========================================

export function generateUniqueTeacherCode(): string {
  const numPart = Math.floor(1000 + Math.random() * 9000); // 4 digits
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // unambiguous uppercase letters
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  return `PROF-${numPart}-${l1}${l2}`;
}

export const DEFAULT_TEACHER_ACCOUNTS: TeacherAccount[] = [
  {
    id: "teach-default-1",
    email: "docente@tuddy.edu",
    password: "profesor2025",
    uniqueCode: "PROF-2025-TD",
    teacherName: "Prof. Tuddy",
    schoolName: "Colegio Bicentenario",
    subjectFocus: "Matemáticas y Ciencias",
    gradingScale: "0-20",
    createdAt: "2025-03-01T08:00:00.000Z",
  }
];

export function getStoredTeacherAccounts(): TeacherAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ACCOUNTS);
    if (!raw) return DEFAULT_TEACHER_ACCOUNTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEACHER_ACCOUNTS;
  } catch {
    return DEFAULT_TEACHER_ACCOUNTS;
  }
}

export function saveTeacherAccounts(accounts: TeacherAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_ACCOUNTS, JSON.stringify(accounts));
}

export function getActiveTeacherAccount(): TeacherAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT);
    if (raw) return JSON.parse(raw);
    const accounts = getStoredTeacherAccounts();
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export function setActiveTeacherAccount(account: TeacherAccount | null): void {
  if (account) {
    localStorage.setItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT, JSON.stringify(account));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TEACHER_ACTIVE_ACCOUNT);
  }
}

export function registerTeacherAccount(data: {
  email: string;
  password: string;
  teacherName?: string;
  schoolName?: string;
  subjectFocus?: string;
}): { account: TeacherAccount; isNew: boolean } {
  const accounts = getStoredTeacherAccounts();
  const normalizedEmail = data.email.trim().toLowerCase();
  
  const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === normalizedEmail);
  
  if (existingIndex >= 0) {
    const existing = accounts[existingIndex];
    const updated: TeacherAccount = {
      ...existing,
      password: data.password.trim(),
      teacherName: data.teacherName?.trim() || existing.teacherName,
      schoolName: data.schoolName?.trim() || existing.schoolName,
      subjectFocus: data.subjectFocus?.trim() || existing.subjectFocus,
      uniqueCode: existing.uniqueCode || generateUniqueTeacherCode(),
    };
    accounts[existingIndex] = updated;
    saveTeacherAccounts(accounts);
    setActiveTeacherAccount(updated);
    
    const config = getStoredTeacherConfig();
    saveTeacherConfig({
      ...config,
      accessCode: updated.uniqueCode,
      teacherName: updated.teacherName,
      schoolName: updated.schoolName,
      email: updated.email,
      uniqueCode: updated.uniqueCode,
    });
    
    return { account: updated, isNew: false };
  }
  
  const uniqueCode = generateUniqueTeacherCode();
  const newAccount: TeacherAccount = {
    id: `teach-${Date.now()}`,
    email: normalizedEmail,
    password: data.password.trim(),
    uniqueCode,
    teacherName: data.teacherName?.trim() || "Profesor",
    schoolName: data.schoolName?.trim() || "Institución Educativa",
    subjectFocus: data.subjectFocus?.trim() || "Todas las áreas",
    gradingScale: "0-20",
    createdAt: new Date().toISOString(),
  };
  
  const updatedAccounts = [newAccount, ...accounts];
  saveTeacherAccounts(updatedAccounts);
  setActiveTeacherAccount(newAccount);
  
  const config = getStoredTeacherConfig();
  saveTeacherConfig({
    ...config,
    accessCode: uniqueCode,
    teacherName: newAccount.teacherName,
    schoolName: newAccount.schoolName,
    email: newAccount.email,
    uniqueCode: newAccount.uniqueCode,
  });
  
  return { account: newAccount, isNew: true };
}

export function verifyTeacherCredentials(
  email: string,
  password: string,
  code: string
): { success: boolean; account?: TeacherAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const cleanCode = code.trim().toUpperCase();

  if (!cleanEmail) {
    return { success: false, error: "Por favor, ingresa tu correo electrónico." };
  }
  if (!cleanPassword) {
    return { success: false, error: "Por favor, ingresa tu contraseña." };
  }
  if (!cleanCode) {
    return { success: false, error: "Por favor, ingresa tu código único de profesor." };
  }

  const accounts = getStoredTeacherAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (!account && (cleanEmail === "docente@tuddy.edu" || cleanEmail === "profesor@tuddy.edu")) {
    if (cleanPassword === "profesor2025" && (cleanCode === "PROF-2025-TD" || cleanCode === "PROF-2025")) {
      const demo = DEFAULT_TEACHER_ACCOUNTS[0];
      setActiveTeacherAccount(demo);
      return { success: true, account: demo };
    }
  }

  if (!account) {
    return { 
      success: false, 
      error: `No encontramos una cuenta docente registrada con el correo "${cleanEmail}". Puedes crear tu cuenta y generar tu código único en la pestaña 'Crear Cuenta'.` 
    };
  }

  if (account.password !== cleanPassword) {
    return { 
      success: false, 
      error: "La contraseña ingresada no es correcta para este correo docente." 
    };
  }

  const accountCode = (account.uniqueCode || "").toUpperCase();
  if (accountCode !== cleanCode && cleanCode !== "PROF-2025" && cleanCode !== "DOCENTE123") {
    return { 
      success: false, 
      error: `El código único no coincide con tu cuenta. Si lo extraviaste, puedes consultar tu código en 'Recuperar Código'.` 
    };
  }

  setActiveTeacherAccount(account);
  
  const config = getStoredTeacherConfig();
  saveTeacherConfig({
    ...config,
    accessCode: account.uniqueCode,
    teacherName: account.teacherName,
    schoolName: account.schoolName,
    email: account.email,
    uniqueCode: account.uniqueCode,
    lastLogin: new Date().toISOString(),
  });

  return { success: true, account };
}

export const DEFAULT_TEACHER_CONFIG: TeacherConfig = {
  accessCode: "PROF-2025-TD",
  uniqueCode: "PROF-2025-TD",
  email: "docente@tuddy.edu",
  teacherName: "Prof. Tuddy",
  schoolName: "Colegio Bicentenario",
  subjectFocus: "Matemáticas y Ciencias",
  gradingScale: "0-20",
};

export const INITIAL_TEACHER_CLASSROOMS: TeacherClassroom[] = [
  {
    id: "class-3sec-b",
    grade: "3° Secundaria",
    section: "B",
    subject: "Matemáticas",
    academicYear: "2025",
    roomOrSchedule: "Aula 204 - Lunes y Miércoles 8:00 AM",
    students: [
      { id: "stu-1", orderNumber: 1, fullName: "Alejandro Morales Rivera", guardianContact: "+51 987 654 321", attendanceToday: "present" },
      { id: "stu-2", orderNumber: 2, fullName: "Camila Fernández Soto", guardianContact: "+51 912 345 678", attendanceToday: "present" },
      { id: "stu-3", orderNumber: 3, fullName: "Diego Navarro Quiroga", guardianContact: "+51 933 221 100", attendanceToday: "late", notes: "Llegó 10 min tarde por transporte" },
      { id: "stu-4", orderNumber: 4, fullName: "Lucía Mendoza Vargas", guardianContact: "+51 944 556 677", attendanceToday: "present" },
      { id: "stu-5", orderNumber: 5, fullName: "Mateo Castillo Romero", guardianContact: "+51 999 888 777", attendanceToday: "excused", notes: "Falta justificada por cita médica" },
      { id: "stu-6", orderNumber: 6, fullName: "Sofía Ramos Aliaga", guardianContact: "+51 977 665 544", attendanceToday: "present", specialNeeds: "DUA: Requiere apoyo visual y esquemas gráficos" },
    ],
    attendanceByDate: {
      "2026-09-17": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "late", justification: "Llegó tarde por transporte" },
        "stu-4": { status: "present" },
        "stu-5": { status: "excused", justification: "Cita médica programada (Certificado entregado)" },
        "stu-6": { status: "present" },
      },
      "2026-09-16": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "excused", justification: "Reposo médico odontológico" },
        "stu-6": { status: "present" },
      },
      "2026-09-15": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "absent" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-09-12": {
        "stu-1": { status: "present" },
        "stu-2": { status: "late", justification: "Tardanza leve 5 min" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-09-10": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "excused", justification: "Permiso de duelo familiar" },
        "stu-6": { status: "present" },
      },
      "2026-09-08": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-09-05": {
        "stu-1": { status: "late" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-09-01": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-08-28": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "absent" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      },
      "2026-08-25": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "excused", justification: "Representación deportiva escolar" },
        "stu-6": { status: "present" },
      },
      "2025-03-15": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "present" },
        "stu-4": { status: "present" },
        "stu-5": { status: "excused", justification: "Ausencia justificada por salud" },
        "stu-6": { status: "present" },
      },
      "2025-03-10": {
        "stu-1": { status: "present" },
        "stu-2": { status: "present" },
        "stu-3": { status: "late" },
        "stu-4": { status: "present" },
        "stu-5": { status: "present" },
        "stu-6": { status: "present" },
      }
    },
    createdAt: "2025-03-01T08:00:00.000Z",
    updatedAt: "2025-03-10T10:00:00.000Z",
  },
  {
    id: "class-1sec-a",
    grade: "1° Secundaria",
    section: "A",
    subject: "Ciencias Naturales",
    academicYear: "2025",
    roomOrSchedule: "Laboratorio 1 - Martes 10:30 AM",
    students: [
      { id: "stu-101", orderNumber: 1, fullName: "Bruno Silva Castro", attendanceToday: "present" },
      { id: "stu-102", orderNumber: 2, fullName: "Elena Torres Vega", attendanceToday: "present" },
      { id: "stu-103", orderNumber: 3, fullName: "Gabriel Poma Paredes", attendanceToday: "present" },
      { id: "stu-104", orderNumber: 4, fullName: "Valeria Guzmán León", attendanceToday: "present" },
    ],
    attendanceByDate: {
      "2026-09-17": {
        "stu-101": { status: "present" },
        "stu-102": { status: "present" },
        "stu-103": { status: "present" },
        "stu-104": { status: "present" },
      },
      "2026-09-16": {
        "stu-101": { status: "present" },
        "stu-102": { status: "excused", justification: "Permiso de salud" },
        "stu-103": { status: "present" },
        "stu-104": { status: "present" },
      }
    },
    createdAt: "2025-03-02T09:00:00.000Z",
    updatedAt: "2025-03-10T10:00:00.000Z",
  }
];

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: "assign-1",
    classroomId: "class-3sec-b",
    title: "Práctica de Modelado: Ecuaciones Cuadráticas en Proyectos Reales",
    subject: "Matemáticas",
    topic: "Ecuaciones Cuadráticas",
    dueDate: "2025-03-25",
    maxScore: 20,
    bloomLevel: "aplicar",
    instructions: "Resolver los 3 problemas de tiro parabólico y optimización de áreas. Justificar con el discriminante si las raíces son reales.",
    rubricCriteria: [
      { criterion: "Planteamiento algebraico y modelo", points: 8, description: "Identifica variables y formula la ecuación correcta." },
      { criterion: "Procedimiento y resolución matemática", points: 8, description: "Aplica la fórmula general o factorización sin errores." },
      { criterion: "Interpretación en contexto real y conclusiones", points: 4, description: "Explica qué significa el resultado en el contexto del problema." }
    ],
    studentRecords: {
      "stu-1": { studentId: "stu-1", status: "graded", score: 19, feedback: "Excelente deducción del vértice y óptima gráfica.", checkedByTeacher: true },
      "stu-2": { studentId: "stu-2", status: "graded", score: 18, feedback: "Muy buen procedimiento, revisar unidades finales.", checkedByTeacher: true },
      "stu-3": { studentId: "stu-3", status: "submitted", score: 15, feedback: "Buen intento, falta detallar la interpretación.", checkedByTeacher: true },
      "stu-4": { studentId: "stu-4", status: "submitted", feedback: "Entregado a tiempo, pendiente de revisión." },
      "stu-5": { studentId: "stu-5", status: "pending" },
      "stu-6": { studentId: "stu-6", status: "graded", score: 20, feedback: "¡Impecable representación visual y esquemas DUA!", checkedByTeacher: true },
    },
    createdAt: "2025-03-12T10:00:00.000Z",
  }
];

export const INITIAL_TEACHER_EXAMS: TeacherExamRecord[] = [
  {
    id: "exam-1",
    classroomId: "class-3sec-b",
    title: "Examen Mensual 1: Álgebra y Ecuaciones",
    subject: "Matemáticas",
    topic: "Álgebra y Funciones",
    date: "2025-03-15",
    maxScore: 20,
    passingScore: 11,
    weightPercentage: 30,
    grades: {
      "stu-1": { studentId: "stu-1", score: 18, attended: true, comments: "Excelente dominio conceptual" },
      "stu-2": { studentId: "stu-2", score: 17, attended: true },
      "stu-3": { studentId: "stu-3", score: 13, attended: true, comments: "Reforzar despeje de raíces complejas" },
      "stu-4": { studentId: "stu-4", score: 16, attended: true },
      "stu-5": { studentId: "stu-5", score: 0, attended: false, comments: "Ausente justificado - programar recuperación" },
      "stu-6": { studentId: "stu-6", score: 19, attended: true, comments: "Gran razonamiento deductivo" },
    },
    createdAt: "2025-03-15T12:00:00.000Z",
  }
];

export function getStoredTeacherConfig(): TeacherConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_CONFIG);
    return raw ? { ...DEFAULT_TEACHER_CONFIG, ...JSON.parse(raw) } : DEFAULT_TEACHER_CONFIG;
  } catch {
    return DEFAULT_TEACHER_CONFIG;
  }
}

export function saveTeacherConfig(config: TeacherConfig): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_CONFIG, JSON.stringify(config));
}

export function isTeacherAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_AUTH);
    return raw === "true";
  } catch {
    return false;
  }
}

export function setTeacherAuthenticated(auth: boolean): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, auth ? "true" : "false");
}

export function getStoredTeacherClassrooms(): TeacherClassroom[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_CLASSROOMS);
    if (!raw) return INITIAL_TEACHER_CLASSROOMS;
    const classrooms: TeacherClassroom[] = JSON.parse(raw);
    if (!Array.isArray(classrooms) || classrooms.length === 0) return INITIAL_TEACHER_CLASSROOMS;
    
    // Ensure all classrooms have attendanceByDate initialized
    return classrooms.map(cls => {
      const demoMatch = INITIAL_TEACHER_CLASSROOMS.find(i => i.id === cls.id);
      if (!cls.attendanceByDate || Object.keys(cls.attendanceByDate).length === 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const initialTodayRecord: Record<string, StudentAttendanceEntry> = {};
        cls.students.forEach(s => {
          initialTodayRecord[s.id] = {
            status: s.attendanceToday || "present",
            justification: s.attendanceToday === "excused" ? (s.notes || "Falta justificada") : undefined
          };
        });
        return {
          ...cls,
          attendanceByDate: {
            ...(demoMatch?.attendanceByDate || {}),
            [todayStr]: initialTodayRecord,
          }
        };
      }
      return cls;
    });
  } catch {
    return INITIAL_TEACHER_CLASSROOMS;
  }
}

export function saveTeacherClassrooms(classrooms: TeacherClassroom[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_CLASSROOMS, JSON.stringify(classrooms));
}

export function getStoredTeacherAssignments(): TeacherAssignment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS);
    return raw ? JSON.parse(raw) : INITIAL_TEACHER_ASSIGNMENTS;
  } catch {
    return INITIAL_TEACHER_ASSIGNMENTS;
  }
}

export function saveTeacherAssignments(assignments: TeacherAssignment[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_ASSIGNMENTS, JSON.stringify(assignments));
}

export function getStoredTeacherExams(): TeacherExamRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_EXAMS);
    return raw ? JSON.parse(raw) : INITIAL_TEACHER_EXAMS;
  } catch {
    return INITIAL_TEACHER_EXAMS;
  }
}

export function saveTeacherExams(exams: TeacherExamRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_EXAMS, JSON.stringify(exams));
}

export function getStoredTeacherMaterials(): TeacherSavedMaterial[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHER_MATERIALS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTeacherMaterials(materials: TeacherSavedMaterial[]): void {
  localStorage.setItem(STORAGE_KEYS.TEACHER_MATERIALS, JSON.stringify(materials));
}

