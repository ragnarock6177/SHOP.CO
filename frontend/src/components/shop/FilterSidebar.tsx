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
    <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 space-y-6 text-black shadow-xs font-be-vietnam-pro">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="font-be-vietnam-pro-black text-xl font-bold text-black flex items-center gap-2">
          <span>Filters</span>
        </h3>
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={handleReset}
              className="text-xs font-bold text-gray-500 hover:text-black underline cursor-pointer"
            >
              Reset All
            </button>
          )}
          {onCloseMobile ? (
            <button
              onClick={onCloseMobile}
              className="p-1 text-gray-400 hover:text-black transition-colors"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <SlidersHorizontal className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
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
              className={`w-full flex items-center justify-between text-sm text-left transition-colors cursor-pointer ${
                isSelected ? "font-bold text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              <span>{catName}</span>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isSelected ? "rotate-90 text-black" : ""
                }`}
              />
            </button>
          );
        })}
      </div>

      <hr className="border-gray-200" />

      {/* Price Slider */}
      <div className="space-y-4">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between font-bold text-lg text-black cursor-pointer"
        >
          <span>Price</span>
          <ChevronUp className={`w-5 h-5 transition-transform ${isPriceOpen ? "" : "rotate-180"}`} />
        </button>

        {isPriceOpen && (
          <div className="space-y-3">
            <input
              type="range"
              min={minPriceBound}
              max={maxPriceBound}
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-black bg-gray-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs font-extrabold text-black">
              <span>₹{minPriceBound}</span>
              <span>₹{priceRange.toLocaleString("en-IN")}</span>
            </div>
          </div>
        )}
      </div>

      {colorsList.length > 0 && <hr className="border-gray-200" />}

      {/* Colors Grid */}
      {colorsList.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setIsColorsOpen(!isColorsOpen)}
            className="w-full flex items-center justify-between font-bold text-lg text-black cursor-pointer"
          >
            <span>Colors</span>
            <ChevronUp className={`w-5 h-5 transition-transform ${isColorsOpen ? "" : "rotate-180"}`} />
          </button>

          {isColorsOpen && (
            <div className="grid grid-cols-5 gap-3 pt-1">
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
                    className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition-all cursor-pointer ${
                      isSelected ? "ring-2 ring-black ring-offset-2 scale-105" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${
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

      {sizesList.length > 0 && <hr className="border-gray-200" />}

      {/* Size Pills Grid */}
      {sizesList.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setIsSizesOpen(!isSizesOpen)}
            className="w-full flex items-center justify-between font-bold text-lg text-black cursor-pointer"
          >
            <span>Size</span>
            <ChevronUp className={`w-5 h-5 transition-transform ${isSizesOpen ? "" : "rotate-180"}`} />
          </button>

          {isSizesOpen && (
            <div className="flex flex-wrap gap-2 pt-1">
              {sizesList.map((sz: string) => {
                const isSelected = selectedSize.toLowerCase() === sz.toLowerCase();
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(isSelected ? "" : sz)}
                    className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-black text-white font-bold"
                        : "bg-[#F0F0F0] text-gray-700 hover:bg-gray-200"
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

      {collectionsList.length > 0 && <hr className="border-gray-200" />}

      {/* Collections List */}
      {collectionsList.length > 0 && (
        <div className="space-y-4">
          <button
            onClick={() => setIsStyleOpen(!isStyleOpen)}
            className="w-full flex items-center justify-between font-bold text-lg text-black cursor-pointer"
          >
            <span>Collections</span>
            <ChevronUp className={`w-5 h-5 transition-transform ${isStyleOpen ? "" : "rotate-180"}`} />
          </button>

          {isStyleOpen && (
            <div className="space-y-3 pt-1">
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
                    className={`w-full flex items-center justify-between text-sm text-left transition-colors cursor-pointer ${
                      isSelected ? "font-bold text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <span>{name}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${
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
          className="w-full bg-black hover:bg-gray-800 text-white font-bold text-sm py-4 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
