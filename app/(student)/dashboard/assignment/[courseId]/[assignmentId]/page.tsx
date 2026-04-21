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
import { ArrowLeft, CheckCircle, Download, Paperclip, Trash2 } from "lucide-react";
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
  
  // --- FORM DATA ---
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

    // --- CONFIRM ---
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
    <div className="min-h-screen bg-background" style={getFadeStyle(fadingOut)}>
      <Navbar role="STUDENT" onLogout={logout} />
      
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <Link href={`/dashboard/assignment/${courseId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la lista
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-3xl font-bold">{assignment?.title}</h1>
            <Card>
              <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignment?.description}</ReactMarkdown>
                {assignment?.fileUrl && (
                  <div className="mt-6 p-4 border rounded-lg flex items-center justify-between bg-muted/30">
                    <span className="text-sm font-medium">Material del profesor</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Descargar
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isGraded && (
              <Card className="border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm uppercase text-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Calificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-black">{submission.score} / 10</p>
                  {submission.feedback && <p className="mt-2 text-sm italic text-muted-foreground">"{submission.feedback}"</p>}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Tu entrega</CardTitle>
                <CardDescription>
                  {submission?.submittedAt ? `Último envío: ${new Date(submission.submittedAt).toLocaleDateString()}` : "No entregado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Title value={title} onChange={(e) => setTitle(e.target.value)} disabled={isGraded || saving} />
                </div>
                <div className="space-y-2">
                  <Label>Comentarios</Label>
                  <Description value={description} onChange={(e) => setDescription(e.target.value)} disabled={isGraded || saving} />
                </div>

                <div className="space-y-2">
                  <Label>Archivo adjunto</Label>
                  {fileUrl ? (
                    <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-xs truncate font-medium">Archivo seleccionado</span>
                      </div>
                      {!isGraded && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDeleteAttachment} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Ningún archivo seleccionado.</p>
                  )}
                </div>

                {!isGraded && (
                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || saving}
                    >
                      <Paperclip className="w-4 h-4 mr-2" /> 
                      {uploading ? "Subiendo..." : fileUrl ? "Cambiar archivo" : "Adjuntar archivo"}
                    </Button>

                    <Button 
                      className="w-full" 
                      onClick={handleSaveSubmission}
                      disabled={saving || uploading}
                    >
                      {saving ? "Guardando..." : "Guardar entrega"}
                    </Button>
                  </div>
                )}
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
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