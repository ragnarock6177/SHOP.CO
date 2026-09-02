import dotenv from "dotenv";
import app from "./app.js";
import { connectDB, stopDbKeepAlive } from "./config/db.js";
import prisma from "./lib/prisma.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Express API Server immediately so port 5000 is always open
const server = app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 AIRAVÉ Node.js API Server`);
  console.log(`📡 Listening on Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=================================`);
});

// Asynchronously connect database with retries
connectDB();

async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  stopDbKeepAlive();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

// Handle unhandled rejections without crashing server
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection Error:", err);
});
