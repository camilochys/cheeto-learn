import { verifyAuth } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error || !auth.payload) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.payload as any;
    const { assignmentId } = await params;
    const { title, description, fileUrl } = await req.json();

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: user.id
      }
    });

    if (existingSubmission?.score !== null && existingSubmission?.score !== undefined) {
      return NextResponse.json({ error: "No puedes editar una tarea ya calificada" }, { status: 403 });
    }

    let submission;

    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          title: title || existingSubmission.title,
          description: description || existingSubmission.description,
          fileUrl: fileUrl || existingSubmission.fileUrl,
          state: "PENDING",
          submittedAt: new Date()
        }
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          title,
          description,
          fileUrl,
          state: "PENDING",
          submittedAt: new Date(),
          assignmentId,
          studentId: user.id
        }
      });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error("SUBMIT_ERROR", error);
    return NextResponse.json({ error: "Error al enviar la tarea" }, { status: 500 });
  }
}