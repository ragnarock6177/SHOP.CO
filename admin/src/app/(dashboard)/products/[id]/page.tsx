"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  Boxes,
  FileText,
  DollarSign,
  Info,
  Image as ImageIcon,
  Copy,
  Check,
  Eye,
  ChevronRight,
  History,
  Sliders,
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { data: product, isLoading, error } = useProductDetails(productId);
  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();
  const updateVariantMutation = useUpdateVariant();

  const [activeTab, setActiveTab] = useState<"overview" | "edit">(
    "overview",
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ [variantId: string]: number }>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
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

  const categories = (categoriesData?.data || []).filter(
    (c) => c.status === "ACTIVE",
  );

  // Derive primary category
  const primaryCat = useMemo(() => {
    if (!product) return null;
    const catRel = (product as any).productCategories?.find(
      (pc: any) => pc.isPrimary,
    );
    return catRel?.category || null;
  }, [product]);

  // Derived variants list
  const variants = useMemo(() => {
    return product?.variants || [];
  }, [product?.variants]);

  // Unique colors extracted from variants
  const uniqueColors = useMemo(() => {
    const colorsMap = new Map<string, string | undefined>();
    for (const v of variants) {
      const colorName = v.colorName || v.variantAttributeValues?.find(
        (vav: any) =>
          vav.attributeValue?.attribute?.name?.toLowerCase() === "color" ||
          vav.attributeValue?.colorHex
      )?.attributeValue?.value;
      const colorHex = v.colorHex || v.variantAttributeValues?.find(
        (vav: any) => vav.attributeValue?.colorHex
      )?.attributeValue?.colorHex;

      if (colorName && !colorsMap.has(colorName)) {
        colorsMap.set(colorName, colorHex || undefined);
      }
    }
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({
      name,
      hex,
    }));
  }, [variants]);

  // Active color (defaults to selectedColor or first available color)
  const activeColor = useMemo(() => {
    if (selectedColor && uniqueColors.some((c) => c.name === selectedColor)) {
      return selectedColor;
    }
    return uniqueColors[0]?.name || null;
  }, [selectedColor, uniqueColors]);

  // Variants filtered by active color
  const colorVariants = useMemo(() => {
    if (!activeColor) return variants;
    return variants.filter((v: any) => v.colorName === activeColor || v.variantName?.toLowerCase().includes(activeColor.toLowerCase()));
  }, [variants, activeColor]);

  // Active selected variant (or first variant of active color)
  const activeVariant = useMemo(() => {
    if (selectedVariantId) {
      const found = variants.find((v: any) => v.id === selectedVariantId);
      if (found && (!activeColor || found.colorName === activeColor || found.variantName?.toLowerCase().includes(activeColor.toLowerCase()))) {
        return found;
      }
    }
    return colorVariants[0] || variants[0] || null;
  }, [variants, colorVariants, selectedVariantId, activeColor]);

  // Sizes available under the active color
  const availableSizes = useMemo(() => {
    const sizesSet = new Set<string>();
    const sourceVariants = activeColor ? colorVariants : variants;
    sourceVariants.forEach((v: any) => {
      const size = v.sizeName || v.variantAttributeValues?.find(
        (vav: any) => vav.attributeValue?.attribute?.name?.toLowerCase() === "size"
      )?.attributeValue?.value;
      if (size) sizesSet.add(size);
    });
    return Array.from(sizesSet);
  }, [variants, colorVariants, activeColor]);

  // Images linked to the active color or active variant
  const productImages = useMemo(() => {
    const allImgs = product?.images || [];
    if (allImgs.length === 0) return [];

    if (activeColor || activeVariant) {
      const activeColorVarIds = colorVariants.map((v: any) => v.id);
      const colorImgs = allImgs.filter((img: any) => {
        const vIds = img.variantIds || img.variantImages?.map((vi: any) => vi.variantId) || [];
        const isLinkedToColor = vIds.some((id: string) => activeColorVarIds.includes(id));
        const isAltMatch = img.altText?.toLowerCase().includes((activeColor || "").toLowerCase());
        return isLinkedToColor || isAltMatch;
      });

      if (colorImgs.length > 0) return colorImgs;
    }

    return allImgs;
  }, [product?.images, activeColor, colorVariants, activeVariant]);

  // Currently displayed main image
  const displayImageUrl = useMemo(() => {
    if (productImages.length > 0) {
      return productImages[selectedImageIndex]?.imageUrl || productImages[0]?.imageUrl;
    }
    return product?.images?.[0]?.imageUrl || null;
  }, [productImages, selectedImageIndex, product?.images]);

  // Handle update submit
  const handleUpdate = (formData: any) => {
    const { primaryCategoryId, comparePrice, variants, ...rest } = formData;
    updateMutation.mutate(
      {
        id: productId,
        data: {
          ...rest,
          ...(primaryCategoryId ? { categoryId: primaryCategoryId } : {}),
          ...(comparePrice !== undefined
            ? { compareAtPrice: comparePrice }
            : {}),
          ...(variants && variants.length > 0 ? { variants } : {}),
        },
      },
      {
        onSuccess: () => {
          setActiveTab("overview");
        },
      },
    );
  };

  // Handle soft archive
  const handleConfirmArchive = () => {
    archiveMutation.mutate(productId, {
      onSuccess: () => {
        setIsArchiveModalOpen(false);
        router.push("/products");
      },
    });
  };

  const copyProductId = () => {
    navigator.clipboard.writeText(productId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
  const hasDiscount = compareAtPrice > basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100)
    : 0;

  const totalStockOnHand = (product as any).totalStockOnHand ?? 0;
  const totalStockAvailable = (product as any).totalStockAvailable ?? 0;
  const totalStockReserved = (product as any).totalStockReserved ?? 0;
  const reorderThreshold = (product as any).reorderLevel ?? 5;
  const overallStockStatus = (product as any).stockStatus || (totalStockAvailable > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

  // Active pricing & stock (from active variant if selected)
  const currentPrice = activeVariant
    ? Number(activeVariant.price) || basePrice
    : basePrice;
  const currentStock = activeVariant
    ? (activeVariant.stockAvailable !== undefined ? Number(activeVariant.stockAvailable) : Number((activeVariant as any).stock) || 0)
    : (product as any).totalStockAvailable || 0;
  const currentSKU = activeVariant?.sku || "Base Product (No SKU)";

  const uniqueSizesSet = new Set<string>();
  variants.forEach((v: any) => {
    if (v.sizeName) {
      uniqueSizesSet.add(v.sizeName);
    }
  });
  const uniqueSizes = Array.from(uniqueSizesSet);

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in duration-300">
      {/* ── Top Navigation & Header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/products"
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Inventory</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status as any} />
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
              {product.visibility}
            </span>
          </div>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md bg-slate-100/80 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eye className="inline-block h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
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

      {/* ── Tab Content: OVERVIEW ──────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Left Column (2 Cols Hero Card) */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                  {/* Photo Box */}
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-50 shadow-xs group">
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
                        <span className="absolute bottom-3 right-3 rounded-md bg-slate-900/80 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                          {selectedImageIndex + 1} / {productImages.length}
                        </span>
                      )}
                    </div>

                    {/* Thumbnails strip */}
                    {productImages.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto p-2 -m-2 sidebar-scrollbar">
                        {productImages.map((img: any, idx: number) => (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                              selectedImageIndex === idx
                                ? "border-blue-600 ring-2 ring-blue-600/20 scale-105"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            <img
                              src={img.imageUrl}
                              alt={img.altText || `Product image ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Product Details Info */}
                  <div className="space-y-5">
                    <div>
                      <span className="inline-block rounded-md bg-blue-50 px-3.5 py-1 text-[11px] font-extrabold text-blue-600 uppercase tracking-wider mb-2">
                        {primaryCat?.name || (product as any).productType || "CLOTHING"}
                      </span>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        {product.name}
                      </h1>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        SKU: {currentSKU}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        DESCRIPTION
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                        {(product as any).shortDescription || product.description || "Premium quality product."}
                      </p>
                    </div>

                    {/* SELECT COLOR */}
                    {uniqueColors.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          SELECT COLOR
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {uniqueColors.map((col) => {
                            const isSelected = activeColor === col.name;
                            const hasLowStock = variants.some(
                              (v: any) =>
                                (v.colorName === col.name ||
                                  v.variantName?.toLowerCase().includes(col.name.toLowerCase())) &&
                                (v.stockAvailable ?? v.stock ?? 0) <= 5
                            );

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
                                      v.variantName?.toLowerCase().includes(col.name.toLowerCase())
                                  );
                                  if (matched) setSelectedVariantId(matched.id);
                                }}
                                className={`relative inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-2 border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs"
                                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                {col.hex ? (
                                  <span
                                    className="h-3 w-3 rounded-md border border-black/10 shadow-2xs"
                                    style={{ backgroundColor: col.hex }}
                                  />
                                ) : (
                                  <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                                )}
                                <span>{col.name}</span>
                                {hasLowStock && (
                                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* AVAILABLE SIZES */}
                    {availableSizes.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                          AVAILABLE SIZES
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {availableSizes.map((size) => {
                            const isSelected = activeVariant?.sizeName === size;
                            const sizeVariant =
                              colorVariants.find((v: any) => v.sizeName === size) ||
                              variants.find((v: any) => v.sizeName === size);
                            const isLowStock =
                              sizeVariant && (sizeVariant.stockAvailable ?? sizeVariant.stock ?? 0) <= 5;

                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => {
                                  if (sizeVariant) setSelectedVariantId(sizeVariant.id);
                                }}
                                className={`relative flex flex-col items-center justify-center rounded-md transition-all cursor-pointer ${
                                  isSelected
                                    ? "h-12 w-12 bg-slate-900 text-white font-extrabold shadow-md"
                                    : isLowStock
                                    ? "h-12 w-12 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold"
                                    : "h-12 w-12 bg-slate-100 border border-slate-200/80 text-slate-800 font-bold hover:bg-slate-200/80"
                                }`}
                              >
                                <span className="text-xs uppercase">{size}</span>
                                {!isSelected && isLowStock && (
                                  <span className="text-[9px] font-black text-rose-600 bg-rose-200/60 px-1 rounded uppercase scale-90">
                                    LOW
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Sidebar */}
            <div className="space-y-6">
              {/* Top Card: ACTIVITY & SUMMARY (Dark Navy Card #0B132B) */}
              <div className="rounded-[2.5rem] bg-[#0B132B] text-white p-6 shadow-xl space-y-5 border border-slate-800/80">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3.5">
                  <History className="h-4 w-4 text-slate-400" />
                  <h2 className="text-xs font-black tracking-widest text-slate-300 uppercase">
                    ACTIVITY & SUMMARY
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      STATUS
                    </span>
                    <span
                      className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        overallStockStatus === "IN_STOCK"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : overallStockStatus === "LOW_STOCK"
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {overallStockStatus === "LOW_STOCK"
                        ? "LOW STOCK"
                        : overallStockStatus === "IN_STOCK"
                        ? "IN STOCK"
                        : "OUT OF STOCK"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      TOTAL VARIANTS
                    </span>
                    <span className="text-sm font-black text-white">
                      {variants.length} items
                    </span>
                  </div>

                  {/* Warning Restock Alert Banner */}
                  {currentStock <= 5 && (
                    <div className="rounded-md bg-rose-950/70 border border-rose-800/80 p-4 text-xs font-semibold text-rose-200 space-y-1">
                      <p className="font-extrabold text-rose-300">
                        Warning: This variant needs a restock soon. Only {currentStock} units left.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card: PRODUCT DETAILS */}
              <div className="rounded-[2.5rem] border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  <h2 className="text-xs font-black tracking-widest text-blue-600 uppercase">
                    PRODUCT DETAILS
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-bold text-slate-700">Fabric</span>
                    <span className="font-bold text-slate-900">
                      {(product as any).careInstructions || "Linen"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Fit</span>
                    <span className="font-bold text-slate-900">
                      {(product as any).productType || "Regular Fit"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Variant Inventory & Stock Control Matrix Card */}
          {variants.length > 0 && (
            <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Variant Stock & Inventory Control Matrix ({variants.length})
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500">
                      Edit stock levels inline and save all changes at once
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {Object.keys(editingStock).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingStock({})}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Reset Edits
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={Object.keys(editingStock).length === 0 || updateVariantMutation.isPending}
                    onClick={async () => {
                      const variantIdsToUpdate = Object.keys(editingStock);
                      try {
                        await Promise.all(
                          variantIdsToUpdate.map((vId) =>
                            updateVariantMutation.mutateAsync({
                              productId,
                              variantId: vId,
                              data: { stock: editingStock[vId] },
                            })
                          )
                        );
                        setEditingStock({});
                      } catch (err) {
                        console.error("Batch variant stock update failed:", err);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                  >
                    {updateVariantMutation.isPending ? (
                      <span>Saving Changes...</span>
                    ) : Object.keys(editingStock).length > 0 ? (
                      <span>Save All Changes ({Object.keys(editingStock).length})</span>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Stock Synced</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto sidebar-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/60">
                    <tr>
                      <th className="px-3 py-2.5">Variant</th>
                      <th className="px-3 py-2.5">SKU</th>
                      <th className="px-3 py-2.5">Price</th>
                      <th className="px-3 py-2.5 text-center">Stock On Hand</th>
                      <th className="px-3 py-2.5">Available Stock</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {variants.map((v: any) => {
                      const colorVal = v.variantAttributeValues?.find(
                        (vav: any) =>
                          vav.attributeValue?.attribute?.name?.toLowerCase() === "color" ||
                          vav.attributeValue?.colorHex
                      )?.attributeValue;
                      const sizeVal = v.variantAttributeValues?.find(
                        (vav: any) => vav.attributeValue?.attribute?.name?.toLowerCase() === "size"
                      )?.attributeValue;

                      const colorName = v.colorName || colorVal?.value || "Default";
                      const colorHex = v.colorHex || colorVal?.colorHex;
                      const sizeName = v.sizeName || sizeVal?.value || "";

                      const stockVal =
                        editingStock[v.id] !== undefined
                          ? editingStock[v.id]
                          : v.stockOnHand ?? v.stock ?? 0;

                      const isModified = editingStock[v.id] !== undefined;

                      return (
                        <tr
                          key={v.id}
                          className={`transition-colors ${
                            isModified ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {colorHex && (
                                <span
                                  className="h-3.5 w-3.5 rounded-md border border-black/10 shadow-2xs shrink-0"
                                  style={{ backgroundColor: colorHex }}
                                />
                              )}
                              <span className="font-bold text-slate-900">
                                {colorName} {sizeName ? `/ ${sizeName}` : ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                              {v.sku || "N/A"}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-bold text-slate-900 whitespace-nowrap">
                            ₹{Number(v.price).toLocaleString("en-IN")}
                          </td>
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
                              className={`w-24 rounded-md border px-3 py-1.5 text-center text-xs font-extrabold shadow-2xs transition focus:outline-none ${
                                isModified
                                  ? "border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-400/20"
                                  : "border-slate-300 bg-white text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10"
                              }`}
                            />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`font-extrabold ${
                                (v.stockAvailable ?? stockVal) > 0
                                  ? "text-emerald-700"
                                  : "text-rose-600"
                              }`}
                            >
                              {v.stockAvailable ?? stockVal} Units
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <StatusBadge
                              status={
                                v.stockStatus ||
                                (stockVal > 5
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

      {/* ── Tab Content: EDIT SPECIFICATIONS FORM ─────────────── */}
      {activeTab === "edit" && (
        <div className="rounded-md border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Edit Product Specifications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update product identity, pricing, categorization, and SEO
                metadata
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Cancel Editing
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
              comparePrice:
                Number((product as any).compareAtPrice) || undefined,
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
                      vav.attributeValue?.attribute?.slug === "color"
                  )?.attributeValue?.value ||
                  "Default",
                colorHex:
                  v.colorHex ||
                  v.variantAttributeValues?.find(
                    (vav: any) => vav.attributeValue?.colorHex
                  )?.attributeValue?.colorHex ||
                  "#000000",
                sizeName:
                  v.sizeName ||
                  v.variantAttributeValues?.find(
                    (vav: any) =>
                      vav.attributeValue?.attribute?.slug === "size"
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

      {/* Archive / Delete Confirmation Modal */}
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
