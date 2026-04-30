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
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  UserCircle,
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
    <div className="min-h-screen bg-background font-sans antialiased overflow-x-hidden">
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/cheeto_learn_logo.png" alt="CheetoLearn" className="h-8 sm:h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {isLoggedIn ? (
              <>
                <Link href={role === "TEACHER" ? "/teacher" : "/dashboard"}>
                  <Button variant="default" size="sm" className="font-semibold shadow-sm text-xs sm:text-sm px-3 sm:px-4">
                    <UserCircle className="w-4 h-4 mr-1 hidden sm:inline" /> MI CUENTA
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground text-xs sm:text-sm px-3 sm:px-4">
                  <LogOut className="w-4 h-4 mr-1 hidden sm:inline" /> SALIR
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="font-semibold shadow-sm px-4 sm:px-8 text-sm">INICIAR SESIÓN</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden border-b border-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-orange-50/40 via-transparent to-transparent opacity-70" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center text-center lg:text-left">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs sm:text-sm font-medium text-orange-600 shadow-sm animate-fade-in mx-auto lg:mx-0">
              <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Nueva era del aprendizaje automático
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              El aprendizaje moderno <br />
              <span className="text-primary">nunca fue tan sencillo</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Un sistema intuitivo diseñado para reaccionar ante tu progreso. Profesores y alumnos colaborando en un entorno de alto rendimiento.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
              <Link href={isLoggedIn ? (role === "TEACHER" ? "/teacher" : "/dashboard") : "/login"} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base sm:text-lg shadow-lg hover:shadow-primary/20 transition-all">
                  ¡Empieza ahora!
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base sm:text-lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                Explorar funciones
              </Button>
            </div>
          </div>

          {/* --- VISUAL MOCKUP --- */}
          <div className="relative mt-8 lg:mt-0 px-4 sm:px-0">
            <div className="absolute -inset-4 bg-linear-to-tr from-primary/20 to-orange-200/20 rounded-3xl blur-2xl -z-10" />
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden p-1 sm:p-2 max-w-2xl mx-auto">
                <div className="bg-muted/25 rounded-lg aspect-video flex items-center justify-center border border-border/50 group">
                   <img 
                    src="/cheeto_learn_courses_example.png" 
                    className="w-lg h-lg object-cover opacity-25 group-hover:opacity-75 transition-opacity" 
                    alt="App Preview" 
                   />
                </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-input p-3 sm:p-4 rounded-xl shadow-xl border border-border animate-bounce-slow hidden md:block">
              <div className="flex items-center gap-3">
                <div className="bg-primary/15 p-2 rounded-full"><ChartNoAxesCombined className="text-primary w-5 h-5" /></div>
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Métricas y Estadísticas</p>
                  <p className="text-xs sm:text-sm font-bold tracking-tight">¡A tiempo real en tu panel!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-16 md:py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 space-y-12 md:space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Todo lo que necesitas para brillar</h2>
            <p className="text-base md:text-lg text-muted-foreground">Herramientas avanzadas integradas en una interfaz minimalista y sin distracciones.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: BookOpen, title: "Cursos Inteligentes", desc: "Organización automática con analíticas predictivas de éxito." },
              { icon: Users, title: "Machine Learning", desc: "La plataforma aprende de tus errores para reforzar tus puntos débiles." },
              { icon: Award, title: "Gamificación Real", desc: "Talleres y retos prácticos diseñados para eliminar el estrés académico." },
              { icon: BarChart3, title: "Analíticas 360", desc: "Gráficos de rendimiento en tiempo real para alumnos y docentes." }
            ].map((f, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all hover:shadow-md border-border bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg md:text-xl">{f.title}</CardTitle>
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
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-primary/75 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                ¿Todo listo para transformar <br className="hidden sm:block" /> tu manera de aprender?
              </h2>
              <p className="text-primary-foreground/90 text-base md:text-lg max-w-2xl mx-auto">
                Únete a la plataforma que está redefiniendo la educación digital con tecnología centrada en las personas.
              </p>
              <Link href={isLoggedIn ? (role === "TEACHER" ? "/teacher" : "/dashboard") : "/login"}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-10 text-lg font-bold hover:scale-105 transition-transform">
                  ¡Empieza ahora mismo!
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border bg-card mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs sm:text-sm">Producto</h3>
              <ul className="space-y-3">
                <li><Link href="/features" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-2"><Star className="w-4 h-4" /> Características</Link></li>
                <li><Link href="/dashboard" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Panel</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs sm:text-sm">Compañía</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-2"><Mail className="w-4 h-4" /> Contacto</Link></li>
                <li><Link href="/docs" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-2"><FileCode className="w-4 h-4" /> Documentación</Link></li>
              </ul>
            </div>

            <div className="space-y-4 col-span-2 md:col-span-1">
              <h3 className="font-bold text-foreground uppercase tracking-wider text-xs sm:text-sm">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Privacidad y Términos</Link></li>
                <li className="text-[10px] sm:text-xs text-muted-foreground/60 italic">Proyecto con fines estrictamente educativos.</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">&copy; 2026 CheetoLearn.</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/75 text-center md:text-left">Hecho con ❤️ para el futuro del e-learning... 🐈</p>
            </div>
            <a href="https://github.com/camilochys/cheeto-learn" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto gap-1 font-semibold">
                <GithubIcon/>GitHub
              </Button>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}