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
import { ArrowLeft, BookOpen, ClipboardList, Edit, Eye, HelpCircle, PenLine, Plus, SquarePen, Trash2 } from "lucide-react";
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

// --- ASSIGNMENT INTERFACE ---
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

  // --- NEW LESSON FORM STATES ---
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [lessonError, setLessonError] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);
  const [previewModeLesson, setPreviewModeLesson] = useState(false);

  // --- NEW QUESTION FORM STATES ---
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

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center gap-4">
          <Link href="/teacher">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{course?.title}</h1>
            <p className="text-muted-foreground">{course?.description}</p>
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-3 gap-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{lessons.length}</p>
                <p className="text-xs text-muted-foreground">Lecciones</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{questions.length}</p>
                <p className="text-xs text-muted-foreground">Preguntas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{assignments.length}</p>
                <p className="text-xs text-muted-foreground">Tareas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "lessons" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lecciones
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "questions" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preguntas
          </button>
          {/* --- NEW TAB - ASSIGNMENTS --- */}
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "assignments" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tareas
          </button>
        </div>

        {/* --- LESSONS TAB --- */}
        {activeTab === "lessons" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle>Nueva lección</CardTitle>
                  <CardDescription>Añade contenido teórico a tu curso</CardDescription>
                </div>
                <div className="flex space-x-2 p-1 rounded-md shrink-0">
                  <Button
                    variant={!previewModeLesson ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewModeLesson(false)}
                    className="h-8 px-3"
                  >
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={previewModeLesson ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewModeLesson(true)}
                    className="h-8 px-3"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Previsualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-title">Título de la lección</Label>
                  {previewModeLesson ? (
                    <div data-placeholder="Ej: Introducción a las redes" className="max-w-none w-full min-w-0 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{newLessonTitle}</ReactMarkdown>
                    </div>
                  ) : (
                    <Title
                      id="lesson-title"
                      placeholder="Ej: Introducción a las redes"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-content">Contenido</Label>
                  {previewModeLesson ? (
                    <div data-placeholder="Contenido teórico de la lección (soporta Markdown)..." className="max-w-none w-full min-w-0 min-h-30 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline cursor-pointer" />)}}>
                        {newLessonContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <Description
                      id="lesson-content"
                      placeholder="Contenido teórico de la lección (soporta Markdown)..."
                      value={newLessonContent}
                      onChange={(e) => setNewLessonContent(e.target.value)}
                    />
                  )}
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">¿Quieres añadir recursos o archivos?</p>
                    <p className="text-muted-foreground gap-1">
                      Crea primero la base de la lección. Después, desde el botón de{" "}
                      <SquarePen className="inline-flex w-4 h-4" />{" "}
                      <strong>Editar</strong> podrás subir archivos adjuntos.
                    </p>
                  </div>
                </div>

                {lessonError && <p className="text-sm text-destructive">{lessonError}</p>}
                
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateLesson} disabled={lessonLoading} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {lessonLoading ? "Creando lección..." : "Añadir lección"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {lessons.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay lecciones todavía.</p>
              ) : (
                lessons.map((lesson, index) => (
                  <Card key={lesson.id}>
                    <CardContent className="py-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium mt-0.5 shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{lesson.title}</p>
                          {lesson.content && (
                            <div className="text-sm text-muted-foreground line-clamp-2 mt-1 prose prose-slate dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8 text-primary">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-200"
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

        {/* --- QUESTIONS TAB --- */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle>Nueva pregunta</CardTitle>
                  <CardDescription>Añade preguntas para evaluar a los alumnos</CardDescription>
                </div>
                <div className="flex space-x-2 p-1 rounded-md shrink-0">
                  <Button
                    variant={!previewModeQuestion ? "secondary" : "outline"} size="sm"
                    onClick={() => setPreviewModeQuestion(false)} className="h-8 px-3"
                  >
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={previewModeQuestion ? "secondary" : "outline"} size="sm"
                    onClick={() => setPreviewModeQuestion(true)} className="h-8 px-3"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Previsualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-text">Pregunta</Label>
                  {previewModeQuestion ? (
                    <div data-placeholder="Escribe la pregunta (soporta Markdown)..." className="max-w-none w-full min-w-0 min-h-30 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{newQuestion}</ReactMarkdown>
                    </div>
                  ) : (
                    <Description
                      id="question-text"
                      placeholder="Escribe la pregunta (soporta Markdown)..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Opción A</Label><Input placeholder="Opción A" value={optionA} onChange={(e) => setOptionA(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Opción B</Label><Input placeholder="Opción B" value={optionB} onChange={(e) => setOptionB(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Opción C</Label><Input placeholder="Opción C" value={optionC} onChange={(e) => setOptionC(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Opción D</Label><Input placeholder="Opción D" value={optionD} onChange={(e) => setOptionD(e.target.value)} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Respuesta correcta</Label>
                    <select
                      value={correctOption} onChange={(e) => setCorrectOption(e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                    >
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nivel de dificultad</Label>
                    <select
                      value={difficultyLevel} onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                    >
                      <option value={1}>1 — Básico</option><option value={2}>2 — Elemental</option><option value={3}>3 — Intermedio</option><option value={4}>4 — Avanzado</option><option value={5}>5 — Experto</option>
                    </select>
                  </div>
                </div>

                {questionError && <p className="text-sm text-destructive">{questionError}</p>}
                <Button onClick={handleCreateQuestion} disabled={questionLoading} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> {questionLoading ? "Creando..." : "Añadir pregunta"}
                </Button>
              </CardContent>
            </Card>

<div className="space-y-3">
  {questions.map((q) => (
    <Card key={q.id}>
      <CardContent className="py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 w-full min-w-0">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium mt-0.5 shrink-0">
            N{q.difficultyLevel}
          </span>
          <div className="min-w-0 flex-1">
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.question}</ReactMarkdown>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-wider">
              ✓ Opción Correcta: {q.correctOption}
            </p>
          </div>
        </div>

        {/* --- ACTION BUTTON FOR QUESTIONS --- */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/teacher/courses/${courseId}/questions/${q.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8 text-primary" title="Editar pregunta">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-200"
            onClick={() => handleDeleteQuestion(q.id)}
            title="Eliminar pregunta"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
          </div>
        )}

        {/* --- NEW ASSIGNMENTS ACTUAL TAB --- */}
{activeTab === "assignments" && (
          <div className="space-y-6">
            <Card>
              {/* --- NEW BUTTONS TO EDIT OR PREVIEW JUST LIKE WE DID IN LESSONS :D --- */}
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle>Nueva Tarea</CardTitle>
                  <CardDescription>Crea un espacio para que los alumnos entreguen sus archivos</CardDescription>
                </div>
                <div className="flex space-x-2 p-1 rounded-md shrink-0">
                  <Button
                    variant={!previewModeAssignment ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewModeAssignment(false)}
                    className="h-8 px-3"
                  >
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={previewModeAssignment ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setPreviewModeAssignment(true)}
                    className="h-8 px-3"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Previsualizar
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assign-title">Título de la tarea</Label>
                  {/* --- PREVIEW FOR TITLE --- */}
                  {previewModeAssignment ? (
                    <div data-placeholder="Ej: Entrega Proyecto Final" className="max-w-none w-full min-w-0 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{newAssignmentTitle}</ReactMarkdown>
                    </div>
                  ) : (
                    <Title
                      id="assign-title"
                      placeholder="Ej: Entrega Proyecto Final"
                      value={newAssignmentTitle}
                      onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assign-desc">Descripción / Instrucciones</Label>
                  {/* --- PREVIEW FOR DESCRIPTION --- */}
                  {previewModeAssignment ? (
                    <div data-placeholder="Instrucciones para la entrega (soporta Markdown)..." className="max-w-none w-full min-w-0 min-h-30 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        components={{ 
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline cursor-pointer" />
                          )
                        }}
                      >
                        {newAssignmentDesc}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <Description
                      id="assign-desc"
                      placeholder="Instrucciones para la entrega (soporta Markdown)..."
                      value={newAssignmentDesc}
                      onChange={(e) => setNewAssignmentDesc(e.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assign-date">Fecha límite de entrega</Label>
                  <Input
                    id="assign-date"
                    type="datetime-local"
                    value={newAssignmentDate}
                    onChange={(e) => setNewAssignmentDate(e.target.value)}
                  />
                </div>

                {assignmentError && <p className="text-sm text-destructive">{assignmentError}</p>}

                <Button onClick={handleCreateAssignment} disabled={assignmentLoading} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  {assignmentLoading ? "Publicando..." : "Publicar tarea"}
                </Button>
              </CardContent>
            </Card>

{/* --- ASSIGNMENTS LIST WITH BUTTONS --- */}
<div className="space-y-3">
  {assignments.length === 0 ? (
    <p className="text-muted-foreground text-center py-8">No hay tareas publicadas todavía.</p>
  ) : (
    assignments.map((asig) => (
      <Card key={asig.id}>
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground truncate">{asig.title}</p>
            {asig.description && (
              <div className="text-xs text-muted-foreground line-clamp-1 prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{asig.description}</ReactMarkdown>
              </div>
            )}
            <p className="text-[10px] text-destructive font-medium mt-1 uppercase tracking-wider">
              Límite: {asig.limitDate ? new Date(asig.limitDate).toLocaleString() : "Sin fecha"}
            </p>
          </div>

          {/* --- BUTTON GROUP --- */}
          <div className="flex items-center gap-2 shrink-0">
            {/* SEE BUTTON */}
            <Link href={`/teacher/courses/${courseId}/assignments/${asig.id}`}>
              <Button variant="outline" size="icon" className="h-8 w-8 text-primary" title="Ver entregas">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            {/* --- DELETE BUTTON --- */}
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-200"
              onClick={() => handleDeleteAssignment(asig.id)}
              title="Eliminar tarea"
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
      </main>
    </div>
  );
}