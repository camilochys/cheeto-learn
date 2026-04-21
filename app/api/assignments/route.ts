import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, limitDate, courseId, fileUrl } = body;

    if (!title || !courseId) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        limitDate: limitDate ? new Date(limitDate) : null,
        courseId,
        fileUrl
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[ASSIGNMENTS_POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) return NextResponse.json({ error: "Course ID requerido" }, { status: 400 });

  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}