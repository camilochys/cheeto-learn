import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

// --- FUNCTION TO REQUEST NAME, EMAIL AND PASSWORD FROM POST ---
export async function POST(request: Request) {
    // --- TRY CATCH IF INTERNAL ERROR ---
      try {
  const body = await request.json();
  const {name,email,password} = body;
  // --- VERIFY EMAIL IS NOT ALREADY REGISTERED ---
  const existingUser = await prisma.user.findUnique({ where: { email } });
  /// --- ERROR CODE IF EXISTING USER ---
  if (existingUser) {
  return NextResponse.json(
    { error: "Error: Este correo electrónico ya está registrado." },
    { status: 409 }
  );
}
// --- FINALLY... HASH PASSWORD AND CREATE USER ---
const hashedPassword = await hashPassword(password)
const user = await prisma.user.create({
  data: { name,email, password: hashedPassword }
});

// --- GENERATE TOKEN FOR ID, EMAIL AND ROLE AND SHOW EMAIL AND TOKEN ---
const token = generateToken({ id: user.id, email: user.email, role: user.role });
return NextResponse.json({ data: {email,token} }, { status: 201 });
// --- END OF TRYCATCH ---
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Error: Fallo interno del servidor." },
      { status: 500 }
    );
  }
}