"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Category } from "@/types/ecommerce";
import {
  buildCollectionMegaColumns,
  COLLECTION_NAV_LABEL,
  FUTURE_NAV_ITEMS,
} from "@/config/navigation";

interface MegaMenuProps {
  categories: Category[];
  onLinkClick?: () => void;
}

export function MegaMenu({ categories, onLinkClick }: MegaMenuProps) {
  const columns = buildCollectionMegaColumns(categories);
  const heroCategory = categories.find((cat) => cat.slug === "shirts") || categories[0];

  const handleLinkClick = () => {
    onLinkClick?.();
  };

  return (
    <div
      className="w-full px-3 sm:px-0"
      role="menu"
      aria-label={`${COLLECTION_NAV_LABEL} menu`}
    >
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        <div className="max-h-[min(72vh,640px)] overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(240px,300px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-5 py-6 sm:px-6 sm:py-7">
              {columns.map((column) => (
                <div key={column.title} className="min-w-0">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                    {column.title}
                  </p>
                  <ul className="space-y-0.5">
                    {column.links.map((link) => (
                      <li key={`${column.title}-${link.label}`}>
                        <Link
                          href={link.href}
                          role="menuitem"
                          onClick={handleLinkClick}
                          className="group/link flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-neutral-50"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-snug text-black transition-colors group-hover/link:text-neutral-700">
                              {link.label}
                            </span>
                            {link.description && (
                              <span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">
                                {link.description}
                              </span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {link.badge && (
                              <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                                {link.badge}
                              </span>
                            )}
                            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 transition-all group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 group-hover/link:text-black" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <aside className="border-t border-neutral-100 bg-[#FAFAFA] px-5 py-6 sm:px-6 sm:py-7 lg:border-t-0 lg:border-l">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                AIRAVÉ
              </p>
              <h3 className="mt-2 font-be-vietnam-pro-black text-xl font-black uppercase leading-tight tracking-tight text-black sm:text-2xl">
                Signature Collection
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Premium shirts and essentials from one house — refined fabrics and a singular
                AIRAVÉ point of view.
              </p>

              {heroCategory && (
                <Link
                  href={`/product?category=${heroCategory.slug}`}
                  onClick={handleLinkClick}
                  className="relative mt-4 block aspect-[5/4] max-h-48 overflow-hidden rounded-xl bg-neutral-200 sm:max-h-56"
                >
                  <Image
                    src={heroCategory.image}
                    alt={heroCategory.name}
                    fill
                    quality={85}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 280px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
                      Featured
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">{heroCategory.name}</p>
                  </div>
                </Link>
              )}

              <Link
                href={heroCategory ? `/product?category=${heroCategory.slug}` : "/product"}
                onClick={handleLinkClick}
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:text-neutral-600"
              >
                Explore collection
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {FUTURE_NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className="text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-300 sm:text-[10px]"
                title={item.description}
              >
                {item.label}
                <span className="ml-1 font-normal normal-case tracking-normal text-neutral-400">
                  soon
                </span>
              </span>
            ))}
          </div>
          <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-neutral-400 sm:text-[10px]">
            AIRAVÉ — personal brand only
          </span>
        </div>
      </div>
    </div>
  );
}
