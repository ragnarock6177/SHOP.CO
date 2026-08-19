import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { UserStatus } from "@prisma/client";
import { NotFoundError } from "../../utils/errors.js";

export class AdminCustomersService {
  static async getCustomers(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "email", "firstName", "lastName", "status", "lastLoginAt"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(UserStatus).includes(query.status as UserStatus)) {
      where.status = query.status as UserStatus;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          profileImage: true,
          status: true,
          emailVerifiedAt: true,
          phoneVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { orders: true, addresses: true, productReviews: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { customers, total, page, limit };
  }

  static async getCustomerDetails(id: string) {
    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        status: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundError("Customer profile not found");
    }

    const ltvAggregate = await prisma.order.aggregate({
      where: {
        userId: id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    return {
      ...customer,
      lifetimeValue: Number(ltvAggregate._sum.totalAmount || 0),
      totalCompletedOrders: ltvAggregate._count.id,
    };
  }

  static async getCustomerOrders(userId: string, query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "totalAmount", "status"],
      "createdAt"
    );

    const where = { userId };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit };
  }

  static async updateCustomerStatus(id: string, status: UserStatus) {
    const customer = await prisma.user.findUnique({ where: { id } });
    if (!customer) throw new NotFoundError("Customer not found");

    return prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        status: true,
        updatedAt: true,
      },
    });
  }
}
