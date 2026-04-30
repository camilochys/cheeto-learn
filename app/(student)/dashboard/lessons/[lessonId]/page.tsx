"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Paperclip
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface LessonFile {
    id: string;
    name: string;
    url: string;
}

interface Lesson {
    id: string;
    title: string;
    content: string;
    order: number;
    courseId: string;
    files: LessonFile[];
}

export default function StudentLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const resolvedParams = use(params);
    const lessonId = resolvedParams.lessonId;
    const router = useRouter();

    const { token, isReady, fadingOut, logout } = useAuth({ requiredRole: "STUDENT" });
    const { visible, getFadeStyle } = useFade();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!isReady || !token) return;
        loadData();
    }, [isReady, token, lessonId]);

    async function loadData() {
        setLoading(true);
        try {
            const resLesson = await fetch(`/api/lessons/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!resLesson.ok) {
                router.push("/dashboard");
                return;
            }

            const dataLesson = await resLesson.json();
            const currentLesson: Lesson = dataLesson.data;
            setLesson(currentLesson);

            const resAll = await fetch(`/api/lessons?courseId=${currentLesson.courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (resAll.ok) {
                const dataAll = await resAll.json();
                const sortedLessons = dataAll.data.sort((a: any, b: any) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });
                setAllLessons(sortedLessons);
            }
        } catch (err) {
            console.error("Error loading lesson:", err);
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    }

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    if (!isReady || loading) {
        return (
            <LoadingScreen
                title="Abriendo lección..."
                description="Cargando material de estudio"
                fadingOut={fadingOut}
                visible={visible}
            />
        );
    }

    return (
        <div
            className="min-h-screen bg-white text-slate-900 transition-opacity duration-600"
            style={getFadeStyle(fadingOut)}
        >
            <Navbar role="STUDENT" onLogout={logout} />

            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">

                        <div className="max-w-4xl w-full">
                            <Link href={`/dashboard/course/${lesson?.courseId}`}>
                                <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Volver al temario</span>
                                    <span className="sm:hidden">Volver</span>
                                </Button>
                            </Link>
                        </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {allLessons.length > 0 && (
                            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                                {currentIndex + 1} / {allLessons.length}
                            </span>
                        )}
                        
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Link href={prevLesson ? `/dashboard/lessons/${prevLesson.id}` : "#"}>
                                <Button variant="ghost" size="sm" disabled={!prevLesson} className="text-primary px-2">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href={nextLesson ? `/dashboard/lessons/${nextLesson.id}` : "#"}>
                                <Button variant="ghost" size="sm" disabled={!nextLesson} className="text-primary px-2">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16">

                    <div className="lg:col-span-8 space-y-8">
                        <header className="space-y-4 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm tracking-wider uppercase">
                                <FileText className="w-4 h-4" /> Lección en curso
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                                {lesson?.title}
                            </h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <BookOpen className="w-4 h-4" />
                                <span>
                                    {lesson?.files && lesson.files.length > 0
                                        ? `${lesson.files.length} archivo${lesson.files.length > 1 ? "s" : ""} adjunto${lesson.files.length > 1 ? "s" : ""}`
                                        : "Sin archivos adjuntos"
                                    }
                                </span>
                            </div>
                        </header>

                        <article className="prose prose-slate prose-base sm:prose-lg max-w-none
                            prose-headings:font-bold prose-headings:text-slate-900
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-img:shadow-md">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {lesson?.content || "*Esta lección no tiene contenido escrito aún.*"}
                            </ReactMarkdown>
                        </article>

                        <div className="pt-12 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="w-full sm:w-auto order-2 sm:order-1">
                                {prevLesson ? (
                                    <Link href={`/dashboard/lessons/${prevLesson.id}`} className="w-full">
                                        <Button variant="ghost" size="sm" className="text-primary w-full sm:w-auto justify-start">
                                            <ChevronLeft className="w-4 h-4 mr-2" />
                                            <span className="truncate max-w-37.5">{prevLesson.title}</span>
                                        </Button>
                                    </Link>
                                ) : <div className="hidden sm:block" />}
                            </div>

                            <Button
                                onClick={() => setCompleted(true)}
                                disabled={completed}
                                className="w-full sm:w-auto order-1 sm:order-2 gap-2 px-8 py-6 text-base font-bold rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-60"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {completed ? "¡Lección completada!" : "Marcar como completada"}
                            </Button>

                            <div className="w-full sm:w-auto order-3">
                                {nextLesson ? (
                                    <Link href={`/dashboard/lessons/${nextLesson.id}`} className="w-full">
                                        <Button variant="ghost" size="sm" className="text-primary w-full sm:w-auto justify-end">
                                            <span className="truncate max-w-37.5">{nextLesson.title}</span>
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={`/dashboard/course/${lesson?.courseId}`} className="w-full">
                                        <Button variant="ghost" size="sm" className="text-primary w-full sm:w-auto justify-end">
                                            Temario <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-4 space-y-10">
                        <div className="lg:sticky lg:top-28 space-y-10">
                            {allLessons.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                        <BookOpen className="w-3.5 h-3.5" /> Contenido del curso
                                    </h3>
                                    <div className="space-y-1 max-h-[40vh] lg:max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {allLessons.map((l, index) => (
                                            <Link key={l.id} href={`/dashboard/lessons/${l.id}`}>
                                                <div className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all mb-1 ${
                                                    l.id === lessonId
                                                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                }`}>
                                                    <span className="font-mono text-[10px] text-slate-400 w-5 shrink-0">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </span>
                                                    <span className="line-clamp-2 leading-snug">{l.title}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                                    <Paperclip className="w-3.5 h-3.5" /> Recursos
                                </h3>

                                {lesson?.files && lesson.files.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {lesson.files.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2 bg-white rounded-xl border group-hover:border-primary/30 transition-colors shrink-0">
                                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium truncate text-slate-700">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <Download className="w-4 h-4 text-slate-300 group-hover:text-primary shrink-0 ml-2" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-xs text-muted-foreground italic">
                                            No hay archivos para esta lección.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}