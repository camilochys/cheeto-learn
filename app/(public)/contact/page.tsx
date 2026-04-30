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
    <div className="min-h-screen bg-slate-50/50 py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
        
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
        <header className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            ¿Tienes alguna <span className="text-primary">pregunta?</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Ya seas un alumno con dudas técnicas o un profesor interesado en la plataforma.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* --- CONTACT INFO --- */}
          <div className="order-2 lg:order-1 space-y-4 sm:space-y-6">
            <Card className="border-none shadow-sm bg-card overflow-hidden">
              <CardContent className="p-6 space-y-6 sm:space-y-8">
                {[
                  { icon: Mail, title: "Email", info: "soporte@cheetolearn.com" },
                  { icon: MapPin, title: "Ubicación", info: "Av. de los Rosales, 17, Madrid" },
                  { icon: Clock, title: "Horario", info: "Lunes a Viernes: 9:00 - 16:00" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center lg:items-start gap-4 group">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.info}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center sm:text-left">
              <p className="text-xs text-primary font-semibold uppercase tracking-wider">Respuesta rápida</p>
              <p className="text-sm text-muted-foreground mt-1">Solemos responder en menos de 24 horas laborables.</p>
            </div>
          </div>

          {/* --- CONTACT FORM --- */}
          <Card className="order-1 lg:order-2 lg:col-span-2 border-none shadow-md bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Envíanos un mensaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Nombre</label>
                      <Input 
                        name="name" 
                        placeholder="Tu nombre" 
                        required 
                        disabled={loading} 
                        className="h-11 sm:h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1">Email</label>
                      <Input 
                        name="email" 
                        type="email" 
                        placeholder="tu@email.com" 
                        required 
                        disabled={loading} 
                        className="h-11 sm:h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Asunto</label>
                    <Input 
                      name="subject" 
                      placeholder="¿En qué podemos ayudarte?" 
                      required 
                      disabled={loading} 
                      className="h-11 sm:h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Mensaje</label>
                    <Textarea 
                      name="message"
                      placeholder="Escribe tu mensaje aquí..." 
                      className="min-h-37.5 sm:min-h-50 resize-none"
                      required 
                      disabled={loading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform" 
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : <><Send className="w-5 h-5" /> Enviar mensaje</>}
                  </Button>
                </form>
              ) : (
                <div className="py-10 sm:py-16 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-bold">¡Mensaje enviado!</h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-xs mx-auto">
                      Gracias por contactar con CheetoLearn. Hemos recibido tu consulta correctamente.
                    </p>
                  </div>
                  <Button variant="outline" size="lg" onClick={() => setSubmitted(false)} className="rounded-xl">
                    Enviar otro mensaje
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <footer className="text-center py-8 md:py-12 border-t border-border mt-8 md:mt-12">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">
            CheetoLearn Project © 2026
          </p>
        </footer>
      </div>
    </div>
  );
}