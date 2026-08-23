import prisma from "../lib/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export class SectionsService {
  /**
   * List all homepage sections sorted by displayOrder.
   */
  static async getAllSections() {
    return prisma.homepageSection.findMany({
      orderBy: { displayOrder: "asc" },
    });
  }

  /**
   * Create a new homepage section.
   */
  static async createSection(data: {
    sectionKey: string;
    sectionType: string;
    title?: string | null;
    subtitle?: string | null;
    displayOrder?: number;
    isEnabled?: boolean;
    config?: Record<string, any>;
  }) {
    return prisma.homepageSection.create({
      data: {
        sectionKey: data.sectionKey,
        sectionType: data.sectionType,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        displayOrder: data.displayOrder ?? 0,
        isEnabled: data.isEnabled ?? true,
        config: data.config || {},
      },
    });
  }

  /**
   * Update an existing homepage section.
   */
  static async updateSection(
    id: string,
    data: {
      title?: string | null;
      subtitle?: string | null;
      displayOrder?: number;
      isEnabled?: boolean;
      config?: Record<string, any>;
    }
  ) {
    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Homepage section with ID '${id}' not found`);
    }

    return prisma.homepageSection.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
        ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
        ...(data.config !== undefined ? { config: data.config } : {}),
      },
    });
  }

  /**
   * Bulk reorder and update status for homepage sections in a transaction.
   */
  static async bulkReorderSections(
    sections: Array<{ id: string; displayOrder: number; isEnabled?: boolean }>
  ) {
    return prisma.$transaction(
      sections.map((sec) =>
        prisma.homepageSection.update({
          where: { id: sec.id },
          data: {
            displayOrder: sec.displayOrder,
            ...(sec.isEnabled !== undefined ? { isEnabled: sec.isEnabled } : {}),
          },
        })
      )
    );
  }

  /**
   * Delete a homepage section by ID.
   */
  static async deleteSection(id: string) {
    const existing = await prisma.homepageSection.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Homepage section with ID '${id}' not found`);
    }

    return prisma.homepageSection.delete({ where: { id } });
  }
}
