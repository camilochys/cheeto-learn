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
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* --- BACK BUTTON --- */}
        <div className="max-w-4xl mx-auto w-full">
          <Link href="/">
            <Button variant="outline" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* --- HEADER --- */}
        <header className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Innovación Educativa
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Potencia tu aprendizaje con <span className="text-primary">tecnología de vanguardia</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Explora las herramientas diseñadas para transformar la educación convencional en una experiencia inteligente y personalizada.
          </p>
        </header>

        {/* --- FEATURES GRID --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* --- FEATURE 1 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-2">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold">Algoritmos Adaptativos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Nuestro motor de <span className="font-semibold text-foreground">Machine Learning</span> analiza tus patrones de estudio para identificar áreas de refuerzo, personalizando los ejercicios en tiempo real.
            </CardContent>
          </Card>

          {/* --- FEATURE 2 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold">Arquitectura de Alta Velocidad</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Construido sobre <span className="font-semibold text-foreground">Next.js 14+</span> y optimizado para una latencia mínima, garantizando una fluidez total entre lecciones y evaluaciones.
            </CardContent>
          </Card>

          {/* --- FEATURE 3 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
                <LineChart className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold">Dashboards en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Visualiza tu progreso mediante gráficos interactivos que detallan tu evolución académica, tasas de éxito y tiempo dedicado por módulo.
            </CardContent>
          </Card>

          {/* --- FEATURE 4 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-2">
                <Layers className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold">Gestión de Roles</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Entornos diferenciados para <span className="font-semibold text-foreground">Alumnos y Profesores</span>. Los docentes pueden gestionar contenidos y supervisar el avance grupal de forma masiva.
            </CardContent>
          </Card>

          {/* --- FEATURE 5 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold">Seguridad de Datos RLS</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Implementamos <span className="font-semibold text-foreground">Row Level Security</span> para asegurar que tu información personal y académica esté blindada y solo accesible por ti.
            </CardContent>
          </Card>

          {/* --- FEATURE 6 --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-2">
                <Smartphone className="w-6 h-6 text-slate-600" />
              </div>
              <CardTitle className="text-xl font-bold">Diseño Responsive</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed">
              Accede a tus cursos desde cualquier dispositivo. Una interfaz adaptativa que no sacrifica funcionalidades en tablets o smartphones.
            </CardContent>
          </Card>
        </div>

        {/* --- EXTRA DETAILS --- */}
        <section className="max-w-4xl mx-auto pt-12">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Diseñado para la Excelencia</h2>
              <p className="text-slate-600">
                CheetoLearn no es solo una plataforma de cursos; es un ecosistema técnico escalable que utiliza bases de datos relacionales avanzadas para trazar rutas de aprendizaje óptimas.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white border border-border rounded-lg text-xs font-mono text-slate-500">PostgreSQL</span>
                <span className="px-3 py-1 bg-white border border-border rounded-lg text-xs font-mono text-slate-500">Tailwind CSS</span>
                <span className="px-3 py-1 bg-white border border-border rounded-lg text-xs font-mono text-slate-500">Supabase Auth</span>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <Cpu className="w-32 h-32 text-primary opacity-20" />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="text-center py-12 border-t border-border mt-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            CheetoLearn Project © 2026
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">
            Innovación · Educación · Tecnología
          </p>
        </footer>
      </div>
    </div>
  );
}