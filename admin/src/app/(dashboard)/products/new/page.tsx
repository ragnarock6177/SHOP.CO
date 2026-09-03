"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { useCreateProduct } from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { ImageUploader, StagedImageItem } from "../../../../components/forms/ImageUploader";

function generateValidUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CreateProductPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const [tempProductId] = useState(() => generateValidUuid());
  const [stagedImages, setStagedImages] = useState<StagedImageItem[]>([]);

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories", "active"],
    queryFn: async () => {
      const res = await apiClient.get<ApiPaginatedResponse<{ id: string; name: string; status: string }>>(
        "/admin/categories?limit=100&status=ACTIVE"
      );
      return res.data;
    },
  });

  const { data: collectionsData } = useQuery({
    queryKey: ["admin", "collections", "active"],
    queryFn: async () => {
      const res = await apiClient.get<ApiPaginatedResponse<{ id: string; name: string; status: string }>>(
        "/admin/collections?limit=100&status=ACTIVE"
      );
      return res.data;
    },
  });

  const categories = (categoriesData?.data || []).filter((c) => c.status === "ACTIVE");
  const collections = (collectionsData?.data || []).filter((c) => c.status === "ACTIVE");

  const handleCreate = (data: any) => {
    const formattedImages = stagedImages.map((img, idx) => ({
      imageUrl: img.imageUrl,
      altText: img.altText || data.name || undefined,
      isPrimary: img.isPrimary,
      sortOrder: idx,
      variantIds: img.variantIds || [],
    }));

    createMutation.mutate(
      {
        id: tempProductId,
        ...data,
        images: formattedImages,
      },
      {
        onSuccess: (created) => {
          router.push(`/products/${created.id}`);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
        <ProductForm
          productId={tempProductId}
          isLoading={createMutation.isPending}
          categories={categories}
          collections={collections}
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
          stagedImages={stagedImages}
          onStagedImagesChange={setStagedImages}
        />
      </div>
    </div>
  );
}
