import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

// --- GET: ANY AUTH USER CAN SEE LESSONS IN A COURSE ---
export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        const lessons = await prisma.lesson.findMany({
            where: courseId ? { courseId } : undefined,
            orderBy: { order: "asc" }
        });

        return NextResponse.json({ data: lessons }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}

// --- POST: ONLY TEACHERS CAN CREATE LESSONS ---
export async function POST(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

        const payload = auth.payload as { id: string; email: string; role: string };
        if (payload.role !== "TEACHER") {
            return NextResponse.json({ error: "No autorizado." }, { status: 403 });
        }

        const { title, content, order, courseId } = await request.json();

        const lesson = await prisma.lesson.create({
            data: { title, content, order: order ?? 0, courseId }
        });

        return NextResponse.json({ data: lesson }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }   
}