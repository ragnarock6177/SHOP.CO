"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Boxes,
  Check,
  Image as ImageIcon,
  Eye,
  Package,
  Search,
} from "lucide-react";
import {
  useProductDetails,
  useUpdateProduct,
  useArchiveProduct,
  useUpdateVariant,
} from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { FormSkeleton } from "../../../../components/ui/FormSkeleton";
import { ConfirmDialog } from "../../../../components/feedback/ConfirmDialog";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { cn } from "@/lib/utils";

function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-100 rounded-md px-3 py-2 min-h-8.5 flex items-center">
        {value ?? <span className="text-slate-400">—</span>}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
      {children}
    </p>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProductDetails(productId);
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();
  const updateVariantMutation = useUpdateVariant();

  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories", "active"],
    queryFn: async () => {
      const res = await apiClient.get<
        ApiPaginatedResponse<{ id: string; name: string; status: string }>
      >("/admin/categories?limit=100&status=ACTIVE");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const categories = (categoriesData?.data || []).filter((c) => c.status === "ACTIVE");

  const primaryCat = useMemo(() => {
    if (!product) return null;
    const catRel = (product as any).productCategories?.find((pc: any) => pc.isPrimary);
    return catRel?.category || null;
  }, [product]);

  const allCategories = useMemo(() => {
    if (!product) return [];
    return (
      (product as any).productCategories?.map((pc: any) => ({
        name: pc.category?.name,
        isPrimary: pc.isPrimary,
      })).filter((c: any) => c.name) || []
    );
  }, [product]);

  const variants = useMemo(() => product?.variants || [], [product?.variants]);

  const uniqueColors = useMemo(() => {
    const colorsMap = new Map<string, string | undefined>();
    for (const v of variants) {
      const colorName =
        v.colorName ||
        v.variantAttributeValues?.find(
          (vav: any) =>
            vav.attributeValue?.attribute?.name?.toLowerCase() === "color" ||
            vav.attributeValue?.colorHex,
        )?.attributeValue?.value;
      const colorHex =
        v.colorHex ||
        v.variantAttributeValues?.find((vav: any) => vav.attributeValue?.colorHex)
          ?.attributeValue?.colorHex;
      if (colorName && !colorsMap.has(colorName)) {
        colorsMap.set(colorName, colorHex || undefined);
      }
    }
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [variants]);

  const activeColor = useMemo(() => {
    if (selectedColor && uniqueColors.some((c) => c.name === selectedColor)) {
      return selectedColor;
    }
    return uniqueColors[0]?.name || null;
  }, [selectedColor, uniqueColors]);

  const colorVariants = useMemo(() => {
    if (!activeColor) return variants;
    return variants.filter(
      (v: any) =>
        v.colorName === activeColor ||
        v.variantName?.toLowerCase().includes(activeColor.toLowerCase()),
    );
  }, [variants, activeColor]);

  const activeVariant = useMemo(() => {
    if (selectedVariantId) {
      const found = variants.find((v: any) => v.id === selectedVariantId);
      if (
        found &&
        (!activeColor ||
          found.colorName === activeColor ||
          found.variantName?.toLowerCase().includes(activeColor.toLowerCase()))
      ) {
        return found;
      }
    }
    return colorVariants[0] || variants[0] || null;
  }, [variants, colorVariants, selectedVariantId, activeColor]);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    const sourceVariants = activeColor ? colorVariants : variants;
    sourceVariants.forEach((v: any) => {
      const size =
        v.sizeName ||
        v.variantAttributeValues?.find(
          (vav: any) => vav.attributeValue?.attribute?.name?.toLowerCase() === "size",
        )?.attributeValue?.value;
      if (size) sizesSet.add(size);
    });
    return Array.from(sizesSet);
  }, [variants, colorVariants, activeColor]);

  const productImages = useMemo(() => {
    const allImgs = product?.images || [];
    if (allImgs.length === 0) return [];

    if (activeColor || activeVariant) {
      const activeColorVarIds = colorVariants.map((v: any) => v.id);
      const colorImgs = allImgs.filter((img: any) => {
        const vIds =
          img.variantIds || img.variantImages?.map((vi: any) => vi.variantId) || [];
        const isLinkedToColor = vIds.some((id: string) => activeColorVarIds.includes(id));
        const isAltMatch = img.altText
          ?.toLowerCase()
          .includes((activeColor || "").toLowerCase());
        return isLinkedToColor || isAltMatch;
      });
      if (colorImgs.length > 0) return colorImgs;
    }
    return allImgs;
  }, [product?.images, activeColor, colorVariants, activeVariant]);

  const displayImageUrl = useMemo(() => {
    if (productImages.length > 0) {
      return productImages[selectedImageIndex]?.imageUrl || productImages[0]?.imageUrl;
    }
    return product?.images?.[0]?.imageUrl || null;
  }, [productImages, selectedImageIndex, product?.images]);

  const handleUpdate = (formData: any) => {
    const { primaryCategoryId, comparePrice, variants: formVariants, ...rest } = formData;
    updateMutation.mutate(
      {
        id: productId,
        data: {
          ...rest,
          ...(primaryCategoryId ? { categoryId: primaryCategoryId } : {}),
          ...(comparePrice !== undefined ? { compareAtPrice: comparePrice } : {}),
          ...(formVariants && formVariants.length > 0 ? { variants: formVariants } : {}),
        },
      },
      { onSuccess: () => setActiveTab("overview") },
    );
  };

  const handleConfirmArchive = () => {
    archiveMutation.mutate(productId, {
      onSuccess: () => {
        setIsArchiveModalOpen(false);
        router.push("/products");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md animate-shimmer bg-slate-100" />
          <div className="h-3.5 w-64 rounded-md animate-shimmer bg-slate-100" />
        </div>
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl rounded-md border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs space-y-3">
        <p>Product not found or failed to load product details.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products Catalog
        </Link>
      </div>
    );
  }

  const basePrice = Number(product.basePrice) || 0;
  const compareAtPrice = Number((product as any).compareAtPrice) || 0;

  const totalStockOnHand = (product as any).totalStockOnHand ?? 0;
  const totalStockAvailable = (product as any).totalStockAvailable ?? 0;
  const totalStockReserved = (product as any).totalStockReserved ?? 0;
  const reorderLevel = (product as any).reorderLevel ?? 5;
  const overallStockStatus =
    (product as any).stockStatus || (totalStockAvailable > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

  const currentPrice = activeVariant ? Number(activeVariant.price) || basePrice : basePrice;
  const currentComparePrice = activeVariant
    ? Number(activeVariant.compareAtPrice) || compareAtPrice
    : compareAtPrice;
  const currentStock = activeVariant
    ? activeVariant.stockAvailable !== undefined
      ? Number(activeVariant.stockAvailable)
      : Number((activeVariant as any).stock) || 0
    : totalStockAvailable;
  const currentSKU = activeVariant?.sku || "Base Product (No SKU)";

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/products"
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Inventory</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status as any} />
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
              {product.visibility}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md bg-slate-100/80 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Eye className="inline-block h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "edit"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Edit className="inline-block h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Edit Details
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsArchiveModalOpen(true)}
            className="rounded-md border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
            title="Archive Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ── Section 1: Product Overview (top) ── */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              {/* Image */}
              <div className="shrink-0 space-y-3 sm:w-48 md:w-56">
                <div className="relative aspect-square w-full max-w-56 mx-auto sm:mx-0 overflow-hidden rounded-lg border border-slate-200/80 bg-slate-50 group">
                  {displayImageUrl ? (
                    <img
                      src={displayImageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <ImageIcon className="h-10 w-10 stroke-[1.5]" />
                    </div>
                  )}
                  {productImages.length > 0 && (
                    <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                      {selectedImageIndex + 1} / {productImages.length}
                    </span>
                  )}
                </div>
                {productImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto p-1 sidebar-scrollbar max-w-56 mx-auto sm:mx-0">
                    {productImages.map((img: any, idx: number) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={cn(
                          "relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer",
                          selectedImageIndex === idx
                            ? "border-slate-900"
                            : "border-slate-200 hover:border-slate-400",
                        )}
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.altText || `Image ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic info */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100">
                      {primaryCat?.name || (product as any).productType || "Uncategorized"}
                    </span>
                    <StatusBadge status={overallStockStatus} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    SKU: <span className="font-semibold text-slate-700">{currentSKU}</span>
                    <span className="mx-2 text-slate-300">·</span>
                    <span className="font-mono text-slate-400">/{product.slug}</span>
                  </p>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-slate-900">{formatINR(currentPrice)}</span>
                  {currentComparePrice > currentPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatINR(currentComparePrice)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {(product as any).shortDescription ||
                    product.description ||
                    "No description provided."}
                </p>

                {uniqueColors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((col) => {
                        const isSelected = activeColor === col.name;
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              setSelectedColor(col.name);
                              setSelectedImageIndex(0);
                              const matched = variants.find(
                                (v: any) =>
                                  v.colorName === col.name ||
                                  v.variantName?.toLowerCase().includes(col.name.toLowerCase()),
                              );
                              if (matched) setSelectedVariantId(matched.id);
                            }}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                              isSelected
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                            )}
                          >
                            {col.hex && (
                              <span
                                className="h-3 w-3 rounded-full border border-black/10"
                                style={{ backgroundColor: col.hex }}
                              />
                            )}
                            {col.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableSizes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => {
                        const sizeVariant =
                          colorVariants.find((v: any) => v.sizeName === size) ||
                          variants.find((v: any) => v.sizeName === size);
                        const isSelected = activeVariant?.sizeName === size;
                        const stock =
                          sizeVariant?.stockAvailable ?? sizeVariant?.stockOnHand ?? 0;
                        const isOutOfStock = stock <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => {
                              if (sizeVariant) setSelectedVariantId(sizeVariant.id);
                            }}
                            className={cn(
                              "flex h-9 min-w-9 items-center justify-center rounded-md px-2.5 text-xs font-bold transition-all",
                              isSelected
                                ? "bg-slate-900 text-white"
                                : isOutOfStock
                                  ? "bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed"
                                  : "border border-slate-200 bg-white text-slate-800 hover:border-slate-400 cursor-pointer",
                            )}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Inventory (below overview) ── */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Inventory</h2>
              </div>
              <StatusBadge status={overallStockStatus} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "On Hand", value: totalStockOnHand },
                { label: "Available", value: totalStockAvailable },
                { label: "Reserved", value: totalStockReserved },
                { label: "Variants", value: variants.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3 text-center"
                >
                  <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
              <span>
                Reorder level: <strong className="text-slate-900">≤ {reorderLevel} units</strong>
              </span>
              <span>
                Created: <strong className="text-slate-900">{formatDate(product.createdAt)}</strong>
              </span>
              <span>
                Updated: <strong className="text-slate-900">{formatDate(product.updatedAt)}</strong>
              </span>
            </div>
            {currentStock <= reorderLevel && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                Low stock — {currentStock} unit{currentStock !== 1 ? "s" : ""} left
                {activeVariant ? " for selected variant" : ""}
              </p>
            )}
          </div>

          {/* ── Section 3: Product Details (full width, field grid) ── */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-semibold text-slate-900">Product Information</h2>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <SectionLabel>Identity & Classification</SectionLabel>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoField label="URL Slug" value={`/${product.slug}`} />
                  <InfoField
                    label="Category"
                    value={
                      allCategories.length > 0
                        ? allCategories
                            .map((c: any) => (c.isPrimary ? `${c.name} ★` : c.name))
                            .join(", ")
                        : null
                    }
                  />
                  <InfoField label="Product Type" value={(product as any).productType} />
                  <InfoField label="Status" value={<StatusBadge status={product.status} />} />
                  <InfoField
                    label="Visibility"
                    value={
                      <span className="text-[10px] font-bold uppercase">{product.visibility}</span>
                    }
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <SectionLabel>Pricing</SectionLabel>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoField label="Base Price" value={formatINR(basePrice)} />
                  <InfoField
                    label="Compare-at Price"
                    value={compareAtPrice > 0 ? formatINR(compareAtPrice) : null}
                  />
                  <InfoField label="Currency" value={(product as any).currency || "INR"} />
                  <InfoField label="Tax Code" value={(product as any).taxCode} />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <SectionLabel>Content</SectionLabel>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InfoField label="Short Description" value={(product as any).shortDescription} />
                  <InfoField
                    label="Care Instructions"
                    value={(product as any).careInstructions}
                  />
                </div>
                {product.description && (
                  <div className="mt-4">
                    <InfoField
                      label="Full Description"
                      value={
                        <span className="whitespace-pre-wrap">{product.description}</span>
                      }
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <SectionLabel>SEO & Meta</SectionLabel>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InfoField label="Meta Title" value={(product as any).metaTitle || product.name} />
                  <InfoField
                    label="Meta Description"
                    value={(product as any).metaDescription}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Variant stock table ── */}
          {variants.length > 0 && (
            <div className="rounded-md border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Variant Stock ({variants.length})
                    </h2>
                    <p className="text-[11px] text-slate-500">Edit stock inline and save</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Object.keys(editingStock).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingStock({})}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={
                      Object.keys(editingStock).length === 0 || updateVariantMutation.isPending
                    }
                    onClick={async () => {
                      try {
                        await Promise.all(
                          Object.keys(editingStock).map((vId) =>
                            updateVariantMutation.mutateAsync({
                              productId,
                              variantId: vId,
                              data: { stock: editingStock[vId] },
                            }),
                          ),
                        );
                        setEditingStock({});
                      } catch (err) {
                        console.error("Stock update failed:", err);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
                  >
                    {updateVariantMutation.isPending
                      ? "Saving…"
                      : Object.keys(editingStock).length > 0
                        ? `Save (${Object.keys(editingStock).length})`
                        : (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Synced
                          </>
                        )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto sidebar-scrollbar">
                <table className="w-full text-left text-xs min-w-150">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/60">
                    <tr>
                      <th className="px-3 py-2.5">Variant</th>
                      <th className="px-3 py-2.5">SKU</th>
                      <th className="px-3 py-2.5">Price</th>
                      <th className="px-3 py-2.5 text-center">On Hand</th>
                      <th className="px-3 py-2.5">Available</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v: any) => {
                      const colorName =
                        v.colorName ||
                        v.variantAttributeValues?.find(
                          (vav: any) =>
                            vav.attributeValue?.attribute?.name?.toLowerCase() === "color",
                        )?.attributeValue?.value ||
                        "Default";
                      const colorHex =
                        v.colorHex ||
                        v.variantAttributeValues?.find((vav: any) => vav.attributeValue?.colorHex)
                          ?.attributeValue?.colorHex;
                      const sizeName = v.sizeName || "";
                      const stockVal =
                        editingStock[v.id] !== undefined
                          ? editingStock[v.id]
                          : v.stockOnHand ?? 0;
                      const available = v.stockAvailable ?? stockVal;
                      const isModified = editingStock[v.id] !== undefined;

                      return (
                        <tr
                          key={v.id}
                          className={cn(
                            "hover:bg-slate-50/80 transition-colors",
                            isModified && "bg-amber-50/40",
                          )}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {colorHex && (
                                <span
                                  className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: colorHex }}
                                />
                              )}
                              <span className="font-bold text-slate-900">
                                {colorName}
                                {sizeName ? ` / ${sizeName}` : ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                              {v.sku || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-bold">{formatINR(Number(v.price))}</td>
                          <td className="px-3 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={stockVal}
                              onChange={(e) => {
                                const num = parseInt(e.target.value, 10);
                                setEditingStock((prev) => ({
                                  ...prev,
                                  [v.id]: isNaN(num) ? 0 : num,
                                }));
                              }}
                              className={cn(
                                "w-20 rounded-md border px-2 py-1.5 text-center text-xs font-bold focus:outline-none",
                                isModified
                                  ? "border-amber-400 bg-amber-50"
                                  : "border-slate-300 bg-white focus:border-slate-500",
                              )}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "font-extrabold",
                                available > 0 ? "text-emerald-700" : "text-rose-600",
                              )}
                            >
                              {available}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge
                              status={
                                v.stockStatus ||
                                (stockVal > reorderLevel
                                  ? "IN_STOCK"
                                  : stockVal > 0
                                    ? "LOW_STOCK"
                                    : "OUT_OF_STOCK")
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "edit" && (
        <div className="rounded-md border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Product Specifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update product identity, pricing, categorization, and SEO metadata
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <ProductForm
            productId={productId}
            initialValues={{
              name: product.name,
              slug: product.slug,
              shortDescription: (product as any).shortDescription || "",
              description: product.description || "",
              careInstructions: (product as any).careInstructions || "",
              productType: (product as any).productType || "",
              basePrice: Number(product.basePrice) || 0,
              comparePrice: Number((product as any).compareAtPrice) || undefined,
              primaryCategoryId: primaryCat?.id || "",
              status: product.status as any,
              visibility: product.visibility,
              metaTitle: (product as any).metaTitle || "",
              metaDescription: (product as any).metaDescription || "",
              variants: variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                colorName:
                  v.colorName ||
                  v.variantAttributeValues?.find(
                    (vav: any) =>
                      vav.attributeValue?.colorHex ||
                      vav.attributeValue?.attribute?.slug === "color",
                  )?.attributeValue?.value ||
                  "Default",
                colorHex:
                  v.colorHex ||
                  v.variantAttributeValues?.find((vav: any) => vav.attributeValue?.colorHex)
                    ?.attributeValue?.colorHex ||
                  "#000000",
                sizeName:
                  v.sizeName ||
                  v.variantAttributeValues?.find(
                    (vav: any) => vav.attributeValue?.attribute?.slug === "size",
                  )?.attributeValue?.value ||
                  "Standard",
                price: Number(v.price) || 0,
                compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                stock:
                  v.stockOnHand !== undefined
                    ? v.stockOnHand
                    : v.inventory?.quantityOnHand || 0,
                isActive: v.isActive !== false,
              })),
            }}
            categories={categories}
            isLoading={updateMutation.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setActiveTab("overview")}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={isArchiveModalOpen}
        title="Archive Product"
        description="Are you sure you want to soft-archive this product? It will be hidden from storefront listings."
        isDestructive
        isLoading={archiveMutation.isPending}
        confirmLabel="Archive Product"
        onConfirm={handleConfirmArchive}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
    </div>
  );
}
