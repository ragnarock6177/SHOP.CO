"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none font-be-vietnam-pro ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-500 hover:text-black transition-colors shrink-0"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-black capitalize shrink-0 truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-black transition-colors capitalize shrink-0"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
