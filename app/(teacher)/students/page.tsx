"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { AlertTriangle, ArrowLeft, Clock, Target, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell, Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
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
    name: `${e.studentName.split(" ")[0]} — ${e.courseTitle.substring(0, 8)}.`,
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
    const radius = outerRadius + 35; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const textContent = `${name} ${Math.round(percent * 100)}%`;
    
    // --- LENGTH RECT SIMPLE ESTIMATE BASED ON TEXT ---
    const boxWidth = textContent.length * 7; 

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
          strokeWidth={1.5}
        />
        {/* --- TEXT 0,0 AND ANCHOR MIDDLE, ALWAYS ON CENTER OF RECT --- */}
        <text
          x={0}
          y={0}
          fill={COLORS[index]}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[10px] sm:text-[12px] font-medium"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">

	<div className="max-w-4xl w-full">
		<Link href="/teacher">
			<Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
				<ArrowLeft className="w-4 h-4" />
				<span className="hidden sm:inline">Volver al panel</span>
				<span className="sm:hidden">Volver</span>
			</Button>
		</Link>
	</div>
  
        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mis alumnos</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Métricas y estadísticas de tus alumnos</p>
        </div>

        {/* --- GLOBAL STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors duration-300">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{students.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Alumnos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors duration-300">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{totalAnswers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors duration-300">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{globalPercentage}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Aciertos globales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors duration-300">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-xl shrink-0">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{avgResponseTime}s</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Tiempo medio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- CHARTS ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* --- LEVEL CHART --- */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">Nivel adaptativo por alumno</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Nivel actual de cada alumno en cada curso</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {levelChartData.length === 0 ? (
                <p className="text-muted-foreground text-center py-12 text-sm">Sin datos todavía.</p>
              ) : (
                <div className="h-62.5 sm:h-75 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[0, 5]} 
                        ticks={[1, 2, 3, 4, 5]} 
                        tick={{ fontSize: 11 }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }}
                      />
                      <Bar dataKey="nivel" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- PIE CHART CORRECT VS WRONG --- */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">Correctas vs Incorrectas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Distribución global de respuestas</CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {totalAnswers === 0 ? (
                <p className="text-muted-foreground text-center py-12 text-sm">Sin datos todavía.</p>
              ) : (
                <div className="h-62.5 sm:h-75 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={renderCustomLabel}
                        stroke="var(--background)"
                        strokeWidth={2}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index]} className="hover:opacity-80 transition-opacity outline-none" />
                        ))}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }} 
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- HARDEST QUESTIONS --- */}
        {hardestQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Preguntas con más fallos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Contenidos que presentan mayor dificultad para tus alumnos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              {hardestQuestions.map((q, index) => (
                <div key={index} className="space-y-2 group">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-foreground font-medium line-clamp-2 pr-4">{q.question}</span>
                    <span className="text-primary font-bold shrink-0 bg-primary/10 px-2 py-1 rounded-md">{q.failures} fallos</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                      className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-1000 ease-out"
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
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">Detalle por alumno</h2>
          {students.length === 0 ? (
            <Card className="text-center py-12 sm:py-16 border-dashed">
              <CardContent>
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground italic">No tienes alumnos inscritos todavía.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <Card
                  key={student.studentId}
                  className={`group hover:border-primary/40 hover:shadow-sm transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedStudent === student.studentId ? "border-primary/50 shadow-md ring-1 ring-primary/20" : ""
                  }`}
                  onClick={() => setSelectedStudent(
                    selectedStudent === student.studentId ? null : student.studentId
                  )}
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="truncate">
                        <CardTitle className="text-base sm:text-lg truncate">{student.studentName}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">{student.studentEmail}</CardDescription>
                      </div>
                      <span className="shrink-0 text-[10px] sm:text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {student.enrollments.length} {student.enrollments.length === 1 ? "curso" : "cursos"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {student.enrollments.map((enrollment) => (
                      <div key={enrollment.courseId} className="space-y-3 bg-muted/30 p-3 sm:p-4 rounded-xl border border-border/50 transition-colors group-hover:border-border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 text-sm">
                          <span className="font-semibold text-foreground truncate">{enrollment.courseTitle}</span>
                          <span className="text-xs text-muted-foreground font-medium shrink-0">Nivel {enrollment.currentLevel} / 5</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <div
                            className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${(enrollment.currentLevel / 5) * 100}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 divide-x divide-border">
                          <div className="text-center px-1">
                            <p className="text-sm sm:text-base font-bold text-foreground">{enrollment.stats.totalAnswers}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Respuestas</p>
                          </div>
                          <div className="text-center px-1">
                            <p className="text-sm sm:text-base font-bold text-primary">{enrollment.stats.percentage}%</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Aciertos</p>
                          </div>
                          <div className="text-center px-1">
                            <p className="text-sm sm:text-base font-bold text-foreground">{enrollment.stats.avgResponseTime}s</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Tiempo med.</p>
                          </div>
                        </div>

                        {/* --- HARDEST QUESTIONS PER STUDENT --- */}
                        <div 
                          className={`grid transition-all duration-300 ease-in-out ${
                            selectedStudent === student.studentId && enrollment.stats.hardestQuestions.length > 0
                              ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-border" 
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                              Preguntas con más fallos
                            </p>
                            {enrollment.stats.hardestQuestions.map((q, i) => (
                              <div key={i} className="flex items-center justify-between text-xs sm:text-sm bg-background p-2 rounded-md border border-border/50">
                                <span className="text-foreground line-clamp-1 pr-2">{q.question}</span>
                                <span className="text-primary font-bold shrink-0 bg-primary/10 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{q.failures}x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}