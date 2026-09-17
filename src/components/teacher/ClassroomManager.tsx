import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  GraduationCap, 
  Layers, 
  Calendar, 
  BookOpen, 
  Trash2, 
  Edit3, 
  Check, 
  UserPlus, 
  ClipboardList, 
  Phone, 
  Sparkles, 
  Printer, 
  Search, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  RotateCcw,
  FileText,
  Download,
  Table,
  ListOrdered,
  CheckSquare,
  Square,
  HelpCircle,
  Filter
} from "lucide-react";
import { 
  TeacherClassroom, 
  TeacherStudent, 
  AttendanceStatus, 
  StudentAttendanceEntry 
} from "../../types";

interface ClassroomManagerProps {
  classrooms: TeacherClassroom[];
  onSaveClassrooms: (classrooms: TeacherClassroom[]) => void;
  selectedClassroomId: string;
  onSelectClassroomId: (id: string) => void;
  onOpenCreateAssignmentForClass?: (classroomId: string) => void;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  classrooms,
  onSaveClassrooms,
  selectedClassroomId,
  onSelectClassroomId,
  onOpenCreateAssignmentForClass,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  // Helper for today's date formatted as YYYY-MM-DD
  const getTodayDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => getTodayDateStr(), []);

  // Selected date for daily attendance
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // View mode: "daily" (Toma diaria) or "matrix" (Sábana mensual/anual)
  const [viewMode, setViewMode] = useState<"daily" | "matrix">("daily");

  // Matrix view selectors (any year, any month)
  const [matrixYear, setMatrixYear] = useState<number>(() => {
    const initialYear = parseInt(selectedDate.split("-")[0], 10);
    return isNaN(initialYear) ? new Date().getFullYear() : initialYear;
  });
  const [matrixMonth, setMatrixMonth] = useState<number>(() => {
    const initialMonth = parseInt(selectedDate.split("-")[1], 10);
    return isNaN(initialMonth) ? new Date().getMonth() + 1 : initialMonth;
  });

  // Modal: Crear nuevo Salón (escrito a mano)
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newRoom, setNewRoom] = useState("");

  // Modal: Editar Salón actual (escrito a mano)
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editGrade, setEditGrade] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editRoom, setEditRoom] = useState("");

  // Modal: Agregar / Editar Estudiante
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [studentSpecialNeeds, setStudentSpecialNeeds] = useState("");

  // Modal: Justificación de Ausencia
  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    studentId: string;
    studentName: string;
    date: string;
    reason: string;
  }>({
    isOpen: false,
    studentId: "",
    studentName: "",
    date: selectedDate,
    reason: "",
  });

  // Batch import modal
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [batchNamesText, setBatchNamesText] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Date formatted helper
  const dateInfo = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      return {
        dayOfWeek: days[dateObj.getDay()],
        dayNum: d,
        monthName: months[m - 1],
        year: y,
        fullFormatted: `${days[dateObj.getDay()]}, ${d} de ${months[m - 1]} de ${y}`,
        isToday: selectedDate === todayStr,
      };
    } catch {
      return {
        dayOfWeek: "",
        dayNum: 1,
        monthName: "",
        year: 2026,
        fullFormatted: selectedDate,
        isToday: false,
      };
    }
  }, [selectedDate, todayStr]);

  // Navigate dates
  const handleShiftDay = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const nextY = dateObj.getFullYear();
    const nextM = String(dateObj.getMonth() + 1).padStart(2, "0");
    const nextD = String(dateObj.getDate()).padStart(2, "0");
    setSelectedDate(`${nextY}-${nextM}-${nextD}`);
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  // Helper to get attendance entry for a student on a specific date
  const getAttendanceEntry = (studentId: string, dateStr: string = selectedDate): StudentAttendanceEntry => {
    if (currentClass?.attendanceByDate?.[dateStr]?.[studentId]) {
      return currentClass.attendanceByDate[dateStr][studentId];
    }
    // Fallback if viewing today
    if (dateStr === todayStr) {
      const student = currentClass?.students.find((s) => s.id === studentId);
      return {
        status: student?.attendanceToday || "present",
        justification: student?.attendanceToday === "excused" ? (student.notes || "Falta justificada") : undefined,
      };
    }
    // Default unrecorded on other days
    return {
      status: "present",
    };
  };

  // Check if a date has recorded attendance in the ledger
  const isDateRecorded = (dateStr: string = selectedDate): boolean => {
    return Boolean(
      currentClass?.attendanceByDate?.[dateStr] &&
      Object.keys(currentClass.attendanceByDate[dateStr]).length > 0
    );
  };

  // Update attendance for a student on a specific date
  const handleUpdateAttendance = (
    studentId: string,
    status: AttendanceStatus,
    justification?: string,
    targetDate: string = selectedDate
  ) => {
    if (!currentClass) return;

    const existingRecordsForDate = currentClass.attendanceByDate?.[targetDate] || {};
    const previousEntry = existingRecordsForDate[studentId] || getAttendanceEntry(studentId, targetDate);

    const updatedEntry: StudentAttendanceEntry = {
      status,
      justification:
        justification !== undefined
          ? justification
          : status === "excused"
          ? previousEntry.justification || "Ausencia justificada registrada"
          : undefined,
      recordedAt: new Date().toISOString(),
    };

    const updatedRecordsForDate: Record<string, StudentAttendanceEntry> = {
      ...existingRecordsForDate,
      [studentId]: updatedEntry,
    };

    const updatedAttendanceByDate = {
      ...(currentClass.attendanceByDate || {}),
      [targetDate]: updatedRecordsForDate,
    };

    // If targetDate is today, sync student.attendanceToday
    let updatedStudents = currentClass.students;
    if (targetDate === todayStr) {
      updatedStudents = currentClass.students.map((s) =>
        s.id === studentId ? { ...s, attendanceToday: status } : s
      );
    }

    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id
        ? {
            ...c,
            students: updatedStudents,
            attendanceByDate: updatedAttendanceByDate,
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    onSaveClassrooms(updatedClassrooms);
  };

  // Toggle "Ausencia Justificada" checkbox
  const handleToggleJustifiedAbsence = (student: TeacherStudent, checked: boolean) => {
    if (checked) {
      // Mark as excused, open modal or inline reason
      handleUpdateAttendance(student.id, "excused", "Ausencia justificada con autorización", selectedDate);
      setJustificationModal({
        isOpen: true,
        studentId: student.id,
        studentName: student.fullName,
        date: selectedDate,
        reason: getAttendanceEntry(student.id, selectedDate).justification || "Permiso / Justificación médica",
      });
    } else {
      // Return to present
      handleUpdateAttendance(student.id, "present", undefined, selectedDate);
    }
  };

  const handleSaveJustification = () => {
    if (!justificationModal.studentId) return;
    handleUpdateAttendance(
      justificationModal.studentId,
      "excused",
      justificationModal.reason.trim() || "Ausencia justificada",
      justificationModal.date
    );
    setJustificationModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Mark all students present on selected date
  const handleMarkAllPresent = (targetDate: string = selectedDate) => {
    if (!currentClass) return;
    const newRecord: Record<string, StudentAttendanceEntry> = {};
    currentClass.students.forEach((s) => {
      newRecord[s.id] = { status: "present", recordedAt: new Date().toISOString() };
    });

    const updatedAttendanceByDate = {
      ...(currentClass.attendanceByDate || {}),
      [targetDate]: newRecord,
    };

    let updatedStudents = currentClass.students;
    if (targetDate === todayStr) {
      updatedStudents = currentClass.students.map((s) => ({ ...s, attendanceToday: "present" }));
    }

    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id
        ? {
            ...c,
            students: updatedStudents,
            attendanceByDate: updatedAttendanceByDate,
            updatedAt: new Date().toISOString(),
          }
        : c
    );
    onSaveClassrooms(updatedClassrooms);
  };

  // Create classroom (User types by hand!)
  const handleCreateClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.trim() || !newSection.trim()) return;

    const newClass: TeacherClassroom = {
      id: `class-${Date.now()}`,
      grade: newGrade.trim(),
      section: newSection.trim(),
      subject: newSubject.trim() || "Materia General",
      academicYear: newYear.trim() || new Date().getFullYear().toString(),
      roomOrSchedule: newRoom.trim() || undefined,
      students: [],
      attendanceByDate: {
        [todayStr]: {},
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newClass, ...classrooms];
    onSaveClassrooms(updated);
    onSelectClassroomId(newClass.id);
    setIsNewClassModalOpen(false);
    setNewGrade("");
    setNewSection("");
    setNewSubject("");
    setNewRoom("");
  };

  // Edit classroom (User types by hand!)
  const handleOpenEditClassroom = () => {
    if (!currentClass) return;
    setEditGrade(currentClass.grade);
    setEditSection(currentClass.section);
    setEditSubject(currentClass.subject);
    setEditYear(currentClass.academicYear);
    setEditRoom(currentClass.roomOrSchedule || "");
    setIsEditClassModalOpen(true);
  };

  const handleSaveEditClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !editGrade.trim() || !editSection.trim()) return;

    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id
        ? {
            ...c,
            grade: editGrade.trim(),
            section: editSection.trim(),
            subject: editSubject.trim() || "Materia General",
            academicYear: editYear.trim() || new Date().getFullYear().toString(),
            roomOrSchedule: editRoom.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : c
    );

    onSaveClassrooms(updatedClassrooms);
    setIsEditClassModalOpen(false);
  };

  const handleDeleteClassroom = (classId: string) => {
    if (confirm("¿Estás seguro de eliminar este salón y todos sus registros de asistencia y estudiantes?")) {
      const updated = classrooms.filter((c) => c.id !== classId);
      onSaveClassrooms(updated);
      if (updated.length > 0) {
        onSelectClassroomId(updated[0].id);
      }
    }
  };

  // Student management
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !studentName.trim()) return;

    let updatedStudents = [...currentClass.students];

    if (editingStudentId) {
      updatedStudents = updatedStudents.map((s) =>
        s.id === editingStudentId
          ? {
              ...s,
              fullName: studentName.trim(),
              guardianContact: studentContact.trim() || undefined,
              notes: studentNotes.trim() || undefined,
              specialNeeds: studentSpecialNeeds.trim() || undefined,
            }
          : s
      );
    } else {
      const nextOrder = updatedStudents.length > 0 ? Math.max(...updatedStudents.map((s) => s.orderNumber)) + 1 : 1;
      const newStudent: TeacherStudent = {
        id: `stu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        orderNumber: nextOrder,
        fullName: studentName.trim(),
        guardianContact: studentContact.trim() || undefined,
        notes: studentNotes.trim() || undefined,
        specialNeeds: studentSpecialNeeds.trim() || undefined,
        attendanceToday: "present",
      };
      updatedStudents.push(newStudent);
    }

    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents, updatedAt: new Date().toISOString() } : c
    );
    onSaveClassrooms(updatedClassrooms);
    setIsNewStudentModalOpen(false);
    setEditingStudentId(null);
    setStudentName("");
    setStudentContact("");
    setStudentNotes("");
    setStudentSpecialNeeds("");
  };

  const handleOpenEditStudent = (student: TeacherStudent) => {
    setEditingStudentId(student.id);
    setStudentName(student.fullName);
    setStudentContact(student.guardianContact || "");
    setStudentNotes(student.notes || "");
    setStudentSpecialNeeds(student.specialNeeds || "");
    setIsNewStudentModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!currentClass) return;
    const updatedStudents = currentClass.students
      .filter((s) => s.id !== studentId)
      .map((s, idx) => ({ ...s, orderNumber: idx + 1 }));

    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents, updatedAt: new Date().toISOString() } : c
    );
    onSaveClassrooms(updatedClassrooms);
  };

  const handleBatchImport = () => {
    if (!currentClass || !batchNamesText.trim()) return;
    const lines = batchNamesText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const startOrder = currentClass.students.length;
    const newStudents: TeacherStudent[] = lines.map((line, idx) => {
      const cleanName = line.replace(/^\d+[\.\-\)]\s*/, "").trim();
      return {
        id: `stu-${Date.now()}-${idx}`,
        orderNumber: startOrder + idx + 1,
        fullName: cleanName,
        attendanceToday: "present",
      };
    });

    const updatedStudents = [...currentClass.students, ...newStudents];
    const updatedClassrooms = classrooms.map((c) =>
      c.id === currentClass.id ? { ...c, students: updatedStudents, updatedAt: new Date().toISOString() } : c
    );
    onSaveClassrooms(updatedClassrooms);
    setIsBatchImportModalOpen(false);
    setBatchNamesText("");
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!currentClass) return [];
    return currentClass.students.filter((s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentClass, searchQuery]);

  // Daily statistics for selectedDate
  const dailyStats = useMemo(() => {
    if (!currentClass || currentClass.students.length === 0) {
      return { total: 0, present: 0, absent: 0, excused: 0, late: 0, percent: 100 };
    }
    const total = currentClass.students.length;
    let present = 0;
    let absent = 0;
    let excused = 0;
    let late = 0;

    currentClass.students.forEach((s) => {
      const entry = getAttendanceEntry(s.id, selectedDate);
      if (entry.status === "present") present++;
      else if (entry.status === "absent") absent++;
      else if (entry.status === "excused") excused++;
      else if (entry.status === "late") late++;
    });

    // Ausencia justificada doesn't penalize presence rate in modern pedagogical systems
    const effectiveAttended = present + late + excused;
    const percent = Math.round((effectiveAttended / total) * 100);

    return { total, present, absent, excused, late, percent };
  }, [currentClass, selectedDate]);

  // Days in month calculation for the Matrix View
  const daysInMatrixMonth = useMemo(() => {
    const daysCount = new Date(matrixYear, matrixMonth, 0).getDate();
    const daysArr: Array<{
      dayNum: number;
      dateStr: string;
      dayOfWeekLetter: string;
      isWeekend: boolean;
      hasRecord: boolean;
    }> = [];

    const weekLetterMap = ["D", "L", "M", "M", "J", "V", "S"];

    for (let d = 1; d <= daysCount; d++) {
      const dateObj = new Date(matrixYear, matrixMonth - 1, d);
      const dayOfWeekIndex = dateObj.getDay();
      const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6;
      const mStr = String(matrixMonth).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      const dateStr = `${matrixYear}-${mStr}-${dStr}`;
      const hasRecord = Boolean(
        currentClass?.attendanceByDate?.[dateStr] &&
        Object.keys(currentClass.attendanceByDate[dateStr]).length > 0
      );

      daysArr.push({
        dayNum: d,
        dateStr,
        dayOfWeekLetter: weekLetterMap[dayOfWeekIndex],
        isWeekend,
        hasRecord,
      });
    }

    return daysArr;
  }, [matrixYear, matrixMonth, currentClass]);

  // Export Matrix to CSV
  const handleExportCSV = () => {
    if (!currentClass) return;
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthName = months[matrixMonth - 1];

    let csvContent = `Reporte de Asistencia - ${currentClass.grade} Sección ${currentClass.section}\n`;
    csvContent += `Materia: ${currentClass.subject} | Mes: ${monthName} ${matrixYear}\n\n`;

    // Headers
    const headers = ["N°", "Estudiante", ...daysInMatrixMonth.map((d) => `Día ${d.dayNum}`), "% Asistencia", "Presentes", "Justificadas", "Faltas", "Tardanzas"];
    csvContent += headers.join(",") + "\n";

    // Rows
    currentClass.students.forEach((student) => {
      let pCount = 0;
      let eCount = 0;
      let aCount = 0;
      let lCount = 0;
      let recordedDays = 0;

      const dayCells = daysInMatrixMonth.map((day) => {
        const entry = currentClass.attendanceByDate?.[day.dateStr]?.[student.id];
        if (!entry) return "-";
        recordedDays++;
        if (entry.status === "present") { pCount++; return "P"; }
        if (entry.status === "excused") { eCount++; return "J"; }
        if (entry.status === "absent") { aCount++; return "F"; }
        if (entry.status === "late") { lCount++; return "T"; }
        return "-";
      });

      const effective = pCount + lCount + eCount;
      const rate = recordedDays > 0 ? `${Math.round((effective / recordedDays) * 100)}%` : "N/A";

      const row = [
        student.orderNumber,
        `"${student.fullName.replace(/"/g, '""')}"`,
        ...dayCells,
        rate,
        pCount,
        eCount,
        aCount,
        lCount,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Asistencia_${currentClass.grade.replace(/\s+/g, "_")}_Sec_${currentClass.section}_${monthName}_${matrixYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const monthNamesList = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6">
      {/* Top Header: Classroom Selector Tabs & Create Class Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Mis Salones y Registro Diario de Asistencia
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lleva el control de asistencia día por día, registra ausencias justificadas con casilla directa y consulta cualquier fecha, semana, mes o año.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewGrade("");
            setNewSection("");
            setNewSubject("");
            setNewYear(new Date().getFullYear().toString());
            setNewRoom("");
            setIsNewClassModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Grado y Sección (Escribir a Mano)</span>
        </button>
      </div>

      {/* Classroom Pills Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {classrooms.map((cls) => {
          const isSelected = cls.id === (currentClass?.id || "");
          return (
            <button
              key={cls.id}
              onClick={() => onSelectClassroomId(cls.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{cls.grade} - Sec. "{cls.section}"</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isSelected ? "bg-indigo-700 text-indigo-100" : "bg-slate-100 text-slate-600"
              }`}>
                {cls.students.length} alumnos
              </span>
            </button>
          );
        })}
      </div>

      {currentClass ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Class Information Banner with Edit Option */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg shrink-0">
                {currentClass.section}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-900">
                    {currentClass.grade} — Sección {currentClass.section}
                  </h3>
                  <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                    {currentClass.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Año {currentClass.academicYear}
                  </span>

                  <button
                    type="button"
                    onClick={handleOpenEditClassroom}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title="Editar información de la sección a mano"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Editar sección</span>
                  </button>
                </div>

                {currentClass.roomOrSchedule && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {currentClass.roomOrSchedule}
                  </p>
                )}
              </div>
            </div>

            {/* View Mode Toggle: Toma Diaria vs Sábana Histórica Mensual/Anual */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("daily")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === "daily"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Registro Diario</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("matrix")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === "matrix"
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Historial Mensual / Anual</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStudentId(null);
                  setStudentName("");
                  setStudentContact("");
                  setStudentNotes("");
                  setStudentSpecialNeeds("");
                  setIsNewStudentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Agregar Estudiante</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBatchImportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Pegar lista de nombres de Excel o Word"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Importar Lista</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClassroom(currentClass.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Eliminar este salón"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* VIEW MODE 1: REGISTRO DIARIO (Día por Día, Cualquier Fecha)   */}
          {/* ============================================================== */}
          {viewMode === "daily" && (
            <div>
              {/* Interactive Date Navigation Bar (Browse any week, month, year) */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Previous day */}
                  <button
                    type="button"
                    onClick={() => handleShiftDay(-1)}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    title="Día anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Date badge and day indicator */}
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-slate-800 leading-tight">
                        {dateInfo.fullFormatted}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {dateInfo.isToday ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                            ● Día de Hoy
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md">
                            ● Registro Histórico ({selectedDate})
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {isDateRecorded(selectedDate) ? "✓ Asistencia guardada" : "⏳ Por registrar"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next day */}
                  <button
                    type="button"
                    onClick={() => handleShiftDay(1)}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    title="Día siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Go to today button if not currently viewing today */}
                  {!dateInfo.isToday && (
                    <button
                      type="button"
                      onClick={handleGoToday}
                      className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Volver a Hoy</span>
                    </button>
                  )}

                  {/* Native Date Picker to select ANY day, week, month, or year */}
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Ir a Fecha:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value);
                        }
                      }}
                      className="text-xs font-bold text-indigo-700 bg-transparent focus:outline-hidden cursor-pointer"
                      title="Selecciona cualquier día de cualquier semana, mes o año"
                    />
                  </div>
                </div>

                {/* Day Summary Counters & Bulk Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs">
                    <span className="text-emerald-600 font-bold" title="Presentes">✓ {dailyStats.present}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-indigo-600 font-bold" title="Ausencias Justificadas">🛡️ {dailyStats.excused} Justif.</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-rose-600 font-bold" title="Faltas Injustificadas">✗ {dailyStats.absent} Faltas</span>
                    {dailyStats.late > 0 && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="text-amber-600 font-bold" title="Tardanzas">⏰ {dailyStats.late}</span>
                      </>
                    )}
                    <span className="text-slate-300">|</span>
                    <span className="text-indigo-700 font-black bg-indigo-50 px-1.5 py-0.5 rounded-md">
                      {dailyStats.percent}% Asistencia
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleMarkAllPresent(selectedDate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    title="Marca a todos los estudiantes como Presentes para este día"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Todos Presentes</span>
                  </button>
                </div>
              </div>

              {/* Student Search & Quick filter */}
              <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Buscar estudiante por nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>
                    Mostrando: <strong className="text-slate-800">{filteredStudents.length}</strong> de {currentClass.students.length} estudiantes
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                    Fecha activa: {selectedDate}
                  </span>
                </div>
              </div>

              {/* Students Daily Attendance Table */}
              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-700">No hay estudiantes en esta lista</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                    Agrega los alumnos del salón o copia y pega la lista con "Importar Lista".
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsNewStudentModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    + Agregar primer estudiante
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-3">Estudiante</th>
                        <th className="py-3 px-3">Contacto Apoderado</th>
                        <th className="py-3 px-3">Adaptación DUA</th>
                        <th className="py-3 px-4 text-center bg-indigo-50/50">
                          <span className="flex items-center justify-center gap-1 text-indigo-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            Casilla Ausencia Justificada
                          </span>
                        </th>
                        <th className="py-3 px-4 text-center">Estado de Asistencia</th>
                        <th className="py-3 px-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.map((student) => {
                        const entry = getAttendanceEntry(student.id, selectedDate);
                        const isExcused = entry.status === "excused";

                        return (
                          <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                              {String(student.orderNumber).padStart(2, "0")}
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 text-sm">{student.fullName}</div>
                              {student.notes && (
                                <div className="text-[11px] text-slate-400 italic mt-0.5">{student.notes}</div>
                              )}
                            </td>

                            <td className="py-3 px-3 text-slate-600">
                              {student.guardianContact ? (
                                <span className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {student.guardianContact}
                                </span>
                              ) : (
                                <span className="text-slate-300 italic text-[11px]">Sin registrar</span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {student.specialNeeds ? (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-medium">
                                  <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                                  {student.specialNeeds}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[11px]">—</span>
                              )}
                            </td>

                            {/* CASILLA DE AUSENCIA JUSTIFICADA DIRECTA */}
                            <td className="py-3 px-4 text-center bg-indigo-50/30 border-x border-indigo-100/60">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer select-none transition-all shadow-2xs bg-white hover:bg-indigo-50 border-slate-200 hover:border-indigo-300">
                                  <input
                                    type="checkbox"
                                    checked={isExcused}
                                    onChange={(e) => handleToggleJustifiedAbsence(student, e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                  />
                                  <span className={`text-[11px] font-bold ${
                                    isExcused ? "text-indigo-700 font-black" : "text-slate-600"
                                  }`}>
                                    {isExcused ? "Ausencia Justificada" : "Marcar Justificada"}
                                  </span>
                                </label>

                                {isExcused && (
                                  <div className="flex items-center gap-1 max-w-[200px]">
                                    <span 
                                      className="text-[10px] text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md font-medium truncate"
                                      title={entry.justification || "Ausencia justificada registrada"}
                                    >
                                      🛡️ {entry.justification || "Justificada"}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setJustificationModal({
                                          isOpen: true,
                                          studentId: student.id,
                                          studentName: student.fullName,
                                          date: selectedDate,
                                          reason: entry.justification || "",
                                        });
                                      }}
                                      className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                                      title="Editar motivo o justificativo"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* ESTADOS COMPLETOS: PRESENTE, TARDE, FALTA, JUSTIFICADA */}
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(student.id, "present", undefined, selectedDate)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    entry.status === "present"
                                      ? "bg-emerald-600 text-white shadow-2xs scale-102"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                  title="Presente en clase"
                                >
                                  ✓ Pres.
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(student.id, "late", undefined, selectedDate)}
                                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    entry.status === "late"
                                      ? "bg-amber-500 text-white shadow-2xs scale-102"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                  title="Tardanza"
                                >
                                  ⏰ Tarde
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAttendance(student.id, "absent", undefined, selectedDate)}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    entry.status === "absent"
                                      ? "bg-rose-600 text-white shadow-2xs scale-102"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                  title="Falta injustificada"
                                >
                                  ✗ Falta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateAttendance(student.id, "excused", "Ausencia justificada", selectedDate);
                                    setJustificationModal({
                                      isOpen: true,
                                      studentId: student.id,
                                      studentName: student.fullName,
                                      date: selectedDate,
                                      reason: entry.justification || "Permiso justificado",
                                    });
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    entry.status === "excused"
                                      ? "bg-indigo-600 text-white shadow-2xs scale-102"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                  title="Ausencia Justificada"
                                >
                                  🛡️ Justif.
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudent(student)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Editar datos del estudiante"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Eliminar de la lista"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW MODE 2: SÁBANA HISTÓRICA MENSUAL / ANUAL                  */}
          {/* ============================================================== */}
          {viewMode === "matrix" && (
            <div className="p-5 space-y-4">
              {/* Matrix Controls: Month & Year Selector */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600">Mes:</span>
                    <select
                      value={matrixMonth}
                      onChange={(e) => setMatrixMonth(Number(e.target.value))}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      {monthNamesList.map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600">Año:</span>
                    <input
                      type="number"
                      min={2020}
                      max={2035}
                      value={matrixYear}
                      onChange={(e) => setMatrixYear(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500 text-center"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setMatrixMonth(now.getMonth() + 1);
                        setMatrixYear(now.getFullYear());
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Mes Actual
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> P = Presente</span>
                    <span className="flex items-center gap-1 text-indigo-600"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> J = Justificada</span>
                    <span className="flex items-center gap-1 text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500"></span> F = Falta</span>
                    <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> T = Tarde</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Excel / CSV</span>
                  </button>
                </div>
              </div>

              {/* Full Month Matrix Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2.5 w-10 text-center border-r border-slate-200">#</th>
                      <th className="py-2.5 px-3 min-w-[180px] sticky left-0 bg-slate-100 z-10 border-r border-slate-200">
                        Estudiante ({monthNamesList[matrixMonth - 1]} {matrixYear})
                      </th>
                      {daysInMatrixMonth.map((day) => {
                        const isSelectedInDaily = day.dateStr === selectedDate;
                        return (
                          <th
                            key={day.dayNum}
                            onClick={() => {
                              setSelectedDate(day.dateStr);
                              setViewMode("daily");
                            }}
                            className={`py-2 px-1 text-center min-w-[28px] border-r border-slate-200 transition-colors cursor-pointer hover:bg-indigo-100 ${
                              isSelectedInDaily
                                ? "bg-indigo-600 text-white font-black"
                                : day.isWeekend
                                ? "bg-slate-200/60 text-slate-400"
                                : day.hasRecord
                                ? "bg-indigo-50 text-indigo-800"
                                : "text-slate-600"
                            }`}
                            title={`Día ${day.dayNum} (${day.dayOfWeekLetter}) - Clic para ver asistencia de este día`}
                          >
                            <div className="text-[9px] uppercase font-medium">{day.dayOfWeekLetter}</div>
                            <div className="text-[11px] font-bold leading-tight">{day.dayNum}</div>
                          </th>
                        );
                      })}
                      <th className="py-2.5 px-2.5 text-center bg-indigo-50 text-indigo-900 border-l border-slate-200 min-w-[65px] font-black">
                        % Asist.
                      </th>
                      <th className="py-2.5 px-2 text-center text-emerald-700 bg-emerald-50/50 min-w-[36px]">P</th>
                      <th className="py-2.5 px-2 text-center text-indigo-700 bg-indigo-50/50 min-w-[36px]">J</th>
                      <th className="py-2.5 px-2 text-center text-rose-700 bg-rose-50/50 min-w-[36px]">F</th>
                      <th className="py-2.5 px-2 text-center text-amber-700 bg-amber-50/50 min-w-[36px]">T</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentClass.students.map((student) => {
                      let pCount = 0;
                      let jCount = 0;
                      let fCount = 0;
                      let tCount = 0;
                      let totalRecordedForStudent = 0;

                      return (
                        <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors">
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-400 border-r border-slate-100">
                            {String(student.orderNumber).padStart(2, "0")}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs truncate max-w-[200px]">
                            {student.fullName}
                          </td>

                          {daysInMatrixMonth.map((day) => {
                            const entry = currentClass.attendanceByDate?.[day.dateStr]?.[student.id];
                            if (entry) {
                              totalRecordedForStudent++;
                              if (entry.status === "present") pCount++;
                              else if (entry.status === "excused") jCount++;
                              else if (entry.status === "absent") fCount++;
                              else if (entry.status === "late") tCount++;
                            }

                            return (
                              <td
                                key={day.dayNum}
                                onClick={() => {
                                  setSelectedDate(day.dateStr);
                                  setViewMode("daily");
                                }}
                                className={`py-1.5 px-1 text-center font-mono text-[10px] font-bold border-r border-slate-100 cursor-pointer hover:bg-indigo-100/50 transition-colors ${
                                  day.isWeekend ? "bg-slate-50/80" : ""
                                }`}
                              >
                                {entry ? (
                                  entry.status === "present" ? (
                                    <span className="text-emerald-700 font-bold">✓</span>
                                  ) : entry.status === "excused" ? (
                                    <span 
                                      className="text-indigo-700 font-bold bg-indigo-100 px-1 py-0.2 rounded"
                                      title={entry.justification || "Ausencia justificada"}
                                    >
                                      J
                                    </span>
                                  ) : entry.status === "absent" ? (
                                    <span className="text-rose-700 font-bold bg-rose-100 px-1 py-0.2 rounded">✗</span>
                                  ) : (
                                    <span className="text-amber-700 font-bold bg-amber-100 px-1 py-0.2 rounded">T</span>
                                  )
                                ) : (
                                  <span className="text-slate-300 font-normal">·</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Student Totals for Month */}
                          {(() => {
                            const effective = pCount + tCount + jCount;
                            const rate = totalRecordedForStudent > 0 
                              ? Math.round((effective / totalRecordedForStudent) * 100) 
                              : 100;

                            return (
                              <>
                                <td className="py-2 px-2 text-center font-black bg-indigo-50/60 text-indigo-900 border-l border-slate-200">
                                  {totalRecordedForStudent > 0 ? `${rate}%` : "—"}
                                </td>
                                <td className="py-2 px-1 text-center font-bold text-emerald-700 bg-emerald-50/30">
                                  {pCount}
                                </td>
                                <td className="py-2 px-1 text-center font-bold text-indigo-700 bg-indigo-50/30">
                                  {jCount}
                                </td>
                                <td className="py-2 px-1 text-center font-bold text-rose-700 bg-rose-50/30">
                                  {fCount}
                                </td>
                                <td className="py-2 px-1 text-center font-bold text-amber-700 bg-amber-50/30">
                                  {tCount}
                                </td>
                              </>
                            );
                          })()}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>
                  💡 Tip: Puedes hacer clic en el encabezado de cualquier día o celda de la tabla para abrir directamente el registro diario y editar la asistencia de esa fecha.
                </span>
                <span className="font-bold text-indigo-600">
                  Total de alumnos: {currentClass.students.length}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No tienes salones creados aún</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Crea tu primer grado y sección escribiendo todos los datos a mano (sin opciones forzadas).
          </p>
          <button
            type="button"
            onClick={() => {
              setNewGrade("");
              setNewSection("");
              setNewSubject("");
              setNewYear(new Date().getFullYear().toString());
              setNewRoom("");
              setIsNewClassModalOpen(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            + Crear mi primer Salón a Mano
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR GRADO Y SECCIÓN (Escrito 100% a mano por usuario) */}
      {/* ============================================================== */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Nuevo Grado y Sección
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Escribe la información de tu sección completamente a mano (sin opciones predeterminadas o listas fijas).
            </p>

            <form onSubmit={handleCreateClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Grado Escolar * (Escribe a mano)
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: 3° Secundaria, 5to Primaria, Sala 4 años, Bachillerato..."
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sección o Grupo * (Escribe a mano)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A, B, C, Sección Única, Mañana, Grupo 1..."
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Año Lectivo (Escribe a mano)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2026, 2025..."
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asignatura / Curso (Escribe a mano)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Matemáticas, Ciencias, Comunicación, Taller..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aula u Horario (Opcional - Escribe a mano)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Aula 204 - Lunes y Miércoles 8:00 AM"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Salón
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDITAR INFORMACIÓN DEL SALÓN (Escrito a mano)           */}
      {/* ============================================================== */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              Editar Información de la Sección
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Modifica la información del grado, sección y materia escribiendo libremente a mano.
            </p>

            <form onSubmit={handleSaveEditClassroom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Grado Escolar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 3° Secundaria, 5to Primaria..."
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sección o Grupo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: A, B, Los Pinos, Turno Mañana..."
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Año Lectivo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2026..."
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asignatura / Curso
                </label>
                <input
                  type="text"
                  placeholder="Ej: Matemáticas, Ciencias..."
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aula u Horario
                </label>
                <input
                  type="text"
                  placeholder="Ej: Aula 204 - Lunes 8:00 AM"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MOTIVO DE AUSENCIA JUSTIFICADA                           */}
      {/* ============================================================== */}
      {justificationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Detalle de Ausencia Justificada
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Estudiante: <strong className="text-slate-800">{justificationModal.studentName}</strong> <br />
              Fecha: <strong className="text-indigo-600">{justificationModal.date}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo o Justificación Médica / Escolar
                </label>
                <textarea
                  rows={3}
                  autoFocus
                  placeholder="Ej: Permiso médico expedido por el hospital, viaje de representación deportiva, cita médica con el pediatra..."
                  value={justificationModal.reason}
                  onChange={(e) =>
                    setJustificationModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Quick Preset Buttons for Justification */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">Opciones rápidas:</span>
                {[
                  "Cita médica / Salud",
                  "Permiso familiar",
                  "Reposo médico",
                  "Representación escolar",
                  "Duelo familiar"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setJustificationModal((prev) => ({ ...prev, reason: preset }))
                    }
                    className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md font-medium transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5">
              <button
                type="button"
                onClick={() => setJustificationModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleSaveJustification}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Guardar Justificación
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AGREGAR / EDITAR ESTUDIANTE                             */}
      {/* ============================================================== */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              {editingStudentId ? "Editar Estudiante" : "Agregar Nuevo Estudiante"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Salón: {currentClass?.grade} - Sección "{currentClass?.section}"
            </p>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre y Apellidos *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: Sofía Mendoza Ramos"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono o Contacto del Apoderado (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: +51 987 654 321"
                  value={studentContact}
                  onChange={(e) => setStudentContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Adaptación Curricular / DUA (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Requiere apoyo visual, tiempo extra o instrucciones fragmentadas"
                  value={studentSpecialNeeds}
                  onChange={(e) => setStudentSpecialNeeds(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones Pedagógicas</label>
                <textarea
                  rows={2}
                  placeholder="Notas internas sobre su ritmo o fortalezas..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: IMPORTACIÓN EN LOTE (Pegar Nombres de Excel/Word)       */}
      {/* ============================================================== */}
      {isBatchImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 overflow-hidden"
          >
            <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Importar Lista Rápida de Estudiantes
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Copia y pega la lista de nombres desde Excel, Word o un PDF (un estudiante por cada línea).
            </p>

            <textarea
              rows={8}
              placeholder={`1. Carlos Quispe Ramos\n2. Andrea Delgado Soto\n3. Mateo Morales Vega\n...`}
              value={batchNamesText}
              onChange={(e) => setBatchNamesText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
            />

            <div className="mt-2 text-[11px] text-slate-400">
              * Se detectarán y numerarán automáticamente en orden correlativo.
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsBatchImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!batchNamesText.trim()}
                onClick={handleBatchImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Importar Estudiantes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
