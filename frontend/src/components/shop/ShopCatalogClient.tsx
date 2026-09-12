"use client";

import React, { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "vaul";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterSidebar } from "@/components/shop/FilterSidebar";
import { CustomSelect } from "@/components/common/CustomSelect";
import { ProductSkeleton } from "@/components/common/ProductSkeleton";
import { Pagination } from "@/components/common/Pagination";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Product, Category } from "@/types/ecommerce";
import { getProductsApi, serializeCatalogQuery } from "@/lib/productApi";

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Highest Rated", value: "rating" },
];

interface ShopCatalogClientProps {
  initialProducts: Product[];
  initialCategories?: Category[];
  initialFilterSettings?: any;
  initialMeta?: any;
  initialQueryKey?: string;
}

function ProductGridList({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 space-y-3 bg-[#F0F0F0] rounded-2xl p-8 font-be-vietnam-pro">
        <h3 className="text-base font-bold text-black uppercase tracking-wide">No Products Found</h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          We couldn't find any products matching your current filters. Try resetting filters or searching for another keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} aspectRatio="square" />
      ))}
    </div>
  );
}

function ShopHeaderRow({
  sortBy,
  setSortBy,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  handleApplyFilter,
  activeFilters,
  initialCategories,
  initialFilterSettings,
}: {
  sortBy: string;
  setSortBy: (val: string) => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (val: boolean) => void;
  handleApplyFilter: (filters: any) => void;
  activeFilters: any;
  initialCategories?: Category[];
  initialFilterSettings?: any;
}) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || searchParams.get("filter") || "Shop Catalog";
  const searchQuery = searchParams.get("search") || "";

  const titleText = searchQuery
    ? `Search: "${searchQuery}"`
    : activeCategory;

  const breadcrumbItems = searchQuery
    ? [{ label: "Shop", href: "/product" }, { label: `Search: ${searchQuery}` }]
    : [{ label: "Shop", href: "/product" }, { label: activeCategory }];

  return (
    <div className="space-y-2 mb-4 font-be-vietnam-pro">
      {/* Dynamic Reusable Breadcrumb Component */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Title & Action Controls Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-2xl font-bold text-black uppercase tracking-tight truncate">
          {titleText}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Filter Trigger using Vaul Drawer */}
          <Drawer.Root open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <Drawer.Trigger asChild>
              <button
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-[#F0F0F0] hover:bg-gray-200 rounded-full text-black text-xs font-bold transition-colors cursor-pointer"
                title="Filter Products"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                <span>Filters</span>
              </button>
            </Drawer.Trigger>

            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
              <Drawer.Content className="bg-white flex flex-col rounded-t-3xl max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-gray-200 shadow-2xl">
                <div className="p-4 bg-white rounded-t-3xl flex-1 overflow-y-auto">
                  <Drawer.Handle className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
                  <Drawer.Title className="sr-only">Filter Products</Drawer.Title>
                  <FilterSidebar
                    categories={initialCategories}
                    filterSettings={initialFilterSettings}
                    activeFilters={activeFilters}
                    onCloseMobile={() => setIsMobileFilterOpen(false)}
                    onApplyFilter={handleApplyFilter}
                  />
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* Custom Styled Sort Dropdown */}
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            labelPrefix="Sort by:"
          />
        </div>
      </div>
    </div>
  );
}

function ShopCatalogContent({
  initialProducts,
  initialCategories = [],
  initialFilterSettings,
  initialMeta,
  initialQueryKey,
}: ShopCatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || searchParams.get("filter") || "";
  const isOnSale = activeCategory === "on-sale" || searchParams.get("onSale") === "true";
  const activeColor = searchParams.get("color") || "";
  const activeSize = searchParams.get("size") || "";
  const activeCollection = searchParams.get("collection") || searchParams.get("style") || "";
  const activeMaxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const activePage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
  const initialSort = searchParams.get("sort") || "popular";

  const [sortBy, setSortBy] = useState(initialSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(activePage);
  const [clientProducts, setClientProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [totalPagesServer, setTotalPagesServer] = useState<number | null>(
    initialMeta?.totalPages || null
  );

  const activeFilters = useMemo(
    () => ({
      category: activeCategory,
      color: activeColor,
      size: activeSize,
      collection: activeCollection,
      maxPrice: activeMaxPrice,
      onSale: isOnSale,
      search: searchQuery,
    }),
    [activeCategory, activeColor, activeSize, activeCollection, activeMaxPrice, isOnSale, searchQuery]
  );

  // Sync state when URL params change
  useEffect(() => {
    setCurrentPage(activePage);
    setSortBy(initialSort);
  }, [activePage, initialSort]);

  // Handle URL updates when filters change
  const updateQueryString = (params: Record<string, string | number | undefined | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });
    router.push(`/product?${current.toString()}`);
  };

  const handleApplyFilter = (newFilters: any) => {
    updateQueryString({
      category: newFilters.category || undefined,
      filter: undefined, // reset alias
      color: newFilters.color || undefined,
      size: newFilters.size || undefined,
      collection: newFilters.collection || undefined,
      style: undefined,
      maxPrice: newFilters.maxPrice || undefined,
      page: 1,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateQueryString({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateQueryString({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch products when query params change
  useEffect(() => {
    let isMounted = true;

    async function fetchFilteredProducts() {
      // Don't refetch on first mount if initialProducts are already matched
      if (
        initialProducts.length > 0 &&
        currentPage === 1 &&
        !searchQuery &&
        !activeCategory &&
        !activeColor &&
        !activeSize &&
        !activeCollection &&
        !activeMaxPrice &&
        sortBy === "popular"
      ) {
        return;
      }

      setLoading(true);
      try {
        const query = {
          category: activeCategory || undefined,
          search: searchQuery || undefined,
          colors: activeColor ? [activeColor] : undefined,
          sizes: activeSize ? [activeSize] : undefined,
          collection: activeCollection || undefined,
          maxPrice: activeMaxPrice || undefined,
          onSale: isOnSale ? true : undefined,
          sortBy: sortBy,
          page: currentPage,
          limit: 12,
        };

        const res = await getProductsApi(query);
        if (isMounted) {
          setClientProducts(res.products || []);
          if (res.meta?.totalPages) {
            setTotalPagesServer(res.meta.totalPages);
          }
        }
      } catch (err) {
        console.error("Error fetching catalog products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchFilteredProducts();

    return () => {
      isMounted = false;
    };
  }, [
    activeCategory,
    searchQuery,
    activeColor,
    activeSize,
    activeCollection,
    activeMaxPrice,
    isOnSale,
    sortBy,
    currentPage,
    initialProducts,
  ]);

  // Client-side fallback sorting
  const displayProducts = useMemo(() => {
    let prods = [...clientProducts];
    if (sortBy === "price-low") {
      prods.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      prods.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      prods.sort((a, b) => b.rating - a.rating);
    }
    return prods;
  }, [clientProducts, sortBy]);

  const totalPages = totalPagesServer !== null
    ? totalPagesServer
    : Math.max(1, Math.ceil(displayProducts.length / 12));

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 py-4 pb-20 font-be-vietnam-pro">
        {/* Header Row: Breadcrumbs, Title & Filter/Sort Controls */}
        <ShopHeaderRow
          sortBy={sortBy}
          setSortBy={handleSortChange}
          isMobileFilterOpen={isMobileFilterOpen}
          setIsMobileFilterOpen={setIsMobileFilterOpen}
          handleApplyFilter={handleApplyFilter}
          activeFilters={activeFilters}
          initialCategories={initialCategories}
          initialFilterSettings={initialFilterSettings}
        />

        {/* Flex Layout: Left Desktop Sidebar + Right Main Catalog */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Left Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              categories={initialCategories}
              filterSettings={initialFilterSettings}
              activeFilters={activeFilters}
              onApplyFilter={handleApplyFilter}
            />
          </aside>

          {/* Right Main Catalog Area */}
          <main className="flex-1 min-w-0 space-y-6 w-full">
            {loading ? (
              <ProductSkeleton count={6} />
            ) : (
              <ProductGridList products={displayProducts} />
            )}

            {/* Responsive Dynamic Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export function ShopCatalogClient(props: ShopCatalogClientProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6 py-4 pb-20 font-be-vietnam-pro">
            <div className="space-y-2 mb-4">
              <Breadcrumb items={[{ label: "Shop", href: "/product" }]} />
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-lg sm:text-2xl font-bold text-black uppercase tracking-tight">
                  Shop Catalog
                </h1>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
              <aside className="hidden lg:block w-64 shrink-0">
                <FilterSidebar
                  categories={props.initialCategories}
                  filterSettings={props.initialFilterSettings}
                />
              </aside>
              <main className="flex-1 min-w-0 space-y-6 w-full">
                <ProductSkeleton count={6} />
              </main>
            </div>
          </div>
        </div>
      }
    >
      <ShopCatalogContent {...props} />
    </Suspense>
  );
}
