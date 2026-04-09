"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { CourseCard } from "@/components/shared/CourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Mi aprendizaje</h1>
          <p className="text-muted-foreground">Continúa donde lo dejaste</p>
        </div>

        {enrollments.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No estás inscrito en ningún curso todavía.</p>
              <p className="text-sm text-muted-foreground">Contacta con tu profesor para que te inscriba.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

<Card className="bg-primary/5 border-primary/20">
  <CardContent className="py-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Tu progreso en CheetoLearn</p>
          <p className="text-sm text-muted-foreground">
            Estás inscrito en {enrollments.length} {enrollments.length === 1 ? "curso" : "cursos"}. ¡Sigue practicando para subir de nivel!
          </p>
        </div>
      </div>
      <Link href="/progress">
        <Button size="sm">
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