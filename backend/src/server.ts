import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

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

// Handle unhandled rejections without crashing server
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Rejection Error:", err);
});
