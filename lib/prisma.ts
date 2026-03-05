// --- PRISMA CHECKING IF THERE IS ALREADY A GLOBALTHIS, IF YES, RECYCLE AND REUSE, IF NOT, CREATES AND SAVES ---
// --- PRISMA WITH PG DRIVER ADAPTER (PRISMA 7) ---
import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}