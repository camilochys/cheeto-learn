"use client";

import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useFade } from "@/hooks/useFade";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Paperclip,
    CheckCircle2,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
            // --- 1. FETCH CURRENT LESSON ---
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

            // --- 2. FETCH ALL LESSONS OF THE SAME COURSE FOR NAVIGATION ---
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

    // --- NAVIGATION HELPERS ---
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

            {/* --- TOP NAVIGATION BAR --- */}
            <nav className="pb-12 mb-12 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href={`/dashboard/course/${lesson?.courseId}`}
                    >
                        <Button variant="ghost" size="sm" className="text-primary">
                        <ArrowLeft className="w-4 h-4" /> Volver al temario
                        </Button>
                    </Link>

                    {/* --- LESSON COUNTER --- */}
                    {allLessons.length > 0 && (
                        <span className="text-xs font-mono text-muted-foreground hidden md:block">
                            Lección {currentIndex + 1} de {allLessons.length}
                        </span>
                    )}

                    {/* --- PREV / NEXT BUTTONS --- */}
                    <div className="flex items-center gap-16">
                        {prevLesson ? (
                            <Link href={`/dashboard/lessons/${prevLesson.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary">
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="ghost" size="sm" disabled className="opacity-30">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                            </Button>
                        )}
                        <div className="h-4 w-px bg-slate-200" />
                        {nextLesson ? (
                            <Link href={`/dashboard/lessons/${nextLesson.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary">
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        ) : (
                            <Button variant="ghost" size="sm" disabled className="opacity-30">
                                Siguiente <ChevronRight className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div style={{ display: "grid", gridTemplateColumns: "4fr 1fr", gap: "5rem" }}>

                    {/* --- MAIN CONTENT (3 COLS) --- */}
                    <div className="space-y-8">

                        {/* --- LESSON HEADER --- */}
                        <header className="space-y-4 pb-8 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wider uppercase">
                                <FileText className="w-4 h-4" /> Lección en curso
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
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

                        {/* --- MARKDOWN CONTENT --- */}
                        <article className="prose prose-slate prose-lg max-w-none
                            prose-headings:font-bold prose-headings:text-slate-900
                            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                            prose-p:text-slate-600 prose-p:leading-relaxed
                            prose-strong:text-slate-900 prose-strong:font-semibold
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-code:text-primary prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                            prose-pre:bg-slate-900 prose-pre:text-slate-100
                            prose-blockquote:border-primary prose-blockquote:text-slate-500
                            prose-ul:text-slate-600 prose-ol:text-slate-600
                            prose-li:my-1
                            prose-img:rounded-xl prose-img:shadow-md
                            prose-hr:border-slate-200">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {lesson?.content || "*Esta lección no tiene contenido escrito aún.*"}
                            </ReactMarkdown>
                        </article>

                        {/* --- BOTTOM NAVIGATION --- */}
                        <div className="pt-12 mt-12 border-slate-100 flex items-center justify-between gap-4">
                            {prevLesson ? (
                                <Link href={`/dashboard/lessons/${prevLesson.id}`}>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline">{prevLesson.title}</span>
                                        <span className="sm:hidden">Anterior</span>
                                    </Button>
                                </Link>
                            ) : <div />}

                            <Button
                                onClick={() => setCompleted(true)}
                                disabled={completed}
                                className="gap-2 px-8 py-6 text-base font-bold rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-60 disabled:scale-100"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {completed ? "¡Lección completada!" : "Marcar como completada"}
                            </Button>

                            {nextLesson ? (
                                <Link href={`/dashboard/lessons/${nextLesson.id}`}>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        <span className="hidden sm:inline">{nextLesson.title}</span>
                                        <span className="sm:hidden">Siguiente</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/dashboard/course/${lesson?.courseId}`}>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        Ver temario
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* --- SIDEBAR (1 COL) --- */}
                    <aside className="col-start-3 col-end-4">
                        <div className="sticky top-28 space-y-6">

                            {/* --- LESSON INDEX --- */}
                            {allLessons.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5" /> Índice
                                    </h3>
                                    <div className="space-y-1">
                                        {allLessons.map((l, index) => (
                                            <Link
                                                key={l.id}
                                                href={`/dashboard/lessons/${l.id}`}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                                                    l.id === lessonId
                                                        ? "bg-primary/10 text-primary font-semibold"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                            >
                                                <span className="font-mono text-xs text-slate-300 w-5 shrink-0">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <span className="line-clamp-2 leading-snug">{l.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- DOWNLOADABLE FILES --- */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Paperclip className="w-3.5 h-3.5" /> Material descargable
                                </h3>

                                {lesson?.files && lesson.files.length > 0 ? (
                                    <div className="space-y-2">
                                        {lesson.files.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary hover:shadow-md transition-all"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-1.5 bg-white rounded-lg border group-hover:border-primary/30 transition-colors shrink-0">
                                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                                    </div>
                                                    <span className="text-sm font-medium truncate text-slate-700 group-hover:text-slate-900">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <Download className="w-4 h-4 text-slate-300 group-hover:text-primary shrink-0 ml-2" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="border-dashed shadow-none bg-slate-50/30">
                                        <CardContent className="py-4 text-center">
                                            <p className="text-xs text-muted-foreground italic">
                                                No hay archivos adjuntos para esta lección.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
