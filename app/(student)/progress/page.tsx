"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

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
    name: c.title.length > 15 ? c.title.substring(0, 15) + "..." : c.title,
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

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Mi progreso</h1>
          <p className="text-muted-foreground">Estadísticas de tu aprendizaje</p>
        </div>

        {/* --- GLOBAL STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{progress.length}</p>
                <p className="text-sm text-muted-foreground">Cursos inscritos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{totalAnswers}</p>
                <p className="text-sm text-muted-foreground">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{globalPercentage}%</p>
                <p className="text-sm text-muted-foreground">Aciertos globales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- LEVEL CHART --- */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Nivel por curso</CardTitle>
              <CardDescription>Tu nivel adaptativo actual en cada curso</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="nivel" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* --- COURSE BREAKDOWN --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Detalle por curso</h2>
          {progress.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <p className="text-muted-foreground">No estás inscrito en ningún curso todavía.</p>
              </CardContent>
            </Card>
          ) : (
            progress.map((course) => (
              <Card key={course.id}>
                <CardContent className="py-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{course.title}</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      Nivel {course.currentLevel} / 5
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(course.currentLevel / 5) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}