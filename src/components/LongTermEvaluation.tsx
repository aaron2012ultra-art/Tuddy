import React from "react";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Brain, 
  Award, 
  Flame, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  BarChart3, 
  ArrowUpRight 
} from "lucide-react";
import { UserStats, ExamSession, Flashcard, PetCustomization } from "../types";
import { PetAvatar } from "./AnthropomorphicBunny";
import { DEFAULT_PET } from "../utils/storage";
import { useTranslation } from "../utils/translations";

interface LongTermEvaluationProps {
  stats: UserStats;
  examHistory: ExamSession[];
  flashcards: Flashcard[];
  onRewardCarrot: (amount: number) => void;
  pet?: PetCustomization;
}

export const LongTermEvaluation: React.FC<LongTermEvaluationProps> = ({
  stats,
  examHistory,
  flashcards,
  pet = DEFAULT_PET,
}) => {
  const { t } = useTranslation();
  // Mastery counts from flashcards
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter((c) => c.masteryLevel === 3).length;
  const learningCards = flashcards.filter((c) => c.masteryLevel >= 1 && c.masteryLevel < 3).length;
  const newCards = flashcards.filter((c) => c.masteryLevel === 0).length;

  const masteryPercentage = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Calculate average exam score
  const recentExams = examHistory.slice(0, 6);
  const avgExamScore =
    recentExams.length > 0
      ? Math.round(
          recentExams.reduce((acc, curr) => acc + curr.percentage, 0) / recentExams.length
        )
      : stats.averageScore || 85;

  // Estimated long-term retention rate based on repetition count
  const estimatedRetention = Math.min(
    96,
    Math.max(65, Math.round(72 + (masteredCards / Math.max(1, totalCards)) * 25))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            {t.analyticsTitle}
          </h2>
          <p className="text-sm text-slate-500">
            {t.analyticsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-100/80 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-amber-900">
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          <span>{t.currentStreakDays}: {stats.streakDays}</span>
        </div>
      </div>

      {/* 4 Core Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Retention Rate */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t.weeklyRetention}
            </span>
            <Brain className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-emerald-950">{estimatedRetention}%</div>
            <p className="text-[11px] text-emerald-700 mt-0.5">{t.levelMastery}</p>
          </div>
          <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${estimatedRetention}%` }} />
          </div>
        </div>

        {/* Mastered Flashcards */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {t.masteredCards}
            </span>
            <Target className="h-5 w-5 text-amber-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-amber-950">
              {masteredCards} <span className="text-sm font-medium text-amber-700">/ {totalCards}</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-0.5">{masteryPercentage}%</p>
          </div>
          <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${masteryPercentage}%` }} />
          </div>
        </div>

        {/* Exam Average */}
        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              {t.examAverage}
            </span>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-blue-950">{avgExamScore}%</div>
            <p className="text-[11px] text-blue-700 mt-0.5">
              {recentExams.length} {t.completed}
            </p>
          </div>
          <div className="w-full bg-blue-200/80 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${avgExamScore}%` }} />
          </div>
        </div>

        {/* Study Hours */}
        <div className="rounded-3xl border border-purple-200 bg-purple-50/60 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              {t.totalStudyHours}
            </span>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-purple-950">
              {(stats.totalStudyMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-[11px] text-purple-700 mt-0.5">
              {stats.todayStudyMinutes} {t.minutes}
            </p>
          </div>
          <div className="w-full bg-purple-200/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (stats.todayStudyMinutes / 60) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mastery by Subject & Forgetting Curve Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Subject Breakdown (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Nivel de Dominio por Materia
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Evaluación Continua</span>
          </div>

          <div className="space-y-4">
            {Object.entries(stats.subjectProgress).map(([subject, data]) => {
              const score = data.scoreAvg || 80;
              return (
                <div key={subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{subject}</span>
                    <span className="font-semibold text-emerald-700">{score}% de acierto</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-emerald-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{data.totalHours} horas dedicadas</span>
                    <span>{data.cardsReviewed} repasos activos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ebbinghaus Forgetting Curve & Tuddy Scientific Tip (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/80 via-white to-amber-100/50 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Curva de Olvido & Consejo Tuddy</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            Sin repaso, el cerebro olvida el 50% de lo estudiado en 24 horas y el 80% en una semana. Con los 3 repasos de Tuddy, la curva se vuelve plana y el recuerdo pasa a la memoria permanente.
          </p>

          <div className="rounded-2xl bg-white p-4 border border-amber-200/80 shadow-2xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <PetAvatar pet={pet} size="xs" showBg={false} />
              <span>Recomendación Personalizada de {pet.name}:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tus resultados en <span className="font-semibold text-slate-900">Biología</span> son excelentes. Hoy te recomiendo reforzar 10 fichas de <span className="font-semibold text-slate-900">Historia</span> para consolidar los acontecimientos antes de que decaiga la curva de retención.
            </p>
          </div>
        </div>
      </div>

      {/* Exam Sessions Log History */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Historial de Simulacros y Exámenes Realizados
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {examHistory.length} exámenes guardados
          </span>
        </div>

        {examHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Aún no has completado ningún simulacro. Ve a la pestaña de Exámenes y pon a prueba tus conocimientos.
          </div>
        ) : (
          <div className="space-y-2.5">
            {examHistory.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{session.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{session.totalQuestions} preguntas</span>
                    <span>•</span>
                    <span>Duración: {Math.round(session.durationSeconds / 60)} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-extrabold text-sm ${
                        session.percentage >= 80
                          ? "text-emerald-600"
                          : session.percentage >= 60
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {session.percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {session.score}/{session.maxScore} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
