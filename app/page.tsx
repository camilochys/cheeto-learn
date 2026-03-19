"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Award, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
  }

  return (
    <div className="min-h-screen">
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="link" color="white">
              <img src="cheeto_learn_logo.png" className="w-34 h-14 text-primary" />
            </Button>
          </div>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link href={role === "TEACHER" ? "/teacher" : "/dashboard"}>
                  <Button variant="ghost">MI CUENTA</Button>
                </Link>
                <Button onClick={handleLogout}>CERRAR SESIÓN</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">INICIAR SESIÓN</Button>
                </Link>
                <Link href="/login">
                  <Button>REGISTRO</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/cheeto_learn_logo.png"
          alt=""
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] opacity-25 pointer-events-none z-[-1]"
        />
        <section className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-5xl font-bold text-foreground text-balance">
                ¡El aprendizaje moderno nunca fue tan sencillo!
              </h1>
              <p className="text-xl text-muted-foreground">
                Un sistema de aprendizaje intuitivo, moderno, limpio y eficaz, diseñado para reaccionar ante el progreso continuo de los estudiantes, ofreciendo un entorno donde tanto ellos, como los profesores, colaboran, aprenden y avanzan juntos.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href={isLoggedIn ? (role === "TEACHER" ? "/teacher" : "/dashboard") : "/login"}>
                <Button size="lg">¡Aprender ahora!</Button>
              </Link>
              <Button variant="outline" size="lg">Ver más...</Button>
            </div>
          </div>
        </section>
      </div>

      {/* --- FEATURES SECTION --- */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Características principales</h2>
            <p className="text-muted-foreground">¡Todo lo que necesitas para un aprendizaje continuo eficaz!</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-secondary/25 border-border">
              <CardHeader>
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Manejo de cursos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Creación y organización de cursos con aprendizaje automático, actividades, analíticas, recursos, tests y mucho más; todo a tu alcance.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Aprendizaje automático</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aprende progresivamente de manera automática gracias a nuestro método avanzado.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <Award className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recursos, tests, ejercicios, talleres, todo lo que necesitas y quieres para un aprendizaje progresivo, práctico y anti-estrés.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Analíticas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitorización de estadísticas de estudio: horas invertidas, aprendizaje de fallos cometidos, verificación de tareas realizadas, gráficos, rendimiento y mucho más.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION SECTION --- */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <div className="bg-secondary/50 rounded-lg p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-secondary-foreground">¿Todo listo para transformar tu manera de aprender?</h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto">
            Únete a miles de estudiantes y profesores que ya utilizan CheetoLearn para alcanzar sus metas cognitivas, organizativas y laborales.
          </p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-accent">
            ¡30 días de acceso gratuito por primer registro!
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2026 CheetoLearn. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}