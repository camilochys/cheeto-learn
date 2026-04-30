"use client";

import { CourseCard } from "@/components/shared/CourseCard";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { BarChart3, BookOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  currentLevel: number;
}

export default function DashboardPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
  const { visible, getFadeStyle } = useFade();
  const [enrollments, setEnrollments] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !token) return;

    let fetchFailed = false;

    const fetchData = fetchEnrollments(token).catch(() => {
      fetchFailed = true;
    });

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));

    Promise.all([minLoadTime, fetchData]).then(() => {
      if (!fetchFailed) setLoading(false);
    });
  }, [isReady, token]);

  async function fetchEnrollments(token: string) {
    const res = await fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) throw new Error("Unauthorized");

    setEnrollments(data.data.map((e: any) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      currentLevel: e.currentLevel
    })));
  }

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando tu aprendizaje"
        description="Preparando tus cursos y progreso..."
        fadingOut={fadingOut}
        visible={visible}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-600"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="STUDENT" onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Mi aprendizaje</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Continúa donde lo dejaste</p>
        </div>

        {enrollments.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto" />
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">No estás inscrito en ningún curso todavía.</p>
                <p className="text-sm text-muted-foreground/80">Contacta con tu profesor para que te inscriba.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {enrollments.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                currentLevel={course.currentLevel}
                role="STUDENT"
              />
            ))}
          </div>
        )}

        <Card className="bg-primary/5 border-primary/20 overflow-hidden">
          <CardContent className="py-6 px-5 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-lg">Tu progreso en CheetoLearn</p>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Estás inscrito en {enrollments.length} {enrollments.length === 1 ? "curso" : "cursos"}. ¡Sigue practicando para subir de nivel!
                  </p>
                </div>
              </div>
              <Link href="/progress" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/10 rounded-xl">
                  Ver progreso
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}