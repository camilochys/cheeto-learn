"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, Eye, PenLine, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PageProps {
  params: Promise<{ courseId: string; questionId: string }>;
}

export default function EditQuestionPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const courseId = resolvedParams.courseId;
  const questionId = resolvedParams.questionId;

  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();

  // --- STATE FOR QUESTION DATA ---
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  
  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!isReady || !token) return;

    const loadData = async () => {
      try {
        // --- FETCH QUESTION CONTENT ---
        const resQuestion = await fetch(`/api/questions/${questionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (resQuestion.ok) {
          const result = await resQuestion.json();

          const q = result.data || result;

            if (q) {
                setQuestion(q.question || "");
                setOptionA(q.optionA || "");
                setOptionB(q.optionB || "");
                setOptionC(q.optionC || "");
                setOptionD(q.optionD || "");
                setCorrectOption(q.correctOption || "A");
                setDifficultyLevel(q.difficultyLevel || 1);
            }
        }

        // --- FETCH COURSE INFO ---
        const resCourse = await fetch(`/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (resCourse.ok) {
          const dataC = await resCourse.json();
          const currentCourse = dataC.data.find((c: any) => c.id === courseId);
          if (currentCourse) {
            setCourse({
              title: currentCourse.title,
              description: currentCourse.description
            });
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, token, questionId, courseId]);

  const handleSave = async () => {
    if (!question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setError("Todos los campos (pregunta y opciones) son obligatorios.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          question, 
          optionA, optionB, optionC, optionD, 
          correctOption, 
          difficultyLevel 
        })
      });

      if (res.ok) {
        router.push(`/teacher/courses/${courseId}`);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar la pregunta.");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || loading) {
    return <LoadingScreen title="Cargando..." description="Sincronizando pregunta..." fadingOut={fadingOut} visible={visible} />;
  }

  return (
    <div className="min-h-screen bg-background transition-all duration-500" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-border/50 sm:bg-transparent sm:p-0 sm:border-none">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/courses/${courseId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-accent transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </Link>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground tracking-tight line-clamp-1">
                {course?.title || "Cargando curso..."}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium uppercase tracking-wider">
                Editando Pregunta
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto shadow-sm hover:shadow transition-all active:scale-95"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Editor de Pregunta</CardTitle>
              <CardDescription>Configura el enunciado y las opciones</CardDescription>
            </div>
            <div className="flex gap-2 bg-background/50 border border-border/50 p-1 rounded-lg shrink-0 w-full sm:w-auto">
              <Button 
                variant={!previewMode ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPreviewMode(false)} 
                className="flex-1 sm:flex-none h-8 px-4 transition-all"
              >
                <PenLine className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button 
                variant={previewMode ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPreviewMode(true)} 
                className="flex-1 sm:flex-none h-8 px-4 transition-all"
              >
                <Eye className="w-4 h-4 mr-2" /> Previsualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-8 space-y-8">
            <div className="space-y-3">
              <Label htmlFor="q-text" className="text-sm font-semibold tracking-wide ml-1">Enunciado de la pregunta</Label>
              {previewMode ? (
                <div className="max-w-none w-full min-w-0 px-4 py-4 text-sm rounded-xl border border-border bg-muted/20 prose prose-slate dark:prose-invert animate-in fade-in duration-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{question || "*Sin enunciado aún*"}</ReactMarkdown>
                </div>
              ) : (
                <Description 
                  id="q-text" 
                  placeholder="Escribe la pregunta (soporta Markdown)..." 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-30 focus-visible:ring-primary/20 transition-all"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2 group">
                <Label className="text-xs font-bold text-muted-foreground group-focus-within:text-primary transition-colors ml-1 uppercase tracking-tighter">Opción A</Label>
                <Input 
                  value={optionA} 
                  onChange={(e) => setOptionA(e.target.value)} 
                  placeholder="Texto de la opción A" 
                  className="bg-muted/5 focus-visible:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2 group">
                <Label className="text-xs font-bold text-muted-foreground group-focus-within:text-primary transition-colors ml-1 uppercase tracking-tighter">Opción B</Label>
                <Input 
                  value={optionB} 
                  onChange={(e) => setOptionB(e.target.value)} 
                  placeholder="Texto de la opción B" 
                  className="bg-muted/5 focus-visible:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2 group">
                <Label className="text-xs font-bold text-muted-foreground group-focus-within:text-primary transition-colors ml-1 uppercase tracking-tighter">Opción C</Label>
                <Input 
                  value={optionC} 
                  onChange={(e) => setOptionC(e.target.value)} 
                  placeholder="Texto de la opción C" 
                  className="bg-muted/5 focus-visible:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2 group">
                <Label className="text-xs font-bold text-muted-foreground group-focus-within:text-primary transition-colors ml-1 uppercase tracking-tighter">Opción D</Label>
                <Input 
                  value={optionD} 
                  onChange={(e) => setOptionD(e.target.value)} 
                  placeholder="Texto de la opción D" 
                  className="bg-muted/5 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/60">
              <div className="space-y-2">
                <Label className="text-sm font-semibold ml-1">Respuesta correcta</Label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full h-11 px-4 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="A">Opción A</option>
                  <option value="B">Opción B</option>
                  <option value="C">Opción C</option>
                  <option value="D">Opción D</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold ml-1">Nivel de dificultad</Label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                  className="w-full h-11 px-4 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value={1}>1 — Básico</option>
                  <option value={2}>2 — Elemental</option>
                  <option value={3}>3 — Intermedio</option>
                  <option value={4}>4 — Avanzado</option>
                  <option value={5}>5 — Experto</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-shake">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}