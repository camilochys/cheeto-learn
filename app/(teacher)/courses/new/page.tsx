"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "TEACHER" });
  const { visible, getFadeStyle } = useFade();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            {/*<p className="text-muted-foreground">Crea un nuevo curso para tus alumnos</p>*/}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del curso</CardTitle>
            <CardDescription>Rellena los datos básicos del curso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título del curso *</Label>
              <Input
                id="title"
                placeholder="Ej: Redes y Sistemas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Describe el contenido del curso..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-30 px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
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