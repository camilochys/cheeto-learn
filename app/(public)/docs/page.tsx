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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3 h-3" />
            Especificaciones Técnicas
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Arquitectura del <span className="text-primary">Ecosistema Educativo</span>
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Documentación detallada sobre la infraestructura, protocolos de seguridad y algoritmos que sostienen a CheetoLearn.
          </p>
        </header>

        {/* --- DOC GRID --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* --- STRUCTURE --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-2">
                <Server className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl font-bold">Arquitectura Serverless</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Implementado en <span className="font-semibold text-foreground">Vercel Edge Runtime</span> para una entrega de contenido global con latencia mínima y escalado horizontal automático.
            </CardContent>
          </Card>

          {/* --- SECURITY --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold">Seguridad y Auth</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Cifrado <span className="font-semibold text-foreground">Bcrypt (Cost 12)</span> y sesiones stateless mediante <span className="font-semibold text-foreground">JWT</span> firmados, protegidos por middleware de autorización por roles.
            </CardContent>
          </Card>

          {/* --- DATABASE --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-2">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl font-bold">Persistencia de Datos</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 leading-relaxed text-sm">
              Motor <span className="font-semibold text-foreground">PostgreSQL</span> gestionado por Supabase, optimizado con políticas de seguridad de nivel de fila (RLS) e integridad referencial estricta.
            </CardContent>
          </Card>

          {/* --- ADAPTIVE ENGINE --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-2">
                <Workflow className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-xl font-bold">Lógica del Motor Adaptativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm">
                El sistema evalúa el rendimiento en tiempo real utilizando una ventana de las últimas 5 respuestas para ajustar dinámicamente el nivel de dificultad:
              </p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="flex-1 min-w-30 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-[10px] uppercase font-bold text-green-600 underline underline-offset-4 mb-1">Éxito &gt; 70%</p>
                  <p className="text-xs font-medium">+1 Nivel</p>
                </div>
                <div className="flex-1 min-w-30 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Estable 40-70%</p>
                  <p className="text-xs font-medium">Mantiene Nivel</p>
                </div>
                <div className="flex-1 min-w-30 p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-[10px] uppercase font-bold text-red-600 mb-1">Bajo &lt; 40%</p>
                  <p className="text-xs font-medium">-1 Nivel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- FILES --- */}
          <Card className="border-none shadow-md bg-card hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-2">
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
        <section className="max-w-4xl mx-auto pt-12">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 text-primary">
                  <Terminal className="w-5 h-5" />
                  <span className="font-mono text-sm font-bold tracking-widest">API_ENDPOINTS_V1</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight">Integración y Desarrollo</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase">Post</span>
                    <code className="text-slate-300 text-xs">/api/auth/login</code>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded uppercase">Get</span>
                    <code className="text-slate-300 text-xs">/api/questions/next</code>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded uppercase">Put</span>
                    <code className="text-slate-300 text-xs">/api/teacher/course/[id]</code>
                  </div>
                </div>
                <p className="text-slate-400 text-sm italic">
                  * Todos los endpoints requieren cabecera Bearer Token y validación de esquema mediante Zod.
                </p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center opacity-40">
                <Code2 className="w-32 h-32 text-primary" />
              </div>
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