import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";

// --- LOGIN ENDPOINT - VERIFIES CREDENTIALS AND RETURNS JWT ---
export async function POST(request: Request) {
    // --- TRY CATCH IF INTERNAL ERROR ---
  try {
    const body = await request.json();
    const {email,password} = body;

// --- VERIFY EMAIL IS NOT ALREADY REGISTERED ---
const existingUser = await prisma.user.findUnique({ where: { email } });

const verifiedPassword = existingUser 
  ? await verifyPassword(password, existingUser.password)
  : false;
  
// --- UNIFICATION OF LOGIN ERRORS, TO PREVENT BRUTE FORCE BREAK ---
if (!existingUser || !verifiedPassword) {
  return NextResponse.json(
    { error: "Credenciales incorrectas." },
    { status: 401 }
  );
}

// --- GENERATE TOKEN FOR ID, EMAIL AND ROLE AND SHOW EMAIL AND TOKEN ---
const token = generateToken({ id: existingUser.id, email: existingUser.email, role: existingUser.role });
return NextResponse.json({ 
  data: { 
    email, 
    token,
    role: existingUser.role 
  } 
}, { status: 200 });
// --- END OF TRYCATCH ---
  } catch (error) {
    return NextResponse.json(
      { error: "Error: Fallo interno del servidor." },
      { status: 500 }
    );
  }
}