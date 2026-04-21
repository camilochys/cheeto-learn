import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error || !auth.payload) {
      return NextResponse.json({ error: auth.error || "No autorizado" }, { status: auth.status || 401 });
    }

    const { assignmentId } = await params;

    // --- LOOK FOR EXACT ASSIGNMENT ---
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
    }

    // --- LOOK FOR SUBMISSIONS/UPLOADS ---
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: assignmentId },
      include: {
        student: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { 
        submittedAt: "desc" 
      }
    });

    // --- MAPPING FOR FRONTEND ---
    const formattedSubmissions = submissions.map(sub => ({
      id: sub.id,
      studentName: sub.student.name,
      content: sub.description || "",
      fileUrl: sub.fileUrl,
      fileName: sub.title || "Archivo adjunto",
      createdAt: sub.submittedAt,
      grade: sub.score,
      feedback: sub.feedback,
      status: sub.score !== null ? "GRADED" : "PENDING"
    }));

    return NextResponse.json({ 
      data: assignment, 
      submissions: formattedSubmissions 
    });

  } catch (error) {
    console.error("GET_ASSIGNMENT_ERROR", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    const user = auth.payload as any;
    if (auth.error || user?.role !== "TEACHER") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { assignmentId } = await params;

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ message: "Tarea eliminada con éxito" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}