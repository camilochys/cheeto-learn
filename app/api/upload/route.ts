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
    const lessonId = formData.get("lessonId") as string | null;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('course-content')
      .getPublicUrl(fileName);

    if (lessonId) {
      const newFile = await prisma.file.create({
        data: {
          name: file.name,
          url: publicUrl,
          path: fileName,
          lessonId: lessonId
        }
      });

      return NextResponse.json({ 
        url: newFile.url, 
        id: newFile.id, 
        path: fileName,
        name: newFile.name 
      });
    }

    return NextResponse.json({ 
      url: publicUrl, 
      path: fileName,
      id: null, 
      name: file.name 
    });

  } catch (error: any) {
    console.error("UPLOAD_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}