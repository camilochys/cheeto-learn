"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface AssignmentItem {
  id: string;
  title: string;
  limitDate: string | null;
  submission?: {
    score: number | null;
    state: string;
  };
}

export default function StudentAssignmentsListPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
  const { visible, getFadeStyle } = useFade();
  
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !token) return;

    const fetchAssignments = async () => {
      try {
        const res = await fetch(`/api/students/courses/${courseId}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) setAssignments(result.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [isReady, token, courseId]);

  if (!isReady || loading) return <LoadingScreen title="Cargando tareas..." fadingOut={fadingOut} visible={visible} />;

  return (
    <div className="min-h-screen bg-background" style={getFadeStyle(fadingOut)}>
      <Navbar role="STUDENT" onLogout={logout} />
      
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>
          </Link>
          <h1 className="text-3xl font-bold">Tareas del curso</h1>
        </div>

        <div className="grid gap-4">
          {assignments.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <CardContent>
                <p className="text-muted-foreground">No hay tareas programadas para este curso.</p>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => {
              const isGraded = assignment.submission?.score !== null && assignment.submission?.score !== undefined;
              const isSubmitted = assignment.submission?.state === "SUBMITTED" || assignment.submission?.state === "PENDING";

              return (
                <Card key={assignment.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isGraded ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{assignment.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 
                            Límite: {assignment.limitDate ? new Date(assignment.limitDate).toLocaleDateString() : "Sin fecha"}
                          </span>
                          {isGraded ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Nota: {assignment.submission?.score}/10
                            </Badge>
                          ) : isSubmitted ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Entregado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/dashboard/assignment/${courseId}/${assignment.id}`}>
                      <Button>
                        {isGraded ? "Ver nota" : isSubmitted ? "Ver entrega" : "Realizar tarea"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}