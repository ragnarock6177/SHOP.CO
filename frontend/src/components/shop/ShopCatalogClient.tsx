'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal } from 'lucide-react';
import { Drawer } from 'vaul';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { CustomSelect } from '@/components/common/CustomSelect';
import { ProductSkeleton } from '@/components/common/ProductSkeleton';
import { Pagination } from '@/components/common/Pagination';
import { Product } from '@/types/ecommerce';

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Highest Rated', value: 'rating' },
];

function ProductGridList({
  initialProducts,
  category,
  searchQuery,
  sortBy,
  activeFilters
}: {
  initialProducts: Product[];
  category: string;
  searchQuery: string;
  sortBy: string;
  activeFilters: any;
}) {
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Category Filter
        if (
          category &&
          category !== 'Casual' &&
          category !== 'All' &&
          product.category.toLowerCase() !== category.toLowerCase()
        ) {
          return false;
        }

        // Search Filter
        if (
          searchQuery &&
          !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Price Filter
        if (activeFilters && activeFilters.maxPrice && product.price > activeFilters.maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
      });
  }, [initialProducts, category, searchQuery, sortBy, activeFilters]);

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16 space-y-3 bg-[#F0F0F0] rounded-3xl p-8 font-be-vietnam-pro">
        <h3 className="font-be-vietnam-pro-black text-xl font-bold text-black uppercase">No Products Found</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          We couldn't find any products matching your current filters. Try resetting filters or searching for another keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 gpu-layer">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductGridWithParams({
  initialProducts,
  sortBy,
  activeFilters
}: {
  initialProducts: Product[];
  sortBy: string;
  activeFilters: any;
}) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || searchParams.get('filter') || 'Casual';
  const searchQuery = searchParams.get('search') || '';

  return (
    <ProductGridList
      initialProducts={initialProducts}
      category={activeCategory}
      searchQuery={searchQuery}
      sortBy={sortBy}
      activeFilters={activeFilters}
    />
  );
}

function ShopHeaderRow({
  sortBy,
  setSortBy,
  isMobileFilterOpen,
  setIsMobileFilterOpen,
  handleApplyFilter
}: {
  sortBy: string;
  setSortBy: (val: string) => void;
  isMobileFilterOpen: boolean;
  setIsMobileFilterOpen: (val: boolean) => void;
  handleApplyFilter: (filters: any) => void;
}) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || searchParams.get('filter') || 'Casual';

  return (
    <div className="space-y-2 mb-4">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap font-be-vietnam-pro">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-black font-semibold capitalize">{activeCategory}</span>
      </nav>

      {/* Title & Action Controls Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black text-black capitalize truncate">
          {activeCategory}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Filter Trigger using Vaul Drawer */}
          <Drawer.Root open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <Drawer.Trigger asChild>
              <button
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#F0F0F0] hover:bg-gray-200 rounded-full text-black text-xs font-bold transition-colors cursor-pointer"
                title="Filter Products"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                <span>Filters</span>
              </button>
            </Drawer.Trigger>

            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
              <Drawer.Content className="bg-white flex flex-col rounded-t-4xl max-h-[85vh] fixed bottom-0 left-0 right-0 z-50 outline-none border-t border-gray-200 shadow-2xl">
                <div className="p-4 bg-white rounded-t-4xl flex-1 overflow-y-auto">
                  <Drawer.Handle className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
                  <Drawer.Title className="sr-only">Filter Products</Drawer.Title>
                  <FilterSidebar
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

export function ShopCatalogClient({ initialProducts }: { initialProducts: Product[] }) {
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const handleApplyFilter = (filters: any) => {
    setActiveFilters(filters);
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 py-4 pb-16 font-be-vietnam-pro gpu-layer">
      
      {/* Header Row: Breadcrumbs, Title & Filter/Sort Controls (Appears Immediately, Never Shimmers) */}
      <Suspense fallback={
        <div className="space-y-2 mb-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>&gt;</span>
            <span className="text-black font-semibold capitalize">Catalog</span>
          </nav>
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black text-black capitalize">
              Casual
            </h1>
            <div className="flex items-center gap-2">
              <button className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#F0F0F0] rounded-full text-black text-xs font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      }>
        <ShopHeaderRow
          sortBy={sortBy}
          setSortBy={setSortBy}
          isMobileFilterOpen={isMobileFilterOpen}
          setIsMobileFilterOpen={setIsMobileFilterOpen}
          handleApplyFilter={handleApplyFilter}
        />
      </Suspense>

      {/* Flex Layout: Left Desktop Sidebar + Right Main Catalog */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-7 items-start">
        
        {/* Left Desktop Filter Sidebar (Appears Immediately, Never Shimmers) */}
        <aside className="hidden lg:block w-73.75 shrink-0">
          <FilterSidebar onApplyFilter={handleApplyFilter} />
        </aside>

        {/* Right Main Catalog Area */}
        <main className="flex-1 min-w-0 space-y-5 w-full">
          
          {/* Product Cards Grid: ONLY Place Where Shimmer Skeleton Appears */}
          <Suspense fallback={<ProductSkeleton count={6} />}>
            <ProductGridWithParams
              initialProducts={initialProducts}
              sortBy={sortBy}
              activeFilters={activeFilters}
            />
          </Suspense>

          {/* Responsive Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(initialProducts.length / 10))}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

        </main>
      </div>

    </div>
  );
}
