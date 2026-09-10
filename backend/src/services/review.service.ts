import prisma from "../lib/prisma.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";

function formatCustomerName(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email.split("@")[0] || "Customer";
}

function formatPublicReview(review: {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: { firstName: string | null; lastName: string | null; email: string };
}) {
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    comment: review.body,
    isVerifiedPurchase: review.isVerifiedPurchase,
    verified: review.isVerifiedPurchase,
    createdAt: review.createdAt.toISOString(),
    customerName: formatCustomerName(review.user),
    userName: formatCustomerName(review.user),
  };
}

export class ReviewService {
  static async getReviewStats(productId: string) {
    const aggregate = await prisma.productReview.aggregate({
      where: {
        productId,
        isPublished: true,
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    const avg = aggregate._avg.rating ?? 0;
    return {
      rating: Math.round(avg * 10) / 10,
      reviewsCount: aggregate._count._all,
    };
  }

  static async getReviewStatsMap(productIds: string[]) {
    if (!productIds.length) return new Map<string, { rating: number; reviewsCount: number }>();

    const grouped = await prisma.productReview.groupBy({
      by: ["productId"],
      where: {
        productId: { in: productIds },
        isPublished: true,
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return new Map(
      grouped.map((row) => [
        row.productId,
        {
          rating: Math.round((row._avg.rating ?? 0) * 10) / 10,
          reviewsCount: row._count._all,
        },
      ]),
    );
  }

  static async getPublishedReviewsForProduct(
    productId: string,
    pageInput?: string,
    limitInput?: string,
    viewerUserId?: string,
  ) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "ACTIVE",
        visibility: "PUBLIC",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const { page, limit, skip } = parsePaginationParams(pageInput, limitInput, 10, 50);

    const where = {
      productId,
      deletedAt: null,
      OR: [
        { isPublished: true },
        ...(viewerUserId ? [{ userId: viewerUserId }] : []),
      ],
    };

    const [reviews, total, summary] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.productReview.count({ where }),
      ReviewService.getReviewStats(productId),
    ]);

    return {
      items: reviews.map(formatPublicReview),
      summary,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  static async submitProductReview(
    userId: string,
    payload: {
      productId: string;
      variantId?: string;
      orderItemId?: string;
      rating: number;
      title?: string;
      body: string;
    },
  ) {
    const product = await prisma.product.findFirst({
      where: {
        id: payload.productId,
        status: "ACTIVE",
        visibility: "PUBLIC",
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const existing = await prisma.productReview.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: payload.productId,
        },
      },
    });

    if (existing && !existing.deletedAt) {
      throw new ConflictError("You have already reviewed this product");
    }

    const verifiedOrderItem = await prisma.orderItem.findFirst({
      where: {
        variant: {
          productId: payload.productId,
          ...(payload.variantId ? { id: payload.variantId } : {}),
        },
        order: {
          userId,
          status: "DELIVERED",
        },
      },
      select: { id: true },
    });

    const review = await prisma.productReview.create({
      data: {
        productId: payload.productId,
        userId,
        variantId: payload.variantId,
        orderItemId: payload.orderItemId ?? verifiedOrderItem?.id,
        rating: payload.rating,
        title: payload.title,
        body: payload.body,
        isVerifiedPurchase: Boolean(verifiedOrderItem || payload.orderItemId),
        isPublished: true,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return {
      ...formatPublicReview(review),
      isPublished: review.isPublished,
      message: "Thank you! Your review has been published.",
    };
  }

  static async userHasReviewed(userId: string, productId: string): Promise<boolean> {
    const review = await prisma.productReview.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true, deletedAt: true },
    });
    return Boolean(review && !review.deletedAt);
  }
}
