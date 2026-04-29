"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Send
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      // --- API CALL ---
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        alert("Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        
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
        <header className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            ¿Tienes alguna <span className="text-primary">pregunta?</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ya seas un alumno con dudas técnicas o un profesor interesado en la plataforma.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* --- CONTACT INFO --- */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-card">
              <CardContent className="p-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Email</h3>
                    <p className="text-sm text-muted-foreground">soporte@cheetolearn.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Ubicación</h3>
                    <p className="text-sm text-muted-foreground">Av. de los Rosales, 17, Madrid</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Horario</h3>
                    <p className="text-sm text-muted-foreground">Lunes a Viernes: 9:00 - 16:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- CONTACT FORM --- */}
          <Card className="lg:col-span-2 border-none shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Envíanos un mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre</label>
                      <Input name="name" placeholder="Tu nombre" required disabled={loading} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input name="email" type="email" placeholder="tu@email.com" required disabled={loading} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asunto</label>
                    <Input name="subject" placeholder="¿En qué podemos ayudarte?" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensaje</label>
                    <Textarea 
                      name="message"
                      placeholder="Escribe tu mensaje aquí..." 
                      className="min-h-37.5 resize-none"
                      required 
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg font-bold gap-2" disabled={loading}>
                    {loading ? "Enviando..." : <><Send className="w-5 h-5" /> Enviar mensaje</>}
                  </Button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold">¡Mensaje enviado!</h2>
                  <p className="text-muted-foreground">Gracias por contactar con CheetoLearn.</p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Enviar otro mensaje
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="text-center py-12 border-t border-border mt-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            CheetoLearn Project © 2026
          </p>
        </footer>
      </div>
    </div>
  );
}