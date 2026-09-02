"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Palette, Ruler, Layers, RefreshCw } from "lucide-react";
import { ProductVariantInput } from "@/validators/product.validator";
import { StagedImageItem } from "./ImageUploader";
import { ColorGroupImageUploader } from "./ColorGroupImageUploader";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface VariantBuilderProps {
  productId?: string;
  productName?: string;
  basePrice?: number;
  variants: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
  stagedImages?: StagedImageItem[];
  onStagedImagesChange?: (images: StagedImageItem[]) => void;
}

const PRESET_COLORS: ColorOption[] = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#0A192F" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#10B981" },
  { name: "Beige", hex: "#E5D9C5" },
  { name: "Heather Gray", hex: "#9CA3AF" },
];

const PRESET_SIZES = ["S", "M", "L", "XL", "XXL"];

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
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newSizeName, setNewSizeName] = useState("");

  // Extract initial unique colors and sizes if editing existing variants
  useEffect(() => {
    if (variants && variants.length > 0 && colors.length === 0 && sizes.length === 0) {
      const extractedColorsMap = new Map<string, string>();
      const extractedSizesSet = new Set<string>();

      variants.forEach((v) => {
        if (v.colorName) {
          extractedColorsMap.set(v.colorName, v.colorHex || "#000000");
        }
        if (v.sizeName) {
          extractedSizesSet.add(v.sizeName);
        }
      });

      if (extractedColorsMap.size > 0) {
        setColors(Array.from(extractedColorsMap.entries()).map(([name, hex]) => ({ name, hex })));
      }
      if (extractedSizesSet.size > 0) {
        setSizes(Array.from(extractedSizesSet));
      }
    }
  }, [variants]);

  // Generate SKU
  const generateSku = (colorName: string, sizeName: string, index: number) => {
    const code = slugifyCode(productName);
    const colorCode = slugifyCode(colorName);
    const sizeCode = slugifyCode(sizeName);
    return `${code}-${colorCode}-${sizeCode}`;
  };

  // Add Color
  const handleAddColor = (color: ColorOption) => {
    if (!color.name.trim()) return;
    if (colors.some((c) => c.name.toLowerCase() === color.name.trim().toLowerCase())) return;

    const updatedColors = [...colors, { name: color.name.trim(), hex: color.hex || "#000000" }];
    setColors(updatedColors);
    syncMatrix(updatedColors, sizes);
    setNewColorName("");
  };

  const handleRemoveColor = (colorName: string) => {
    const updatedColors = colors.filter((c) => c.name !== colorName);
    setColors(updatedColors);
    syncMatrix(updatedColors, sizes);
  };

  // Add Size
  const handleAddSize = (sizeName: string) => {
    const trimmed = sizeName.trim().toUpperCase();
    if (!trimmed || sizes.includes(trimmed)) return;

    const updatedSizes = [...sizes, trimmed];
    setSizes(updatedSizes);
    syncMatrix(colors, updatedSizes);
    setNewSizeName("");
  };

  const handleRemoveSize = (sizeName: string) => {
    const updatedSizes = sizes.filter((s) => s !== sizeName);
    setSizes(updatedSizes);
    syncMatrix(colors, updatedSizes);
  };

  // Synchronize combinations matrix
  const syncMatrix = (currentColors: ColorOption[], currentSizes: string[]) => {
    if (currentColors.length === 0 || currentSizes.length === 0) {
      onChange([]);
      return;
    }

    const newVariants: ProductVariantInput[] = [];
    let idx = 0;

    currentColors.forEach((color) => {
      currentSizes.forEach((size) => {
        const existing = variants.find(
          (v) => v.colorName?.toLowerCase() === color.name.toLowerCase() && v.sizeName?.toLowerCase() === size.toLowerCase()
        );

        if (existing) {
          newVariants.push({
            ...existing,
            colorHex: color.hex,
            id: existing.id || generateValidUuid(),
          });
        } else {
          newVariants.push({
            id: generateValidUuid(),
            sku: generateSku(color.name, size, idx),
            colorName: color.name,
            colorHex: color.hex,
            sizeName: size,
            price: Number(basePrice) || 0,
            compareAtPrice: null,
            stock: 10,
            isActive: true,
          });
        }
        idx++;
      });
    });

    onChange(newVariants);
  };

  // Inline Variant Update
  const updateVariantItem = (id: string, field: keyof ProductVariantInput, value: any) => {
    onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const removeSingleVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const handleApplyBasePriceToAll = () => {
    onChange(variants.map((v) => ({ ...v, price: Number(basePrice) || 0 })));
  };

  return (
    <div className="space-y-6">
      
      {/* ── STEP 1 & 2: Colors and Sizes Selection (Matrix Builder) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Colors Selection */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-700" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Select Colors</h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <div
                key={c.name}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span>{c.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColor(c.name)}
                  className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_COLORS.filter((pc) => !colors.some((c) => c.name === pc.name)).map((pc) => (
                <button
                  key={pc.name}
                  type="button"
                  onClick={() => handleAddColor(pc)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {pc.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 p-0.5"
              />
              <input
                type="text"
                placeholder="Custom color..."
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColor({ name: newColorName, hex: newColorHex });
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddColor({ name: newColorName, hex: newColorHex })}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Sizes Selection */}
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-slate-700" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Select Sizes</h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <div
                key={s}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(s)}
                  className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESET_SIZES.filter((ps) => !sizes.includes(ps)).map((ps) => (
                <button
                  key={ps}
                  type="button"
                  onClick={() => handleAddSize(ps)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  {ps}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Custom size..."
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSize(newSizeName);
                  }
                }}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-400 focus:ring-1 focus:ring-slate-400 uppercase"
              />
              <button
                type="button"
                onClick={() => handleAddSize(newSizeName)}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEP 3: Automatically Generated Color Groups ── */}
      {colors.length > 0 && sizes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Variant Images & Details</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Variations have been grouped by color. Upload an image for each color group.
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyBasePriceToAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              <RefreshCw className="h-3 w-3" />
              Sync Base Price
            </button>
          </div>

          <div className="space-y-6">
            {colors.map((color) => {
              const colorVariants = variants.filter((v) => v.colorName === color.name);
              const variantIds = colorVariants.map((v) => v.id).filter(Boolean) as string[];

              if (colorVariants.length === 0) return null;

              return (
                <div key={color.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                    <span className="h-4 w-4 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: color.hex }} />
                    <h3 className="text-base font-bold text-slate-900">Color: {color.name}</h3>
                  </div>

                  {/* Group Content: Image Left, Variations Right */}
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    
                    {/* Left: Dedicated Color Image Uploader */}
                    <div className="w-full md:w-auto">
                      <ColorGroupImageUploader
                        productId={productId}
                        colorLabel={color.name}
                        variantIds={variantIds}
                        stagedImages={stagedImages}
                        onStagedImagesChange={onStagedImagesChange}
                      />
                    </div>

                    {/* Right: Stack of sizes for this color */}
                    <div className="flex-1 w-full space-y-3">
                      {colorVariants.map((v) => (
                        <div key={v.id} className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300">
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-6">
                            {/* Size */}
                            <div className="col-span-2 md:col-span-4 flex items-center justify-between mb-1">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800">
                                Size: {v.sizeName}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeSingleVariant(v.id!)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div>
                              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={Number.isNaN(v.price as any) ? "" : (v.price ?? "")}
                                onChange={(e) => updateVariantItem(v.id!, "price", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white"
                              />
                            </div>

                            {/* Sale Price */}
                            <div>
                              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Sale Price</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={v.compareAtPrice === null || Number.isNaN(v.compareAtPrice as any) ? "" : v.compareAtPrice}
                                onChange={(e) => updateVariantItem(v.id!, "compareAtPrice", e.target.value === "" ? null : parseFloat(e.target.value))}
                                placeholder="Optional"
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white"
                              />
                            </div>

                            {/* Stock */}
                            <div>
                              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Stock</label>
                              <input
                                type="number"
                                min="0"
                                value={Number.isNaN(v.stock as any) ? "" : (v.stock ?? "")}
                                onChange={(e) => updateVariantItem(v.id!, "stock", e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 bg-white"
                              />
                            </div>

                            {/* SKU */}
                            <div>
                              <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">SKU</label>
                              <input
                                type="text"
                                value={v.sku}
                                onChange={(e) => updateVariantItem(v.id!, "sku", e.target.value)}
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
