import { PrismaClient } from "@prisma/client";

const CONNECTION_ERROR_CODES = new Set(["P1001", "P1002", "P1008", "P1017"]);

export function isPrismaConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as { code?: string; name?: string; message?: string };
  if (err.code && CONNECTION_ERROR_CODES.has(err.code)) return true;
  if (err.name === "PrismaClientInitializationError") return true;

  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("can't reach database server") ||
    msg.includes("connection timed out") ||
    msg.includes("connection terminated") ||
    msg.includes("server has closed the connection") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused")
  );
}

/**
 * Picks the best database URL for long-running Node servers.
 * Session pooler (5432) / direct connections are more stable than
 * transaction pooler (6543) for Express. Transaction pooler is for serverless.
 */
export function buildDatabaseUrl(): string {
  const explicit = process.env.PRISMA_DATABASE_URL;
  const transactionUrl = process.env.DATABASE_URL;
  const sessionUrl = process.env.DIRECT_URL;
  const isDev = process.env.NODE_ENV !== "production";

  let raw = explicit || transactionUrl;
  if (!raw) {
    throw new Error("DATABASE_URL is required");
  }

  // Prefer session pooler in development — avoids stale transaction-pool connections.
  if (!explicit && isDev && sessionUrl) {
    raw = sessionUrl;
  }

  const url = new URL(raw);

  if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true");
  }

  const defaults: Record<string, string> = {
    connect_timeout: "30",
    pool_timeout: "30",
    connection_limit: isDev ? "3" : "5",
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

let reconnectPromise: Promise<void> | null = null;

async function reconnectPrisma(client: PrismaClient): Promise<void> {
  if (!reconnectPromise) {
    reconnectPromise = (async () => {
      try {
        await client.$disconnect();
      } catch {
        // ignore disconnect errors on a dead connection
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await client.$connect();
    })().finally(() => {
      reconnectPromise = null;
    });
  }
  await reconnectPromise;
}

function createPrismaClient() {
  const baseClient = new PrismaClient({
    datasources: {
      db: { url: buildDatabaseUrl() },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const maxAttempts = 3;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              if (!isPrismaConnectionError(error) || attempt === maxAttempts) {
                throw error;
              }

              const delayMs = attempt * 1000;
              console.warn(
                `[Prisma] Database connection lost (attempt ${attempt}/${maxAttempts}). Reconnecting in ${delayMs}ms...`,
              );
              await reconnectPrisma(baseClient);
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          throw new Error("Prisma query failed after retries");
        },
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function ensureDatabaseConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    if (!isPrismaConnectionError(error)) throw error;
    await reconnectPrisma(prisma as unknown as PrismaClient);
    await prisma.$queryRaw`SELECT 1`;
  }
}

export default prisma;
