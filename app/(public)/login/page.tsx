"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("role", data.data.role);

      // --- FADE OUT REDIRECT ---
      setFadingOut(true);
      
      const userRole = data.data.role;

      setTimeout(() => {
        if (userRole === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/dashboard");
        }
      }, 600);
    } catch (err) {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background transition-opacity duration-600 p-4"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <Card className="w-full max-w-87.5 sm:max-w-md shadow-lg border-muted"> 
        <CardHeader className="text-center space-y-2 pb-4">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <img 
              src="/cheeto_learn_logo.png" 
              alt="CheetoLearn Logo"
              className="h-10 sm:h-12 mx-auto mb-2"
            />
          </Link>
          <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Accede a tu cuenta de CheetoLearn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md">
                <p className="text-xs sm:text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          <Button 
            className="w-full h-11 text-base font-semibold transition-all active:scale-95" 
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
          
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}¡Pídesela a tu organización o{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                contáctanos! 
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}