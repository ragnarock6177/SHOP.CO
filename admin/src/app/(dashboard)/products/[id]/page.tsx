"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductDetails, useUpdateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { ImageUploader } from "../../../../components/forms/ImageUploader";
import { FormSkeleton } from "../../../../components/ui/FormSkeleton";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProductDetails(productId);
  const updateMutation = useUpdateProduct();

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories", "active"],
    queryFn: async () => {
      const res = await apiClient.get<ApiPaginatedResponse<{ id: string; name: string; status: string }>>(
        "/admin/categories?limit=100&status=ACTIVE"
      );
      return res.data;
    },
  });

  const categories = (categoriesData?.data || []).filter((c) => c.status === "ACTIVE");

  const handleUpdate = (formData: any) => {
    const { primaryCategoryId, comparePrice, ...rest } = formData;
    updateMutation.mutate(
      {
        id: productId,
        data: {
          ...rest,
          ...(primaryCategoryId ? { categoryId: primaryCategoryId } : {}),
          ...(comparePrice !== undefined ? { compareAtPrice: comparePrice } : {}),
        },
      },
      {
        onSuccess: () => {
          router.push("/products");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl animate-shimmer bg-slate-100" />
          <div className="h-3.5 w-64 rounded-md animate-shimmer bg-slate-100" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs">
        Product not found or failed to load product details.
      </div>
    );
  }

  // Derive primary category ID from productCategories array
  const primaryCatId =
    (product as any).productCategories?.find((pc: any) => pc.isPrimary)?.category?.id || "";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update attributes, pricing, images, and catalog status for{" "}
          <span className="font-semibold text-slate-700">{product.name}</span>
        </p>
      </div>

      {/* ── Product Details Form ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-5">Product Details</h2>
        <ProductForm
          initialValues={{
            name: product.name,
            slug: product.slug,
            shortDescription: (product as any).shortDescription || "",
            description: product.description || "",
            careInstructions: (product as any).careInstructions || "",
            productType: (product as any).productType || "",
            basePrice: product.basePrice,
            comparePrice: (product as any).compareAtPrice || undefined,
            primaryCategoryId: primaryCatId,
            status: product.status as any,
            visibility: product.visibility,
            metaTitle: (product as any).metaTitle || "",
            metaDescription: (product as any).metaDescription || "",
          }}
          categories={categories}
          isLoading={updateMutation.isPending}
          onSubmit={handleUpdate}
          onCancel={() => router.push("/products")}
        />
      </div>

      {/* ── Product Images ────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-slate-800">Product Images</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag to reorder. The primary image is shown first in listings.
          </p>
        </div>
        <ImageUploader productId={productId} />
      </div>
    </div>
  );
}
