import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { DiscountType } from "@prisma/client";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

export class AdminCouponsService {
  static async getCoupons(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "code", "discountValue", "usedCount", "isActive"],
      "createdAt"
    );

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true" || query.isActive === true;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { usages: true } },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    const formatted = coupons.map((c) => ({
      ...c,
      discountValue: c.discountValue.toNumber(),
      minimumOrderAmount: c.minimumOrderAmount ? c.minimumOrderAmount.toNumber() : null,
      maximumDiscountAmount: c.maximumDiscountAmount ? c.maximumDiscountAmount.toNumber() : null,
    }));

    return { coupons: formatted, total, page, limit };
  }

  static async getCouponDetails(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        products: { include: { product: true } },
        usages: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            order: { select: { id: true, orderNumber: true } },
          },
        },
      },
    });

    if (!coupon) throw new NotFoundError("Coupon not found");

    return {
      ...coupon,
      discountValue: coupon.discountValue.toNumber(),
      minimumOrderAmount: coupon.minimumOrderAmount ? coupon.minimumOrderAmount.toNumber() : null,
      maximumDiscountAmount: coupon.maximumDiscountAmount ? coupon.maximumDiscountAmount.toNumber() : null,
    };
  }

  static async createCoupon(data: {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number;
    usageLimitPerUser?: number;
    startsAt?: Date;
    expiresAt?: Date;
    isActive?: boolean;
  }) {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) {
      throw new ConflictError("A coupon with this code already exists");
    }

    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maximumDiscountAmount: data.maximumDiscountAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser || 1,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateCoupon(
    id: string,
    data: {
      description?: string;
      discountType?: DiscountType;
      discountValue?: number;
      minimumOrderAmount?: number;
      maximumDiscountAmount?: number;
      usageLimit?: number;
      usageLimitPerUser?: number;
      startsAt?: Date;
      expiresAt?: Date;
      isActive?: boolean;
    }
  ) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundError("Coupon not found");

    return prisma.coupon.update({
      where: { id },
      data: {
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maximumDiscountAmount: data.maximumDiscountAmount,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        isActive: data.isActive,
      },
    });
  }

  static async toggleCouponStatus(id: string, isActive: boolean) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundError("Coupon not found");

    return prisma.coupon.update({
      where: { id },
      data: { isActive },
    });
  }
}
