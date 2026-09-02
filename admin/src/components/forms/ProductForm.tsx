"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { ProductFormSchema, ProductFormInput, ProductVariantInput } from "@/validators/product.validator";
import { FormField } from "./FormField";
import { CustomSelect } from "@/components/ui/select";
import { VariantBuilder } from "./VariantBuilder";

import { ImageUploader, StagedImageItem } from "./ImageUploader";

export interface ProductFormProps {
  productId?: string;
  initialValues?: Partial<ProductFormInput>;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
  stagedImages?: StagedImageItem[];
  onStagedImagesChange?: (images: StagedImageItem[]) => void;
  onSubmit: (data: ProductFormInput) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  initialValues,
  isLoading = false,
  categories = [],
  stagedImages = [],
  onStagedImagesChange,
  onSubmit,
  onCancel,
}) => {
  const [seoOpen, setSeoOpen] = useState(false);
  const [variants, setVariants] = useState<ProductVariantInput[]>(initialValues?.variants || []);


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
      shortDescription: initialValues?.shortDescription || "",
      description: initialValues?.description || "",
      careInstructions: initialValues?.careInstructions || "",
      productType: initialValues?.productType || "",
      basePrice: initialValues?.basePrice || 0,
      comparePrice: initialValues?.comparePrice || undefined,
      stockQuantity: (initialValues as any)?.totalStockOnHand ?? (initialValues as any)?.stockQuantity ?? 0,
      reorderLevel: (initialValues as any)?.reorderLevel ?? 5,
      primaryCategoryId: initialValues?.primaryCategoryId || (categories[0]?.id || ""),
      status: initialValues?.status || "DRAFT",
      visibility: initialValues?.visibility || "PUBLIC",
      metaTitle: initialValues?.metaTitle || "",
      metaDescription: initialValues?.metaDescription || "",
    },
  });

  const nameVal = watch("name");
  const currentCategory = watch("primaryCategoryId");

  useEffect(() => {
    if (!currentCategory && categories.length > 0) {
      setValue("primaryCategoryId", categories[0].id, { shouldValidate: true });
    }
  }, [categories, currentCategory, setValue]);

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
    <form
      onSubmit={handleSubmit((formData) => {
        onSubmit({
          ...formData,
          variants,
        });
      })}
      className="space-y-5"
    >

      {/* ── Core Identity ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Product Name" required error={errors.name?.message}>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g. Vintage Leather Jacket"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>

        <FormField label="URL Slug" required error={errors.slug?.message}>
          <input
            type="text"
            {...register("slug")}
            placeholder="vintage-leather-jacket"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>
      </div>

      {/* ── Pricing & Dynamic Inventory Stock ────────────────── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <FormField label="Base Price (₹)" required error={errors.basePrice?.message}>
          <input
            type="number"
            step="0.01"
            {...register("basePrice", {
              setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? 0 : Number(v)),
            })}
            placeholder="2999.00"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>

        <FormField label="Compare-at Price (₹)" error={errors.comparePrice?.message}>
          <input
            type="number"
            step="0.01"
            {...register("comparePrice", {
              setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? undefined : Number(v)),
            })}
            placeholder="3999.00"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>

        <FormField label="Stock Quantity (Units)" required error={errors.stockQuantity?.message}>
          <input
            type="number"
            step="1"
            {...register("stockQuantity", {
              setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? 0 : Number(v)),
            })}
            placeholder="50"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-emerald-700 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>

        <FormField label="Reorder Level Alert" error={errors.reorderLevel?.message}>
          <input
            type="number"
            step="1"
            {...register("reorderLevel", {
              setValueAs: (v) => (v === "" || v === null || isNaN(Number(v)) ? 5 : Number(v)),
            })}
            placeholder="5"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>
      </div>

      {/* ── Category & Classification ────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Primary Category" required error={errors.primaryCategoryId?.message}>
          <CustomSelect
            value={watch("primaryCategoryId") || ""}
            onChange={(val) => setValue("primaryCategoryId", val, { shouldValidate: true })}
            placeholder="Select Category"
            options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
            className="w-full"
            triggerClassName="w-full h-10 px-3.5"
          />
        </FormField>

        <FormField label="Product Type" error={errors.productType?.message}>
          <input
            type="text"
            {...register("productType")}
            placeholder="e.g. T-Shirt, Jeans, Dress"
            className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
          />
        </FormField>
      </div>

      {/* ── Status & Visibility ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Status" required error={errors.status?.message}>
          <CustomSelect
            value={watch("status") || "DRAFT"}
            onChange={(val) => setValue("status", val as any, { shouldValidate: true })}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "OUT_OF_STOCK", label: "Out of Stock" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
            className="w-full"
            triggerClassName="w-full h-10 px-3.5"
          />
        </FormField>

        <FormField label="Visibility" required error={errors.visibility?.message}>
          <CustomSelect
            value={watch("visibility") || "PUBLIC"}
            onChange={(val) => setValue("visibility", val as any, { shouldValidate: true })}
            options={[
              { value: "PUBLIC", label: "Public" },
              { value: "PRIVATE", label: "Private" },
              { value: "HIDDEN", label: "Hidden" },
            ]}
            className="w-full"
            triggerClassName="w-full h-10 px-3.5"
          />
        </FormField>
      </div>

      {/* ── Descriptions ────────────────────────────────────── */}
      <FormField label="Short Description" error={errors.shortDescription?.message}>
        <input
          type="text"
          {...register("shortDescription")}
          placeholder="One-line product summary shown in listings"
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        />
      </FormField>

      <FormField label="Detailed Description" error={errors.description?.message}>
        <textarea
          rows={4}
          {...register("description")}
          placeholder="Product details, material composition, and sizing advice..."
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        />
      </FormField>

      <FormField label="Care Instructions" error={errors.careInstructions?.message}>
        <textarea
          rows={2}
          {...register("careInstructions")}
          placeholder="e.g. Machine wash cold, tumble dry low, do not bleach"
          className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
        />
      </FormField>

      {/* ── SEO (collapsible) ────────────────────────────────── */}
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setSeoOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            SEO & Meta
          </div>
          {seoOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {seoOpen && (
          <div className="px-4 pb-4 pt-3 space-y-4 bg-white border-t border-slate-100">
            <FormField label="Meta Title" error={errors.metaTitle?.message}>
              <input
                type="text"
                {...register("metaTitle")}
                placeholder="SEO page title (defaults to product name)"
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </FormField>

            <FormField label="Meta Description" error={errors.metaDescription?.message}>
              <textarea
                rows={2}
                {...register("metaDescription")}
                placeholder="SEO description shown in search results (120–160 chars)"
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* ── Dynamic Product Variants (Color & Size Matrix) ──── */}
      <VariantBuilder
        productId={productId}
        productName={watch("name")}
        basePrice={watch("basePrice")}
        variants={variants}
        onChange={setVariants}
        stagedImages={stagedImages}
        onStagedImagesChange={onStagedImagesChange}
      />

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Saving Product..." : "Save Product"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
