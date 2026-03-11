import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        
        const payload = auth.payload as { id: string; email: string; role: string };
        if (payload.role !== "STUDENT") {
            return NextResponse.json({ error: "Solo los alumnos pueden obtener preguntas." }, { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        
        if (!courseId) {
            return NextResponse.json({ error: "courseId es obligatorio." }, { status: 400 });
        }
        
        // --- OBTAIN STUDENT'S CURRENT LEVEL IN THIS COURSE ---
        const enrollment = await prisma.enrollment.findFirst({
            where: { studentId: payload.id, courseId }
        });
        
        if (!enrollment) {
            return NextResponse.json({ error: "El alumno no está inscrito en este curso." }, { status: 404 });
        }

        // --- OBTAIN QUESTIONS ALREDY ANSWERED BY THE STUDENT'S ID ---
        const answeredQuestions = await prisma.answer.findMany({
            where: {
                studentId: payload.id,
                question: { courseId }
            },
            select: { questionId: true }
        });

        const answeredIds = answeredQuestions.map(a => a.questionId);

        // --- SEARCH CURRENT LEVEL'S QUESTIONS NOT ANSWERED YET ---
        let question = await prisma.question.findFirst({
            where: {
                courseId,
                difficultyLevel: enrollment.currentLevel,
                id: { notIn: answeredIds.length > 0 ? answeredIds : [""] }
            }
        });

        // --- IF THERE ARE NO CURRENT LEVEL'S QUESTIONS, SEARCH IN THE CLOSEST LEVEL ---
        if (!question) {
            question = await prisma.question.findFirst({
                where: {
                    courseId,
                    id: { notIn: answeredIds.length > 0 ? answeredIds : [""] }
                },
                orderBy: { difficultyLevel: "asc" }
            });
        }

        // --- IF THERE ARE NO UNASWERED QUESTIONS, RESTART ---
        if (!question) {
            question = await prisma.question.findFirst({
                where: {
                    courseId,
                    difficultyLevel: enrollment.currentLevel
                }
            });
        }

        if (!question) {
            return NextResponse.json({ error: "No hay preguntas disponibles en este curso." }, { status: 404 });
        }

        // --- RETURN THE QUESTION WITHOUT THE CORRECT ANSWER ---
        const { correctOption, ...questionWithoutAnswer } = question;

        return NextResponse.json({
            data: {
                question: questionWithoutAnswer,
                currentLevel: enrollment.currentLevel
            }
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}