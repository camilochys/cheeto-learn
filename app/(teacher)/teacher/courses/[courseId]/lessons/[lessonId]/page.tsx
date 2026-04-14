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
import { ArrowLeft, Eye, Paperclip, PenLine, Save } from "lucide-react";
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
    <div className="min-h-screen bg-background" style={getFadeStyle(fadingOut)}>
      <Navbar role="TEACHER" onLogout={logout} />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        
        {/* --- HEADER: EXACT MATCH TO COURSE PAGE --- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/courses/${courseId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              {/* --- RENDERING COURSE TITLE AND DESCRIPTION --- */}
              <h1 className="text-3xl font-bold text-foreground">
                {course?.title || "Cargando curso..."}
              </h1>
              <p className="text-muted-foreground">
                {course?.description || "Cargando descripción..."}
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
            <CardTitle>Editor de lección</CardTitle>
            <CardDescription>Modifica el contenido de tu lección</CardDescription>
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

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Título de la lección</Label>
              {previewMode ? (
                <div data-placeholder="Escribe el título de la lección..." className="max-w-none w-full min-w-0 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">{title}</div>
              ) : (
                <Title id="lesson-title" placeholder="Escribe el título de la lección..." value={title} onChange={(e) => setTitle(e.target.value)} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-content">Contenido</Label>
              {previewMode ? (
                <div data-placeholder="Contenido teórico de la lección (soporta Markdown)..." className="max-w-none w-full min-w-0 min-h-30 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => (
                                          <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline cursor-pointer" />)}}>
                                          {content}
                                        </ReactMarkdown>
                </div>
              ) : (
                <Description
                id="lesson-content"
                placeholder="Contenido teórico de la lección (soporta Markdown)..."
                value={content}
                onChange={(e) => setContent(e.target.value)} 
                />
              )}
            </div>

            {/* --- ATTACHED FILES LIST --- */}
            <div className="space-y-2 mt-4">
              <Label>Archivos adjuntos</Label>
              {files.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No hay archivos adjuntos en esta lección.</p>
              ) : (
                <div className="grid gap-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium hover:underline truncate"
                        >
                          {file.name}
                        </a>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!previewMode && (
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-2">
                <Paperclip className="w-4 h-4 mr-2" /> Adjuntar archivo
              </Button>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
        </Card>

        <input type="file" ref={fileInputRef} onChange={onFileSelected} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.zip,.7z,.rar"/>
      </main>
    </div>
  );
}