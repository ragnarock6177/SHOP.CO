import prisma from "../../lib/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

export class AdminAttributesService {
  static async getAttributes() {
    return prisma.attribute.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        values: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  static async createAttribute(data: {
    name: string;
    slug: string;
    description?: string;
    isVariantAttribute?: boolean;
    isFilterable?: boolean;
    isVisible?: boolean;
    sortOrder?: number;
  }) {
    const existing = await prisma.attribute.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new ConflictError("An attribute with this slug already exists");
    }

    return prisma.attribute.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        isVariantAttribute: data.isVariantAttribute ?? false,
        isFilterable: data.isFilterable ?? true,
        isVisible: data.isVisible ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        values: true,
      },
    });
  }

  static async addAttributeValue(
    attributeId: string,
    data: {
      value: string;
      slug: string;
      colorHex?: string;
      imageUrl?: string;
      sortOrder?: number;
    }
  ) {
    const attribute = await prisma.attribute.findUnique({ where: { id: attributeId } });
    if (!attribute) {
      throw new NotFoundError("Attribute not found");
    }

    return prisma.attributeValue.create({
      data: {
        attributeId,
        value: data.value,
        slug: data.slug,
        colorHex: data.colorHex,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }
}
