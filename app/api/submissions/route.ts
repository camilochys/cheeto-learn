import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assignmentId, studentId, title, description, fileUrl } = body;

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        title,
        description,
        fileUrl,
        state: "SUBMITTED",
        submittedAt: new Date()
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("[SUBMISSIONS_POST]", error);
    return NextResponse.json({ error: "Error al enviar la tarea" }, { status: 500 });
  }
}