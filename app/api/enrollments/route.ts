import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    
    const payload = auth.payload as { id: string; email: string; role: string };
    
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: payload.id },
      include: { course: true }
    });

    const dataWithStats = await Promise.all(enrollments.map(async (enrol) => {
      const totalAnswers = await prisma.answer.count({
        where: {
          studentId: payload.id,
          question: {
            courseId: enrol.courseId
          }
        }
      });

      const correctAnswers = await prisma.answer.count({
        where: {
          studentId: payload.id,
          isCorrect: true,
          question: {
            courseId: enrol.courseId
          }
        }
      });

      return {
        ...enrol,
        totalAnswers,
        correctAnswers
      };
    }));
    
    return NextResponse.json({ data: dataWithStats }, { status: 200 });
  } catch (error) {
    console.error("GET_PROGRESS_ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

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
        data: { 
          studentId: payload.id, 
          courseId, 
          currentLevel: 1 
        }
    });
    
    return NextResponse.json({ data: enrollment }, { status: 201 });
  } catch (error) {
    console.error("POST_ENROLL_ERROR:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}