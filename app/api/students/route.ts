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

    const courses = await prisma.course.findMany({
      where: { teacherId: payload.id },
      include: {
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            },
            course: {
              select: { id: true, title: true }
            }
          }
        },
        questions: {
          include: {
            answers: {
              select: {
                isCorrect: true,
                responseTime: true,
                studentId: true,
                answeredAt: true
              }
            }
          }
        }
      }
    });

    const students = courses.flatMap((course) =>
      course.enrollments.map((enrollment) => {
        // --- GET ALL ANSWERS FROM THIS STUDENT IN THIS COURSE ---
        const studentAnswers = course.questions.flatMap((q) =>
          q.answers.filter((a) => a.studentId === enrollment.student.id)
        );

        const totalAnswers = studentAnswers.length;
        const correctAnswers = studentAnswers.filter((a) => a.isCorrect).length;
        const incorrectAnswers = totalAnswers - correctAnswers;
        const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
        const avgResponseTime = totalAnswers > 0
          ? Math.round(studentAnswers.reduce((acc, a) => acc + (a.responseTime ?? 0), 0) / totalAnswers)
          : 0;

        // --- HARDEST QUESTIONS (most failures) ---
        const questionFailures = course.questions.map((q) => ({
          question: q.question,
          failures: q.answers.filter((a) => a.studentId === enrollment.student.id && !a.isCorrect).length
        })).filter((q) => q.failures > 0).sort((a, b) => b.failures - a.failures).slice(0, 3);

        return {
          studentId: enrollment.student.id,
          studentName: enrollment.student.name,
          studentEmail: enrollment.student.email,
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          currentLevel: enrollment.currentLevel,
          enrolledAt: enrollment.enrolledAt,
          stats: {
            totalAnswers,
            correctAnswers,
            incorrectAnswers,
            percentage,
            avgResponseTime,
            hardestQuestions: questionFailures
          }
        };
      })
    );

    return NextResponse.json({ data: students }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}