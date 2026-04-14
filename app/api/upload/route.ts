import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    // --- EXTRACT LESSONID FROM FORMDATA TO LINK THE FILE ---
    const lessonId = formData.get("lessonId") as string;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: "No lessonId provided" }, { status: 400 });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // --- UPLOAD TO SUPABASE STORAGE BUCKET ---
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(fileName, file);

    if (error) throw error;

    // --- GET THE PUBLIC URL ---
    const { data: { publicUrl } } = supabase.storage
      .from('course-content')
      .getPublicUrl(fileName);

    // --- CREATE RECORD IN DATABASE USING PRISMA ---
    const newFile = await prisma.file.create({
      data: {
        name: file.name,
        url: publicUrl,
        path: fileName, // --- STORE THE PATH TO DELETE IT FROM STORAGE LATER ---
        lessonId: lessonId
      }
    });

    // --- RETURN THE COMPLETE FILE OBJECT ---
    return NextResponse.json({ 
      url: newFile.url, 
      id: newFile.id, 
      name: newFile.name 
    });

  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}