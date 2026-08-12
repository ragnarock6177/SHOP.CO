import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 SHOP.CO Node.js API Server`);
    console.log(`📡 Listening on Port: ${PORT}`);
    console.log(`🐘 PostgreSQL & Prisma ORM Connected`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=================================`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection Error:', err);
    server.close(() => process.exit(1));
  });
});
