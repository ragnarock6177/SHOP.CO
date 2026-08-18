import { z } from "zod";

export const ProductFilterQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    collection: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "basePrice", "name", "sortOrder"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const SlugParamSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});
