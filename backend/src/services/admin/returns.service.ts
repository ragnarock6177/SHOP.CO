import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { ReturnStatus, RefundStatus } from "@prisma/client";
import { NotFoundError } from "../../utils/errors.js";

export class AdminReturnsService {
  static async getReturns(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "status"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(ReturnStatus).includes(query.status as ReturnStatus)) {
      where.status = query.status as ReturnStatus;
    }

    if (search) {
      where.OR = [
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [returns, total] = await Promise.all([
      prisma.return.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: { select: { id: true, orderNumber: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: {
            include: {
              orderItem: { select: { sku: true, productName: true } },
            },
          },
        },
      }),
      prisma.return.count({ where }),
    ]);

    return { returns, total, page, limit };
  }

  static async getReturnDetails(id: string) {
    const returnReq = await prisma.return.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, orderNumber: true, totalAmount: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: {
          include: {
            orderItem: { select: { sku: true, productName: true, unitPrice: true } },
          },
        },
        refunds: true,
      },
    });

    if (!returnReq) throw new NotFoundError("Return request not found");

    return {
      ...returnReq,
      order: {
        ...returnReq.order,
        totalAmount: returnReq.order.totalAmount.toNumber(),
      },
    };
  }

  static async updateReturnStatus(id: string, status: ReturnStatus, notes?: string) {
    const returnReq = await prisma.return.findUnique({ where: { id } });
    if (!returnReq) throw new NotFoundError("Return request not found");

    return prisma.return.update({
      where: { id },
      data: {
        status,
        adminNote: notes ? (returnReq.adminNote ? `${returnReq.adminNote}\n${notes}` : notes) : undefined,
      },
    });
  }

  static async getRefunds(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "amount", "status"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(RefundStatus).includes(query.status as RefundStatus)) {
      where.status = query.status as RefundStatus;
    }

    if (search) {
      where.OR = [
        { providerRefundId: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: { select: { id: true, orderNumber: true, customerEmail: true } },
          payment: { select: { provider: true, providerPaymentId: true } },
        },
      }),
      prisma.refund.count({ where }),
    ]);

    const formatted = refunds.map((rf) => ({
      ...rf,
      amount: rf.amount.toNumber(),
    }));

    return { refunds: formatted, total, page, limit };
  }

  static async processRefund(data: {
    orderId: string;
    returnId?: string;
    paymentId?: string;
    amount: number;
    reason: string;
  }) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundError("Order not found");

    const providerRefundId = `RFD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          providerRefundId,
          orderId: data.orderId,
          returnId: data.returnId,
          paymentId: data.paymentId,
          amount: data.amount,
          reason: data.reason,
          status: RefundStatus.COMPLETED,
          processedAt: new Date(),
        },
      });

      // Update order status if full refund
      if (Number(order.totalAmount) <= data.amount) {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: "REFUNDED" },
        });
      } else {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: "PARTIALLY_REFUNDED" },
        });
      }

      return refund;
    });
  }
}
