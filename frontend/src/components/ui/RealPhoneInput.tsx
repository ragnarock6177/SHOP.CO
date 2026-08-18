"use client";

import React, { useState, useEffect, useRef } from "react";
import { AsYouType } from "libphonenumber-js";
import {
  getCountryCallingCode,
  getCountries,
  isValidPhoneNumber,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import enLabels from "react-phone-number-input/locale/en.json";
import { ChevronDown } from "lucide-react";

// Per-country maximum national numeric digits limit
const COUNTRY_MAX_NATIONAL_DIGITS: Record<string, number> = {
  IN: 10, // India: Exactly 10 digits
  US: 10, // USA: 10 digits
  CA: 10, // Canada: 10 digits
  GB: 10, // UK: 10 digits
  AU: 9,  // Australia: 9 digits
  AE: 9,  // UAE: 9 digits
  DE: 11, // Germany: 11 digits
  FR: 9,  // France: 9 digits
  JP: 10, // Japan: 10 digits
  SA: 9,  // Saudi Arabia: 9 digits
  SG: 8,  // Singapore: 8 digits
  BR: 11, // Brazil: 11 digits
  MX: 10, // Mexico: 10 digits
  CN: 11, // China: 11 digits
  PK: 10, // Pakistan: 10 digits
  BD: 10, // Bangladesh: 10 digits
};

const ALL_COUNTRIES = getCountries();

interface RealPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: string;
}

export const RealPhoneInput: React.FC<RealPhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  error = false,
  disabled = false,
  placeholder = "98765 43210",
  defaultCountry = "IN",
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get Calling code (e.g., "91" for IN)
  let callingCode = "91";
  try {
    callingCode = getCountryCallingCode(selectedCountry as any);
  } catch (e) {
    callingCode = "91";
  }

  const maxDigits = COUNTRY_MAX_NATIONAL_DIGITS[selectedCountry] || 10;

  // Extract raw numeric national digits from full E.164 string (+919876543210 -> 9876543210)
  const extractNationalDigits = (fullVal: string) => {
    if (!fullVal) return "";
    let clean = fullVal.replace(/[^0-9]/g, "");
    if (clean.startsWith(callingCode)) {
      clean = clean.slice(callingCode.length);
    }
    return clean.slice(0, maxDigits);
  };

  const [rawDigits, setRawDigits] = useState<string>(() => extractNationalDigits(value));

  // Sync internal state when external props change
  useEffect(() => {
    setRawDigits(extractNationalDigits(value));
  }, [value, selectedCountry]);

  // Format raw digits live as user types as per specific country standard (e.g. 98765 43210 for IN)
  const formatter = new AsYouType(selectedCountry as any);
  const formattedDisplay = formatter.input(rawDigits);

  // Handle typing inside input box
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, maxDigits);
    setRawDigits(clean);

    if (clean.length === 0) {
      onChange("");
    } else {
      onChange(`+${callingCode}${clean}`);
    }
  };

  // Country selection handler
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setIsDropdownOpen(false);
    setSearchQuery("");

    let newCallingCode = "91";
    try {
      newCallingCode = getCountryCallingCode(countryCode as any);
    } catch (e) {
      newCallingCode = "91";
    }

    const newMax = COUNTRY_MAX_NATIONAL_DIGITS[countryCode] || 10;
    const trimmed = rawDigits.slice(0, newMax);
    setRawDigits(trimmed);

    if (trimmed.length > 0) {
      onChange(`+${newCallingCode}${trimmed}`);
    }
  };

  // Active flag element
  const ActiveFlagComponent = (flags as any)[selectedCountry];

  // Filter countries for dropdown search
  const filteredCountries = ALL_COUNTRIES.filter((cCode) => {
    const name = (enLabels as any)[cCode] || cCode;
    let code = "";
    try {
      code = getCountryCallingCode(cCode as any);
    } catch (e) {}
    const query = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) ||
      cCode.toLowerCase().includes(query) ||
      code.includes(query)
    );
  });

  return (
    <div className={`relative w-full ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      <div
        className={`flex items-center rounded-full px-3.5 py-1 transition-all border ${
          error
            ? "border-red-500 bg-red-50/40 ring-2 ring-red-500/20 animate-shake shadow-xs shadow-red-500/10"
            : "border-transparent bg-[#F0F0F0] focus-within:border-black/30 focus-within:ring-2 focus-within:ring-black/10 focus-within:bg-white"
        }`}
      >
        {/* Country Code & SVG Flag Badge Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 py-2 pr-2.5 font-bold text-xs text-black hover:text-gray-700 cursor-pointer border-r border-gray-300/70 mr-2 select-none focus:outline-none disabled:cursor-not-allowed"
          >
            {ActiveFlagComponent && (
              <div className="w-5 h-3.5 rounded-2xs overflow-hidden shadow-2xs shrink-0 flex items-center">
                <ActiveFlagComponent title={selectedCountry} />
              </div>
            )}
            <span className="text-xs font-semibold text-black">
              +{callingCode}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Searchable Country Selector Dropdown */}
          {isDropdownOpen && !disabled && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 z-50 text-xs">
                {/* Search Box */}
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F0F0F0] rounded-xl px-3 py-2 text-xs text-black placeholder-gray-400 focus:outline-none mb-2"
                />

                {/* Country List */}
                <div className="max-h-52 overflow-y-auto space-y-0.5">
                  {filteredCountries.map((cCode) => {
                    const FlagComp = (flags as any)[cCode];
                    const countryName = (enLabels as any)[cCode] || cCode;
                    let cCodeNum = "";
                    try {
                      cCodeNum = getCountryCallingCode(cCode as any);
                    } catch (e) {}

                    return (
                      <button
                        key={cCode}
                        type="button"
                        onClick={() => handleCountrySelect(cCode)}
                        className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 rounded-xl transition-colors text-left ${
                          selectedCountry === cCode
                            ? "bg-gray-100 font-bold text-black"
                            : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {FlagComp && (
                            <div className="w-5 h-3.5 rounded-2xs overflow-hidden shadow-2xs shrink-0 flex items-center">
                              <FlagComp title={countryName} />
                            </div>
                          )}
                          <span className="truncate text-xs">{countryName}</span>
                        </div>
                        <span className="text-gray-500 text-[11px] shrink-0 ml-2">
                          +{cCodeNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Country-Formatted Mobile Input Field */}
        <input
          type="tel"
          disabled={disabled}
          inputMode="numeric"
          placeholder={placeholder}
          value={formattedDisplay}
          onChange={handleInputChange}
          onBlur={onBlur}
          className="w-full bg-transparent py-2 pr-3 text-xs text-black placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
        />

        {/* Live Country Digit Progress Counter (e.g. 10/10) */}
        {rawDigits.length > 0 && (
          <span
            className={`pr-3 text-[10px] font-bold select-none shrink-0 ${
              error ? "text-red-500" : "text-gray-400"
            }`}
          >
            {rawDigits.length}/{maxDigits}
          </span>
        )}
      </div>
    </div>
  );
};

export { isValidPhoneNumber };
