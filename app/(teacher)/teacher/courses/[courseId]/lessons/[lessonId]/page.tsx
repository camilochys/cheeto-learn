"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Description } from "@/components/ui/description";
import { Label } from "@/components/ui/label";
import { Title } from "@/components/ui/title";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { ArrowLeft, Eye, Paperclip, PenLine, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default function EditLessonPage({ params }: PageProps) {
  // --- UNWRAP PARAMS FOR NEXTJS 15 ---
  const resolvedParams = use(params);
  const router = useRouter();
  const courseId = resolvedParams.courseId;
  const lessonId = resolvedParams.lessonId;

  // --- NEW STATE TO TRACK UPLOADED FILES ---
  const [files, setFiles] = useState<{ id: string; name: string; url: string }[]>([]);

  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();

  // --- STATE FOR LESSON AND COURSE DATA ---
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // --- STATE CREATED TO STORE COURSE INFO AND AVOID UNDEFINED ERRORS ---
  const [course, setCourse] = useState<{ title: string; description: string } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
    if (!isReady || !token) return;

    const loadData = async () => {
      try {
        // --- FETCH LESSON CONTENT ---
        const resLesson = await fetch(`/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (resLesson.ok) {
          const result = await resLesson.json();
          setTitle(result.data.title);
          setContent(result.data.content || "");
          
          // --- STEP 2: LOAD EXISTING FILES INTO STATE ---
          // --- THIS ENSURES PREVIOUSLY UPLOADED FILES ARE VISIBLE ---
          setFiles(result.data.files || []); 
        }

        // --- FETCH ALL COURSES TO FIND THE CURRENT ONE ---
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
        setTimeout(() => setLoading(false), 1000);
      }
    };

    loadData();
  }, [isReady, token, lessonId, courseId]); // --- ADDED COURSEID TO DEPENDENCIES FOR SAFETY ---

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        router.push(`/teacher/courses/${courseId}`);
      } else {
        setError("Error al actualizar la lección.");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

// --- FILE UPLOAD HANDLER UPDATED TO SEND LESSONID ---
  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- PREPARE FORMDATA WITH FILE AND LESSONID ---
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", lessonId); // --- THIS IS CRUCIAL FOR THE API ---

    try {
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData 
        // --- NOTE: NO CONTENT-TYPE HEADER NEEDED FOR FORMDATA ---
      });
      
      const result = await res.json();

      if (res.ok) {
        // --- 1. UPDATE LOCAL FILES STATE TO SHOW IT IN THE LIST ---
        // --- ASSUMING WE ADD A 'files' STATE LATER ---
        setFiles((prev) => [...prev, { 
          id: result.id, 
          name: result.name, 
          url: result.url 
        }]);

        // --- 2. APPEND MARKDOWN LINK TO CONTENT AS USUAL ---
        setContent((prev) => prev + `\n\n📎 **Recurso:** [${file.name}](${result.url})`);
      } else {
        setError(result.error || "Error al subir el archivo");
      }
    } catch (error) {
      console.error("UPLOAD_ERROR:", error);
      setError("Error de red al intentar subir el archivo.");
    } finally {
      // --- RESET INPUT SO THE SAME FILE CAN BE SELECTED AGAIN ---
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- DELETE FILE FROM BOTH STORAGE AND DATABASE ---
  const handleDeleteFile = async (fileId: string) => {
    // --- PREVENT ACCIDENTAL DELETIONS ---
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) return;

    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // --- REMOVE FROM LOCAL STATE ---
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Error al eliminar el archivo");
      }
    } catch (err) {
      setError("Error de red al intentar eliminar.");
    }
  };

  if (!isReady || loading) {
    return <LoadingScreen title="Cargando..." description="Sincronizando con el curso..." fadingOut={fadingOut} visible={visible} />;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* --- HEADER: EXACT MATCH TO COURSE PAGE --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/50 p-4 rounded-xl border border-border/40 sm:bg-transparent sm:p-0 sm:border-none">
          <div className="flex items-start gap-4">
        <div className="max-w-4xl">
          <Link href={`/teacher/courses/${courseId}`}>
            <Button variant="outline" size="icon" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
            <div className="space-y-1">
              {/* --- RENDERING COURSE TITLE AND DESCRIPTION --- */}
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground line-clamp-1">
                {course?.title || "Cargando curso..."}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
                {course?.description || "Cargando descripción..."}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full md:w-auto shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>

        <Card className="border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/40 bg-muted/5 pb-6">
            <div className="space-y-1">
              <CardTitle className="text-xl">Editor de lección</CardTitle>
              <CardDescription>Modifica el contenido de tu lección</CardDescription>
            </div>
            <div className="flex w-full gap-2 sm:w-auto bg-muted/20 p-1 rounded-lg border border-border/20 shrink-0">
              <Button 
                variant={!previewMode ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPreviewMode(false)} 
                className={`flex-1 sm:flex-none h-8 px-4 transition-all ${!previewMode ? "shadow-sm" : ""}`}
              >
                <PenLine className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button 
                variant={previewMode ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setPreviewMode(true)} 
                className={`flex-1 sm:flex-none h-8 px-4 transition-all ${previewMode ? "shadow-sm" : ""}`}
              >
                <Eye className="w-4 h-4 mr-2" /> Previsualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2.5">
              <Label htmlFor="lesson-title" className="text-sm font-semibold tracking-wide ml-1 uppercase text-muted-foreground/80">Título de la lección</Label>
              {previewMode ? (
                <div data-placeholder="Escribe el título de la lección..." className="max-w-none w-full min-w-0 px-4 py-3 text-lg font-bold rounded-lg border border-input bg-muted/10 shadow-sm transition-all text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">{title}</div>
              ) : (
                <Title id="lesson-title" placeholder="Escribe el título de la lección..." value={title} onChange={(e) => setTitle(e.target.value)} />
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="lesson-content" className="text-sm font-semibold tracking-wide ml-1 uppercase text-muted-foreground/80">Contenido</Label>
              {previewMode ? (
                <div data-placeholder="Contenido teórico de la lección (soporta Markdown)..." className="max-w-none w-full min-w-0 min-h-75 px-4 py-4 text-sm rounded-lg border border-input bg-muted/5 shadow-sm transition-all text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => (
                                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-4 cursor-pointer hover:text-primary/80 transition-colors" />)}}>
                                          {content}
                                        </ReactMarkdown>
                </div>
              ) : (
                <Description
                id="lesson-content"
                placeholder="Contenido teórico de la lección (soporta Markdown)..."
                value={content}
                onChange={(e) => setContent(e.target.value)} 
                className="min-h-75"
                />
              )}
            </div>

            {/* --- ATTACHED FILES LIST --- */}
            <div className="space-y-3 mt-6 pt-6 border-t border-border/40">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold tracking-wide ml-1 uppercase text-muted-foreground/80">Archivos adjuntos</Label>
                {!previewMode && (
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 border-dashed hover:border-primary hover:text-primary transition-all">
                    <Paperclip className="w-3.5 h-3.5 mr-2" /> Adjuntar
                  </Button>
                )}
              </div>
              
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed rounded-lg bg-muted/5">
                  <Paperclip className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground italic">No hay archivos adjuntos en esta lección.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file) => (
                    <div key={file.id} className="group flex items-center justify-between p-3 border rounded-xl bg-card hover:border-primary/30 transition-all shadow-xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                          <Paperclip className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium hover:text-primary transition-colors truncate pr-2"
                        >
                          {file.name}
                        </a>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteFile(file.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.zip,.7z,.rar"/>
      </main>
    </div>
  );
}