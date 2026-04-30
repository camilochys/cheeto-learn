"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, Calendar, ChevronRight, Clock, FileText } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50/50" style={getFadeStyle(fadingOut)}>
      <Navbar role="STUDENT" onLogout={logout} />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
		        <div className="max-w-4xl w-full">
		            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al panel
              </Button>
            </Link>
			        </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mt-6">
              Tareas del curso
            </h1>
            <p className="text-muted-foreground">Gestiona tus entregas y consulta tus calificaciones.</p>
          </div>
          
          <div className="bg-background border border-border px-4 py-2 rounded-xl shadow-sm hidden md:flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-4 h-4" />
             </div>
             <div className="text-xs">
                <p className="font-bold text-foreground">Fecha actual</p>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
             </div>
          </div>
        </header>

        <div className="grid gap-4">
          {assignments.length === 0 ? (
            <Card className="text-center py-16 border-2 border-dashed border-muted bg-transparent">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-semibold text-foreground">No hay tareas pendientes</p>
                  <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                    Parece que no hay tareas programadas para este curso en este momento.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => {
              const isGraded = assignment.submission?.score !== null && assignment.submission?.score !== undefined;
              const isSubmitted = assignment.submission?.state === "SUBMITTED" || assignment.submission?.state === "PENDING";

              return (
                <Card key={assignment.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 gap-6">
                      <div className="flex items-start md:items-center gap-5">
                        <div className={`p-4 rounded-2xl shrink-0 transition-colors ${
                          isGraded 
                            ? 'bg-green-100 text-green-600' 
                            : isSubmitted 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-primary/10 text-primary'
                        }`}>
                          <FileText className="w-6 h-6 md:w-7 md:h-7" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg md:text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
                            {assignment.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-slate-100 px-2.5 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5" /> 
                              <span className="font-medium">
                                Límite: {assignment.limitDate ? new Date(assignment.limitDate).toLocaleDateString() : "Sin fecha"}
                              </span>
                            </div>
                            
                            {isGraded ? (
                              <Badge className="bg-green-600 hover:bg-green-600 text-white border-none px-3">
                                Calificada: {assignment.submission?.score}/10
                              </Badge>
                            ) : isSubmitted ? (
                              <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none px-3">
                                Entregada
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-3">
                                Pendiente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-none">
                        <Link href={`/dashboard/assignment/${courseId}/${assignment.id}`} className="w-full">
                          <Button className="w-full md:w-auto shadow-sm group/btn font-bold px-6">
                            {isGraded ? "Ver corrección" : isSubmitted ? "Editar entrega" : "Abrir tarea"}
                            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
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