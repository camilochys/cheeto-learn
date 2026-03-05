// --- IMPORT BCRYPT AND JSON WEB TOKEN ---
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

// --- SAVES THE JWT AS STRING FOR TYPESCRIPT TO UNDERSTAND ---
const JWT_SECRET = process.env.JWT_SECRET as string;

// --- PROMISE TO CONVERT TEXT PASSWORD TO HASH WITH 12 TRIES/BOUNCES/"SALT ROUNDS" OF HASH ---
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// --- PROMISE TO COMPARE STRING WITH SAVED HASH ---
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- FUNCTION TO GENERATE A TOKEN WITH SECRET ID, EMAIL AND ROLE THAT EXPIRES IN 7 DAYS ---
export function generateToken(payload: {
  id: string;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// --- FUNCTION TO VERIFY IF SAVED TOKEN IS ACTUALLY SECRET JWT ---
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}