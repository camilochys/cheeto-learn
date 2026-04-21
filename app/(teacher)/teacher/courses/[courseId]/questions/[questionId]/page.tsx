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
  }, [isReady, token, questionId]);

  const handleSave = async () => {
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
    <div className="min-h-screen bg-background" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {course?.title || "Cargando curso..."}
              </h1>
              <p className="text-muted-foreground text-sm">
                Editando Pregunta de Evaluación
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Editor de Pregunta</CardTitle>
              <CardDescription>Configura el enunciado y las opciones</CardDescription>
            </div>
            <div className="flex space-x-2 p-1 rounded-md shrink-0">
              <Button variant={!previewMode ? "secondary" : "outline"} size="sm" onClick={() => setPreviewMode(false)} className="h-8 px-3">
                <PenLine className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button variant={previewMode ? "secondary" : "outline"} size="sm" onClick={() => setPreviewMode(true)} className="h-8 px-3">
                <Eye className="w-4 h-4 mr-2" /> Previsualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="q-text">Enunciado de la pregunta</Label>
              {previewMode ? (
                <div className="max-w-none w-full min-w-0 px-3 py-2 text-sm rounded-md border border-input bg-muted/10 prose prose-slate dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{question}</ReactMarkdown>
                </div>
              ) : (
                <Description 
                  id="q-text" 
                  placeholder="Escribe la pregunta (soporta Markdown)..." 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Opción A</Label>
                <Input value={optionA} onChange={(e) => setOptionA(e.target.value)} placeholder="Texto de la opción A" />
              </div>
              <div className="space-y-2">
                <Label>Opción B</Label>
                <Input value={optionB} onChange={(e) => setOptionB(e.target.value)} placeholder="Texto de la opción B" />
              </div>
              <div className="space-y-2">
                <Label>Opción C</Label>
                <Input value={optionC} onChange={(e) => setOptionC(e.target.value)} placeholder="Texto de la opción C" />
              </div>
              <div className="space-y-2">
                <Label>Opción D</Label>
                <Input value={optionD} onChange={(e) => setOptionD(e.target.value)} placeholder="Texto de la opción D" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Respuesta correcta</Label>
                <select
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nivel de dificultad</Label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                >
                  <option value={1}>1 — Básico</option>
                  <option value={2}>2 — Elemental</option>
                  <option value={3}>3 — Intermedio</option>
                  <option value={4}>4 — Avanzado</option>
                  <option value={5}>5 — Experto</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}