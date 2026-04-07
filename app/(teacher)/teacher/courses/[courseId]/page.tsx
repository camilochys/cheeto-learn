"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Description } from "@/components/ui/description";
import { Title } from "@/components/ui/title";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, BookOpen, HelpCircle, Eye, PenLine, Paperclip, ImageIcon, Upload, File as FileIcon } from "lucide-react";
import Link from "next/link";
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

// --- CONSTS FOR STATES TOGGLES ETC ---
export default function ManageCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileClick = () => {
  fileInputRef.current?.click();
  };

const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      const markdownLink = `\n\n📎 **Recurso:** [${file.name}](${data.url})`;
      
      setNewLessonContent((prev) => prev + markdownLink);
    }
  } catch (error) {
    console.error("Error al subir archivo:", error);
  }
};

  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"lessons" | "questions">("lessons");

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

  useEffect(() => {
    if (!isReady || !token) return;

    const minLoadTime = new Promise((res) => setTimeout(res, 2500));
    const fetchData = Promise.all([
      fetchCourse(token),
      fetchLessons(token),
      fetchQuestions(token)
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
    const data = await res.json();
    if (res.ok) setLessons(data.data);
  }

  async function fetchQuestions(token: string) {
    const res = await fetch(`/api/questions?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setQuestions(data.data);
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

    setLessons([...lessons, data.data]);
    setNewLessonTitle("");
    setNewLessonContent("");
    setPreviewModeLesson(false);
    setLessonLoading(false);
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
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setDifficultyLevel(1);
    setPreviewModeQuestion(false);
    setQuestionLoading(false);
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
        {/* --- HEADER --- */}
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
        <div className="grid grid-cols-4 gap-4">
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
              <HelpCircle className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{questions.length}</p>
                <p className="text-xs text-muted-foreground">PLACEHOLDER FILL</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xl font-bold">{questions.length}</p>
                <p className="text-xs text-muted-foreground">PLACEHOLDER STATS</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "lessons"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lecciones
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "questions"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preguntas
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
                {/* --- TOGGLE PREVIEW BUTTON LESSONS --- */}
                <div className="flex space-x-2 p-1 rounded-md shrink-0">
                  <Button
                    variant={!previewModeLesson ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewModeLesson(false)}
                    className="h-8 px-3"
                  >
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={previewModeLesson ? "secondary" : "ghost"}
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {newLessonTitle}
                      </ReactMarkdown>
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
                      {/* --- _BLANK MAKES LINKS OPEN ON NEW TAB --- */}
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

                {lessonError && <p className="text-sm text-destructive">{lessonError}</p>}
                
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateLesson} disabled={lessonLoading} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {lessonLoading ? "Creando lección..." : "Añadir lección"}
                  </Button>
                  {/* --- NEW ATTACHMENT BUTTON --- */}
      <Button variant="outline" className="shrink-0" onClick={handleFileClick}>
        <Paperclip className="w-4 h-4 mr-2" />
        Adjuntar
      </Button>
                </div>
              </CardContent>
            </Card>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelected}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.zip,.7z,.rar"
      />

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
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {lesson.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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
                {/* --- TOGGLE PREVIEW BUTTON QUESTIONS --- */}
                <div className="flex space-x-2 p-1 rounded-md shrink-0">
                  <Button
                    variant={!previewModeQuestion ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewModeQuestion(false)}
                    className="h-8 px-3"
                  >
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant={previewModeQuestion ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setPreviewModeQuestion(true)}
                    className="h-8 px-3"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Previsualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-text">Pregunta</Label>
                  {previewModeQuestion ? (
                    <div data-placeholder="Escribe la pregunta (soporta Markdown)..." className="w-full min-w-0 min-h-20 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {newQuestion}
                      </ReactMarkdown>
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
                  <div className="space-y-2">
                    <Label>Opción A</Label>
                    <Input placeholder="Opción A" value={optionA} onChange={(e) => setOptionA(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Opción B</Label>
                    <Input placeholder="Opción B" value={optionB} onChange={(e) => setOptionB(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Opción C</Label>
                    <Input placeholder="Opción C" value={optionC} onChange={(e) => setOptionC(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Opción D</Label>
                    <Input placeholder="Opción D" value={optionD} onChange={(e) => setOptionD(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Respuesta correcta</Label>
                    <select
                      value={correctOption}
                      onChange={(e) => setCorrectOption(e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value={1}>1 — Básico</option>
                      <option value={2}>2 — Elemental</option>
                      <option value={3}>3 — Intermedio</option>
                      <option value={4}>4 — Avanzado</option>
                      <option value={5}>5 — Experto</option>
                    </select>
                  </div>
                </div>

                {questionError && <p className="text-sm text-destructive">{questionError}</p>}
                
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleCreateQuestion} disabled={questionLoading} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    {questionLoading ? "Creando pregunta..." : "Añadir pregunta"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay preguntas todavía.</p>
              ) : (
                questions.map((q) => (
                  <Card key={q.id}>
                    <CardContent className="py-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium mt-0.5 shrink-0">
                          N{q.difficultyLevel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-foreground prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {q.question}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-bold shrink-0">✓ Opción {q.correctOption}</span>
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