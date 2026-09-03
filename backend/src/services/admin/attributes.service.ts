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

  static async getAttributeById(id: string) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: {
        values: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    if (!attribute) {
      throw new NotFoundError("Attribute not found");
    }
    return attribute;
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

  static async updateAttribute(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      isVariantAttribute?: boolean;
      isFilterable?: boolean;
      isVisible?: boolean;
      sortOrder?: number;
    }
  ) {
    const attribute = await prisma.attribute.findUnique({ where: { id } });
    if (!attribute) {
      throw new NotFoundError("Attribute not found");
    }

    if (data.slug && data.slug !== attribute.slug) {
      const existing = await prisma.attribute.findUnique({ where: { slug: data.slug } });
      if (existing) {
        throw new ConflictError("An attribute with this slug already exists");
      }
    }

    return prisma.attribute.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        isVariantAttribute: data.isVariantAttribute,
        isFilterable: data.isFilterable,
        isVisible: data.isVisible,
        sortOrder: data.sortOrder,
      },
      include: {
        values: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  static async deleteAttribute(id: string) {
    const attribute = await prisma.attribute.findUnique({ where: { id } });
    if (!attribute) {
      throw new NotFoundError("Attribute not found");
    }

    await prisma.attribute.delete({ where: { id } });
    return { success: true };
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
        colorHex: data.colorHex || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  static async updateAttributeValue(
    valueId: string,
    data: {
      value?: string;
      slug?: string;
      colorHex?: string | null;
      imageUrl?: string | null;
      sortOrder?: number;
    }
  ) {
    const value = await prisma.attributeValue.findUnique({ where: { id: valueId } });
    if (!value) {
      throw new NotFoundError("Attribute value not found");
    }

    return prisma.attributeValue.update({
      where: { id: valueId },
      data: {
        value: data.value,
        slug: data.slug,
        colorHex: data.colorHex,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
      },
    });
  }

  static async deleteAttributeValue(valueId: string) {
    const value = await prisma.attributeValue.findUnique({ where: { id: valueId } });
    if (!value) {
      throw new NotFoundError("Attribute value not found");
    }

    await prisma.attributeValue.delete({ where: { id: valueId } });
    return { success: true };
  }
}

