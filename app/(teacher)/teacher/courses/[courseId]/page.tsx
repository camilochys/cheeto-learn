"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Title } from "@/components/ui/title";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, BookOpen, Calendar, ClipboardList, Edit, Eye, HelpCircle, PenLine, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Question {
  id: string;
  question: string;
  difficultyLevel: number;
  correctOption: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  limitDate: string | null;
}

export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();

  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lessons" | "questions" | "assignments">("lessons");

  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [lessonError, setLessonError] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);
  const [previewModeLesson, setPreviewModeLesson] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [questionError, setQuestionError] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [previewModeQuestion, setPreviewModeQuestion] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("");
  const [newAssignmentDesc, setNewAssignmentDesc] = useState("");
  const [newAssignmentDate, setNewAssignmentDate] = useState("");
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [previewModeAssignment, setPreviewModeAssignment] = useState(false);

  useEffect(() => {
    if (!isReady || !token) return;

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));
    const fetchData = Promise.all([
      fetchCourse(token),
      fetchLessons(token),
      fetchQuestions(token),
      fetchAssignments(token)
    ]);

    Promise.all([minLoadTime, fetchData]).then(() => setLoading(false));
  }, [isReady, token]);

  async function fetchCourse(token: string) {
    const res = await fetch("/api/courses", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const found = data.data.find((c: any) => c.id === courseId);
    if (found) setCourse({ title: found.title, description: found.description });
  }

  async function fetchLessons(token: string) {
    const res = await fetch(`/api/lessons?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      const rawLessons = data.data || [];

      const sorted = [...rawLessons].sort((a: any, b: any) => {
        const orderA = Number(a.order) || 0;
        const orderB = Number(b.order) || 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      setLessons(sorted);
    }
  }

  async function fetchQuestions(token: string) {
    const res = await fetch(`/api/questions?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setQuestions(data.data);
  }

  async function fetchAssignments(token: string) {
    const res = await fetch(`/api/assignments?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAssignments(data);
    }
  }

  async function handleCreateLesson() {
    if (!newLessonTitle.trim()) {
      setLessonError("El título es obligatorio.");
      return;
    }
    setLessonLoading(true);
    setLessonError("");

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newLessonTitle,
        content: newLessonContent,
        order: lessons.length + 1,
        courseId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setLessonError(data.error);
      setLessonLoading(false);
      return;
    }

    setLessons((prev) => {
        const newList = [...prev, data.data];
        return newList.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    });
    setNewLessonTitle("");
    setNewLessonContent("");
    setPreviewModeLesson(false);
    setLessonLoading(false);
  }

async function handleCreateAssignment() {
    if (!newAssignmentTitle.trim()) {
      setAssignmentError("El título de la tarea es obligatorio.");
      return;
    }
    setAssignmentLoading(true);
    setAssignmentError("");

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newAssignmentTitle,
        description: newAssignmentDesc,
        limitDate: newAssignmentDate,
        courseId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setAssignmentError(data.error || "Error al crear la tarea");
      setAssignmentLoading(false);
      return;
    }

    setAssignments([data, ...assignments]);
    setNewAssignmentTitle("");
    setNewAssignmentDesc("");
    setNewAssignmentDate("");
    setPreviewModeAssignment(false);
    setAssignmentLoading(false);
  }

  async function handleDeleteLesson(lessonId: string) {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres borrar esta lección? Esta acción no se puede deshacer.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      } else {
        const data = await res.json();
        alert(`Error al borrar: ${data.error}`);
      }
    } catch (error) {
      console.error("Error borrando lección:", error);
      alert("Error de red al intentar borrar la lección.");
    }
  }

  async function handleCreateQuestion() {
    if (!newQuestion.trim() || !optionA || !optionB || !optionC || !optionD) {
      setQuestionError("Todos los campos son obligatorios.");
      return;
    }
    setQuestionLoading(true);
    setQuestionError("");

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        question: newQuestion,
        optionA, optionB, optionC, optionD,
        correctOption,
        difficultyLevel,
        courseId
      })
    });

    const data = await res.json();
    if (!res.ok) {
      setQuestionError(data.error);
      setQuestionLoading(false);
      return;
    }

    setQuestions([...questions, data.data]);
    setNewQuestion("");
    setOptionA(""); setOptionB(""); setOptionC(""); setOptionD("");
    setCorrectOption("A");
    setDifficultyLevel(1);
    setPreviewModeQuestion(false);
    setQuestionLoading(false);
  }

  async function handleDeleteQuestion(questionId: string) {
  const confirmDelete = window.confirm("¿Estás seguro de que quieres borrar esta pregunta?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/questions/${questionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } else {
      const data = await res.json();
      alert(`Error al borrar: ${data.error}`);
    }
  } catch (error) {
    console.error("Error borrando pregunta:", error);
  }
}

  async function handleDeleteAssignment(assignmentId: string) {
  if (!window.confirm("¿Estás seguro de borrar esta tarea? Se perderán todas las entregas de los alumnos.")) return;

  const res = await fetch(`/api/assignments/${assignmentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  } else {
    alert("Error al eliminar la tarea");
  }
}

  if (!isReady || loading) {
    return (
      <LoadingScreen
        title="Cargando curso"
        description="Preparando lecciones y preguntas..."
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
      <Navbar role="TEACHER" onLogout={logout} />

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
	<Link href="/teacher">
		<Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
			<ArrowLeft className="w-4 h-4" />
			<span className="hidden sm:inline">Volver</span>
			<span className="sm:hidden">Volver</span>
		</Button>
	</Link>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{course?.title}</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{course?.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <Card className="bg-primary/5 border-primary/20 hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="py-5 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lecciones</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="py-5 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preguntas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20 hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="py-5 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tareas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: "lessons", label: "Lecciones", icon: BookOpen },
            { id: "questions", label: "Preguntas", icon: HelpCircle },
            { id: "assignments", label: "Tareas", icon: ClipboardList }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>

        <div className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
          {activeTab === "lessons" && (
            <div className="space-y-8">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Nueva lección</CardTitle>
                    <CardDescription>Añade contenido teórico a tu curso</CardDescription>
                  </div>
                  <div className="flex gap-2 bg-background border rounded-lg p-1 shrink-0">
                    <Button
                      variant={!previewModeLesson ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewModeLesson(false)}
                      className="h-8 px-3 text-xs md:text-sm"
                    >
                      <PenLine className="w-3.5 h-3.5 mr-2" /> Editar
                    </Button>
                    <Button
                      variant={previewModeLesson ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewModeLesson(true)}
                      className="h-8 px-3 text-xs md:text-sm"
                    >
                      <Eye className="w-3.5 h-3.5 mr-2" /> Previsualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="lesson-title" className="text-sm font-semibold">Título de la lección</Label>
                    {previewModeLesson ? (
                      <div className="min-h-10.5 px-3 py-2 text-sm rounded-md border border-input bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{newLessonTitle || "*Sin título*"}</ReactMarkdown>
                      </div>
                    ) : (
                      <Title
                        id="lesson-title"
                        placeholder="Ej: Introducción a las redes"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lesson-content" className="text-sm font-semibold">Contenido</Label>
                    {previewModeLesson ? (
                      <div className="min-h-30 px-3 py-2 text-sm rounded-md border border-input bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />)}}>
                          {newLessonContent || "*No hay contenido para mostrar*"}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <Description
                        id="lesson-content"
                        placeholder="Contenido teórico de la lección (soporta Markdown)..."
                        value={newLessonContent}
                        onChange={(e) => setNewLessonContent(e.target.value)}
                        className="min-h-37.5 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-4">
                    <div className="p-2 bg-primary/10 rounded-full h-fit">
                      <HelpCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-primary mb-1">¿Necesitas subir archivos?</p>
                      <p className="text-muted-foreground leading-relaxed">
                        Crea la lección primero. Luego usa el botón <Edit className="inline w-3 h-3 mx-1" /> para gestionar los archivos adjuntos.
                      </p>
                    </div>
                  </div>

                  {lessonError && <p className="text-xs font-medium text-destructive animate-pulse">{lessonError}</p>}
                  
                  <Button onClick={handleCreateLesson} disabled={lessonLoading} className="w-full h-11 transition-all active:scale-[0.98]">
                    {lessonLoading ? "Procesando..." : <><Plus className="w-4 h-4 mr-2" /> Añadir lección</>}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {lessons.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted">
                    <p className="text-muted-foreground">No hay lecciones todavía.</p>
                  </div>
                ) : (
                  lessons.map((lesson, index) => (
                    <Card key={lesson.id} className="group hover:border-primary/40 transition-all duration-300 shadow-sm">
                      <CardContent className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">Teoría del curso</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg transition-colors">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )))}
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-8">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Nueva pregunta</CardTitle>
                    <CardDescription>Evaluación de opción múltiple</CardDescription>
                  </div>
                  <div className="flex gap-2 bg-background border rounded-lg p-1 shrink-0">
                    <Button variant={!previewModeQuestion ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewModeQuestion(false)} className="h-8 px-3">
                      <PenLine className="w-3.5 h-3.5 mr-2" /> Editar
                    </Button>
                    <Button variant={previewModeQuestion ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewModeQuestion(true)} className="h-8 px-3">
                      <Eye className="w-3.5 h-3.5 mr-2" /> Previsualizar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Enunciado de la pregunta</Label>
                    {previewModeQuestion ? (
                      <div className="min-h-20 px-3 py-2 text-sm rounded-md border border-input bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{newQuestion || "*Escribe tu pregunta...*"}</ReactMarkdown>
                      </div>
                    ) : (
                      <Description
                        placeholder="Escribe la pregunta (Markdown disponible)..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Opción A</Label><Input placeholder="Texto de opción A" value={optionA} onChange={(e) => setOptionA(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Opción B</Label><Input placeholder="Texto de opción B" value={optionB} onChange={(e) => setOptionB(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Opción C</Label><Input placeholder="Texto de opción C" value={optionC} onChange={(e) => setOptionC(e.target.value)} /></div>
                    <div className="space-y-2"><Label className="text-xs uppercase tracking-wider text-muted-foreground">Opción D</Label><Input placeholder="Texto de opción D" value={optionD} onChange={(e) => setOptionD(e.target.value)} /></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Respuesta correcta</Label>
                      <select
                        value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}
                        className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      >
                        <option value="A">Opción A</option><option value="B">Opción B</option><option value="C">Opción C</option><option value="D">Opción D</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Dificultad</Label>
                      <select
                        value={difficultyLevel} onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                        className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      >
                        <option value={1}>Nivel 1 — Básico</option><option value={2}>Nivel 2 — Elemental</option><option value={3}>Nivel 3 — Intermedio</option><option value={4}>Nivel 4 — Avanzado</option><option value={5}>Nivel 5 — Experto</option>
                      </select>
                    </div>
                  </div>

                  {questionError && <p className="text-xs font-medium text-destructive">{questionError}</p>}
                  <Button onClick={handleCreateQuestion} disabled={questionLoading} className="w-full h-11 active:scale-[0.98] transition-all">
                    {questionLoading ? "Guardando..." : <><Plus className="w-4 h-4 mr-2" /> Añadir pregunta</>}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {questions.map((q) => (
                  <Card key={q.id} className="hover:border-primary/40 transition-all shadow-sm overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 flex items-start justify-between gap-4">
                        <div className="flex gap-4 min-w-0">
                          <div className="flex flex-col items-center gap-1 shrink-0">
                             <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">NV {q.difficultyLevel}</div>
                          </div>
                          <div className="min-w-0 prose prose-sm dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900 uppercase">Correcta: {q.correctOption}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link href={`/teacher/courses/${courseId}/questions/${q.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg transition-colors">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-8">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Nueva Tarea</CardTitle>
                    <CardDescription>Espacio para entregas de alumnos</CardDescription>
                  </div>
                  <div className="flex gap-2 bg-background border rounded-lg p-1 shrink-0">
                    <Button variant={!previewModeAssignment ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewModeAssignment(false)} className="h-8 px-3">
                      <PenLine className="w-3.5 h-3.5 mr-2" /> Editar
                    </Button>
                    <Button variant={previewModeAssignment ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewModeAssignment(true)} className="h-8 px-3">
                      <Eye className="w-3.5 h-3.5 mr-2" /> Previsualizar
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Título de la tarea</Label>
                    {previewModeAssignment ? (
                      <div className="min-h-10.5 px-3 py-2 text-sm rounded-md border border-input bg-muted/20 prose prose-sm dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{newAssignmentTitle || "*Título de la tarea*"}</ReactMarkdown>
                      </div>
                    ) : (
                      <Title
                        placeholder="Ej: Entrega Proyecto Final"
                        value={newAssignmentTitle}
                        onChange={(e) => setNewAssignmentTitle(e.target.value)}
                        className="transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Instrucciones</Label>
                    {previewModeAssignment ? (
                      <div className="min-h-25 px-3 py-2 text-sm rounded-md border border-input bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{newAssignmentDesc || "*Sin instrucciones*"}</ReactMarkdown>
                      </div>
                    ) : (
                      <Description
                        placeholder="Explica qué deben entregar los alumnos..."
                        value={newAssignmentDesc}
                        onChange={(e) => setNewAssignmentDesc(e.target.value)}
                        className="min-h-30 transition-all focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Fecha límite</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="datetime-local"
                        value={newAssignmentDate}
                        onChange={(e) => setNewAssignmentDate(e.target.value)}
                        className="pl-10 focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {assignmentError && <p className="text-xs font-medium text-destructive">{assignmentError}</p>}

                  <Button onClick={handleCreateAssignment} disabled={assignmentLoading} className="w-full h-11 active:scale-[0.98] transition-all">
                    {assignmentLoading ? "Publicando..." : <><Plus className="w-4 h-4 mr-2" /> Publicar tarea</>}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-2xl border-muted">
                    <p className="text-muted-foreground">Aún no has creado tareas.</p>
                  </div>
                ) : (
                  assignments.map((a) => (
                    <Card key={a.id} className="hover:border-primary/40 transition-all shadow-sm">
                      <CardContent className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                            <ClipboardList className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{a.title}</p>
                            {a.limitDate && (
                              <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Límite: {new Date(a.limitDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/teacher/courses/${courseId}/assignments/${a.id}`}>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg transition-colors">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => handleDeleteAssignment(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}