import { PrismaClient } from "../../generated/prisma/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const isPostgreSql = Boolean(
  process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgres://") ||
      process.env.DATABASE_URL.startsWith("postgresql://"))
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Executes a database operation with exponential backoff retry
 * to mitigate SQLite busy write locks under concurrent courtside load.
 */
export async function executeWithBusyRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 50
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const isBusy =
        error?.code === "P2034" ||
        error?.message?.includes("SQLITE_BUSY") ||
        error?.message?.includes("database is locked");

      if (isBusy && attempt <= maxRetries) {
        const jitter = Math.floor(Math.random() * 50);
        const delay = initialDelayMs * Math.pow(2, attempt - 1) + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export default prisma;
