"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, LogOut, User, BarChart3 } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  currentLevel: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

useEffect(() => {
    // Fade in inmediato
    setVisible(true);

const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
  setFadingOut(true);
  setTimeout(() => router.push("/login"), 600);
  return;
}

if (role === "TEACHER") {
  setFadingOut(true);
  setTimeout(() => router.push("/teacher"), 600);
  return;
}

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));
    const fetchData = fetchEnrollments(token);

    Promise.all([minLoadTime, fetchData]).then(() => {
      setLoading(false);
    });
  }, []);

  function redirectWithFade(path: string) {
    setFadingOut(true);
    setTimeout(() => router.push(path), 400);
  }

  async function fetchEnrollments(token: string) {
    const res = await fetch("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      redirectWithFade("/login");
      return;
    }

    setEnrollments(data.data.map((e: any) => ({
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      currentLevel: e.currentLevel
    })));
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    redirectWithFade("/");
  }

  // --- LOADING SCREEN ---
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background transition-opacity duration-[600ms]"
        style={{ opacity: fadingOut ? 0 : visible ? 1 : 0 }}
      >
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-2">
            <img src="/cheeto_learn_logo.png" className="h-12 mx-auto mb-2" />
            <CardTitle className="text-2xl">Cargando tu aprendizaje</CardTitle>
            <CardDescription>Preparando tus cursos y progreso...</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="flex justify-center gap-2 mt-4">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-[600ms]"
      style={{ opacity: fadingOut ? 0 : visible ? 1 : 0 }}
    >
      {/* --- NAVBAR --- */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <img src="/cheeto_learn_logo.png" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Alumno
            </span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Mi aprendizaje</h1>
          <p className="text-muted-foreground">Continúa donde lo dejaste</p>
        </div>

        {/* --- COURSES GRID --- */}
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
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="w-8 h-8 text-primary mb-2" />
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      Nivel {course.currentLevel}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Nivel actual</span>
                      <span>{course.currentLevel} / 5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(course.currentLevel / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <Link href={`/dashboard/exercise/${course.id}`}>
                    <Button className="w-full mt-2">
                      Practicar ahora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- STATS BANNER --- */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Tu progreso en CheetoLearn</p>
                <p className="text-sm text-muted-foreground">
                  Estás inscrito en {enrollments.length} {enrollments.length === 1 ? "curso" : "cursos"}. ¡Sigue practicando para subir de nivel!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}