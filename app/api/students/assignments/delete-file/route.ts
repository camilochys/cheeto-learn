import { verifyAuth } from "@/lib/middleware";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (auth.error) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { path } = await req.json();
    if (!path) return NextResponse.json({ error: "No path provided" }, { status: 400 });

    // --- ERASE FROM BUCKET D: ---
    const { error } = await supabase.storage
      .from('course-content')
      .remove([path]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}