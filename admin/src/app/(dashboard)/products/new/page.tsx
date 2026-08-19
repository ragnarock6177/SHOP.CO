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
        <h1 className="text-xl font-bold text-zinc-100">Create New Product</h1>
        <p className="text-xs text-zinc-400">Add a new item to the AIRAVÉ product catalog</p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <ProductForm
          isLoading={createMutation.isPending}
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
