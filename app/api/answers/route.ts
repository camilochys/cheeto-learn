import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";
import { calculateNewLevel, calculatePercentage } from "@/lib/adaptive";

export async function POST(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        
        const payload = auth.payload as { id: string; email: string; role: string };
        if (payload.role !== "STUDENT") {
            return NextResponse.json({ error: "Solo los alumnos pueden responder preguntas." }, { status: 403 });
    }

    const { questionId, selectedOption, responseTime, courseId } = await request.json();

    // --- OBTAIN THE QUESTION TO KNOW THE CORRECT ANSWER ---
    const question = await prisma.question.findUnique({
        where: { id: questionId }
    });

    if (!question) {
        return NextResponse.json({ error: "Pregunta no encontrada." }, { status: 404 });
    }

    const isCorrect = selectedOption === question.correctOption;

    // --- SAVE THE ANSWER ---
    await prisma.answer.create({
        data: {
            selectedOption,
            isCorrect,
            responseTime: responseTime ?? 0,
            studentId: payload.id,
            questionId
        }
    });

    // --- OBTAIN THE LAST 5 ANSWERS OF THE STUDENT IN THAT COURSE ---
    const lastAnswers = await prisma.answer.findMany({
        where: {
            studentId: payload.id,
            question: { courseId }
        },
        orderBy: { answeredAt: "desc" },
        take: 5
    });

    // --- OBTAIN THE CURRENT LEVEL OF THE STUDENT IN THAT COURSE ---
    const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: payload.id, courseId }
    });

    if (!enrollment) {
        return NextResponse.json({ error: "El alumno no está inscrito en este curso." }, { status: 404 });
    }

    // --- CALCULATE PERCENTAGE AND NEW LEVEL USING ADAPTIVE ENGINE ---
    const percentage = calculatePercentage(lastAnswers);
    const newLevel = calculateNewLevel(enrollment.currentLevel, lastAnswers);

    // --- UPDATE NEVEL IF IT CHANGES ---
    if (newLevel !== enrollment.currentLevel) {
        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { currentLevel: newLevel }
        });
    }

    return NextResponse.json({
        data: {
            isCorrect,
            correctOption: question.correctOption,
            newLevel,
            percentage: Math.round(percentage)
        }
    }, { status: 201 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}