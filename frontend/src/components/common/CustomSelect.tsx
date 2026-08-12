'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  labelPrefix?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  labelPrefix = 'Sort by:'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative text-xs select-none">
      <div className="flex items-center gap-1.5">
        {labelPrefix && (
          <span className="text-gray-500 hidden sm:inline font-normal">
            {labelPrefix}
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#F0F0F0] hover:bg-gray-200 text-black font-bold rounded-full px-4 py-2.5 flex items-center gap-2 transition-all cursor-pointer focus:outline-none"
        >
          <span>{selectedOption ? selectedOption.label : 'Select'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-black transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in-50 zoom-in-95 duration-150">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                option.value === value
                  ? 'bg-black text-white font-bold'
                  : 'text-gray-700 hover:bg-[#F0F0F0] hover:text-black'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
