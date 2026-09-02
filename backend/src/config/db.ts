import { prisma, ensureDatabaseConnection, isPrismaConnectionError } from "../lib/prisma.js";

let keepAliveTimer: NodeJS.Timeout | null = null;

export const connectDB = async (retries = 12, delay = 3000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await ensureDatabaseConnection();
      console.log(
        "✅ Successfully connected to Supabase PostgreSQL database via Prisma.",
      );
      startDbKeepAlive();
      return;
    } catch (error: any) {
      const message = error?.message || String(error);
      console.warn(
        `[DB Connection Attempt ${attempt}/${retries}] Warning: ${message}`,
      );

      if (attempt < retries) {
        console.log(`Retrying database connection in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error(
          "⚠️ All initial database connection attempts failed. Server will keep retrying on requests and via keepalive.",
        );
        startDbKeepAlive();
      }
    }
  }
};

/** Prevents Supabase free-tier pause and refreshes stale pooler connections. */
export function startDbKeepAlive(intervalMs = 4 * 60 * 1000): void {
  if (keepAliveTimer) return;

  keepAliveTimer = setInterval(async () => {
    try {
      await ensureDatabaseConnection();
    } catch (error: any) {
      if (isPrismaConnectionError(error)) {
        console.warn(
          "[DB KeepAlive] Connection check failed:",
          error?.message || error,
        );
      }
    }
  }, intervalMs);

  keepAliveTimer.unref?.();
}

export function stopDbKeepAlive(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

export { prisma };
export default prisma;
