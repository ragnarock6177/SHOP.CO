"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  Heart,
  ChevronDown,
  ChevronRight,
  Tag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES, PRODUCTS } from "@/data/mockData";
import { Product } from "@/types/ecommerce";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { cartCount, wishlistCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userInitial = (
    user?.firstName?.[0] ||
    user?.email?.[0] ||
    user?.phoneNumber?.[0] ||
    "U"
  ).toUpperCase();

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll & autofocus input when search drawer is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
  }, [isSearchOpen]);

  // Cmd+K / Ctrl+K keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live Predictive Search filtering
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div
      className={`bg-white transition-all duration-300 ${
        isScrolled ? "shadow-xs border-b border-gray-200" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8">
          {/* Left: Mobile Menu Trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-black focus:outline-none hover:text-gray-600 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center">
              <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black tracking-tighter text-black">
                AIRAVÉ
              </span>
            </Link>
          </div>

          {/* Center Left: Desktop Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-black">
            {/* Shop Dropdown */}
            <div className="relative group py-4 cursor-pointer">
              <Link
                href="/product"
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Shop
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5 block">
                  Categories
                </span>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/product?category=${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 hover:bg-gray-100 hover:text-black transition-colors text-xs font-semibold"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-normal px-2 py-0.5 rounded-full">
                      {cat.itemCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/product?filter=on-sale"
              className="hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              On Sale
            </Link>

            <Link
              href="/product?sort=newest"
              className="hover:text-gray-600 transition-colors"
            >
              New Arrivals
            </Link>

            <Link
              href="/#brands"
              className="hover:text-gray-600 transition-colors"
            >
              Brands
            </Link>
          </nav>

          {/* Center Right: Desktop Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md relative">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center gap-3 bg-[#F4F4F4] hover:bg-gray-100 border border-transparent hover:border-gray-200/80 rounded-full px-4 py-2 text-xs text-gray-500 transition-all duration-200 text-left group cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors shrink-0" />
              <span className="truncate text-gray-500 font-medium">Search garments, styles...</span>

            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-black hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="p-2 text-black hover:text-gray-600 transition-colors relative"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-black hover:text-gray-600 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="p-1 hover:opacity-80 transition-all flex items-center"
                aria-label="User Profile"
                title={user.firstName || user.email || "Profile"}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-black/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black text-white font-black text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="p-2 text-black hover:text-gray-600 transition-colors"
                aria-label="User Account"
                title="Account Login"
              >
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Predictive Live Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-start">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide Down Search Panel */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full bg-white shadow-2xl z-10 border-b border-gray-200 overflow-hidden"
            >
              <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-be-vietnam-pro-black text-lg font-black uppercase text-black">
                    Search Store
                  </h3>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSearchSubmit} className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by garment, category..."
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-100 rounded-2xl text-black font-semibold text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </form>

                {/* Search Results */}
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Matching Products ({searchResults.length})
                    </h4>

                    {searchResults.length > 0 ? (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className="relative w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                              <Image
                                src={product.image}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-black truncate group-hover:text-gray-600">
                                {product.title}
                              </h5>
                              <p className="text-xs text-gray-400 capitalize">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-sm text-black">${product.price}</span>
                              {product.originalPrice && (
                                <span className="block text-xs text-gray-400 line-through">
                                  ${product.originalPrice}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        <p className="text-sm font-medium">No garments found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-black" /> Popular Searches
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["Casual T-Shirts", "Oversized Hoodies", "Formal Suits", "Party Wear", "Gym Shorts"].map(
                        (tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-black hover:text-white text-xs font-bold transition-colors"
                          >
                            {tag}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 h-[100dvh] z-50 md:hidden flex overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-[100dvh] bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-80 max-w-[85vw] h-[100dvh] bg-white text-black z-10 flex flex-col shadow-2xl p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="font-be-vietnam-pro-black text-2xl font-black text-black">
                    AIRAVÉ
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-black transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-4 font-bold text-sm text-black flex-1">
                <Link
                  href="/product"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>Shop All</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/product?filter=on-sale"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>On Sale</span>
                </Link>

                <Link
                  href="/product?sort=newest"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>New Arrivals</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>My Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-gray-100 text-black font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <Heart className="w-4 h-4 text-black" />
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>My Profile & Orders</span>
                  <User className="w-4 h-4 text-gray-400" />
                </Link>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
