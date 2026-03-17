"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

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
      className="min-h-screen bg-background transition-opacity duration-[600ms]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* --- NAVBAR --- */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <img src="/cheeto_learn_logo.png" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              Nivel {currentLevel} / 5
            </span>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Mis cursos
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* --- LEVEL BAR --- */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Nivel actual</span>
            <span>{currentLevel} / 5</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentLevel / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* --- QUESTION CARD --- */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Dificultad {question?.difficultyLevel} / 5
              </span>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["A", "B", "C", "D"].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback || submitting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${getOptionStyle(option)}`}
              >
                <span className="font-semibold text-primary mr-3">{option}.</span>
                {getOptionLabel(option)}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* --- FEEDBACK --- */}
        {feedback && (
          <Card className={`border-2 transition-all duration-300 ${feedback.isCorrect ? "border-green-500 bg-green-500/5" : "border-destructive bg-destructive/5"}`}>
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                {feedback.isCorrect
                  ? <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
                  : <XCircle className="w-6 h-6 text-destructive mt-0.5 shrink-0" />
                }
                <div className="flex-1 space-y-1">
                  <p className="font-semibold">
                    {feedback.isCorrect ? "¡Correcto! 🎉" : "Incorrecto"}
                  </p>
                  {!feedback.isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      La respuesta correcta era <span className="font-semibold text-foreground">{feedback.correctOption}. {getOptionLabel(feedback.correctOption)}</span>
                    </p>
                  )}
                  {feedback.newLevel !== currentLevel && (
                    <p className="text-sm font-medium text-primary">
                      {feedback.newLevel > currentLevel
                        ? `¡Has subido al nivel ${feedback.newLevel}! 🚀`
                        : `Has bajado al nivel ${feedback.newLevel}`
                      }
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => fetchNextQuestion(localStorage.getItem("token")!)}
                  size="sm"
                >
                  Siguiente
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