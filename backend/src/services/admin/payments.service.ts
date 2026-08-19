import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { PaymentStatus } from "@prisma/client";
import { NotFoundError } from "../../utils/errors.js";

export class AdminPaymentsService {
  static async getPayments(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "amount", "status", "provider"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(PaymentStatus).includes(query.status as PaymentStatus)) {
      where.status = query.status as PaymentStatus;
    }

    if (query.provider) {
      where.provider = query.provider;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { provider: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: {
            select: { id: true, orderNumber: true, customerEmail: true },
          },
          transactions: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    const formatted = payments.map((p) => ({
      ...p,
      amount: p.amount.toNumber(),
    }));

    return { payments: formatted, total, page, limit };
  }

  static async getPaymentDetails(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          select: { id: true, orderNumber: true, totalAmount: true, customerEmail: true },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!payment) throw new NotFoundError("Payment record not found");

    return {
      ...payment,
      amount: payment.amount.toNumber(),
      order: {
        ...payment.order,
        totalAmount: payment.order.totalAmount.toNumber(),
      },
    };
  }

  static async getInvoices(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "invoiceNumber", "totalAmount"],
      "createdAt"
    );

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order: {
            select: { id: true, orderNumber: true, customerEmail: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    const formatted = invoices.map((i) => ({
      ...i,
      totalAmount: i.totalAmount.toNumber(),
    }));

    return { invoices: formatted, total, page, limit };
  }
}
