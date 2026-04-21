import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error || !auth.payload) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const user = auth.payload as any;
    const { courseId } = await params;

    const assignments = await prisma.assignment.findMany({
      where: { courseId: courseId },
      include: {
        submissions: {
          where: { studentId: user.id },
          select: {
            score: true,
            state: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const data = assignments.map(a => ({
      id: a.id,
      title: a.title,
      limitDate: a.limitDate,
      submission: a.submissions[0] || null
    }));

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar tareas" }, { status: 500 });
  }
}