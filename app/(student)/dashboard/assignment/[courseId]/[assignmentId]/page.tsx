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
import { ArrowLeft, CheckCircle, Clock, Download, FileText, Paperclip, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StudentAssignmentDetailPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
  const resolvedParams = use(params);
  const { courseId, assignmentId } = resolvedParams;
  
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
  const { visible, getFadeStyle } = useFade();

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isReady || !token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/students/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (res.ok) {
          setAssignment(result.assignment);
          if (result.submission) {
            setSubmission(result.submission);
            setTitle(result.submission.title || "");
            setDescription(result.submission.description || "");
            setFileUrl(result.submission.fileUrl || null);
            
            if (result.submission.fileUrl) {
              const urlParts = result.submission.fileUrl.split('/');
              setFilePath(urlParts[urlParts.length - 1]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isReady, token, assignmentId]);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { 
        method: "POST", 
        body: formData 
      });
      
      const result = await res.json();

      if (res.ok) {
        setFileUrl(result.url);
        setFilePath(result.path);
      } else {
        setError(result.error || "Error al subir el archivo");
      }
    } catch (error) {
      setError("Error de red al intentar subir el archivo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAttachment = async () => {
    if (!filePath) return;

    if (!confirm("¿Estás seguro de que quieres eliminar este archivo? Se borrará permanentemente del servidor.")) return;

    try {
      const res = await fetch(`/api/students/assignments/delete-file`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ path: filePath })
      });

      if (res.ok) {
        setFileUrl(null);
        setFilePath(null);
      } else {
        setError("Error al eliminar el archivo del servidor.");
      }
    } catch (err) {
      setError("Error de red al intentar eliminar.");
    }
  };

  const handleSaveSubmission = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          title, 
          description, 
          fileUrl 
        })
      });

      if (res.ok) {
        const result = await res.json();
        setSubmission(result.data);
        alert("Entrega guardada correctamente.");
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      }
    } catch (err) {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || loading) return <LoadingScreen title="Cargando tarea..." fadingOut={fadingOut} visible={visible} />;

  const isGraded = submission?.score !== null && submission?.score !== undefined;

  return (
    <div className="min-h-screen bg-slate-50/50" style={getFadeStyle(fadingOut)}>
      <Navbar role="STUDENT" onLogout={logout} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">

        <div className="max-w-4xl w-full">
          <Link href={`/dashboard/assignment/${courseId}`}>
            <Button variant="outline" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver a la lista
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {assignment?.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Creado: {assignment?.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : "---"}</span>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Instrucciones de la tarea
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-li:text-slate-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignment?.description}</ReactMarkdown>
                
                {assignment?.fileUrl && (
                  <div className="mt-8 p-6 border-2 border-dashed border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between bg-primary/5 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Download className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Material complementario</p>
                        <p className="text-xs text-muted-foreground text-pretty">Descarga los recursos adjuntos por el docente.</p>
                      </div>
                    </div>
                    <Button variant="default" size="sm" className="w-full sm:w-auto shadow-md" asChild>
                      <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                        Descargar archivo
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isGraded && (
              <Card className="border-none bg-primary text-white shadow-lg shadow-orange-600/20 overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-32 h-32" />
                </div>
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest font-black flex items-center gap-2 opacity-80">
                    <CheckCircle className="w-4 h-4" /> Calificación Final
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{submission.score}</span>
                    <span className="text-xl font-bold opacity-70">/ 10</span>
                  </div>
                  {submission.feedback && (
                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                      <p className="text-sm italic leading-relaxed">"{submission.feedback}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Tu entrega</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${submission?.submittedAt ? 'bg-green-500' : 'bg-slate-300'}`} />
                  {submission?.submittedAt ? `Enviado el ${new Date(submission.submittedAt).toLocaleDateString()}` : "Pendiente de envío"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título del envío</Label>
                  <Title 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    disabled={isGraded || saving}
                    placeholder="Ej: Tarea Final - Juan Pérez"
                    className="bg-slate-50 border-none focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comentarios adicionales</Label>
                  <Description 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    disabled={isGraded || saving}
                    placeholder="Escribe aquí cualquier observación para el profesor..."
                    className="bg-slate-50 border-none min-h-30 focus-visible:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Archivo adjunto</Label>
                  {fileUrl ? (
                    <div className="flex items-center justify-between p-3 border border-primary/10 rounded-xl bg-primary/5 group/file">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <span className="text-xs truncate font-semibold text-slate-700">Documento cargado</span>
                      </div>
                      {!isGraded && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDeleteAttachment} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 px-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                      <p className="text-xs text-muted-foreground italic">No hay archivos adjuntos</p>
                    </div>
                  )}
                </div>

                {!isGraded && (
                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || saving}
                    >
                      <Paperclip className="w-4 h-4 mr-2" /> 
                      {uploading ? "Subiendo..." : fileUrl ? "Reemplazar archivo" : "Seleccionar archivo"}
                    </Button>

                    <Button 
                      className="w-full shadow-lg shadow-primary/20 font-bold" 
                      onClick={handleSaveSubmission}
                      disabled={saving || uploading || !title}
                    >
                      {saving ? "Guardando..." : "Confirmar entrega"}
                    </Button>
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-red-600 text-[11px] text-center font-medium leading-tight">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileSelected} 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg,.zip,.7z,.rar"
        />
      </main>
    </div>
  );
}