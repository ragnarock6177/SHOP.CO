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
  const maxPriceBound = filterSettings?.maxPrice || 500;
  const colorsList = filterSettings?.availableColors || [
    { name: "Green", hex: "#00C12B" },
    { name: "Red", hex: "#F50606" },
    { name: "Yellow", hex: "#F5DD06" },
    { name: "Orange", hex: "#F57906" },
    { name: "Cyan", hex: "#06CAF5" },
    { name: "Blue", hex: "#063AF5" },
    { name: "Purple", hex: "#7D06F5" },
    { name: "Pink", hex: "#F506A4" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#000000" },
  ];
  const sizesList = filterSettings?.availableSizes || [
    "XX-Small",
    "X-Small",
    "Small",
    "Medium",
    "Large",
    "X-Large",
    "XX-Large",
    "3X-Large",
  ];
  const stylesList = filterSettings?.dressStyles || [
    { name: "Casual", slug: "casual" },
    { name: "Formal", slug: "formal" },
    { name: "Party", slug: "party" },
    { name: "Gym", slug: "gym" },
  ];

  const categoryNames = categories.length > 0 ? categories.map((c) => c.name) : ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];

  const [selectedCategory, setSelectedCategory] = useState(activeFilters?.category || "");
  const [priceRange, setPriceRange] = useState<number>(activeFilters?.maxPrice || maxPriceBound);
  const [selectedColor, setSelectedColor] = useState<string>(activeFilters?.color || "");
  const [selectedSize, setSelectedSize] = useState<string>(activeFilters?.size || "");
  const [selectedStyle, setSelectedStyle] = useState<string>(activeFilters?.style || "");

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
      setSelectedStyle(activeFilters.style || "");
    }
  }, [
    activeFilters?.category,
    activeFilters?.maxPrice,
    activeFilters?.color,
    activeFilters?.size,
    activeFilters?.style,
    maxPriceBound,
  ]);

  // Accordion toggle states
  const [isPriceOpen, setIsPriceOpen] = useState(filterSettings?.enablePriceFilter ?? true);
  const [isColorsOpen, setIsColorsOpen] = useState(filterSettings?.enableColorFilter ?? true);
  const [isSizesOpen, setIsSizesOpen] = useState(filterSettings?.enableSizeFilter ?? true);
  const [isStyleOpen, setIsStyleOpen] = useState(filterSettings?.enableDressStyleFilter ?? true);

  const handleApply = () => {
    if (onApplyFilter) {
      onApplyFilter({
        category: selectedCategory,
        maxPrice: priceRange < maxPriceBound ? priceRange : undefined,
        color: selectedColor,
        size: selectedSize,
        style: selectedStyle,
      });
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleReset = () => {
    setSelectedCategory("");
    setPriceRange(maxPriceBound);
    setSelectedColor("");
    setSelectedSize("");
    setSelectedStyle("");
    if (onApplyFilter) {
      onApplyFilter({});
    }
    if (onCloseMobile) onCloseMobile();
  };

  const isFilterActive =
    selectedCategory ||
    selectedColor ||
    selectedSize ||
    selectedStyle ||
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
      {(filterSettings?.enableCategoryFilter ?? true) && (
        <div className="space-y-3">
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory.toLowerCase() === cat.toLowerCase() ? "" : cat)}
              className={`w-full flex items-center justify-between text-sm text-left transition-colors cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase() ? "font-bold text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              <span>{cat}</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedCategory.toLowerCase() === cat.toLowerCase() ? "rotate-90 text-black" : ""}`} />
            </button>
          ))}
        </div>
      )}

      {(filterSettings?.enablePriceFilter ?? true) && <hr className="border-gray-200" />}

      {/* Price Slider */}
      {(filterSettings?.enablePriceFilter ?? true) && (
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
                min="10"
                max={maxPriceBound}
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-black bg-gray-200 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs font-extrabold text-black">
                <span>₹10</span>
                <span>₹{priceRange}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {(filterSettings?.enableColorFilter ?? true) && <hr className="border-gray-200" />}

      {/* Colors Grid */}
      {(filterSettings?.enableColorFilter ?? true) && (
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
                const isSelected = selectedColor.toLowerCase() === name.toLowerCase() || selectedColor.toLowerCase() === hex.toLowerCase();
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
                          hex === "#FFFFFF" || hex === "#F5DD06" ? "text-black" : "text-white"
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

      {(filterSettings?.enableSizeFilter ?? true) && <hr className="border-gray-200" />}

      {/* Size Pills Grid */}
      {(filterSettings?.enableSizeFilter ?? true) && (
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

      {(filterSettings?.enableDressStyleFilter ?? true) && <hr className="border-gray-200" />}

      {/* Dress Style List */}
      {(filterSettings?.enableDressStyleFilter ?? true) && (
        <div className="space-y-4">
          <button
            onClick={() => setIsStyleOpen(!isStyleOpen)}
            className="w-full flex items-center justify-between font-bold text-lg text-black cursor-pointer"
          >
            <span>Dress Style</span>
            <ChevronUp className={`w-5 h-5 transition-transform ${isStyleOpen ? "" : "rotate-180"}`} />
          </button>

          {isStyleOpen && (
            <div className="space-y-3 pt-1">
              {stylesList.map((style: any) => {
                const name = typeof style === "string" ? style : style.name;
                const isSelected = selectedStyle.toLowerCase() === name.toLowerCase();
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedStyle(isSelected ? "" : name)}
                    className={`w-full flex items-center justify-between text-sm text-left transition-colors cursor-pointer ${
                      isSelected ? "font-bold text-black" : "text-gray-500 hover:text-black"
                    }`}
                  >
                    <span>{name}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? "rotate-90 text-black" : ""}`} />
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
