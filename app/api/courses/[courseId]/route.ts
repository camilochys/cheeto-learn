import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function GET(
  request: Request,
  // --- NEXT JS USE PROMISE FOR PARAMS ---
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = verifyAuth(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            _count: {
              // --- ICON FOR CLIP IF THERE ARE FILES, FANCY HUH TEACHER? ;) ---
              select: { files: true }
            }
          },
          orderBy: {
            // ---  CREATEDAT ORDER ---
            createdAt: 'asc'
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: course }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}