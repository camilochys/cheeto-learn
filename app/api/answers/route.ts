import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

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

    // --- CALCULATE THE PERCENTAGE OF CORRECT ANSWERS ---
    const correctCount = lastAnswers.filter(a => a.isCorrect).length;
    const percentage = (correctCount / lastAnswers.length) * 100;

    // --- OBTAIN THE CURRENT LEVEL OF THE STUDENT IN THAT COURSE ---
    const enrollment = await prisma.enrollment.findFirst({
        where: { studentId: payload.id, courseId }
    });

    if (!enrollment) {
        return NextResponse.json({ error: "El alumno no está inscrito en este curso." }, { status: 404 });
    }

    let newLevel = enrollment.currentLevel;

    // --- APPLY ADAPTATIVE ALGORITHM WHEN THERE IS ONLY 5 ANSWERS ---
    if (lastAnswers.length === 5) {
        if (percentage > 70 && newLevel < 5) newLevel += 1;
        if (percentage < 40 && newLevel > 1) newLevel -= 1;
    }

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