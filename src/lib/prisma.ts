// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Gunakan deklarasi global agar tidak membuat banyak instance Prisma di Next.js (Hot Reload)
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Simpan instance di globalThis (hanya di dev mode)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
