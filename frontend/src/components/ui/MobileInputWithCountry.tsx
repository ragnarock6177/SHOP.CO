"use client";

import React, { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";

export const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+1", country: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
];

interface MobileInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  placeholder?: string;
}

export const MobileInputWithCountry: React.FC<MobileInputProps> = ({
  value,
  onChange,
  onBlur,
  error = false,
  placeholder = "9876543210",
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default +91 India
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Extract numeric part (max 10 digits)
  const numericPart = value.replace(/[^0-9]/g, "").slice(0, 10);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    onChange(rawVal);
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center bg-[#F0F0F0] rounded-full overflow-hidden transition-all border ${
          error
            ? "border-red-500 bg-red-50/50 focus-within:ring-2 focus-within:ring-red-200"
            : "border-transparent focus-within:border-black/30 focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-white"
        }`}
      >
        {/* Phone Icon */}
        <div className="pl-4 pr-1 text-gray-400">
          <Phone className="w-4 h-4" />
        </div>

        {/* Country Code Prefix Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 py-3 pr-2 font-bold text-xs text-black hover:text-gray-700 focus:outline-none cursor-pointer border-r border-gray-300/60 mr-2 shrink-0 select-none"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs">{selectedCountry.code}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Country Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 max-h-56 overflow-y-auto text-xs">
                {COUNTRY_CODES.map((item, idx) => (
                  <button
                    key={`${item.code}-${item.country}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(item);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors text-left ${
                      selectedCountry.country === item.country && selectedCountry.code === item.code
                        ? "bg-gray-50 font-bold text-black"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-gray-500 text-[11px]">
                      {item.code}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 10-Digit Mobile Input Field */}
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder={placeholder}
          value={numericPart}
          onChange={handleInputChange}
          onBlur={onBlur}
          className="w-full bg-transparent py-3 pr-4 text-xs text-black placeholder-gray-400 font-mono tracking-wider focus:outline-none"
        />

        {/* Digit Count Badge */}
        {numericPart.length > 0 && (
          <span className="pr-4 text-[10px] font-bold text-gray-400 select-none">
            {numericPart.length}/10
          </span>
        )}
      </div>
    </div>
  );
};
