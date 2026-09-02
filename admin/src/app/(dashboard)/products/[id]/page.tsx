"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Boxes,
  Image as ImageIcon,
  Eye,
  Package,
  ExternalLink,
  Copy,
  CheckCheck,
  AlertTriangle,
  TrendingUp,
  Tag,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import {
  useProductDetails,
  useUpdateProduct,
  useArchiveProduct,
} from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../../../components/feedback/ConfirmDialog";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

function formatINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProductDetails(productId);
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();

  const [activeTab, setActiveTab] = useState<"overview" | "edit">("overview");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

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
      (product as any).productCategories
        ?.map((pc: any) => ({
          id: pc.category?.id,
          name: pc.category?.name,
          isPrimary: pc.isPrimary,
        }))
        .filter((c: any) => c.name) || []
    );
  }, [product]);

  const allCollections = useMemo(() => {
    if (!product) return [];
    return (
      (product as any).productCollections
        ?.map((pc: any) => pc.collection?.name)
        .filter(Boolean) || []
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

  const handleCopyId = () => {
    if (product?.id) {
      navigator.clipboard.writeText(product.id);
      setCopiedId(true);
      toast.success("Copied to clipboard", "Product ID copied");
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

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
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-7 w-64 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 rounded bg-slate-200" />
            <div className="h-9 w-28 rounded bg-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-full w-full rounded-lg bg-slate-100" />
            </div>
            <div className="h-48 rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-100" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-48 rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="h-20 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full rounded-xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-xs space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900">Product Not Found</h3>
          <p className="text-xs font-medium text-rose-700 mt-1">
            The requested product details could not be loaded or the product has been removed.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
        </Link>
      </div>
    );
  }

  const basePrice = Number(product.basePrice) || 0;
  const compareAtPrice = Number((product as any).compareAtPrice) || 0;
  const discountPercent =
    compareAtPrice > basePrice
      ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
      : 0;

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
  const currentSKU = activeVariant?.sku || null;

  const hasSpecifications = Boolean(
    (product as any).shortDescription ||
      product.description ||
      (product as any).careInstructions ||
      (product as any).productType,
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ── Top Header & Breadcrumbs Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              href="/products"
              className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Products</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status as any} />
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase border border-slate-200">
              {product.visibility}
            </span>
            {primaryCat && (
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-blue-100">
                {primaryCat.name}
              </span>
            )}
            <StatusBadge status={overallStockStatus} />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tabs Pill Switcher */}
          <div className="flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                activeTab === "edit"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Edit className="h-3.5 w-3.5 text-slate-500" />
              Edit Details
            </button>
          </div>

          {/* View in Storefront Link */}
          <a
            href={`/product/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            title="Preview in Storefront"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Storefront</span>
          </a>

          {/* Archive Product Button */}
          <button
            type="button"
            onClick={() => setIsArchiveModalOpen(true)}
            className="rounded-lg border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
            title="Archive Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* LEFT MAIN COLUMN (8 cols)                                        */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-6">
            {/* ── CARD 1: Gallery & Visual Showcase ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Large Preview Image */}
                <div className="shrink-0 space-y-3 sm:w-56 md:w-64">
                  <div className="relative aspect-3/4 w-full max-w-64 mx-auto sm:mx-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group">
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-12 w-12 stroke-[1.5]" />
                      </div>
                    )}
                    {productImages.length > 0 && (
                      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                        {selectedImageIndex + 1} / {productImages.length}
                      </span>
                    )}
                    {activeColor && (
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs backdrop-blur-xs border border-slate-200/80">
                        {activeColor}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail gallery */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto p-1 sidebar-scrollbar max-w-64 mx-auto sm:mx-0">
                      {productImages.map((img: any, idx: number) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={cn(
                            "relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer",
                            selectedImageIndex === idx
                              ? "border-slate-900 shadow-xs"
                              : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100",
                          )}
                        >
                          <img
                            src={img.imageUrl}
                            alt={img.altText || `Product Image ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Product Identity & Variant Selectors */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {product.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                      {currentSKU && (
                        <>
                          <span>
                            SKU: <strong className="text-slate-800">{currentSKU}</strong>
                          </span>
                          <span className="text-slate-300">·</span>
                        </>
                      )}
                      <span>
                        Slug: <span className="text-slate-700">/{product.slug}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="flex items-baseline gap-3 flex-wrap bg-slate-50 border border-slate-100 rounded-lg p-3">
                    <span className="text-2xl font-bold text-slate-900">
                      {formatINR(currentPrice)}
                    </span>
                    {currentComparePrice > currentPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatINR(currentComparePrice)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        Save {discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Color Selector Filter */}
                  {uniqueColors.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Color Options ({uniqueColors.length})
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
                                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                                isSelected
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                              )}
                            >
                              {col.hex && (
                                <span
                                  className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: col.hex }}
                                />
                              )}
                              <span>{col.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {availableSizes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Available Sizes
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
                              onClick={() => {
                                if (sizeVariant) setSelectedVariantId(sizeVariant.id);
                              }}
                              className={cn(
                                "flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all",
                                isSelected
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : isOutOfStock
                                    ? "bg-slate-50 border border-slate-100 text-slate-400 cursor-pointer"
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

            {/* ── CARD 2: Product Content & Specifications ── */}
            {hasSpecifications && (
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900">Product Specifications</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("edit")}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Specs
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(product as any).shortDescription && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Short Description
                      </p>
                      <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3">
                        {(product as any).shortDescription}
                      </p>
                    </div>
                  )}

                  {(product as any).productType && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Product Type
                      </p>
                      <p className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg p-3">
                        {(product as any).productType}
                      </p>
                    </div>
                  )}
                </div>

                {product.description && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Detailed Description
                    </p>
                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3.5 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </div>
                  </div>
                )}

                {(product as any).careInstructions && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Care Instructions
                    </p>
                    <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3 leading-relaxed">
                      {(product as any).careInstructions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── CARD 3: Product Variants (Read-Only on Detail Page) ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Product Variants ({variants.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Variant options, pricing, and stock levels
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  Manage in Edit
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 space-y-1.5">
                  <p className="font-medium text-slate-700">No variants configured for this product.</p>
                  <p className="text-slate-400">
                    You can add color and size variants in the{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("edit")}
                      className="font-semibold text-slate-900 underline hover:text-slate-700 cursor-pointer"
                    >
                      Edit Details tab
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto sidebar-scrollbar">
                  <table className="w-full text-left text-xs min-w-140">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                      <tr>
                        <th className="px-3 py-2.5">Variant Option</th>
                        <th className="px-3 py-2.5">SKU</th>
                        <th className="px-3 py-2.5">Price</th>
                        <th className="px-3 py-2.5 text-center">On Hand</th>
                        <th className="px-3 py-2.5 text-center">Available</th>
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
                        const stockVal = v.stockOnHand ?? v.stock ?? 0;
                        const available = v.stockAvailable ?? stockVal;

                        return (
                          <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                {colorHex && (
                                  <span
                                    className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
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
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                                {v.sku || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-bold text-slate-900">
                              {formatINR(Number(v.price))}
                            </td>
                            <td className="px-3 py-3 text-center font-semibold text-slate-800">
                              {stockVal}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={cn(
                                  "font-bold",
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
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* RIGHT SIDEBAR COLUMN (4 cols)                                     */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-4 space-y-6">
            {/* ── SIDEBAR CARD 1: Inventory Health & Stock Summary ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Inventory Summary</h3>
                </div>
                <StatusBadge status={overallStockStatus} />
              </div>

              {/* 4 Metric Tiles */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{totalStockOnHand}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    On Hand
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{totalStockAvailable}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Available
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-600">{totalStockReserved}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Reserved
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{variants.length}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                    Variants
                  </p>
                </div>
              </div>
            </div>

            {/* ── SIDEBAR CARD 2: Pricing ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Pricing</h3>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base Catalog Price:</span>
                  <strong className="text-slate-900">{formatINR(basePrice)}</strong>
                </div>
                {compareAtPrice > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Compare-at Price:</span>
                    <span className="text-slate-700">{formatINR(compareAtPrice)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Currency:</span>
                  <span className="font-semibold text-slate-800">
                    {(product as any).currency || "INR (₹)"}
                  </span>
                </div>
                {(product as any).taxCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tax Code:</span>
                    <span className="text-slate-700">{(product as any).taxCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR CARD 3: Organization & Categorization ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Categorization</h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Primary Category
                  </p>
                  {primaryCat ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 text-white px-2.5 py-1 text-xs font-bold shadow-2xs">
                      <Sparkles className="h-3 w-3 text-slate-300" />
                      {primaryCat.name}
                    </span>
                  ) : (
                    <span className="text-slate-400">Uncategorized</span>
                  )}
                </div>

                {allCategories.length > 1 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      All Assigned Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allCategories.map((c: any) => (
                        <span
                          key={c.id || c.name}
                          className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 border border-slate-200"
                        >
                          {c.name} {c.isPrimary && "★"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {allCollections.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Collections
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allCollections.map((col: string) => (
                        <span
                          key={col}
                          className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR CARD 4: Metadata & Audit Trail ── */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900">Audit & Metadata</h3>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Product ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-700 truncate max-w-28 font-medium">
                      {product.id}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-slate-400 hover:text-slate-800 transition cursor-pointer p-0.5"
                      title="Copy Product ID"
                    >
                      {copiedId ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-800 font-medium">
                    {formatDateTime(product.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Updated:</span>
                  <span className="text-slate-800 font-medium">
                    {formatDateTime(product.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Specifications Edit Tab ── */}
      {activeTab === "edit" && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Edit Product Specifications</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update product identity, pricing, categorization, SEO metadata, and product variants
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
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

      {/* ── Archive Product Confirm Dialog ── */}
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
