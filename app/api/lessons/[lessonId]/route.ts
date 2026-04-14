import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    // --- UNWRAP DYNAMIC PARAMS ---
    const { lessonId } = await params;

    // --- VALIDATE JWT ---
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = auth.payload as { id: string; role: string };

    // --- FETCH LESSON WITH COURSE AND FILES RELATION ---
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { 
        course: true,
        files: true // --- ADDED TO RETRIEVE RELATED FILES FROM DATABASE ---
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada." }, { status: 404 });
    }

    // --- CHECK OWNERSHIP ---
    if (payload.role === "TEACHER" && lesson.course.teacherId !== payload.id) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta lección." },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: lesson }, { status: 200 });

  } catch (error) {
    console.error("Error en GET lesson:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}

// --- PUT METHOD: UPDATE EXISTING LESSON ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const body = await req.json();
    const { title, content, order } = body;

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = auth.payload as { id: string; role: string };

    if (payload.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada." }, { status: 404 });
    }

    if (lesson.course.teacherId !== payload.id) {
      return NextResponse.json({ error: "No eres el dueño." }, { status: 403 });
    }

    // --- UPDATE DATABASE RECORD ---
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title ?? lesson.title,
        content: content ?? lesson.content,
        order: order ?? lesson.order,
      },
    });

    return NextResponse.json({ data: updatedLesson }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Error al actualizar." }, { status: 500 });
  }
}

// --- DELETE METHOD: REMOVE LESSON FROM DATABASE ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const payload = auth.payload as { id: string; role: string };

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lección no encontrada." }, { status: 404 });
    }

    if (lesson.course.teacherId !== payload.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    // --- EXECUTE DELETE ACTION ---
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: "Error en DELETE." }, { status: 500 });
  }
}