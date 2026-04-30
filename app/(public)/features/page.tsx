"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Bot,
  Cpu,
  Layers,
  LineChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10 md:space-y-16">
        
        {/* --- BACK BUTTON --- */}
        <div className="max-w-4xl w-full">
          <Link href="/">
            <Button variant="outline" className="gap-2 hover:bg-accent transition-colors -ml-2 sm:ml-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </Link>
        </div>

        {/* --- HEADER --- */}
        <header className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Innovación Educativa
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Potencia tu aprendizaje con <span className="text-primary">tecnología</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Explora las herramientas diseñadas para transformar la educación convencional en una experiencia inteligente y personalizada.
          </p>
        </header>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* --- FEATURE 1 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold">Algoritmos Adaptativos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Nuestro motor de <span className="font-semibold text-foreground">Machine Learning</span> analiza tus patrones de estudio para identificar áreas de refuerzo, personalizando los ejercicios en tiempo real.
            </CardContent>
          </Card>

          {/* --- FEATURE 2 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold">Alta Velocidad</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Construido sobre <span className="font-semibold text-foreground">Next.js 14+</span> y optimizado para una latencia mínima, garantizando una fluidez total entre lecciones y evaluaciones.
            </CardContent>
          </Card>

          {/* --- FEATURE 3 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold">Dashboards Reales</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Visualiza tu progreso mediante gráficos interactivos que detallan tu evolución académica, tasas de éxito y tiempo dedicado por módulo.
            </CardContent>
          </Card>

          {/* --- FEATURE 4 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold">Gestión de Roles</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Entornos diferenciados para <span className="font-semibold text-foreground">Alumnos y Profesores</span>. Los docentes pueden gestionar contenidos y supervisar el avance grupal.
            </CardContent>
          </Card>

          {/* --- FEATURE 5 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold">Seguridad RLS</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Implementamos <span className="font-semibold text-foreground">Row Level Security</span> para asegurar que tu información esté blindada y solo accesible por ti bajo protocolos estrictos.
            </CardContent>
          </Card>

          {/* --- FEATURE 6 --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <CardTitle className="text-xl font-bold">Diseño Responsive</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Accede a tus cursos desde cualquier dispositivo. Una interfaz adaptativa que no sacrifica funcionalidades ni rendimiento en tablets o smartphones.
            </CardContent>
          </Card>
        </div>

        {/* --- EXTRA DETAILS --- */}
        <section className="max-w-4xl mx-auto pt-8">
          <div className="bg-primary/5 border border-primary/10 rounded-4xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group">
            <div className="flex-1 space-y-6 relative z-10">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">Diseñado para la Excelencia</h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  CheetoLearn no es solo una plataforma de cursos; es un ecosistema técnico escalable que utiliza bases de datos relacionales avanzadas para trazar rutas de aprendizaje óptimas.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {["PostgreSQL", "Tailwind CSS", "Supabase Auth", "Zod Validation"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-white border border-border rounded-lg text-[10px] sm:text-xs font-mono text-slate-500 shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-32 h-32 md:w-48 md:h-48 flex justify-center items-center relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
              <Cpu className="w-16 h-16 md:w-24 md:h-24 text-primary opacity-40 group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="text-center py-12 border-t border-border mt-12 space-y-2">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.3em] font-bold">
            CheetoLearn Project © 2026
          </p>
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">
            Innovación · Educación · Tecnología
          </p>
        </footer>
      </div>
    </div>
  );
}