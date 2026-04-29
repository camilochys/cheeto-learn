import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// --- WE USE process.env.RESEND_API_KEY so its not exposed ---
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'camilochzzb@gmail.com',
      subject: `Nuevo mensaje: ${subject}`,
      html: `
        <h1>Has recibido un nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email del remitente:</strong> ${email}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}