"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

interface HardQuestion {
  question: string;
  failures: number;
}

interface StudentStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  avgResponseTime: number;
  hardestQuestions: HardQuestion[];
}

interface StudentEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  currentLevel: number;
  enrolledAt: string;
  stats: StudentStats;
}

interface StudentSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollments: {
    courseId: string;
    courseTitle: string;
    currentLevel: number;
    stats: StudentStats;
  }[];
}

const COLORS = ["var(--chart-1)", "var(--chart-3)"];

export default function StudentsPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [rawData, setRawData] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || !token) return;

    let fetchFailed = false;

    const fetchData = fetchStudents(token).catch(() => {
      fetchFailed = true;
    });

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));

    Promise.all([minLoadTime, fetchData]).then(() => {
      if (!fetchFailed) setLoading(false);
    });
  }, [isReady, token]);

  async function fetchStudents(token: string) {
    const res = await fetch("/api/students", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Unauthorized");

    setRawData(data.data);

    const grouped: Record<string, StudentSummary> = {};
    data.data.forEach((e: StudentEnrollment) => {
      if (!grouped[e.studentId]) {
        grouped[e.studentId] = {
          studentId: e.studentId,
          studentName: e.studentName,
          studentEmail: e.studentEmail,
          enrollments: []
        };
      }
      grouped[e.studentId].enrollments.push({
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        currentLevel: e.currentLevel,
        stats: e.stats
      });
    });

    setStudents(Object.values(grouped));
  }

  // --- GLOBAL STATS ---
  const totalAnswers = rawData.reduce((acc, e) => acc + e.stats.totalAnswers, 0);
  const totalCorrect = rawData.reduce((acc, e) => acc + e.stats.correctAnswers, 0);
  const globalPercentage = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
  const avgResponseTime = rawData.length > 0
    ? Math.round(rawData.reduce((acc, e) => acc + e.stats.avgResponseTime, 0) / rawData.length)
    : 0;

  // --- CHART DATA: LEVEL PER STUDENT PER COURSE ---
  const levelChartData = rawData.map((e) => ({
    name: `${e.studentName} — ${e.courseTitle.substring(0, 10)}`,
    nivel: e.currentLevel
  }));

  // --- CHART DATA: CORRECT VS INCORRECT GLOBAL ---
  const pieData = [
    { name: "Correctas", value: totalCorrect },
    { name: "Incorrectas", value: totalAnswers - totalCorrect }
  ];

  // --- HARDEST QUESTIONS ACROSS ALL STUDENTS ---
  const allHardQuestions: Record<string, number> = {};
  rawData.forEach((e) => {
    e.stats.hardestQuestions.forEach((q) => {
      allHardQuestions[q.question] = (allHardQuestions[q.question] ?? 0) + q.failures;
    });
  });
  const hardestQuestions = Object.entries(allHardQuestions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([question, failures]) => ({ question, failures }));

  const selectedStudentData = selectedStudent
    ? students.find((s) => s.studentId === selectedStudent)
    : null;

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando alumnos"
        description="Preparando estadísticas y métricas..."
        fadingOut={fadingOut}
        visible={visible}
      />
    );
  }

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name, percent, index }: any) => {
  const RADIAN = Math.PI / 180;
  // --- RADIUS PIE SEPARATION
  const radius = outerRadius + 55; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const textContent = `${name} ${Math.round(percent * 100)}%`;
  
  // --- LENGTH RECT SIMPLE ESTIMATE BASED ON TEXT ---
  const boxWidth = textContent.length * 8; 

  return (
    <g transform={`translate(${x}, ${y})`}> 
      {/* --- RECT X AND E RELATIVE TO GROUP, -boxWidth / 2 DOES THE CENTER TRICK ;) --- */}
      <rect
        x={-boxWidth / 2}
        y={-12} 
        width={boxWidth}
        height={24}
        rx={6}
        ry={6}
        fill="transparent"
        stroke={COLORS[index]}
        strokeWidth={2}
      />
      {/* --- TEXT 0,0 AND ANCHOR MIDDLE, ALWAYS ON CENTER OF RECT --- */}
      <text
        x={0}
        y={0}
        fill={COLORS[index]}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[14px]"
      >
        {textContent}
      </text>
    </g>
  );
};

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-600"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="TEACHER" onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">

        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Mis alumnos</h1>
          <p className="text-muted-foreground">Métricas y estadísticas de tus alumnos</p>
        </div>

        {/* --- GLOBAL STATS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-xs text-muted-foreground">Alumnos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-3">
              <Target className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalAnswers}</p>
                <p className="text-xs text-muted-foreground">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{globalPercentage}%</p>
                <p className="text-xs text-muted-foreground">Aciertos globales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-3">
              <Clock className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">{avgResponseTime}s</p>
                <p className="text-xs text-muted-foreground">Tiempo medio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid md:grid-cols-1 gap-8">
          {/* --- LEVEL CHART --- */}
          <Card>
            <CardHeader>
              <CardTitle>Nivel adaptativo por alumno</CardTitle>
              <CardDescription>Nivel actual de cada alumno en cada curso</CardDescription>
            </CardHeader>
            <CardContent>
              {levelChartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sin datos todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={levelChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="nivel" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* --- PIE CHART CORRECT VS WRONG --- */}
          <Card>
            <CardHeader>
              <CardTitle>Respuestas correctas vs incorrectas</CardTitle>
              <CardDescription>Distribución global de respuestas</CardDescription>
            </CardHeader>
            <CardContent>
              {totalAnswers === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sin datos todavía.</p>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={renderCustomLabel}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- HARDEST QUESTIONS --- */}
        {hardestQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Preguntas con más fallos
              </CardTitle>
              <CardDescription>Contenidos que presentan mayor dificultad para tus alumnos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hardestQuestions.map((q, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary line-clamp-1">{q.question}</span>
                    <span className="text-primary font-medium shrink-0 ml-4">{q.failures} fallos</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${Math.min((q.failures / (hardestQuestions[0]?.failures || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* --- STUDENT LIST WITH DETAIL --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Detalle por alumno</h2>
          {students.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes alumnos inscritos todavía.</p>
              </CardContent>
            </Card>
          ) : (
            students.map((student) => (
              <Card
                key={student.studentId}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStudent(
                  selectedStudent === student.studentId ? null : student.studentId
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{student.studentName}</CardTitle>
                      <CardDescription>{student.studentEmail}</CardDescription>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {student.enrollments.length} {student.enrollments.length === 1 ? "curso" : "cursos"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.enrollments.map((enrollment) => (
                    <div key={enrollment.courseId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{enrollment.courseTitle}</span>
                        <span className="text-muted-foreground">Nivel {enrollment.currentLevel} / 5</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(enrollment.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{enrollment.stats.totalAnswers}</p>
                          <p className="text-xs text-muted-foreground">Respuestas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-primary">{enrollment.stats.percentage}%</p>
                          <p className="text-xs text-muted-foreground">Aciertos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{enrollment.stats.avgResponseTime}s</p>
                          <p className="text-xs text-muted-foreground">Tiempo medio</p>
                        </div>
                      </div>

                      {/* --- HARDEST QUESTIONS PER STUDENT --- */}
                      {selectedStudent === student.studentId && enrollment.stats.hardestQuestions.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-primary" />
                            Preguntas con más fallos
                          </p>
                          {enrollment.stats.hardestQuestions.map((q, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-foreground line-clamp-1">{q.question}</span>
                              <span className="text-primary font-medium ml-2 shrink-0">{q.failures}x</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}