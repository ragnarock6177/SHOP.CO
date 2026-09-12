"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronUp, SlidersHorizontal, X, Check } from "lucide-react";
import { Category } from "@/types/ecommerce";

interface FilterSidebarProps {
  categories?: Category[];
  filterSettings?: any;
  activeFilters?: any;
  onCloseMobile?: () => void;
  onApplyFilter?: (filters: any) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories = [],
  filterSettings,
  activeFilters,
  onCloseMobile,
  onApplyFilter,
}) => {
  const maxPriceBound = filterSettings?.maxPrice || 5000;
  const minPriceBound = filterSettings?.minPrice || 10;
  
  // 100% dynamic colors from database
  const colorsList = filterSettings?.availableColors || [];
  
  // 100% dynamic sizes from database
  const sizesList = filterSettings?.availableSizes || [];
  
  // 100% dynamic collections from database
  const collectionsList = filterSettings?.collections || [];

  const categoryItems = categories.length > 0
    ? categories
    : [
        { id: "1", name: "T-Shirts", slug: "t-shirts" },
        { id: "2", name: "Shirts", slug: "shirts" },
        { id: "3", name: "Pants", slug: "pants" },
      ];

  const [selectedCategory, setSelectedCategory] = useState(activeFilters?.category || "");
  const [priceRange, setPriceRange] = useState<number>(activeFilters?.maxPrice || maxPriceBound);
  const [selectedColor, setSelectedColor] = useState<string>(activeFilters?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(activeFilters?.size || "");
  const [selectedCollection, setSelectedCollection] = useState<string>(activeFilters?.collection || activeFilters?.style || "");

  // Sync state when activeFilters change from URL parameters
  useEffect(() => {
    if (activeFilters) {
      setSelectedCategory(activeFilters.category || "");
      if (activeFilters.maxPrice !== undefined) {
        setPriceRange(activeFilters.maxPrice);
      } else {
        setPriceRange(maxPriceBound);
      }
      setSelectedColor(activeFilters.color || "");
      setSelectedSize(activeFilters.size || "");
      setSelectedCollection(activeFilters.collection || activeFilters.style || "");
    }
  }, [
    activeFilters?.category,
    activeFilters?.maxPrice,
    activeFilters?.color,
    activeFilters?.size,
    activeFilters?.collection,
    activeFilters?.style,
    maxPriceBound,
  ]);

  // Accordion toggle states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorsOpen, setIsColorsOpen] = useState(true);
  const [isSizesOpen, setIsSizesOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);

  const handleApply = () => {
    if (onApplyFilter) {
      onApplyFilter({
        category: selectedCategory,
        maxPrice: priceRange < maxPriceBound ? priceRange : undefined,
        color: selectedColor,
        size: selectedSize,
        collection: selectedCollection,
      });
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleReset = () => {
    setSelectedCategory("");
    setPriceRange(maxPriceBound);
    setSelectedColor("");
    setSelectedSize("");
    setSelectedCollection("");
    if (onApplyFilter) {
      onApplyFilter({});
    }
    if (onCloseMobile) onCloseMobile();
  };

  const isFilterActive =
    Boolean(selectedCategory) ||
    Boolean(selectedColor) ||
    Boolean(selectedSize) ||
    Boolean(selectedCollection) ||
    priceRange < maxPriceBound;

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 space-y-5 text-black shadow-xs font-be-vietnam-pro">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
          <span>Filters</span>
        </h3>
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold text-neutral-500 hover:text-black uppercase tracking-wider underline cursor-pointer"
            >
              Reset All
            </button>
          )}
          {onCloseMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-2.5">
        {categoryItems.map((cat: any) => {
          const catName = typeof cat === "string" ? cat : cat.name;
          const catSlug = typeof cat === "string" ? cat.toLowerCase().replace(/\s+/g, "-") : cat.slug;
          const isSelected =
            selectedCategory.toLowerCase() === catName.toLowerCase() ||
            selectedCategory.toLowerCase() === catSlug.toLowerCase();

          return (
            <button
              key={catSlug || catName}
              onClick={() => setSelectedCategory(isSelected ? "" : catSlug || catName)}
              className={`w-full flex items-center justify-between text-xs text-left transition-colors cursor-pointer py-0.5 ${
                isSelected ? "font-bold text-black" : "text-neutral-500 hover:text-black font-medium"
              }`}
            >
              <span>{catName}</span>
              <ChevronRight
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                  isSelected ? "rotate-90 text-black" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      <hr className="border-neutral-100" />

      {/* Price Slider */}
      <div className="space-y-3">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 cursor-pointer"
        >
          <span>Price</span>
          <ChevronUp className={`w-4 h-4 transition-transform text-neutral-500 ${isPriceOpen ? "" : "rotate-180"}`} />
        </button>

        {isPriceOpen && (
          <div className="space-y-2.5 pt-1">
            <input
              type="range"
              min={minPriceBound}
              max={maxPriceBound}
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-black bg-neutral-200 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-bold text-neutral-900">
              <span>₹{minPriceBound}</span>
              <span>₹{priceRange.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>

      {colorsList.length > 0 && <hr className="border-neutral-100" />}

      {/* Colors Grid */}
      {colorsList.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setIsColorsOpen(!isColorsOpen)}
            className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 cursor-pointer"
          >
            <span>Colors</span>
            <ChevronUp className={`w-4 h-4 transition-transform text-neutral-500 ${isColorsOpen ? "" : "rotate-180"}`} />
          </button>

          {isColorsOpen && (
            <div className="grid grid-cols-5 gap-2.5 pt-1">
              {colorsList.map((c: any) => {
                const hex = typeof c === "string" ? "#000" : c.hex;
                const name = typeof c === "string" ? c : c.name;
                const isSelected =
                  selectedColor.toLowerCase() === name.toLowerCase() ||
                  selectedColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedColor(isSelected ? "" : name)}
                    className={`w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-black ring-offset-2 scale-105" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          hex === "#FFFFFF" || hex === "#F5DD06" || hex === "#F5F5F0"
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sizesList.length > 0 && <hr className="border-neutral-100" />}

      {/* Size Pills Grid */}
      {sizesList.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setIsSizesOpen(!isSizesOpen)}
            className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 cursor-pointer"
          >
            <span>Size</span>
            <ChevronUp className={`w-4 h-4 transition-transform text-neutral-500 ${isSizesOpen ? "" : "rotate-180"}`} />
          </button>

          {isSizesOpen && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sizesList.map((sz: string) => {
                const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(isSelected ? "" : sz)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-black text-white font-bold"
                        : "bg-[#F0F0F0] text-neutral-700 hover:bg-neutral-200 font-medium"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {collectionsList.length > 0 && <hr className="border-neutral-100" />}

      {/* Collections List */}
      {collectionsList.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setIsStyleOpen(!isStyleOpen)}
            className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-neutral-900 cursor-pointer"
          >
            <span>Collections</span>
            <ChevronUp className={`w-4 h-4 transition-transform text-neutral-500 ${isStyleOpen ? "" : "rotate-180"}`} />
          </button>

          {isStyleOpen && (
            <div className="space-y-2.5 pt-1">
              {collectionsList.map((col: any) => {
                const name = typeof col === "string" ? col : col.name;
                const slug = typeof col === "string" ? col.toLowerCase().replace(/\s+/g, "-") : col.slug;
                const isSelected =
                  selectedCollection.toLowerCase() === name.toLowerCase() ||
                  selectedCollection.toLowerCase() === slug.toLowerCase();
                return (
                  <button
                    key={slug || name}
                    onClick={() => setSelectedCollection(isSelected ? "" : slug || name)}
                    className={`w-full flex items-center justify-between text-xs text-left transition-colors cursor-pointer py-0.5 ${
                      isSelected ? "font-bold text-black" : "text-neutral-500 hover:text-black font-medium"
                    }`}
                  >
                    <span>{name}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                        isSelected ? "rotate-90 text-black" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply Filter Button */}
      <div className="pt-2">
        <button
          onClick={handleApply}
          className="w-full bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
