import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { NotFoundError } from "../../utils/errors.js";

export class AdminReviewsService {
  static async getReviews(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "rating", "isPublished", "isVerifiedPurchase"],
      "createdAt"
    );

    const where: any = {};

    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished === "true" || query.isPublished === true;
    }

    if (query.rating) {
      where.rating = parseInt(query.rating, 10);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { body: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          product: {
            select: { id: true, name: true, slug: true },
          },
          variant: {
            select: { id: true, sku: true, variantName: true },
          },
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
      prisma.productReview.count({ where }),
    ]);

    return { reviews, total, page, limit };
  }

  static async toggleReviewPublish(id: string, isPublished: boolean) {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundError("Product review not found");

    return prisma.productReview.update({
      where: { id },
      data: { isPublished },
      include: {
        product: { select: { name: true } },
      },
    });
  }

  static async deleteReview(id: string) {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundError("Product review not found");

    await prisma.productReview.delete({ where: { id } });
    return { id, message: "Review deleted successfully" };
  }
}
