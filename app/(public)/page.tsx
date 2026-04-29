"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  ChartNoAxesCombined,
  FileCode,
  FolderOpen,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (token) {
      setIsLoggedIn(true);
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/cheeto_learn_logo.png" alt="CheetoLearn" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href={role === "TEACHER" ? "/teacher" : "/dashboard"}>
                  <Button variant="default" className="font-semibold shadow-sm">MI CUENTA</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="text-muted-foreground">CERRAR SESIÓN</Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="font-semibold shadow-sm px-8">INICIAR SESIÓN</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-border">
        {/* --- BG --- */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-50/40 via-transparent to-transparent opacity-70" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600 shadow-sm animate-fade-in">
              <Sparkles className="mr-2 h-4 w-4" />
              Nueva era del aprendizaje automático
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              El aprendizaje moderno <br />
              <span className="text-primary">nunca fue tan sencillo</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Un sistema intuitivo diseñado para reaccionar ante tu progreso. Profesores y alumnos colaborando en un entorno de alto rendimiento.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={isLoggedIn ? (role === "TEACHER" ? "/teacher" : "/dashboard") : "/login"}>
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg hover:shadow-primary/20 transition-all">
                  ¡Empieza ahora gratis!
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar funciones
              </Button>
            </div>
          </div>

          {/* --- VISUAL MOCKUP EXAMPLE --- */}
          <div className="relative lg:block hidden">
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-orange-200/20 rounded-3xl blur-2xl -z-10" />
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-2">
               <div className="bg-muted/25 rounded-lg aspect-video flex items-center justify-center border border-border/50 group">
                  <img src="/cheeto_learn_courses_example.png" className="w-lg opacity-20 group-hover:opacity-75 transition-opacity" alt="App Preview" />
               </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-input p-4 rounded-xl shadow-xl border border-border animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="bg-primary/15 p-2 rounded-full"><ChartNoAxesCombined className="text-primary w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Métricas y Estadísticas</p>
                  <p className="text-sm font-bold">¡A tiempo real en tu panel!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Todo lo que necesitas para brillar</h2>
            <p className="text-lg text-muted-foreground">Herramientas avanzadas integradas en una interfaz minimalista y sin distracciones.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: "Cursos Inteligentes", desc: "Organización automática con analíticas predictivas de éxito." },
              { icon: Users, title: "Machine Learning", desc: "La plataforma aprende de tus errores para reforzar tus puntos débiles." },
              { icon: Award, title: "Gamificación Real", desc: "Talleres y retos prácticos diseñados para eliminar el estrés académico." },
              { icon: BarChart3, title: "Analíticas 360", desc: "Gráficos de rendimiento en tiempo real para alumnos y docentes." }
            ].map((f, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all hover:shadow-md border-border bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-primary/50 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            {/* --- BG CIRCLES --- */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                ¿Todo listo para transformar <br />tu manera de aprender?
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
                Únete a la plataforma que está redefiniendo la educación digital con tecnología centrada en las personas.
              </p>
              <Link href={isLoggedIn ? (role === "TEACHER" ? "/teacher" : "/dashboard") : "/login"}>
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold hover:scale-105 transition-transform">
                  ¡Empieza ahora mismo!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
    <footer className="border-t border-border bg-card mt-20">

      <div className="max-w-6xl mx-auto px-4 py-12">

        <div className="grid md:grid-cols-3 gap-12 mb-12">

          

          {/* --- PRODUCT COLUMN --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Producto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Características
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* --- COMPANY COLUMN --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Compañía</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                    Documentación técnica
                </Link>
              </li>
            </ul>
          </div>

          {/* --- LEGAL COLUMN --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Privacidad y Términos
                </Link>
              </li>
              <li className="text-xs text-muted-foreground/60 italic">
                Proyecto con fines estrictamente educativos.
              </li>
            </ul>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-sm text-muted-foreground font-medium">
              &copy; 2026 CheetoLearn.
            </p>
            <p className="text-xs text-muted-foreground/75">
            Hecho con ❤️ para el futuro del e-learning... 🐈
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/camilochys/cheeto-learn" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 font-semibold">
                <GithubIcon/>
                GitHub
              </Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}