import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    const user = auth.payload as any;

    if (auth.error || user?.role !== "TEACHER") {
      return NextResponse.json(
        { error: auth.error || "No autorizado" }, 
        { status: auth.status || 401 }
      );
    }

    const { submissionId } = await params;
    const body = await req.json();
    const { grade, feedback } = body;

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(grade),
        feedback: feedback,
        state: "SUBMITTED"
      },
    });

    return NextResponse.json({ 
      message: "Calificación guardada", 
      data: updatedSubmission 
    });

  } catch (error) {
    console.error("GRADE_SUBMISSION_ERROR:", error);
    return NextResponse.json(
      { error: "Error al procesar la calificación" }, 
      { status: 500 }
    );
  }
}