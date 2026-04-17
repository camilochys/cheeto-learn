"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import {
    ArrowLeft,
    ChevronRight,
    FileText,
    Info,
    LayoutList,
    Paperclip,
    Trophy
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface Lesson {
    id: string;
    title: string;
    _count?: { files: number; };
}

interface Course {
    id: string;
    title: string;
    description: string;
    lessons: Lesson[];
}

export default function CourseCurriculumPage({ params }: { params: Promise<{ courseId: string }> }) {
    const resolvedParams = use(params);
    const courseId = resolvedParams.courseId;

    const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
    const { visible, getFadeStyle } = useFade();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isReady || !token) return;
        
        const loadCourseAndLessons = async () => {
            try {

                const resCourses = await fetch(`/api/courses`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                

                const resLessons = await fetch(`/api/lessons?courseId=${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (resCourses.ok && resLessons.ok) {
                    const dataCourses = await resCourses.json();
                    const dataLessons = await resLessons.json();


                    const currentCourse = dataCourses.data.find((c: any) => c.id === courseId);
                    
                    if (currentCourse) {
                        setCourse({
                            id: currentCourse.id,
                            title: currentCourse.title,
                            description: currentCourse.description,

                            lessons: dataLessons.data || [] 
                        });
                    }
                }
            } catch (err) {
                console.error("Error al cargar datos del temario:", err);
            } finally {
                setLoading(false);
            }
        };

        loadCourseAndLessons();
    }, [isReady, token, courseId]);

    if (!isReady || loading) {
        return <LoadingScreen title="Cargando..." description="Preparando temario" fadingOut={fadingOut} visible={visible} />;
    }

    return (
        <div className="min-h-screen bg-white" style={getFadeStyle(fadingOut)}>
            <Navbar role="STUDENT" onLogout={logout} />

            <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
                
                {/* --- HEADER --- */}
                <div className="space-y-4">
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" /> Volver al panel
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">{course?.title}</h1>
                        <p className="text-muted-foreground text-lg max-w-3xl">{course?.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* --- LESSONS --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <LayoutList className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-xl">Índice de lecciones</h2>
                        </div>

                        <div className="divide-y border-b">
                            {course?.lessons && course.lessons.length > 0 ? (
                                course.lessons.map((lesson, index) => (
                                    <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="block py-6 group hover:bg-slate-50 transition-colors rounded-lg px-4 -mx-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-start gap-5">
                                                <span className="text-slate-300 font-mono text-lg font-medium">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <div className="space-y-1.5">
                                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                        {lesson.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                                            <FileText className="w-3 h-3 text-slate-500" /> Teoría
                                                        </span>
                                                        {lesson._count?.files && lesson._count.files > 0 ? (
                                                            <span className="flex items-center gap-1 text-primary">
                                                                <Paperclip className="w-3 h-3" /> {lesson._count.files} archivos adjuntos
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                Estudiar <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="py-8 text-muted-foreground text-center">Aún no hay lecciones publicadas en este curso.</p>
                            )}
                        </div>
                    </div>

                    {/* --- SIDEBAR --- */}
                    <div className="space-y-10">
                        {/* --- COURSE STATE --- */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tu Estado</h3>
                            <div className="space-y-2">
                                <Progress value={0} className="h-1.5 bg-slate-100" />
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-500">PROGRESO</span>
                                    <span className="text-primary">0%</span>
                                </div>
                            </div>
                        </div>

                        {/* --- TEST BUTTON --- */}
                        <div className="p-6 rounded-2xl border-2 border-slate-100 space-y-4 bg-white">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <span>Evaluación Adaptativa</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Cuando te sientas listo, realiza el test para validar tus conocimientos. El sistema adaptará las preguntas a tu nivel.
                            </p>
                            <Link href={`/dashboard/exercise/${courseId}`} className="block">
                                <Button className="w-full py-6 text-md font-bold shadow-none">
                                    Comenzar Test
                                </Button>
                            </Link>
                        </div>

                        {/* --- ADD INFO --- */}
                        <div className="flex gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                <strong>Nota:</strong> Los archivos y recursos adicionales se encuentran dentro de cada lección individual.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}