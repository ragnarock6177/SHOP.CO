"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    onChange(debouncedSearch);
  }, [debouncedSearch, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-8 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-2.5 text-zinc-500 hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
