"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchInputProps {
  value?: string;
  placeholder?: string;
  onChange: (val: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value = "",
  placeholder = "Search records...",
  onChange,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(value);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Only notify parent when debounced value changes — NOT when onChange reference changes.
  // Including onChange in deps caused pagination resets on every parent re-render.
  useEffect(() => {
    onChangeRef.current(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm("")}
          className="absolute right-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
