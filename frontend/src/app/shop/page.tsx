'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { Drawer } from 'vaul';
import { ProductCard } from '../../components/product/ProductCard';
import { FilterSidebar } from '../../components/shop/FilterSidebar';
import { CustomSelect } from '../../components/common/CustomSelect';
import { ProductSkeleton } from '../../components/common/ProductSkeleton';
import { PRODUCTS } from '../../data/mockData';

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Highest Rated', value: 'rating' },
];

function ProductGridList({
  searchQuery,
  sortBy,
  activeFilters
}: {
  searchQuery: string;
  sortBy: string;
  activeFilters: any;
}) {
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (
        searchQuery &&
        !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (activeFilters && activeFilters.maxPrice && product.price > activeFilters.maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [searchQuery, sortBy, activeFilters]);

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : PRODUCTS;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || searchParams.get('filter') || 'Casual';
  const initialSearch = searchParams.get('search') || '';

  const [activeCategory] = useState(initialCategory);
  const [searchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const handleApplyFilter = (filters: any) => {
    setActiveFilters(filters);
    setIsMobileFilterOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4 pb-16">
      
      {/* Breadcrumb Trail (Immediate Render) */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>&gt;</span>
        <span className="text-black font-semibold capitalize">{activeCategory}</span>
      </nav>

      {/* Flex Layout: Left Desktop Sidebar (Immediate Render: 295px) + Right Main Catalog */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-7 items-start">
        
        {/* Left Desktop Filter Sidebar (295px width - Immediate Render) */}
        <aside className="hidden lg:block w-73.75 shrink-0">
          <FilterSidebar onApplyFilter={handleApplyFilter} />
        </aside>

        {/* Right Main Catalog Area */}
        <main className="flex-1 min-w-0 space-y-6 w-full">
          
          {/* Header Row: Title & Custom Sort Dropdown (Immediate Render) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h1 className="font-bold text-2xl sm:text-3xl text-black capitalize">
                {activeCategory}
              </h1>
              <span className="text-xs sm:text-sm text-gray-500">
                Showing 1-10 of 100 Products
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              
              {/* Mobile Filter Trigger using Vaul Drawer */}
              <Drawer.Root open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <Drawer.Trigger asChild>
                  <button
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#F0F0F0] hover:bg-gray-200 rounded-full text-black text-xs font-bold transition-colors"
                    title="Filter Products"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-black" />
                    <span>Filters</span>
                  </button>
                </Drawer.Trigger>

                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
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

          {/* Right side Product Grid ONLY loads with Shimmer Skeleton */}
          <Suspense fallback={<ProductSkeleton count={6} />}>
            <ProductGridList
              searchQuery={searchQuery}
              sortBy={sortBy}
              activeFilters={activeFilters}
            />
          </Suspense>

          <hr className="border-gray-200 pt-4" />

          {/* Responsive Pagination Bar */}
          <div className="flex items-center justify-between pt-2 text-xs sm:text-sm font-semibold">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-black hover:bg-black hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold transition-colors ${
                    currentPage === num
                      ? 'bg-[#F0F0F0] text-black border border-gray-200'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="px-1 text-gray-400">...</span>
              {[9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold transition-colors ${
                    currentPage === num
                      ? 'bg-[#F0F0F0] text-black border border-gray-200'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-black hover:bg-black hover:text-white transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </main>
      </div>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
        <div className="flex gap-7">
          <div className="hidden lg:block w-73.75 h-150 bg-gray-100 rounded-3xl animate-pulse" />
          <div className="flex-1">
            <ProductSkeleton count={6} />
          </div>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
