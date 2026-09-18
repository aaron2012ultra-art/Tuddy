import React, { useMemo, useState } from "react";
import { 
  CalendarCheck2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Filter,
  FileText,
  Info
} from "lucide-react";
import { 
  TeacherClassroom, 
  StudentActiveSession, 
  StudentAttendanceEntry, 
  AttendanceStatus 
} from "../../types";

interface StudentAttendanceViewProps {
  session: StudentActiveSession;
  classroom: TeacherClassroom;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  session,
  classroom,
}) => {
  const [filter, setFilter] = useState<AttendanceStatus | "all">("all");

  // Compile student's history across all recorded dates
  const attendanceHistory = useMemo(() => {
    const dates = Object.keys(classroom.attendanceByDate || {}).sort().reverse();
    const records: Array<{
      date: string;
      status: AttendanceStatus;
      justification?: string;
      recordedAt?: string;
    }> = [];

    dates.forEach((dateStr) => {
      const dayRecord = classroom.attendanceByDate?.[dateStr]?.[session.studentId];
      if (dayRecord) {
        records.push({
          date: dateStr,
          status: dayRecord.status,
          justification: dayRecord.justification,
          recordedAt: dayRecord.recordedAt,
        });
      }
    });

    return records;
  }, [classroom.attendanceByDate, session.studentId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = attendanceHistory.length;
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    attendanceHistory.forEach((r) => {
      if (r.status === "present") present++;
      else if (r.status === "late") late++;
      else if (r.status === "excused") excused++;
      else if (r.status === "absent") absent++;
    });

    // Score: present = 100%, late = 80%, excused = 100% (justified), absent = 0%
    const score = total > 0 ? Math.round(((present + excused + late * 0.8) / total) * 100) : 100;

    return { total, present, late, excused, absent, score };
  }, [attendanceHistory]);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return attendanceHistory;
    return attendanceHistory.filter((r) => r.status === filter);
  }, [attendanceHistory, filter]);

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Attendance Rate */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-xs">
          <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Índice Asistencia</p>
          <p className="text-3xl font-black mt-1">{stats.score}%</p>
          <p className="text-[10px] text-emerald-100 mt-0.5">
            {stats.score >= 90 ? "Excelente puntualidad" : stats.score >= 75 ? "Regular" : "Requiere atención"}
          </p>
        </div>

        {/* Present Days */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Presente</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.present}</p>
          <p className="text-[10px] text-slate-400">días asistidos</p>
        </div>

        {/* Tardanzas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase">Tardanzas</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-1">{stats.late}</p>
          <p className="text-[10px] text-slate-400">llegadas tarde</p>
        </div>

        {/* Ausencias Justificadas */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase">Justificadas</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-1">{stats.excused}</p>
          <p className="text-[10px] text-slate-400">con comprobante</p>
        </div>

        {/* Faltas Injustificadas */}
        <div className="p-4 rounded-2xl bg-white border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 uppercase">Faltas</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 mt-1">{stats.absent}</p>
          <p className="text-[10px] text-slate-400">injustificadas</p>
        </div>
      </div>

      {/* Filter and History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Historial Diario de Asistencia ({attendanceHistory.length} fechas registradas)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Récord oficial tomado en clase por tu profesor.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setFilter("present")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "present" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Presentes
            </button>
            <button
              type="button"
              onClick={() => setFilter("late")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "late" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tardanzas
            </button>
            <button
              type="button"
              onClick={() => setFilter("excused")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "excused" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Justificadas
            </button>
            <button
              type="button"
              onClick={() => setFilter("absent")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "absent" ? "bg-white text-rose-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Faltas
            </button>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600">No hay registros para este filtro</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {attendanceHistory.length === 0
                ? "El docente aún no ha registrado la asistencia de este período."
                : "No se encontraron fechas que coincidan con la categoría elegida."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((entry) => {
              const isPresent = entry.status === "present";
              const isLate = entry.status === "late";
              const isExcused = entry.status === "excused";
              const isAbsent = entry.status === "absent";

              return (
                <div
                  key={entry.date}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isPresent
                          ? "bg-emerald-100 text-emerald-700"
                          : isLate
                          ? "bg-amber-100 text-amber-700"
                          : isExcused
                          ? "bg-blue-100 text-blue-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isPresent && <CheckCircle2 className="w-4 h-4" />}
                      {isLate && <Clock className="w-4 h-4" />}
                      {isExcused && <ShieldCheck className="w-4 h-4" />}
                      {isAbsent && <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 capitalize">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Fecha: <strong>{entry.date}</strong>
                      </p>

                      {/* Motivo de ausencia justificada */}
                      {isExcused && entry.justification && (
                        <div className="mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-start gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Motivo registrado:</strong> {entry.justification}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                        isPresent
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          : isLate
                          ? "bg-amber-50 border border-amber-200 text-amber-700"
                          : isExcused
                          ? "bg-blue-50 border border-blue-200 text-blue-700"
                          : "bg-rose-50 border border-rose-200 text-rose-700"
                      }`}
                    >
                      {isPresent && "Presente"}
                      {isLate && "Tardanza"}
                      {isExcused && "Ausencia Justificada"}
                      {isAbsent && "Falta Injustificada"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Information Helper */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          Si tienes una inasistencia que necesitas justificar (por salud o motivos familiares), puedes enviarle un mensaje a tu profesor en la pestaña de <strong>Avisos & Mensajes</strong> con los detalles correspondientes.
        </p>
      </div>
    </div>
  );
};
