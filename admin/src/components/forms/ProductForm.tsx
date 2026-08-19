"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormSchema, ProductFormInput } from "@/validators/product.validator";
import { FormField } from "./FormField";

export interface ProductFormProps {
  initialValues?: Partial<ProductFormInput>;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
  onSubmit: (data: ProductFormInput) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialValues,
  isLoading = false,
  categories = [],
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      slug: initialValues?.slug || "",
      description: initialValues?.description || "",
      careInstructions: initialValues?.careInstructions || "",
      basePrice: initialValues?.basePrice || 0,
      comparePrice: initialValues?.comparePrice || undefined,
      primaryCategoryId: initialValues?.primaryCategoryId || (categories[0]?.id || ""),
      status: initialValues?.status || "DRAFT",
      visibility: initialValues?.visibility || "PUBLIC",
    },
  });

  const nameVal = watch("name");

  useEffect(() => {
    if (!initialValues?.slug && nameVal) {
      const generatedSlug = nameVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generatedSlug);
    }
  }, [nameVal, setValue, initialValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Product Name" required error={errors.name?.message}>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g. Vintage Leather Jacket"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </FormField>

        <FormField label="URL Slug" required error={errors.slug?.message}>
          <input
            type="text"
            {...register("slug")}
            placeholder="vintage-leather-jacket"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Base Price (₹)" required error={errors.basePrice?.message}>
          <input
            type="number"
            step="0.01"
            {...register("basePrice", { valueAsNumber: true })}
            placeholder="2999.00"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </FormField>

        <FormField label="Compare-at Price (₹)" error={errors.comparePrice?.message}>
          <input
            type="number"
            step="0.01"
            {...register("comparePrice", { valueAsNumber: true })}
            placeholder="3999.00"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
        </FormField>
      </div>

      <FormField label="Primary Category" required error={errors.primaryCategoryId?.message}>
        <select
          {...register("primaryCategoryId")}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" required error={errors.status?.message}>
          <select
            {...register("status")}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </FormField>

        <FormField label="Visibility" required error={errors.visibility?.message}>
          <select
            {...register("visibility")}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </FormField>
      </div>

      <FormField label="Detailed Description" error={errors.description?.message}>
        <textarea
          rows={4}
          {...register("description")}
          placeholder="Product details, material composition, and sizing advice..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </FormField>

      <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {isLoading ? "Saving Product..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
