import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

// --- GET: OBTAIN ENROLLMENT FROM CURRECT STUDENT ---
export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        
        const payload = auth.payload as { id: string; email: string; role: string };
        
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: payload.id },
            include: { course: true }
        });
        
        return NextResponse.json({ data: enrollments }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}

// --- POST: ENROLL STUDENT ON A COURSE ---
export async function POST(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
        
        const payload = auth.payload as { id: string; email: string; role: string };
        if (payload.role !== "STUDENT") {
            return NextResponse.json({ error: "Solo los alumnos pueden inscribirse." }, { status: 403 });
        }
        
        const { courseId } = await request.json();
        
        const enrollment = await prisma.enrollment.create({
            data: { studentId: payload.id, courseId, currentLevel: 1 }
        });
        
        return NextResponse.json({ data: enrollment }, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}