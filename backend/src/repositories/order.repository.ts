import prisma from "../lib/prisma.js";

export class OrderRepository {
  async findAll(userId?: string) {
    return prisma.order.findMany({
      where: userId ? { userId, deletedAt: null } : { deletedAt: null },
      include: {
        items: true,
        addresses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        addresses: true,
        payments: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
