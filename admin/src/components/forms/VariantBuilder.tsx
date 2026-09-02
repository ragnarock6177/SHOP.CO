"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Palette,
  Ruler,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Boxes,
} from "lucide-react";
import { ProductVariantInput } from "@/validators/product.validator";
import { StagedImageItem } from "./ImageUploader";
import { ColorGroupImageUploader } from "./ColorGroupImageUploader";
import { CustomSelect, SelectOption } from "@/components/ui/select";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";

export interface VariantBuilderProps {
  productId?: string;
  productName?: string;
  basePrice?: number;
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
  stagedImages?: StagedImageItem[];
  onStagedImagesChange?: (images: StagedImageItem[]) => void;
}

interface AttributeValueItem {
  id: string;
  value: string;
  slug: string;
  colorHex?: string | null;
}

interface AttributeItem {
  id: string;
  name: string;
  slug: string;
  isVariantAttribute: boolean;
  values?: AttributeValueItem[];
}

const DEFAULT_FALLBACK_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#0A192F" },
  { name: "Heather Gray", hex: "#9CA3AF" },
  { name: "Beige", hex: "#E5D9C5" },
  { name: "Olive", hex: "#556B2F" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Green", hex: "#10B981" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#8B5CF6" },
];

const DEFAULT_FALLBACK_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "One Size",
];

function slugifyCode(str: string): string {
  return (str || "PROD")
    .toUpperCase()
    .replace(/[^\w]/g, "")
    .slice(0, 8);
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

export const VariantBuilder: React.FC<VariantBuilderProps> = ({
  productId,
  productName = "",
  basePrice = 0,
  variants,
  onChange,
  stagedImages,
  onStagedImagesChange,
}) => {
  // Fetch dynamic attributes from API
  const { data: rawAttributes } = useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>("/admin/attributes");
        const list = res.data?.data?.data || res.data?.data || res.data || [];
        return Array.isArray(list) ? (list as AttributeItem[]) : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Safe attributes list
  const attributesList: AttributeItem[] = useMemo(() => {
    if (Array.isArray(rawAttributes)) return rawAttributes;
    if (rawAttributes && Array.isArray((rawAttributes as any).data)) {
      return (rawAttributes as any).data;
    }
    if (rawAttributes && Array.isArray((rawAttributes as any).data?.data)) {
      return (rawAttributes as any).data.data;
    }
    return [];
  }, [rawAttributes]);

  // Extract Colors from API attributes
  const apiColors = useMemo(() => {
    const colorAttr = attributesList.find(
      (a) => a.slug === "color" || a.name?.toLowerCase() === "color",
    );
    if (colorAttr && colorAttr.values && colorAttr.values.length > 0) {
      return colorAttr.values.map((v) => ({
        name: v.value,
        hex: v.colorHex || "#000000",
      }));
    }
    return DEFAULT_FALLBACK_COLORS;
  }, [attributesList]);

  // Extract Sizes from API attributes
  const apiSizes = useMemo(() => {
    const sizeAttr = attributesList.find(
      (a) => a.slug === "size" || a.name?.toLowerCase() === "size",
    );
    if (sizeAttr && sizeAttr.values && sizeAttr.values.length > 0) {
      return sizeAttr.values.map((v) => v.value);
    }
    return DEFAULT_FALLBACK_SIZES;
  }, [attributesList]);

  // Options for CustomSelect dropdowns
  const colorSelectOptions: SelectOption[] = useMemo(() => {
    const opts = apiColors.map((c) => ({
      value: c.name,
      label: c.name,
    }));
    opts.push({ value: "CUSTOM", label: "Custom Color..." });
    return opts;
  }, [apiColors]);

  const sizeSelectOptions: SelectOption[] = useMemo(() => {
    const opts = apiSizes.map((s) => ({
      value: s,
      label: s,
    }));
    opts.push({ value: "CUSTOM", label: "Custom Size..." });
    return opts;
  }, [apiSizes]);

  const [showAddForm, setShowAddForm] = useState(variants.length === 0);
  const [showColorImages, setShowColorImages] = useState(false);

  // Single Add Form State
  const [selectedColorPreset, setSelectedColorPreset] = useState<string>(
    apiColors[0]?.name || "Black",
  );
  const [customColorName, setCustomColorName] = useState("");
  const [colorHex, setColorHex] = useState(apiColors[0]?.hex || "#000000");

  const [selectedSizePreset, setSelectedSizePreset] = useState<string>(apiSizes[0] || "M");
  const [customSizeName, setCustomSizeName] = useState("");

  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState<number | string>(basePrice || 0);
  const [newComparePrice, setNewComparePrice] = useState<number | string>("");
  const [newStock, setNewStock] = useState<number>(10);

  // Resolved current color & size names
  const activeColorName =
    selectedColorPreset === "CUSTOM" ? customColorName : selectedColorPreset;
  const activeSizeName =
    selectedSizePreset === "CUSTOM" ? customSizeName : selectedSizePreset;

  // Helper to generate SKU
  const createSku = (cName: string, sName: string) => {
    const prodCode = slugifyCode(productName);
    const colorCode = slugifyCode(cName);
    const sizeCode = slugifyCode(sName);
    return `${prodCode}-${colorCode || "COL"}-${sizeCode || "SZ"}`;
  };

  // Handle color dropdown change
  const handleColorDropdownChange = (val: string) => {
    setSelectedColorPreset(val);
    if (val !== "CUSTOM") {
      const match = apiColors.find((c) => c.name.toLowerCase() === val.toLowerCase());
      if (match) {
        setColorHex(match.hex);
      }
    }
  };

  // Add Single Variant
  const handleAddSingleVariant = () => {
    const finalColor = activeColorName.trim();
    const finalSize = activeSizeName.trim().toUpperCase();

    if (!finalColor || !finalSize) return;

    const skuToUse = newSku.trim() || createSku(finalColor, finalSize);
    const finalPrice = Number(newPrice) || Number(basePrice) || 0;
    const finalComparePrice =
      newComparePrice !== "" && !isNaN(Number(newComparePrice)) ? Number(newComparePrice) : null;

    const newVariant: ProductVariantInput = {
      id: generateValidUuid(),
      sku: skuToUse.toUpperCase(),
      colorName: finalColor,
      colorHex: colorHex || "#000000",
      sizeName: finalSize,
      price: finalPrice,
      compareAtPrice: finalComparePrice,
      stock: Number(newStock) || 0,
      isActive: true,
    };

    onChange([...variants, newVariant]);
    // Reset form fields
    setSelectedColorPreset(apiColors[0]?.name || "Black");
    setColorHex(apiColors[0]?.hex || "#000000");
    setCustomColorName("");
    setSelectedSizePreset(apiSizes[0] || "M");
    setCustomSizeName("");
    setNewSku("");
    setNewPrice(basePrice || 0);
    setNewComparePrice("");
    setNewStock(10);
  };

  // Inline table update
  const updateVariantItem = (id: string, field: keyof ProductVariantInput, value: any) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // Remove Single Variant
  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  // Sync Base Price to all
  const handleApplyBasePriceToAll = () => {
    onChange(variants.map((v) => ({ ...v, price: Number(basePrice) || 0 })));
  };

  // Unique Color Groups for optional image upload
  const uniqueColorGroups = React.useMemo(() => {
    const map = new Map<string, { name: string; hex?: string | null; variantIds: string[] }>();
    variants.forEach((v) => {
      if (!v.colorName) return;
      if (!map.has(v.colorName)) {
        map.set(v.colorName, { name: v.colorName, hex: v.colorHex, variantIds: [] });
      }
      if (v.id) {
        map.get(v.colorName)!.variantIds.push(v.id);
      }
    });
    return Array.from(map.values());
  }, [variants]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Product Variants</h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                {variants.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Select colors &amp; sizes from attributes, or add custom values
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variants.length > 0 && (
            <button
              type="button"
              onClick={handleApplyBasePriceToAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
              title="Apply product base price to all variants"
            >
              <RefreshCw className="h-3 w-3 text-slate-500" />
              Sync Base Price
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer",
              showAddForm
                ? "bg-slate-900 text-white"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? "Hide Add Form" : "Add Variant"}
          </button>
        </div>
      </div>

      {/* ── SIMPLE ADD VARIANT FORM (CONSISTENT DROPDOWNS + CUSTOM SIDE BY SIDE) ── */}
      {showAddForm && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add New Variant Option
            </h4>
            <span className="text-[11px] text-slate-500">
              Select attributes or enter custom values
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── COLOR DROPDOWN + CUSTOM COLOR BESIDE IT ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Palette className="h-3.5 w-3.5 text-slate-500" />
                Color Option
              </label>

              <div className="flex items-center gap-2">
                {/* CustomSelect Component for consistent UI */}
                <CustomSelect
                  value={selectedColorPreset}
                  onChange={handleColorDropdownChange}
                  options={colorSelectOptions}
                  className="w-44 shrink-0"
                  triggerClassName="w-full h-10 px-3 text-xs"
                />

                {/* Color Picker Swatch (Beside Dropdown) */}
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-10 w-11 cursor-pointer rounded-md border border-slate-200 p-1 bg-white shrink-0 shadow-2xs"
                  title="Choose exact color hex"
                />

                {/* Custom Color Name Input (Beside Dropdown) */}
                <input
                  type="text"
                  placeholder={
                    selectedColorPreset === "CUSTOM"
                      ? "Type custom color..."
                      : "Color label..."
                  }
                  value={
                    selectedColorPreset === "CUSTOM" ? customColorName : selectedColorPreset
                  }
                  onChange={(e) => {
                    setSelectedColorPreset("CUSTOM");
                    setCustomColorName(e.target.value);
                  }}
                  className="flex-1 min-w-0 h-10 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* ── SIZE DROPDOWN + CUSTOM SIZE BESIDE IT ── */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Ruler className="h-3.5 w-3.5 text-slate-500" />
                Size Option
              </label>

              <div className="flex items-center gap-2">
                {/* CustomSelect Component for consistent UI */}
                <CustomSelect
                  value={selectedSizePreset}
                  onChange={(val) => setSelectedSizePreset(val)}
                  options={sizeSelectOptions}
                  className="w-44 shrink-0"
                  triggerClassName="w-full h-10 px-3 text-xs"
                />

                {/* Custom Size Name Input (Beside Dropdown) */}
                <input
                  type="text"
                  placeholder={
                    selectedSizePreset === "CUSTOM"
                      ? "Type custom size (e.g. UK 8)..."
                      : "Size value..."
                  }
                  value={
                    selectedSizePreset === "CUSTOM" ? customSizeName : selectedSizePreset
                  }
                  onChange={(e) => {
                    setSelectedSizePreset("CUSTOM");
                    setCustomSizeName(e.target.value.toUpperCase());
                  }}
                  className="flex-1 min-w-0 h-10 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none uppercase"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing, SKU & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Compare Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional"
                value={newComparePrice}
                onChange={(e) => setNewComparePrice(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={newStock}
                onChange={(e) => setNewStock(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-emerald-700 shadow-2xs focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                SKU (Auto or Custom)
              </label>
              <input
                type="text"
                placeholder={createSku(activeColorName, activeSizeName)}
                value={newSku}
                onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAddSingleVariant}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Variant to List
            </button>
          </div>
        </div>
      )}

      {/* ── VARIANTS TABLE (DROPDOWNS + INLINE EDITING) ── */}
      {variants.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No Variants Created Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Use the color &amp; size dropdowns above to add variants for this product.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Variant
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto sidebar-scrollbar border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs min-w-160">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3">Color (Dropdown &amp; Swatch)</th>
                  <th className="px-3.5 py-3">Size (Dropdown)</th>
                  <th className="px-3.5 py-3">SKU</th>
                  <th className="px-3.5 py-3">Price (₹)</th>
                  <th className="px-3.5 py-3">Compare Price (₹)</th>
                  <th className="px-3.5 py-3">Stock</th>
                  <th className="px-3.5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {variants.map((v) => {
                  const isPresetColor = apiColors.some(
                    (pc) => pc.name.toLowerCase() === (v.colorName || "").toLowerCase(),
                  );
                  const isPresetSize = apiSizes.includes(v.sizeName || "");

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Color Dropdown + Swatch + Custom Name */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {/* Color Picker Swatch */}
                          <input
                            type="color"
                            value={v.colorHex || "#000000"}
                            onChange={(e) => updateVariantItem(v.id!, "colorHex", e.target.value)}
                            className="h-8 w-8 rounded-md border border-slate-200 p-0.5 cursor-pointer shrink-0 shadow-2xs"
                            title="Change color hex swatch"
                          />

                          {/* Color Dropdown */}
                          <CustomSelect
                            value={isPresetColor ? v.colorName : "CUSTOM"}
                            onChange={(val) => {
                              if (val !== "CUSTOM") {
                                const match = apiColors.find(
                                  (c) => c.name.toLowerCase() === val.toLowerCase(),
                                );
                                onChange(
                                  variants.map((item) =>
                                    item.id === v.id
                                      ? {
                                          ...item,
                                          colorName: val,
                                          colorHex: match?.hex || item.colorHex,
                                        }
                                      : item,
                                  ),
                                );
                              }
                            }}
                            options={colorSelectOptions}
                            className="w-32"
                            triggerClassName="h-8 px-2 text-xs"
                          />

                          {/* Custom Color Name Beside Dropdown */}
                          {!isPresetColor && (
                            <input
                              type="text"
                              value={v.colorName}
                              onChange={(e) =>
                                updateVariantItem(v.id!, "colorName", e.target.value)
                              }
                              placeholder="Color name"
                              className="w-24 h-8 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-900 focus:border-slate-500 focus:outline-none"
                            />
                          )}
                        </div>
                      </td>

                      {/* Size Dropdown */}
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <CustomSelect
                            value={isPresetSize ? v.sizeName : "CUSTOM"}
                            onChange={(val) => {
                              if (val !== "CUSTOM") {
                                updateVariantItem(v.id!, "sizeName", val);
                              }
                            }}
                            options={sizeSelectOptions}
                            className="w-28"
                            triggerClassName="h-8 px-2 text-xs font-bold"
                          />

                          {!isPresetSize && (
                            <input
                              type="text"
                              value={v.sizeName}
                              onChange={(e) =>
                                updateVariantItem(
                                  v.id!,
                                  "sizeName",
                                  e.target.value.toUpperCase(),
                                )
                              }
                              placeholder="Size"
                              className="w-16 h-8 rounded-md border border-slate-300 px-2 text-xs font-bold text-slate-900 focus:border-slate-500 focus:outline-none uppercase text-center"
                            />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-3.5 py-2.5">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) =>
                            updateVariantItem(v.id!, "sku", e.target.value.toUpperCase())
                          }
                          className="w-36 h-8 rounded-md border border-slate-300 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-500 focus:outline-none uppercase"
                        />
                      </td>

                      {/* Price */}
                      <td className="px-3.5 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={Number.isNaN(v.price as any) ? "" : (v.price ?? "")}
                          onChange={(e) =>
                            updateVariantItem(
                              v.id!,
                              "price",
                              e.target.value === "" ? 0 : parseFloat(e.target.value),
                            )
                          }
                          className="w-24 h-8 rounded-md border border-slate-300 px-2.5 text-xs font-bold text-slate-900 focus:border-slate-500 focus:outline-none"
                        />
                      </td>

                      {/* Compare Price */}
                      <td className="px-3.5 py-2.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Optional"
                          value={
                            v.compareAtPrice === null || Number.isNaN(v.compareAtPrice as any)
                              ? ""
                              : v.compareAtPrice
                          }
                          onChange={(e) =>
                            updateVariantItem(
                              v.id!,
                              "compareAtPrice",
                              e.target.value === "" ? null : parseFloat(e.target.value),
                            )
                          }
                          className="w-24 h-8 rounded-md border border-slate-300 px-2.5 text-xs font-medium text-slate-600 focus:border-slate-500 focus:outline-none"
                        />
                      </td>

                      {/* Stock */}
                      <td className="px-3.5 py-2.5">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={Number.isNaN(v.stock as any) ? "" : (v.stock ?? "")}
                          onChange={(e) =>
                            updateVariantItem(
                              v.id!,
                              "stock",
                              e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                            )
                          }
                          className="w-20 h-8 rounded-md border border-slate-300 px-2 text-xs font-bold text-emerald-700 focus:border-slate-500 focus:outline-none text-center"
                        />
                      </td>

                      {/* Action Delete */}
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id!)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Optional Color Group Images Toggle */}
          {uniqueColorGroups.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowColorImages((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                {showColorImages ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span>Color Images Gallery ({uniqueColorGroups.length} Colors)</span>
              </button>

              {showColorImages && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  {uniqueColorGroups.map((cg) => (
                    <div
                      key={cg.name}
                      className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        {cg.hex && (
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: cg.hex }}
                          />
                        )}
                        <span className="text-xs font-bold text-slate-900">{cg.name}</span>
                      </div>
                      <ColorGroupImageUploader
                        productId={productId}
                        colorLabel={cg.name}
                        variantIds={cg.variantIds}
                        stagedImages={stagedImages}
                        onStagedImagesChange={onStagedImagesChange}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
