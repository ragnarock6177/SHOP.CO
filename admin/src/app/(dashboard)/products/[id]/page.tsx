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
} from "lucide-react";
import {
  useProductDetails,
  useUpdateProduct,
  useArchiveProduct,
} from "../../../../hooks/queries/useProducts";
import { ProductForm } from "../../../../components/forms/ProductForm";
import { ImageUploader } from "../../../../components/forms/ImageUploader";
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

  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "images">(
    "overview",
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
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

  // Active selected variant or default
  const activeVariant = useMemo(() => {
    if (selectedVariantId) {
      const found = variants.find((v: any) => v.id === selectedVariantId);
      if (found) return found;
    }
    return variants[0] || null;
  }, [variants, selectedVariantId]);

  // Unique colors extracted from variants
  const uniqueColors = useMemo(() => {
    const colorsMap = new Map<string, string | undefined>();
    for (const v of variants) {
      const vavs = v.variantAttributeValues || [];
      for (const vav of vavs) {
        const val = vav.attributeValue;
        if (val?.value) {
          const isColor =
            val.attribute?.name?.toLowerCase() === "color" ||
            val.colorHex ||
            val.attributeId?.includes("color");
          if (isColor) {
            colorsMap.set(val.value, val.colorHex || undefined);
          }
        }
      }
    }
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({
      name,
      hex,
    }));
  }, [variants]);

  // Derived images list
  const productImages = useMemo(() => {
    return product?.images || [];
  }, [product?.images]);

  // Currently displayed main image
  const displayImageUrl = useMemo(() => {
    if (productImages.length > 0) {
      return (
        productImages[selectedImageIndex]?.imageUrl ||
        productImages[0]?.imageUrl
      );
    }
    return null;
  }, [productImages, selectedImageIndex]);

  // Handle update submit
  const handleUpdate = (formData: any) => {
    const { primaryCategoryId, comparePrice, ...rest } = formData;
    updateMutation.mutate(
      {
        id: productId,
        data: {
          ...rest,
          ...(primaryCategoryId ? { categoryId: primaryCategoryId } : {}),
          ...(comparePrice !== undefined
            ? { compareAtPrice: comparePrice }
            : {}),
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
          <div className="h-7 w-48 rounded-xl animate-shimmer bg-slate-100" />
          <div className="h-3.5 w-64 rounded-md animate-shimmer bg-slate-100" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <FormSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs space-y-3">
        <p>Product not found or failed to load product details.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
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

  // Active pricing & stock (from active variant if selected)
  const currentPrice = activeVariant
    ? Number(activeVariant.price) || basePrice
    : basePrice;
  const currentStock = activeVariant
    ? Number(activeVariant.stockAvailable) || 0
    : null;
  const currentSKU = activeVariant?.sku || "Base Product (No SKU)";

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
            <span>Back to Products Catalog</span>
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status as any} />
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase border border-slate-200">
              {product.visibility}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>
              Slug:{" "}
              <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                {product.slug}
              </code>
            </span>
            <span>•</span>
            {primaryCat && (
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <Tag className="h-3 w-3 text-slate-400" /> {primaryCat.name}
              </span>
            )}
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100/80 p-1 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
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
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "edit"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Edit className="inline-block h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("images")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === "images"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ImageIcon className="inline-block h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Photos ({productImages.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsArchiveModalOpen(true)}
            className="rounded-xl border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-2xs cursor-pointer"
            title="Archive Product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Tab Content: OVERVIEW ──────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Left Column (2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Summary Card / Hero View */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Photo Viewer */}
                <div className="space-y-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xs group">
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
                      <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                        {selectedImageIndex + 1} / {productImages.length}
                      </span>
                    )}
                  </div>

                  {/* Thumbnails strip */}
                  {productImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sidebar-scrollbar">
                      {productImages.map((img: any, idx: number) => (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            selectedImageIndex === idx
                              ? "border-slate-900 ring-2 ring-slate-900/10 scale-105"
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

                {/* Info & Variants Selector */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {(product as any).productType || "General Catalog Item"}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {product.name}
                    </h2>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {(product as any).shortDescription ||
                        "No short description provided."}
                    </p>
                  </div>

                  {/* Pricing Hero */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          ₹{currentPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-semibold text-slate-400 line-through">
                            ₹{compareAtPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Base listing price per unit
                      </p>
                    </div>
                    {hasDiscount && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Color Swatches (if available) */}
                  {uniqueColors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Available Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {uniqueColors.map((col) => (
                          <div
                            key={col.name}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                          >
                            {col.hex && (
                              <span
                                className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: col.hex }}
                              />
                            )}
                            <span>{col.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Variant Selection List (if variants exist) */}
                  {variants.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Product Variants ({variants.length})
                        </label>
                        <span className="text-[11px] font-medium text-slate-500">
                          Select to preview details
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-44 overflow-y-auto sidebar-scrollbar pr-1">
                        {variants.map((v: any) => {
                          const isSelected = activeVariant?.id === v.id;
                          const attrLabel =
                            v.variantAttributeValues
                              ?.map((vav: any) => vav.attributeValue?.value)
                              .join(" / ") ||
                            v.sku ||
                            "Default Variant";

                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariantId(v.id)}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                              }`}
                            >
                              <span className="font-bold">{attrLabel}</span>
                              <div className="flex items-center gap-3">
                                <span
                                  className={
                                    isSelected
                                      ? "text-slate-300"
                                      : "text-slate-500"
                                  }
                                >
                                  SKU: {v.sku || "N/A"}
                                </span>
                                <span className="font-extrabold">
                                  ₹{Number(v.price).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Specifications Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Description & Care Instructions
                </h2>
              </div>

              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-1">
                    Detailed Description
                  </h3>
                  {product.description ? (
                    <div className="whitespace-pre-line rounded-xl bg-slate-50 p-4 border border-slate-200/60 text-slate-700">
                      {product.description}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">
                      No detailed description provided for this product.
                    </p>
                  )}
                </div>

                {(product as any).careInstructions && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 mb-1">
                      Care & Handling Instructions
                    </h3>
                    <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/80 text-amber-900 font-medium">
                      {(product as any).careInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Uploader Preview Section */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Product Images & Variant Links
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                >
                  Manage Gallery <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <ImageUploader productId={productId} variants={variants} />
            </div>
          </div>

          {/* Right Column (1 Col Sidebar) */}
          <div className="space-y-6">
            {/* Inventory & Status Activity Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Boxes className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Inventory & Listing Status
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                  <span className="text-xs font-medium text-slate-500">
                    Catalog Status
                  </span>
                  <StatusBadge status={product.status as any} />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                  <span className="text-xs font-medium text-slate-500">
                    Store Visibility
                  </span>
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    {product.visibility}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                  <span className="text-xs font-medium text-slate-500">
                    Total Variants
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    {variants.length}
                  </span>
                </div>

                {currentStock !== null && (
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                    <span className="text-xs font-medium text-slate-500">
                      Active Variant Stock
                    </span>
                    <span
                      className={`text-xs font-black ${currentStock > 0 ? "text-emerald-700" : "text-rose-600"}`}
                    >
                      {currentStock > 0
                        ? `${currentStock} Units Available`
                        : "Out of Stock"}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200/60">
                  <span className="text-xs font-medium text-slate-500">
                    Active SKU
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {currentSKU}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className="w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" /> Edit Specifications
              </button>
            </div>

            {/* Google Search Result SEO Preview Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Search className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  SEO & Search Snippet
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60 space-y-1">
                <p className="text-[11px] font-mono text-emerald-700 truncate">
                  https://airave.com/products/{product.slug}
                </p>
                <h3 className="text-sm font-bold text-blue-700 line-clamp-1 hover:underline cursor-pointer">
                  {(product as any).metaTitle || product.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                  {(product as any).metaDescription ||
                    (product as any).shortDescription ||
                    "Shop the finest collection at AIRAVÉ. Quality craftsmanship and design."}
                </p>
              </div>
            </div>

            {/* Product Meta & ID Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Product ID</span>
                <button
                  type="button"
                  onClick={copyProductId}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2 py-0.5 rounded cursor-pointer transition"
                >
                  {productId.slice(0, 8)}...
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Created On</span>
                <span className="font-bold text-slate-700">
                  {new Date(product.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  Last Modified
                </span>
                <span className="font-bold text-slate-700">
                  {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: EDIT SPECIFICATIONS FORM ─────────────── */}
      {activeTab === "edit" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
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
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Cancel Editing
            </button>
          </div>

          <ProductForm
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
            }}
            categories={categories}
            isLoading={updateMutation.isPending}
            onSubmit={handleUpdate}
            onCancel={() => setActiveTab("overview")}
          />
        </div>
      )}

      {/* ── Tab Content: GALLERY MANAGE ───────────────────────── */}
      {activeTab === "images" && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product Images & Variant Photos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload photos, set primary thumbnail, and link photos to
                specific product variants
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Back to Overview
            </button>
          </div>

          <ImageUploader productId={productId} variants={variants} />
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
