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

  const categories = (categoriesData?.data || []).filter((c) => c.status === "ACTIVE");

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
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Create New Product</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-6">
            Configure product identity, pricing, SEO metadata, and upload high-resolution product photos.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <ProductForm
          isLoading={createMutation.isPending}
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => router.push("/products")}
          imageSection={
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">Product Images</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    <Sparkles className="h-2.5 w-2.5" /> High-Res WebP
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload images now. The first or starred image is marked as primary.
                </p>
              </div>
              <ImageUploader
                productId={tempProductId}
                stagedImages={stagedImages}
                onStagedImagesChange={setStagedImages}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
