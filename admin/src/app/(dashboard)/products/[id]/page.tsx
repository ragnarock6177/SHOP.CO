"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useProductDetails, useUpdateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";

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
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center text-xs text-red-300">
        Product not found or failed to load product details.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Edit Product #{product.name}</h1>
        <p className="text-xs text-zinc-400">Update product attributes, pricing, and catalog status</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
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
