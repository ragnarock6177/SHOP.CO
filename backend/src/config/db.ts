import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('🐘 PostgreSQL Database Connected via Prisma ORM Pool');
  } catch (error) {
    console.error('❌ Database Connection Error:', error);
    process.exit(1);
  }
};
