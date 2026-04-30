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
import { ArrowLeft, Eye, PenLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- CONSTS FOR STATES TOGGLES ETC ---
export default function NewCoursePage() {
  const router = useRouter();
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  async function handleCreate() {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title, description })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push(`/courses/${data.data.id}`);
  }

  if (!isReady) {
    return (
      <LoadingScreen
        title="Cargando..."
        description="Por favor espera..."
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

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
	<Link href="/teacher">
		<Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
			<ArrowLeft className="w-4 h-4" />
			<span className="hidden sm:inline">Volver</span>
			<span className="sm:hidden">Volver</span>
		</Button>
	</Link>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Nuevo curso</h1>
          </div>
        </div>

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border-b">
            <div className="space-y-1">
              <CardTitle className="text-lg md:text-xl">Información del curso</CardTitle>
              <CardDescription>Rellena los datos básicos del curso</CardDescription>
            </div>
            {/* --- TOGGLE PREVIEW BUTTON --- */}
            <div className="flex gap-2 bg-background border rounded-lg p-1 w-fit shadow-inner">
              <Button
                variant={!previewMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode(false)}
                className="h-8 px-3 text-xs md:text-sm transition-all"
              >
                <PenLine className="w-3.5 h-3.5 mr-2" /> Editar
              </Button>
              <Button
                variant={previewMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode(true)}
                className="h-8 px-3 text-xs md:text-sm transition-all"
              >
                <Eye className="w-3.5 h-3.5 mr-2" /> Previsualizar
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2.5">
              <Label htmlFor="title" className="text-sm font-semibold text-muted-foreground">Título del curso</Label>
              {previewMode ? (
                /* --- PREVIEW CONTAINER TITLE --- */
                <div 
                  data-placeholder="Ej: Desarrollo de Aplicaciones Web - Primer Año" 
                  className="w-full min-h-11.25 px-4 py-2.5 text-sm rounded-md border border-input bg-muted/10 shadow-sm text-foreground overflow-y-auto prose prose-slate dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 transition-all animate-in fade-in"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {title}
                  </ReactMarkdown>
                </div>
              ) : (
                /* --- EDIT TEXTAREA TITLE --- */
                <Title
                  id="title"
                  placeholder="Ej: Desarrollo de Aplicaciones Web - Primer Año"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="transition-all focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground">Descripción</Label>
              {previewMode ? (
                /* --- PREVIEW CONTAINER DESCRIPTION --- */
                <div 
                  data-placeholder="Escribe el contenido del curso (soporta Markdown)..." 
                  className="w-full min-h-37.5 px-4 py-2.5 text-sm rounded-md border border-input bg-muted/10 shadow-sm text-foreground overflow-y-auto prose prose-slate dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 transition-all animate-in fade-in"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description}
                  </ReactMarkdown>
                </div>
              ) : (
                /* --- EDIT TEXTAREA DESCRIPTION --- */
                <Description
                  id="description"
                  placeholder="Escribe el contenido del curso (soporta Markdown)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-37.5 transition-all focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
            
            {error && (
              <p className="text-sm font-medium text-destructive animate-bounce">{error}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/40">
              <Link href="/teacher" className="flex-1">
                <Button variant="outline" className="w-full h-11 transition-all active:scale-[0.98]">
                  Cancelar
                </Button>
              </Link>
              <Button
                className="flex-1 h-11 shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creando...
                  </span>
                ) : "Crear curso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}