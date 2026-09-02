import { z } from "zod";

export const BulkImportOptionsSchema = z.object({
  body: z.object({
    autoCreateCategories: z
      .union([z.boolean(), z.string().transform((v) => v === "true" || v === "1")])
      .default(true),
    importMode: z
      .enum(["INSERT_ONLY", "UPSERT"])
      .default("UPSERT"),
    skipInvalidRows: z
      .union([z.boolean(), z.string().transform((v) => v === "true" || v === "1")])
      .default(false),
  }),
});

export type BulkImportOptions = z.infer<typeof BulkImportOptionsSchema>["body"];
