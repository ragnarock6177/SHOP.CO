"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { useCreateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";

export default function CreateProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

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

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: (created) => {
        // Redirect to edit page immediately so images can be uploaded
        router.push(`/products/${created.id}`);
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Create New Product</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Add a new item to the AIRAVÉ catalog. You can upload images after saving.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <ProductForm
          isLoading={createMutation.isPending}
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
        />
      </div>
    </div>
  );
}
