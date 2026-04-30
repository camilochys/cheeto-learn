"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, BookOpen, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CourseProgress {
  id: string;
  title: string;
  currentLevel: number;
  totalAnswers: number;
  correctAnswers: number;
}

export default function ProgressPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
  const { visible, getFadeStyle } = useFade();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !token) return;

    let fetchFailed = false;

    const fetchData = fetchProgress(token).catch(() => {
      fetchFailed = true;
    });

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));

    Promise.all([minLoadTime, fetchData]).then(() => {
      if (!fetchFailed) setLoading(false);
    });
  }, [isReady, token]);

  async function fetchProgress(token: string) {
    const res = await fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Unauthorized");

    setProgress(data.data.map((e: any) => ({
      id: e.course.id,
      title: e.course.title,
      currentLevel: e.currentLevel,
      totalAnswers: e.totalAnswers ?? 0,
      correctAnswers: e.correctAnswers ?? 0
    })));
  }

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando tu progreso"
        description="Preparando tus estadísticas..."
        fadingOut={fadingOut}
        visible={visible}
      />
    );
  }

  const chartData = progress.map((c) => ({
    name: c.title.length > 12 ? c.title.substring(0, 10) + ".." : c.title,
    nivel: c.currentLevel,
  }));

  const totalAnswers = progress.reduce((acc, c) => acc + c.totalAnswers, 0);
  const totalCorrect = progress.reduce((acc, c) => acc + c.correctAnswers, 0);
  const globalPercentage = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-600"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="STUDENT" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="max-w-4xl w-full">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al panel</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </Link>
        </div>
        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mi progreso</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Estadísticas de tu aprendizaje</p>
        </div>

        {/* --- GLOBAL STATS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{progress.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Cursos inscritos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{totalAnswers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 sm:col-span-2 lg:col-span-1">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{globalPercentage}%</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Aciertos globales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- LEVEL CHART --- */}
        {chartData.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">Nivel por curso</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tu nivel adaptativo actual en cada curso</CardDescription>
            </CardHeader>
            <CardContent className="px-1 sm:px-6">
              <div className="h-62.5 sm:h-75 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }} 
                      axisLine={false}
                      tickLine={false}
                      interval={0}
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
                      contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)' }}
                    />
                    <Bar dataKey="nivel" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- COURSE BREAKDOWN --- */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">Detalle por curso</h2>
          {progress.length === 0 ? (
            <Card className="text-center py-12 sm:py-16 border-dashed">
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground italic">No estás inscrito en ningún curso todavía.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {progress.map((course) => (
                <Card key={course.id} className="group hover:border-primary/30 transition-colors">
                  <CardContent className="py-5 sm:py-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-foreground text-sm sm:text-base truncate">{course.title}</p>
                      <span className="shrink-0 text-[10px] sm:text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        Nivel {course.currentLevel} / 5
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${(course.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground font-medium">
                        <span>Progreso de maestría</span>
                        <span>{Math.round((course.currentLevel / 5) * 100)}%</span>
                      </div>
                    </div>
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