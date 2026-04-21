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
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.payload as any;
    const { assignmentId } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    const submission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: user.id
      }
    });

    return NextResponse.json({ assignment, submission });
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}