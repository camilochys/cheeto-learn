import { verifyAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    // --- UNWRAP PARAMS ---
    const { fileId } = await params;

    // --- VALIDATE AUTH ---
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // --- FIND FILE RECORD TO GET THE STORAGE PATH ---
    const fileRecord = await prisma.file.findUnique({
      where: { id: fileId }
    }) as { id: string; name: string; url: string; path: string } | null;

    if (!fileRecord) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
    }

    // --- DELETE FROM SUPABASE STORAGE BUCKET ---
    const { error: storageError } = await supabase.storage
      .from('course-content')
      .remove([fileRecord.path]); // --- USES THE STORED FILENAME/PATH ---

    if (storageError) {
      console.error("STORAGE ERROR:", storageError);
      return NextResponse.json({ error: "Error al borrar del storage" }, { status: 500 });
    }

    // --- DELETE FROM DATABASE ---
    await prisma.file.delete({
      where: { id: fileId }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("DELETE_FILE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}