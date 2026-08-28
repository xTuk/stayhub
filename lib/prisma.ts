import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient instance across hot reloads in development so
// we don't exhaust the Postgres connection pool. In production (serverless)
// each cold start gets its own instance, which is the expected behavior.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
