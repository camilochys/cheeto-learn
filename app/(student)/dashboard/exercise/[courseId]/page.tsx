"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  difficultyLevel: number;
}

interface FeedbackData {
  isCorrect: boolean;
  correctOption: string;
  newLevel: number;
  percentage: number;
}

export default function ExercisePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchNextQuestion(token);
  }, []);

  async function fetchNextQuestion(token: string) {
    setLoading(true);
    setSelectedOption(null);
    setFeedback(null);

    const res = await fetch(`/api/questions/next?courseId=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (!res.ok) {
      router.push("/dashboard");
      return;
    }

    setQuestion(data.data.question);
    setCurrentLevel(data.data.currentLevel);
    setStartTime(Date.now());
    setLoading(false);
  }

  async function handleAnswer(option: string) {
    if (feedback || submitting) return;

    setSelectedOption(option);
    setSubmitting(true);

    const token = localStorage.getItem("token");
    const responseTime = Math.round((Date.now() - startTime) / 1000);

    const res = await fetch("/api/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: question?.id,
        selectedOption: option,
        responseTime,
        courseId
      })
    });

    const data = await res.json();
    setFeedback(data.data);
    setSubmitting(false);
  }

  function getOptionLabel(option: string) {
    const map: Record<string, string> = {
      A: question?.optionA ?? "",
      B: question?.optionB ?? "",
      C: question?.optionC ?? "",
      D: question?.optionD ?? ""
    };
    return map[option];
  }

  function getOptionStyle(option: string) {
    if (!feedback) {
      return selectedOption === option
        ? "border-primary bg-primary/10"
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }
    if (option === feedback.correctOption) return "border-green-500 bg-green-500/10";
    if (option === selectedOption && !feedback.isCorrect) return "border-destructive bg-destructive/10";
    return "border-border opacity-50";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex justify-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background transition-opacity duration-600"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* --- NAVBAR --- */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/dashboard" className="shrink-0">
            <img src="/cheeto_learn_logo.png" className="h-8 sm:h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap">
              Nivel {currentLevel} / 5
            </span>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Mis cursos</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>
              
      <main className="max-w-2xl mx-auto px-4 py-6 sm:py-12 space-y-6">
        {/* --- LEVEL BAR --- */}
        <div className="space-y-1.5">
            <div className="max-w-4xl w-full">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-2 bg-background shadow-sm hover:bg-accent transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Volver al panel
                </Button>
              </Link>
            </div>
          <div className="flex justify-between text-[10px] mt-4 sm:text-xs text-muted-foreground font-medium">
            <span>PROGRESO DE NIVEL</span>
            <span>{currentLevel} / 5</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
            <div
              className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(var(--primary),0.4)]"
              style={{ width: `${(currentLevel / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* --- QUESTION CARD --- */}
        <Card className="border-border/60 shadow-sm sm:shadow-md">
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Dificultad {question?.difficultyLevel} / 5
              </span>
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl leading-snug sm:leading-relaxed font-semibold text-foreground">
              {question?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-3 p-5 sm:p-6 pt-0">
            {["A", "B", "C", "D"].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback || submitting}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 text-sm sm:text-base transition-all duration-200 flex items-start gap-3 group ${getOptionStyle(option)}`}
              >
                <span className="font-bold text-primary shrink-0">{option}.</span>
                <span className="flex-1 font-medium">{getOptionLabel(option)}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* --- FEEDBACK --- */}
        {feedback && (
          <Card className={`border-2 animate-in fade-in slide-in-from-bottom-4 duration-300 ${feedback.isCorrect ? "border-green-500 bg-green-500/5" : "border-destructive bg-destructive/5"}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {feedback.isCorrect
                    ? <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                    : <XCircle className="w-6 h-6 text-destructive mt-0.5 shrink-0" />
                  }
                  <div className="space-y-1">
                    <p className="font-bold text-base sm:text-lg">
                      {feedback.isCorrect ? "¡Correcto! 🎉" : "Casi lo tienes"}
                    </p>
                    {!feedback.isCorrect && (
                      <p className="text-sm text-muted-foreground leading-snug">
                        La correcta era: <span className="font-bold text-foreground">{feedback.correctOption}. {getOptionLabel(feedback.correctOption)}</span>
                      </p>
                    )}
                    {feedback.newLevel !== currentLevel && (
                      <p className="text-xs sm:text-sm font-bold text-primary animate-pulse">
                        {feedback.newLevel > currentLevel
                          ? `¡Nivel ${feedback.newLevel} alcanzado! 🚀`
                          : `Nivel actual: ${feedback.newLevel}`
                        }
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => fetchNextQuestion(localStorage.getItem("token")!)}
                  className="w-full sm:w-auto font-bold px-8 h-11 sm:h-10"
                  size="default"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}