import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const auth = await verifyAuth(req);

    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // --- AS 'ANY' TO ACCESS ROLE ---
    const user = auth.payload as any;

    if (user.role !== "TEACHER") {
      return NextResponse.json({ error: "No tienes permisos." }, { status: 403 });
    }

    const { questionId } = await params;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ data: question });
  } catch (error) {
    console.error("GET_QUESTION_ERROR:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const user = auth.payload as any;
    if (user.role !== "TEACHER") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { questionId } = await params;
    const body = await req.json();
    
    // --- SECURITY VALIDATION ---
    const { question, optionA, optionB, optionC, optionD, correctOption, difficultyLevel } = body;

    if (!question?.trim() || !optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos (pregunta y opciones) son obligatorios." },
        { status: 400 }
      );
    }

    // --- UPDATE ---
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        difficultyLevel: Number(difficultyLevel),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PUT_QUESTION_ERROR:", error);
    return NextResponse.json({ error: "Error al actualizar la pregunta" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ questionId: string }> }) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const user = auth.payload as any;
    if (user.role !== "TEACHER") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { questionId } = await params;
    await prisma.question.delete({ where: { id: questionId } });

    return NextResponse.json({ message: "Pregunta eliminada" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}