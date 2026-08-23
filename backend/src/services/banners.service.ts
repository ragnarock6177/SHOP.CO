import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";
import { BannerTargetType } from "@prisma/client";

export class BannersService {
  /**
   * List all banners sorted by displayOrder.
   */
  static async getAllBanners() {
    return prisma.banner.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        targetProduct: { select: { id: true, name: true, slug: true } },
        targetCategory: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Create a new promotional banner.
   */
  static async createBanner(data: {
    title?: string | null;
    subtitle?: string | null;
    desktopImageUrl: string;
    mobileImageUrl?: string | null;
    buttonText?: string | null;
    buttonUrl?: string | null;
    targetType?: BannerTargetType;
    targetProductId?: string | null;
    targetCategoryId?: string | null;
    displayOrder?: number;
    isEnabled?: boolean;
    startsAt?: string | Date | null;
    endsAt?: string | Date | null;
  }) {
    return prisma.banner.create({
      data: {
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        desktopImageUrl: data.desktopImageUrl,
        mobileImageUrl: data.mobileImageUrl ?? null,
        buttonText: data.buttonText ?? null,
        buttonUrl: data.buttonUrl ?? null,
        targetType: data.targetType ?? BannerTargetType.NONE,
        targetProductId: data.targetProductId ?? null,
        targetCategoryId: data.targetCategoryId ?? null,
        displayOrder: data.displayOrder ?? 0,
        isEnabled: data.isEnabled ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
      include: {
        targetProduct: { select: { id: true, name: true, slug: true } },
        targetCategory: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Update an existing banner.
   */
  static async updateBanner(
    id: string,
    data: {
      title?: string | null;
      subtitle?: string | null;
      desktopImageUrl?: string;
      mobileImageUrl?: string | null;
      buttonText?: string | null;
      buttonUrl?: string | null;
      targetType?: BannerTargetType;
      targetProductId?: string | null;
      targetCategoryId?: string | null;
      displayOrder?: number;
      isEnabled?: boolean;
      startsAt?: string | Date | null;
      endsAt?: string | Date | null;
    }
  ) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Banner with ID '${id}' not found`);
    }

    return prisma.banner.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
        ...(data.desktopImageUrl !== undefined ? { desktopImageUrl: data.desktopImageUrl } : {}),
        ...(data.mobileImageUrl !== undefined ? { mobileImageUrl: data.mobileImageUrl } : {}),
        ...(data.buttonText !== undefined ? { buttonText: data.buttonText } : {}),
        ...(data.buttonUrl !== undefined ? { buttonUrl: data.buttonUrl } : {}),
        ...(data.targetType !== undefined ? { targetType: data.targetType } : {}),
        ...(data.targetProductId !== undefined ? { targetProductId: data.targetProductId } : {}),
        ...(data.targetCategoryId !== undefined ? { targetCategoryId: data.targetCategoryId } : {}),
        ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
        ...(data.startsAt !== undefined ? { startsAt: data.startsAt ? new Date(data.startsAt) : null } : {}),
        ...(data.endsAt !== undefined ? { endsAt: data.endsAt ? new Date(data.endsAt) : null } : {}),
      },
      include: {
        targetProduct: { select: { id: true, name: true, slug: true } },
        targetCategory: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Delete a banner by ID.
   */
  static async deleteBanner(id: string) {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Banner with ID '${id}' not found`);
    }

    return prisma.banner.delete({ where: { id } });
  }
}
