"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, ShieldAlert, ShieldCheck, ShieldEllipsis, ShieldPlus, ShieldUser } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- BACK BUTTON --- */}
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </Link>

        {/* --- HEADER --- */}
        <header className="space-y-4 border-b border-border pb-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Info className="w-3 h-3" />
            Documento Informativo
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground text-lg">
            Última actualización: <span className="font-medium text-foreground">Abril 2026</span>
          </p>
        </header>

        <div className="grid gap-8">
          
          {/* --- SECTION 1 --- */}
          <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShieldCheck className="w-5 h-5" />
                Aviso de Carácter Educativo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-slate-700 leading-relaxed relative z-10">
              <span className="font-bold text-foreground">CheetoLearn</span> es un proyecto desarrollado con fines estrictamente académicos y de aprendizaje. 
              Toda la información gestionada en esta plataforma se utiliza para demostrar la viabilidad técnica 
              del sistema de aprendizaje automático y la arquitectura de software propuesta.
            </CardContent>
          </Card>

          {/* --- SECTION 2 --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldAlert className="w-5 h-5 text-primary" />
                1. Datos que recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Para el correcto funcionamiento de la plataforma, almacenamos la siguiente información mínima necesaria:
              </p>
              <ul className="space-y-3 ml-2">
                <li className="flex gap-3 text-sm text-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><span className="font-bold text-foreground">Datos de Identificación:</span> Nombre, apellidos y correo electrónico facilitados durante el proceso de registro.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><span className="font-bold text-foreground">Datos de Progreso:</span> Resultados de ejercicios, tiempos de estudio, logs de actividad y cursos inscritos.</span>
                </li>
                <li className="flex gap-3 text-sm text-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><span className="font-bold text-foreground">Credenciales:</span> Las contraseñas se gestionan de forma segura y se almacenan cifradas mediante algoritmos de hash.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* --- SECTION 3 --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldEllipsis className="w-5 h-5 text-primary" />
                2. Finalidad del tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 space-y-4">
              <p>Los datos recogidos se utilizan exclusivamente para los siguientes fines:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-border text-center space-y-2">
                  <div className="font-bold text-primary">Personalización</div>
                  <p className="text-xs text-muted-foreground">Experiencia de aprendizaje adaptada al alumno.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-border text-center space-y-2">
                  <div className="font-bold text-primary">Seguimiento</div>
                  <p className="text-xs text-muted-foreground">Control del rendimiento por parte de profesores.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-border text-center space-y-2">
                  <div className="font-bold text-primary">Analíticas</div>
                  <p className="text-xs text-muted-foreground">Generación de métricas de progreso automático.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- SECTION 4 --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldPlus className="w-5 h-5 text-primary" />
                3. Seguridad de la información
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas avanzadas como <span className="font-bold text-foreground italic">Row Level Security (RLS)</span> en nuestra base de datos PostgreSQL para garantizar que cada usuario tenga acceso exclusivo a sus propios datos, respetando la jerarquía de roles.
            </CardContent>
          </Card>

          {/* --- SECTION 5  --- */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldUser className="w-5 h-5 text-primary" />
                4. Tus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 leading-relaxed">
              Al tratarse de un prototipo educativo, garantizamos el derecho de supresión. Cualquier usuario puede solicitar la eliminación total de su perfil y datos asociados contactando con el administrador o a través de los ajustes del panel.
            </CardContent>
          </Card>
        </div>

        {/* --- FOOTER --- */}
        <footer className="text-center py-12 border-t border-border mt-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            CheetoLearn Project © 2026
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Innovación · Educación · Tecnología
          </p>
        </footer>
      </div>
    </div>
  );
}