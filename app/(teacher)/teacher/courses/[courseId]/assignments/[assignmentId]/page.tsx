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
    <div className="min-h-screen bg-background" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/courses/${courseId}`}>
              <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{assignment?.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-3 h-3" />
                <span>Límite: {new Date(assignment?.limitDate).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- ASSIGNMENT DESCRIPTION --- */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignment?.description}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* --- ASSIGNMENT LIST --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Entregas de los alumnos ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
              Aún no hay entregas para esta tarea.
            </p>
          ) : (
            submissions.map((sub) => (
              <Card key={sub.id} className={sub.status === "GRADED" ? "border-green-500/30" : ""}>
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                    {/* --- STUDENT INFO --- */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="text-primary w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{sub.studentName}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(sub.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {sub.status === "GRADED" && (
                          <span className="ml-auto md:ml-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> CALIFICADO
                          </span>
                        )}
                      </div>
                      
                      <div className="bg-background border rounded-md p-3 text-sm">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Comentario del alumno:</p>
                        {sub.content || "Sin comentarios."}
                      </div>

                      {sub.fileUrl && (
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                        >
                          <Download className="w-4 h-4" /> Descargar: {sub.fileName}
                        </a>
                      )}
                    </div>

                    {/* --- SCORE :o --- */}
                    <div className="w-full md:w-72 space-y-3 bg-muted/20 p-4 rounded-lg border">
                      {gradingId === sub.id ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                          <div>
                            <Label className="text-[10px] uppercase">Nota (0-10)</Label>
                            <Input 
                              type="number" 
                              max={10} 
                              min={0} 
                              value={tempGrade} 
                              onChange={(e) => setTempGrade(Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] uppercase">Feedback para el alumno</Label>
                            <Textarea 
                              placeholder="Muy buen trabajo..." 
                              className="text-xs resize-none"
                              value={tempFeedback}
                              onChange={(e) => setTempFeedback(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => handleGradeSubmission(sub.id)}>
                              Confirmar
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setGradingId(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center space-y-2">
                          {sub.status === "GRADED" ? (
                            <>
                              <p className="text-3xl font-black text-primary">{sub.grade}/10</p>
                              <p className="text-xs text-muted-foreground italic">"{sub.feedback}"</p>
                              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => {
                                setGradingId(sub.id);
                                setTempGrade(sub.grade || 0);
                                setTempFeedback(sub.feedback || "");
                              }}>
                                Corregir nota
                              </Button>
                            </>
                          ) : (
                            <Button className="w-full" onClick={() => {
                              setGradingId(sub.id);
                              setTempGrade(0);
                              setTempFeedback("");
                            }}>
                              Calificar Entrega
                            </Button>
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