import { orderRepository } from '../repositories/order.repository.js';

export class OrderService {
  async placeOrder(payload: {
    items: any[];
    shippingAddress: string;
    paymentMethod: string;
    total: number;
    userId?: string;
  }) {
    const orderRef = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNum = `TRK${Math.floor(10000000 + Math.random() * 90000000)}`;

    return orderRepository.create({
      orderRef,
      trackingNum,
      total: payload.total,
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
      userId: payload.userId,
      items: payload.items,
    });
  }

  async getUserOrders(userId?: string) {
    return orderRepository.findAll(userId);
  }
}

export const orderService = new OrderService();
