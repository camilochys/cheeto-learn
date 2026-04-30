"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Database,
  FileCode,
  Lock,
  Server,
  Terminal,
  Workflow
} from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3 h-3" />
            Especificaciones Técnicas
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Arquitectura del <span className="text-primary">Ecosistema</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Documentación detallada sobre la infraestructura, protocolos de seguridad y algoritmos que sostienen a CheetoLearn.
          </p>
        </header>

        {/* --- DOC GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* --- STRUCTURE --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Server className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl font-bold">Arquitectura Serverless</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Implementado en <span className="font-semibold text-foreground">Vercel Edge Runtime</span> para una entrega de contenido global con latencia mínima y escalado horizontal automático.
            </CardContent>
          </Card>

          {/* --- SECURITY --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold">Seguridad y Auth</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Cifrado <span className="font-semibold text-foreground">Bcrypt (Cost 12)</span> y sesiones stateless mediante <span className="font-semibold text-foreground">JWT</span> firmados, protegidos por middleware de autorización por roles.
            </CardContent>
          </Card>

          {/* --- DATABASE --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold">Persistencia de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Motor <span className="font-semibold text-foreground">PostgreSQL</span> gestionado por Supabase, optimizado con políticas de seguridad de nivel de fila (RLS) e integridad referencial estricta.
            </CardContent>
          </Card>

          {/* --- ADAPTIVE ENGINE --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group lg:col-span-2">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Workflow className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold">Lógica del Motor Adaptativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 text-sm">
                El sistema evalúa el rendimiento en tiempo real utilizando una ventana de las últimas 5 respuestas para ajustar dinámicamente el nivel de dificultad:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[10px] uppercase font-black text-green-600 tracking-wider mb-2">Éxito &gt; 70%</p>
                  <p className="text-sm font-bold text-green-900">+1 Nivel de Dificultad</p>
                </div>
                <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2">Estable 40-70%</p>
                  <p className="text-sm font-bold text-slate-700">Mantiene Nivel Actual</p>
                </div>
                <div className="flex-1 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] uppercase font-black text-red-600 tracking-wider mb-2">Bajo &lt; 40%</p>
                  <p className="text-sm font-bold text-red-900">-1 Nivel de Dificultad</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- FILES --- */}
          <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCode className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold">Gestión de Archivos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Sistema de <span className="font-semibold text-foreground">borrado físico en cascada</span> para evitar archivos huérfanos en el almacenamiento S3 ante eliminaciones en DB.
            </CardContent>
          </Card>
        </div>

        {/* --- API / CODE --- */}
        <section className="max-w-4xl mx-auto pt-8">
          <div className="bg-slate-900 rounded-4xl p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
               <Code2 className="w-48 h-48 text-primary" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-primary">
                  <Terminal className="w-5 h-5" />
                  <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase">API_REST_SPEC_V1</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Integración y Desarrollo</h2>
              </div>

              <div className="grid gap-3 sm:gap-4 max-w-2xl">
                {[
                  { method: "Post", path: "/api/auth/login", color: "bg-blue-500/20 text-blue-400" },
                  { method: "Get", path: "/api/questions/next", color: "bg-green-500/20 text-green-400" },
                  { method: "Put", path: "/api/teacher/course/[id]", color: "bg-yellow-500/20 text-yellow-400" }
                ].map((api, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                    <span className={`w-fit text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter ${api.color}`}>
                      {api.method}
                    </span>
                    <code className="text-slate-300 text-xs sm:text-sm font-mono truncate">
                      {api.path}
                    </code>
                  </div>
                ))}
              </div>

              <p className="text-slate-400 text-[11px] sm:text-xs italic border-l-2 border-primary/30 pl-4">
                * Todos los endpoints requieren cabecera Bearer Token y validación de esquema mediante Zod para garantizar la integridad de los datos.
              </p>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="text-center py-12 border-t border-border mt-12 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
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