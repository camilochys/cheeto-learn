"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { CourseCard } from "@/components/shared/CourseCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Plus, BarChart3 } from "lucide-react";
import Link from "next/link";
import NewCoursePage from "./courses/new/page";

interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function TeacherPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
      className="min-h-screen bg-background transition-opacity duration-600"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="TEACHER" onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Panel del profesor</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Cursos creados</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">—</p>
                <p className="text-sm text-muted-foreground">Alumnos inscritos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">—</p>
                <p className="text-sm text-muted-foreground">Respuestas totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Mis cursos</h1>
              <p className="text-muted-foreground">Gestiona tus cursos y alumnos</p>
            </div>

              <div className="align-top">
                <Link href="/teacher/courses/new">
                  <Button className="space-x-3">
                    <Plus className="w-4 h-4 mr-2" />
                      Nuevo curso
                  </Button>
                </Link>
              </div>
            
            </div>
          
          {courses.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-4">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No has creado ningún curso todavía.</p>
                <Link href="/courses/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear primer curso
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  role="TEACHER"
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}