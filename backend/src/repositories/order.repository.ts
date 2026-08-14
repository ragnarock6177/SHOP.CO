import { prisma } from "../config/db.js";

export class OrderRepository {
  async create(data: {
    orderRef: string;
    trackingNum: string;
    total: number;
    shippingAddress: string;
    paymentMethod: string;
    userId?: string;
    items: {
      productId?: string;
      title: string;
      price: number;
      quantity: number;
      color?: string;
      size?: string;
      image: string;
    }[];
  }) {
    return prisma.order.create({
      data: {
        orderRef: data.orderRef,
        trackingNum: data.trackingNum,
        total: data.total,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        userId: data.userId,
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async findAll(userId?: string) {
    return prisma.order.findMany({
      where: userId ? { userId } : undefined,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const orderRepository = new OrderRepository();
