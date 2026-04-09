import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function GET(request: Request) {
  try {
    const auth = verifyAuth(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const payload = auth.payload as { id: string; email: string; role: string };
    if (payload.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    // --- GET ALL COURSES FROM THIS TEACHER ---
    const courses = await prisma.course.findMany({
      where: { teacherId: payload.id },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    });

    // --- FLATTEN ENROLLMENTS ---
    const students = courses.flatMap((course) =>
      course.enrollments.map((enrollment) => ({
        studentId: enrollment.student.id,
        studentName: enrollment.student.name,
        studentEmail: enrollment.student.email,
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        currentLevel: enrollment.currentLevel,
        enrolledAt: enrollment.enrolledAt,
      }))
    );

    return NextResponse.json({ data: students }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}