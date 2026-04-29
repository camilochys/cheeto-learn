import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const payload = auth.payload as { id: string; email: string; role: string };
        
        if (payload.role !== "TEACHER") {
            return NextResponse.json({ error: "Usuario no autorizado." }, { status: 403 });
        }

        const body = await request.json();
        const { title, description } = body;

        const course = await prisma.course.create({
            data: { 
                title, 
                description, 
                teacherId: payload.id 
            }
        });

        return NextResponse.json({ data: course }, { status: 201 });

    } catch (error) {
        console.error("POST COURSE ERROR:", error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const payload = auth.payload as { id: string; role: string };

        // --- ONLY COURSES FROM AUTH TEACHER ---
        const courses = await prisma.course.findMany({
            where: {
                teacherId: payload.id
            },
            include: {
                _count: {
                    select: { 
                        lessons: true,
                        enrollments: true,
                        questions: true
                    }
                },
                questions: {
                    select: {
                        _count: {
                            select: { answers: true }
                        }
                    }
                }
            }
        });

        // --- SEC DATA FOR FRONT ---
        const coursesWithStats = courses.map(course => {
            // --- CALCULATED TOTAL ---
            const totalAnswers = course.questions.reduce((acc, q) => {
                return acc + (q._count?.answers || 0);
            }, 0);

            return {
                id: course.id,
                title: course.title,
                description: course.description || "",
                createdAt: course.createdAt.toISOString(),
                enrolledCount: course._count?.enrollments || 0,
                answersCount: totalAnswers
            };
        });
        
        return NextResponse.json({ data: coursesWithStats }, { status: 200 });

    } catch (error) {
        console.error("GET COURSES ERROR:", error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}