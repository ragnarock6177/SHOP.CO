import { prisma } from "./database.js";

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (error) {
    console.error("Failed to connect to database via Prisma:", error);
    process.exit(1);
  }
};

export { prisma };
export default prisma;
