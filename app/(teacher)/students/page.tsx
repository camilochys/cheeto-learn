"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp } from "lucide-react";

interface StudentEnrollment {
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  currentLevel: number;
  enrolledAt: string;
}

interface StudentSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollments: {
    courseId: string;
    courseTitle: string;
    currentLevel: number;
  }[];
}

export default function StudentsPage() {
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

    // --- GROUP BY STUDENT ---
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
        currentLevel: e.currentLevel
      });
    });

    setStudents(Object.values(grouped));
  }

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando alumnos"
        description="Preparando el listado de alumnos..."
        fadingOut={fadingOut}
        visible={visible}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-[600ms]"
      style={getFadeStyle(fadingOut)}
    >
      <Navbar role="TEACHER" onLogout={logout} />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* --- HEADER --- */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Mis alumnos</h1>
          <p className="text-muted-foreground">Progreso de tus alumnos inscritos</p>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{students.length}</p>
                <p className="text-sm text-muted-foreground">Alumnos únicos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-6 flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.reduce((acc, s) => acc + s.enrollments.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Inscripciones totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- STUDENTS LIST --- */}
        {students.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <Users className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No tienes alumnos inscritos todavía.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student.studentId} className="hover:shadow-md transition-shadow">
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
                <CardContent className="space-y-3">
                  {student.enrollments.map((enrollment) => (
                    <div key={enrollment.courseId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">{enrollment.courseTitle}</span>
                        <span className="text-muted-foreground">Nivel {enrollment.currentLevel} / 5</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(enrollment.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}