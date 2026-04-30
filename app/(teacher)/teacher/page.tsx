"use client";

import { CourseCard } from "@/components/shared/CourseCard";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { BarChart3, BookOpen, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  enrolledCount: number;
  answersCount: number;
}

export default function TeacherPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
const totalStudents = courses?.length > 0 
  ? courses.reduce((acc, course) => acc + (course.enrolledCount || 0), 0) 
  : 0;

const totalAnswers = courses?.length > 0 
  ? courses.reduce((acc, course) => acc + (course.answersCount || 0), 0) 
  : 0;

  useEffect(() => {
    if (!isReady || !token) return;

    let fetchFailed = false;

    const fetchData = fetchCourses(token).catch(() => {
      fetchFailed = true;
    });

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));

    Promise.all([minLoadTime, fetchData]).then(() => {
      if (!fetchFailed) setLoading(false);
    });
  }, [isReady, token]);

  async function fetchCourses(token: string) {
    const res = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) throw new Error("Unauthorized");

    setCourses(data.data);
  }

  function handleLogout() {
    logout();
  }

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando tu panel"
        description="Preparando tus cursos y alumnos..."
        fadingOut={fadingOut}
        visible={visible}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-700"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="TEACHER" onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Panel del profesor</h1>
            <p className="text-muted-foreground">Bienvenido de nuevo a tu espacio de gestión.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm group">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">{courses.length}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Cursos creados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm group">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">{totalStudents}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Alumnos inscritos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 hover:border-primary/30 transition-all duration-300 shadow-sm group sm:col-span-2 lg:col-span-1">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">{totalAnswers}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Mis cursos</h2>
              <p className="text-muted-foreground">Gestiona tus cursos y alumnos de forma centralizada</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/students" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full transition-all active:scale-[0.98]">
                  <Users className="w-4 h-4 mr-2" />
                  Ver alumnos
                </Button>
              </Link>
              
              <Link href="/teacher/courses/new" className="flex-1 sm:flex-none">
                <Button className="w-full shadow-md shadow-primary/20 transition-all active:scale-[0.98]">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo curso
                </Button>
              </Link>
            </div>
          </div>
          
          {courses.length === 0 ? (
            <Card className="text-center py-20 border-dashed bg-muted/20">
              <CardContent className="space-y-6">
                <div className="p-4 rounded-full bg-background w-fit mx-auto shadow-sm">
                  <BookOpen className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">No hay cursos todavía</p>
                  <p className="text-muted-foreground max-w-xs mx-auto">Comienza creando tu primer curso para compartir tus conocimientos.</p>
                </div>
                <Link href="/teacher/courses/new">
                  <Button size="lg" className="px-8">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primer curso
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="animate-in fade-in zoom-in-95 duration-500">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    role="TEACHER"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}