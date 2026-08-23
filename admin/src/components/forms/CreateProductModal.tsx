"use client";

import React, { useEffect, useState } from "react";
import { X, PackagePlus, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { useCreateProduct } from "@/hooks/queries/useProducts";
import { ProductForm } from "./ProductForm";
import { ImageUploader, StagedImageItem } from "./ImageUploader";
import { ProductFormInput } from "@/validators/product.validator";

interface CategoryItem {
  id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

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

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateProduct();
  const [tempProductId, setTempProductId] = useState(() => generateValidUuid());
  const [stagedImages, setStagedImages] = useState<StagedImageItem[]>([]);

  // Reset temp ID and staged images whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTempProductId(generateValidUuid());
      setStagedImages([]);
    }
  }, [isOpen]);

  // Fetch active categories for the dropdown
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["admin", "categories", "active"],
    queryFn: async () => {
      const res = await apiClient.get<ApiPaginatedResponse<CategoryItem>>("/admin/categories?limit=100&status=ACTIVE");
      return res.data;
    },
    enabled: isOpen,
  });

  const categories = (categoriesData?.data || []).filter((c) => c.status === "ACTIVE");

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !createMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, createMutation.isPending]);

  if (!isOpen) return null;

  const handleCreateProduct = (formData: ProductFormInput) => {
    const formattedImages = stagedImages.map((img, idx) => ({
      imageUrl: img.imageUrl,
      altText: img.altText || formData.name || undefined,
      isPrimary: img.isPrimary,
      sortOrder: idx,
      variantIds: img.variantIds || [],
    }));

    createMutation.mutate(
      {
        id: tempProductId,
        ...formData,
        images: formattedImages,
      },
      {
        onSuccess: () => {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in-0">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={() => !createMutation.isPending && onClose()} />

      {/* Large Modal Container */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Create New Product</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                  <Sparkles className="h-3 w-3 text-slate-600" /> Catalog
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add a new product with pricing, categorization, and high-res photos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sidebar-scrollbar">
          <ProductForm
            isLoading={createMutation.isPending}
            categories={categories}
            onSubmit={handleCreateProduct}
            onCancel={onClose}
            imageSection={
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">Product Images</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      <Sparkles className="h-2.5 w-2.5" /> High-Res WebP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload images now. The primary photo is highlighted in catalog listings.
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
    </div>
  );
};

export default CreateProductModal;
