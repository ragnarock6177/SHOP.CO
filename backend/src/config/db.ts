import { prisma } from "./database.js";

export const connectDB = async (retries = 5, delay = 2000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log("✅ Successfully connected to Supabase PostgreSQL database via Prisma.");
      return;
    } catch (error: any) {
      console.warn(`[DB Connection Attempt ${attempt}/${retries}] Warning: Supabase pooler initial connection issue (${error.message || error}).`);
      if (attempt < retries) {
        console.log(`Retrying database connection in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("⚠️ All initial database connection attempts timed out. Express server will remain active and retry on incoming requests.");
      }
    }
  }
};

export { prisma };
export default prisma;
