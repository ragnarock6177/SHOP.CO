"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductDetails, useUpdateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { FormSkeleton } from "../../../../components/ui/FormSkeleton";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProductDetails(productId);
  const updateMutation = useUpdateProduct();

  const handleUpdate = (formData: any) => {
    updateMutation.mutate(
      { id: productId, data: formData },
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Edit Product #{product.name}</h1>
        <p className="text-xs text-slate-500">Update product attributes, pricing, and catalog status</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <ProductForm
          initialValues={{
            name: product.name,
            slug: product.slug,
            description: product.description || "",
            basePrice: product.basePrice,
            comparePrice: product.comparePrice || undefined,
            primaryCategoryId: product.primaryCategoryId,
            status: product.status,
            visibility: product.visibility,
          }}
          isLoading={updateMutation.isPending}
          onSubmit={handleUpdate}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
