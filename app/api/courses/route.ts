import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/middleware";

export async function POST(request: Request) {
    // --- INTERNAL SERVER TRY ---
    try {
        // --- REQUEST VERIFYAUTH FROM MIDDLEWARE --- 
        const auth = verifyAuth(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        // --- EXTRACT ID, EMAIL, ROLE FROM THE PAYLOAD FOR FURTHER USE ---
        const payload = auth.payload as { id: string; email: string; role: string };
        // --- VERIFY PAYLOAD ROLE IS TEACHER, ELSE UNAUTHORIZED ---
        if (payload.role !== "TEACHER") {
            return NextResponse.json({ error: "Usuario no autorizado." }, { status: 403 });
        }

        // --- EXTRACT TITLE AND DESCRIPTION FROM BODY ---
        const body = await request.json();
        const { title, description } = body;

        // --- CREATE COURSE ON PRISMA USING PAYLOAD ID ---
        const course = await prisma.course.create({
            data: { title, description, teacherId: payload.id }
        });

        // --- COURSE CREATED OK ---
        return NextResponse.json({ data: course }, { status: 201 });

    // --- CHECK ANY INTERNAL ERROR ---
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}

// --- GET TO READ AND OBTAIN COURSES FROM PRISMA ---
export async function GET(request: Request) {
    try {
        const auth = verifyAuth(request);
        if (auth.error) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const course = await prisma.course.findMany();
        return NextResponse.json({ data: course }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}