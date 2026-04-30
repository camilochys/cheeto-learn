"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
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
        if (!isReady || !token || !courseId) return;
        const loadCourseAndLessons = async () => {
            try {
                const [resCourses, resLessons] = await Promise.all([
                    fetch(`/api/courses`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`/api/lessons?courseId=${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                if (resCourses.ok && resLessons.ok) {
                    const dataCourses = await resCourses.json();
                    const dataLessons = await resLessons.json();
                    const currentCourse = dataCourses.data?.find((c: any) => c.id === courseId);
                    const lessonsFromServer = dataLessons.data || [];
                    setCourse({
                        id: courseId,
                        title: currentCourse?.title || "Cargando curso...",
                        description: currentCourse?.description || "...",
                        lessons: lessonsFromServer
                    });
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

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
                
                {/* --- HEADER --- */}
                <div className="space-y-4">
		        <div className="max-w-4xl w-full">
		            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al panel
              </Button>
            </Link>
			        </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{course?.title}</h1>
                        <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">{course?.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                    
                    {/* --- LESSONS --- */}
                    <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <LayoutList className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-xl">Índice de lecciones</h2>
                        </div>

                        <div className="divide-y border-b">
                            {course?.lessons && course.lessons.length > 0 ? (
                                course.lessons.map((lesson, index) => (
                                    <Link key={lesson.id} href={`/dashboard/lessons/${lesson.id}`} className="block py-5 sm:py-6 group hover:bg-slate-50 transition-colors rounded-lg px-2 sm:px-4 -mx-2 sm:-mx-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-start gap-3 sm:gap-5">
                                                <span className="text-slate-300 font-mono text-base sm:text-lg font-medium pt-0.5">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <div className="space-y-1.5">
                                                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors leading-tight">
                                                        {lesson.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                                            <FileText className="w-3 h-3 text-slate-500" /> Teoría
                                                        </span>
                                                        {lesson._count?.files && lesson._count.files > 0 ? (
                                                            <span className="flex items-center gap-1 text-primary">
                                                                <Paperclip className="w-3 h-3" /> {lesson._count.files} archivos
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                                                <span className="hidden sm:inline">Estudiar</span> <ChevronRight className="w-4 h-4" />
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
                    <div className="order-1 lg:order-2 space-y-8 sm:space-y-10">

                        {/* --- TEST BUTTON --- */}
                        <div className="p-5 sm:p-6 rounded-2xl border-2 border-slate-100 space-y-4 bg-white">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <span>Evaluación Adaptativa</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Cuando te sientas listo, realiza el test para validar tus conocimientos.
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
                                <strong>Nota:</strong> Los archivos se encuentran dentro de cada lección individual.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}