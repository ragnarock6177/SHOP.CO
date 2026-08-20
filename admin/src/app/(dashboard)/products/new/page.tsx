"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";

export default function CreateProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push("/products");
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Create New Product</h1>
        <p className="text-xs text-slate-500">Add a new item to the AIRAVÉ product catalog</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <ProductForm
          isLoading={createMutation.isPending}
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
