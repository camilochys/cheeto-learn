"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, ShieldAlert, ShieldCheck, ShieldEllipsis, ShieldPlus, ShieldUser } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
        <header className="space-y-4 border-b border-border pb-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <Info className="w-3 h-3" />
            Documento Informativo
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Última actualización: <span className="font-medium text-foreground">Abril 2026</span>
          </p>
        </header>

        <div className="grid gap-6 sm:gap-8">
          
          {/* --- SECTION 1: EDUCATIONAL NOTICE --- */}
          <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 hidden sm:block">
              <ShieldCheck className="w-24 h-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary text-lg sm:text-xl">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                Aviso de Carácter Educativo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm sm:text-base text-slate-700 leading-relaxed relative z-10">
              <span className="font-bold text-foreground">CheetoLearn</span> es un proyecto desarrollado con fines estrictamente académicos y de aprendizaje. 
              Toda la información gestionada en esta plataforma se utiliza para demostrar la viabilidad técnica 
              del sistema de aprendizaje automático y la arquitectura de software propuesta.
            </CardContent>
          </Card>

          {/* --- SECTION 2: DATA COLLECTION --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
                1. Datos que recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Para el correcto funcionamiento de la plataforma, almacenamos la siguiente información mínima necesaria:
              </p>
              <ul className="space-y-4 sm:space-y-3">
                {[
                  { label: "Datos de Identificación", desc: "Nombre, apellidos y correo electrónico facilitados durante el proceso de registro." },
                  { label: "Datos de Progreso", desc: "Resultados de ejercicios, tiempos de estudio, logs de actividad y cursos inscritos." },
                  { label: "Credenciales", desc: "Las contraseñas se gestionan de forma segura y se almacenan cifradas mediante algoritmos de hash." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span><span className="font-bold text-foreground">{item.label}:</span> {item.desc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* --- SECTION 3: PURPOSE --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <ShieldEllipsis className="w-5 h-5 text-primary shrink-0" />
                2. Finalidad del tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700">Los datos recogidos se utilizan exclusivamente para los siguientes fines:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { title: "Personalización", desc: "Experiencia adaptada al alumno." },
                  { title: "Seguimiento", desc: "Control de rendimiento docente." },
                  { title: "Analíticas", desc: "Métricas de progreso automático." }
                ].map((box, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-border text-center space-y-1 sm:space-y-2">
                    <div className="font-bold text-primary text-sm">{box.title}</div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">{box.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* --- SECTION 4: SECURITY --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <ShieldPlus className="w-5 h-5 text-primary shrink-0" />
                3. Seguridad de la información
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas avanzadas como <span className="font-bold text-foreground italic">Row Level Security (RLS)</span> en nuestra base de datos PostgreSQL para garantizar que cada usuario tenga acceso exclusivo a sus propios datos, respetando la jerarquía de roles establecida en el sistema.
            </CardContent>
          </Card>

          {/* --- SECTION 5: RIGHTS --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <ShieldUser className="w-5 h-5 text-primary shrink-0" />
                4. Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 leading-relaxed">
              Al tratarse de un prototipo educativo, garantizamos el derecho de supresión. Cualquier usuario puede solicitar la eliminación total de su perfil y datos asociados contactando con el administrador o a través de las opciones de cuenta en el panel de control.
            </CardContent>
          </Card>
        </div>

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