'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronUp, SlidersHorizontal, X, Check } from 'lucide-react';

interface FilterSidebarProps {
  onCloseMobile?: () => void;
  onApplyFilter?: (filters: any) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onCloseMobile,
  onApplyFilter
}) => {
  const [selectedCategory, setSelectedCategory] = useState('T-shirts');
  const [priceRange, setPriceRange] = useState<number>(200);
  const [selectedColor, setSelectedColor] = useState('#063AF5'); // Blue selected in image
  const [selectedSize, setSelectedSize] = useState('Large'); // Large selected in image
  const [selectedStyle, setSelectedStyle] = useState('Casual');

  // Accordion toggle states
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isColorsOpen, setIsColorsOpen] = useState(true);
  const [isSizesOpen, setIsSizesOpen] = useState(true);
  const [isStyleOpen, setIsStyleOpen] = useState(true);

  const filterCategories = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];

  const colors = [
    { name: 'Green', hex: '#00C12B' },
    { name: 'Red', hex: '#F50606' },
    { name: 'Yellow', hex: '#F5DD06' },
    { name: 'Orange', hex: '#F57906' },
    { name: 'Cyan', hex: '#06CAF5' },
    { name: 'Blue', hex: '#063AF5' },
    { name: 'Purple', hex: '#7D06F5' },
    { name: 'Pink', hex: '#F506A4' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
  ];

  const sizes = [
    'XX-Small',
    'X-Small',
    'Small',
    'Medium',
    'Large',
    'X-Large',
    'XX-Large',
    '3X-Large',
    '4X-Large'
  ];

  const dressStyles = ['Casual', 'Formal', 'Party', 'Gym'];

  const handleApply = () => {
    if (onApplyFilter) {
      onApplyFilter({
        category: selectedCategory,
        maxPrice: priceRange,
        color: selectedColor,
        size: selectedSize,
        style: selectedStyle
      });
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 space-y-6 text-black shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h3 className="font-integral text-xl font-bold text-black flex items-center gap-2">
          <span>Filters</span>
        </h3>
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

      {/* Category List */}
      <div className="space-y-3">
        {filterCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full flex items-center justify-between text-sm text-left transition-colors ${
              selectedCategory === cat ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
            }`}
          >
            <span>{cat}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Price Slider */}
      <div className="space-y-4">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex items-center justify-between font-bold text-lg text-black"
        >
          <span>Price</span>
          <ChevronUp className={`w-5 h-5 transition-transform ${isPriceOpen ? '' : 'rotate-180'}`} />
        </button>

        {isPriceOpen && (
          <div className="space-y-3">
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-black bg-gray-200 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs font-extrabold text-black">
              <span>$50</span>
              <span>${priceRange}</span>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Colors Grid */}
      <div className="space-y-4">
        <button
          onClick={() => setIsColorsOpen(!isColorsOpen)}
          className="w-full flex items-center justify-between font-bold text-lg text-black"
        >
          <span>Colors</span>
          <ChevronUp className={`w-5 h-5 transition-transform ${isColorsOpen ? '' : 'rotate-180'}`} />
        </button>

        {isColorsOpen && (
          <div className="grid grid-cols-5 gap-3 pt-1">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c.hex)}
                className={`w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                  selectedColor === c.hex ? 'ring-2 ring-black ring-offset-2 scale-105' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {selectedColor === c.hex && (
                  <Check
                    className={`w-4 h-4 ${
                      c.hex === '#FFFFFF' || c.hex === '#F5DD06' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Size Pills Grid */}
      <div className="space-y-4">
        <button
          onClick={() => setIsSizesOpen(!isSizesOpen)}
          className="w-full flex items-center justify-between font-bold text-lg text-black"
        >
          <span>Size</span>
          <ChevronUp className={`w-5 h-5 transition-transform ${isSizesOpen ? '' : 'rotate-180'}`} />
        </button>

        {isSizesOpen && (
          <div className="flex flex-wrap gap-2 pt-1">
            {sizes.map((sz) => (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  selectedSize === sz
                    ? 'bg-black text-white font-bold'
                    : 'bg-[#F0F0F0] text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Dress Style List */}
      <div className="space-y-4">
        <button
          onClick={() => setIsStyleOpen(!isStyleOpen)}
          className="w-full flex items-center justify-between font-bold text-lg text-black"
        >
          <span>Dress Style</span>
          <ChevronUp className={`w-5 h-5 transition-transform ${isStyleOpen ? '' : 'rotate-180'}`} />
        </button>

        {isStyleOpen && (
          <div className="space-y-3 pt-1">
            {dressStyles.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`w-full flex items-center justify-between text-sm text-left transition-colors ${
                  selectedStyle === style ? 'font-bold text-black' : 'text-gray-500 hover:text-black'
                }`}
              >
                <span>{style}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filter Button */}
      <div className="pt-2">
        <button
          onClick={handleApply}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold text-sm py-4 rounded-full transition-all shadow-md active:scale-95"
        >
          Apply Filter
        </button>
      </div>

    </div>
  );
};
