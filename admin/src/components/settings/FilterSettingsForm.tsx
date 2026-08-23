"use client";

import React, { useState } from "react";
import { updateSettingsGroup } from "@/lib/settingsApi";
import { CheckCircle2, AlertCircle, Save, Plus, Trash2 } from "lucide-react";

export interface FilterSettingsData {
  maxPrice: number;
  enablePriceFilter: boolean;
  enableCategoryFilter: boolean;
  enableColorFilter: boolean;
  enableSizeFilter: boolean;
  enableDressStyleFilter: boolean;
  availableColors: Array<{ name: string; hex: string }>;
  availableSizes: string[];
  dressStyles: Array<{ name: string; slug: string }>;
}

interface FilterSettingsFormProps {
  initialData?: FilterSettingsData;
  onSaved?: () => void;
}

export function FilterSettingsForm({ initialData, onSaved }: FilterSettingsFormProps) {
  const [formData, setFormData] = useState<FilterSettingsData>({
    maxPrice: initialData?.maxPrice || 500,
    enablePriceFilter: initialData?.enablePriceFilter ?? true,
    enableCategoryFilter: initialData?.enableCategoryFilter ?? true,
    enableColorFilter: initialData?.enableColorFilter ?? true,
    enableSizeFilter: initialData?.enableSizeFilter ?? true,
    enableDressStyleFilter: initialData?.enableDressStyleFilter ?? true,
    availableColors: initialData?.availableColors || [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Gray", hex: "#808080" },
      { name: "Navy", hex: "#000080" },
      { name: "Olive", hex: "#556B2F" },
      { name: "Red", hex: "#FF0000" },
    ],
    availableSizes: initialData?.availableSizes || ["Small", "Medium", "Large", "X-Large"],
    dressStyles: initialData?.dressStyles || [
      { name: "Casual", slug: "casual" },
      { name: "Formal", slug: "formal" },
      { name: "Party", slug: "party" },
      { name: "Gym", slug: "gym" },
    ],
  });

  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newSize, setNewSize] = useState("");
  const [newStyleName, setNewStyleName] = useState("");
  const [newStyleSlug, setNewStyleSlug] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateSettingsGroup("filters", "catalog", formData);
      setMessage({ type: "success", text: "Storefront catalog filter settings saved successfully!" });
      if (onSaved) onSaved();
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.error?.message || "Failed to update filter settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      availableColors: [...prev.availableColors, { name: newColorName.trim(), hex: newColorHex }],
    }));
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableColors: prev.availableColors.filter((_, i) => i !== index),
    }));
  };

  const handleAddSize = () => {
    if (!newSize.trim()) return;
    setFormData((prev) => ({
      ...prev,
      availableSizes: [...prev.availableSizes, newSize.trim()],
    }));
    setNewSize("");
  };

  const handleRemoveSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      availableSizes: prev.availableSizes.filter((_, i) => i !== index),
    }));
  };

  const handleAddStyle = () => {
    if (!newStyleName.trim()) return;
    const slug = newStyleSlug.trim() || newStyleName.toLowerCase().replace(/[^a-z0-9_]/g, "-");
    setFormData((prev) => ({
      ...prev,
      dressStyles: [...prev.dressStyles, { name: newStyleName.trim(), slug }],
    }));
    setNewStyleName("");
    setNewStyleSlug("");
  };

  const handleRemoveStyle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      dressStyles: prev.dressStyles.filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-base font-bold text-slate-900">Catalog Filter Customization</h2>
        <p className="text-xs text-slate-500 mt-0.5">Control storefront filter visibility, price bounds, color palettes, sizes, and dress styles</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Visibility Toggles */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-900 block">Filter Facet Toggles</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Price Range Filter</span>
            <input
              type="checkbox"
              checked={formData.enablePriceFilter}
              onChange={(e) => setFormData((prev) => ({ ...prev, enablePriceFilter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Category Filter</span>
            <input
              type="checkbox"
              checked={formData.enableCategoryFilter}
              onChange={(e) => setFormData((prev) => ({ ...prev, enableCategoryFilter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Color Swatch Filter</span>
            <input
              type="checkbox"
              checked={formData.enableColorFilter}
              onChange={(e) => setFormData((prev) => ({ ...prev, enableColorFilter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Size Chips Filter</span>
            <input
              type="checkbox"
              checked={formData.enableSizeFilter}
              onChange={(e) => setFormData((prev) => ({ ...prev, enableSizeFilter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white shadow-2xs">
            <span className="text-xs font-semibold text-slate-800">Dress Style Filter</span>
            <input
              type="checkbox"
              checked={formData.enableDressStyleFilter}
              onChange={(e) => setFormData((prev) => ({ ...prev, enableDressStyleFilter: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Max Price Bound */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
        <label htmlFor="maxPrice" className="text-xs font-semibold text-slate-700">
          Storefront Price Slider Maximum Upper Bound (₹ / $) <span className="text-rose-500">*</span>
        </label>
        <input
          id="maxPrice"
          type="number"
          min={10}
          max={100000}
          value={formData.maxPrice}
          onChange={(e) => setFormData((prev) => ({ ...prev, maxPrice: parseFloat(e.target.value) || 500 }))}
          className="w-full sm:w-64 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-2xs"
          required
        />
      </div>

      {/* Available Colors Manager */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80">
        <span className="text-xs font-bold text-slate-900 block">Available Color Swatches</span>
        
        <div className="flex flex-wrap gap-2">
          {formData.availableColors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs shadow-2xs">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: color.hex }} />
              <span className="font-semibold text-slate-800">{color.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveColor(idx)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Color Name (e.g. Navy)"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none w-40"
          />
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="h-9 w-10 rounded-xl border border-slate-200 p-0.5 bg-white cursor-pointer"
          />
          <button
            type="button"
            onClick={handleAddColor}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Color</span>
          </button>
        </div>
      </div>

      {/* Available Sizes Manager */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80">
        <span className="text-xs font-bold text-slate-900 block">Available Size Chips</span>
        
        <div className="flex flex-wrap gap-2">
          {formData.availableSizes.map((size, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs shadow-2xs">
              <span className="font-semibold text-slate-800">{size}</span>
              <button
                type="button"
                onClick={() => handleRemoveSize(idx)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Size Label (e.g. XX-Large)"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none w-48"
          />
          <button
            type="button"
            onClick={handleAddSize}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Size</span>
          </button>
        </div>
      </div>

      {/* Dress Styles / Collections Manager */}
      <div className="space-y-3 pt-2 border-t border-slate-200/80">
        <span className="text-xs font-bold text-slate-900 block">Dress Styles / Collection Chips</span>
        
        <div className="flex flex-wrap gap-2">
          {formData.dressStyles.map((style, idx) => (
            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/80 bg-white text-xs shadow-2xs">
              <span className="font-bold text-slate-900">{style.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({style.slug})</span>
              <button
                type="button"
                onClick={() => handleRemoveStyle(idx)}
                className="text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Style Name (e.g. Casual)"
            value={newStyleName}
            onChange={(e) => setNewStyleName(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none w-40"
          />
          <input
            type="text"
            placeholder="Slug (optional)"
            value={newStyleSlug}
            onChange={(e) => setNewStyleSlug(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none w-36 font-mono"
          />
          <button
            type="button"
            onClick={handleAddStyle}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Style</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-200/80">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Catalog Filters"}</span>
        </button>
      </div>
    </form>
  );
}
