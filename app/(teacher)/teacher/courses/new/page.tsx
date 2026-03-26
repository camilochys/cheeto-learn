"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Description } from "@/components/ui/description";
import { Title } from "@/components/ui/title";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, PenLine } from "lucide-react";
import Link from "next/link";
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

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/teacher">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nuevo curso</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div>
            <CardTitle>Información del curso</CardTitle>
            <CardDescription>Rellena los datos básicos del curso</CardDescription>
            </div>
            {/* --- TOGGLE PREVIEW BUTTON --- */}
            <div className="flex space-x-2 p-1 rounded-md">
              <Button
              variant={!previewMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode(false)}
              className="h-8 px-3">
                <PenLine className="w-4 h-4 mr-2"/> Editar
              </Button>
              <Button
              variant={previewMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode(true)}
              className="h-8 px-3">
                <Eye className="w-4 h-4 mr-2"/> Previsualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del curso</Label>
              {previewMode ? (
                /* --- PREVIEW CONTAINER TITLE --- */
                <div data-placeholder="Ej: Desarrollo de Aplicaciones Web - Primer Año" className="w-full min-w-0 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
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
              />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              {previewMode ? (
                /* --- PREVIEW CONTAINER DESCRIPTION --- */
                <div data-placeholder="Escribe el contenido del curso (soporta Markdown)..." className="w-full min-w-0 min-h-30 px-3 py-2 text-sm rounded-md border border-input shadow-xs transition-[color,box-shadow] text-foreground overflow-y-auto prose prose-slate dark:prose-invert empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground">
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
              />
              )}
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? "Creando curso..." : "Crear curso"}
              </Button>
              <Link href="/teacher">
                <Button variant="outline">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}