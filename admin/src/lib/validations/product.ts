import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be greater than zero'),
  compareAtPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  status: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'ARCHIVED']),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  images: z.array(z.string().url('Must be a valid image URL')).min(1, 'At least one image is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;
