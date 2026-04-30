"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileText, User } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Submission {
  id: string;
  studentName: string;
  content: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  grade?: number;
  feedback?: string;
  status: "PENDING" | "GRADED";
}

export default function ViewAssignmentPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
  const { courseId, assignmentId } = use(params);
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<number>(0);
  const [tempFeedback, setTempFeedback] = useState("");

  useEffect(() => {
    if (!isReady || !token) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) {
          setAssignment(result.data);
          setSubmissions(result.submissions || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isReady, token, assignmentId]);

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ grade: tempGrade, feedback: tempFeedback })
      });

      if (res.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId ? { ...s, grade: tempGrade, feedback: tempFeedback, status: "GRADED" } : s
        ));
        setGradingId(null);
      }
    } catch (err) {
      alert("Error al calificar");
    }
  };

  if (!isReady || loading) return <LoadingScreen title="Cargando..." fadingOut={fadingOut} visible={visible} />;

  return (
    <div className="min-h-screen bg-background transition-opacity duration-600" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link href={`/teacher/courses/${courseId}`}>
                <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
                  <ArrowLeft className="w-4 h-4"/>
                  <span className="hidden sm:inline">Volver al curso</span>
                  <span className="sm:hidden">Volver</span>
                </Button>
              </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{assignment?.title}</h1>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm mt-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Límite: {new Date(assignment?.limitDate).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- ASSIGNMENT DESCRIPTION --- */}
        <Card className="bg-muted/20 border-muted/40 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/30 bg-muted/30">
            <CardTitle className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-semibold">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <div className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignment?.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* --- ASSIGNMENT LIST --- */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Entregas de los alumnos ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground border rounded-xl border-dashed bg-muted/10">
              <FileText className="w-10 h-10 mb-3 text-muted-foreground/50" />
              <p className="text-sm sm:text-base italic">Aún no hay entregas para esta tarea.</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <Card 
                key={sub.id} 
                className={`group transition-all duration-300 shadow-sm hover:shadow-md ${
                  sub.status === "GRADED" 
                    ? "border-green-500/30 bg-green-500/5 hover:border-green-500/50" 
                    : "hover:border-primary/40"
                }`}
              >
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-5 sm:gap-6">
                    {/* --- STUDENT INFO --- */}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                            <p className="font-bold text-sm sm:text-base text-foreground truncate">{sub.studentName}</p>
                            {sub.status === "GRADED" && (
                              <span className="w-fit bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 tracking-wider">
                                <CheckCircle2 className="w-3 h-3" /> CALIFICADO
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-background/60 border border-border/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm">
                        <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Comentario del alumno:</p>
                        <p className="text-foreground leading-relaxed">{sub.content || "Sin comentarios."}</p>
                      </div>

                      {sub.fileUrl && (
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors font-medium bg-primary/5 px-3 py-2 rounded-md border border-primary/10 w-fit"
                        >
                          <Download className="w-4 h-4 shrink-0" /> <span className="truncate max-w-50 sm:max-w-xs">Descargar: {sub.fileName}</span>
                        </a>
                      )}
                    </div>

                    {/* --- SCORE :o --- */}
                    <div className="w-full md:w-72 lg:w-80 shrink-0 space-y-3 bg-muted/20 p-4 sm:p-5 rounded-xl border border-border/50">
                      {gradingId === sub.id ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">Nota (0-10)</Label>
                            <Input 
                              type="number" 
                              max={10} 
                              min={0} 
                              value={tempGrade} 
                              onChange={(e) => setTempGrade(Number(e.target.value))}
                              className="text-sm bg-background"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] sm:text-xs uppercase font-semibold text-muted-foreground">Feedback para el alumno</Label>
                            <Textarea 
                              placeholder="Muy buen trabajo..." 
                              className="text-xs sm:text-sm resize-none bg-background min-h-20"
                              value={tempFeedback}
                              onChange={(e) => setTempFeedback(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <Button size="sm" className="flex-1 transition-transform active:scale-95" onClick={() => handleGradeSubmission(sub.id)}>
                              Confirmar
                            </Button>
                            <Button size="sm" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => setGradingId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center space-y-3 py-2">
                          {sub.status === "GRADED" ? (
                            <>
                              <p className="text-3xl sm:text-4xl font-black text-primary drop-shadow-sm">{sub.grade}/10</p>
                              <p className="text-xs sm:text-sm text-muted-foreground italic px-2 line-clamp-3">"{sub.feedback}"</p>
                              <Button variant="outline" size="sm" className="mt-2 w-full hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => {
                                setGradingId(sub.id);
                                setTempGrade(sub.grade || 0);
                                setTempFeedback(sub.feedback || "");
                              }}>
                                Corregir nota
                              </Button>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col justify-center gap-3">
                              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Sin calificar</p>
                              <Button className="w-full transition-transform active:scale-95 shadow-sm" onClick={() => {
                                setGradingId(sub.id);
                                setTempGrade(0);
                                setTempFeedback("");
                              }}>
                                Calificar Entrega
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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