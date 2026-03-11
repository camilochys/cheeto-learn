import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

// --- GET: ANY AUTH USER CAN SEE COURSE QUESTIONS ---
export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");
        const difficulty = searchParams.get("difficulty");

        const questions = await prisma.question.findMany({
            where: {
                ...(courseId && { courseId }),
                ...(difficulty && { difficultyLevel: parseInt(difficulty) })
            }
        });

        return NextResponse.json({ data: questions }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}

// --- POST: ONLY TEACHERS CAN CREATE QUESTIONS ---
export async function POST(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        
        const payload = auth.payload as { id: string; email: string; role: string };
        if (payload.role !== "TEACHER") {
            return NextResponse.json({ error: "No autorizado." }, { status: 403 });
        }
        
        const { question, optionA, optionB, optionC, optionD, correctOption, difficultyLevel, courseId } = await request.json();
        
        const newQuestion = await prisma.question.create({
            data: { question, optionA, optionB, optionC, optionD, correctOption, difficultyLevel, courseId }
        });
        
        return NextResponse.json({ data: newQuestion }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}