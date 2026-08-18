"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../data/mockData";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { cartCount, wishlistCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userInitial = (
    user?.firstName?.[0] ||
    user?.email?.[0] ||
    user?.phoneNumber?.[0] ||
    "U"
  ).toUpperCase();

  // Lock body scroll & add Escape key listener when mobile drawer is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Navigation Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4 md:gap-8">
          {/* Left: Mobile Menu Trigger Button & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1 text-black focus:outline-none hover:text-gray-600 transition-colors"
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-black">
            {/* Shop Dropdown */}
            <div className="relative group py-4 cursor-pointer">
              <Link
                href="/product"
                className="flex items-center gap-1 hover:text-gray-600 transition-colors"
              >
                Shop
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
              </Link>

              {/* Desktop Dropdown */}
              <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 block">
                  Categories
                </span>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/product?category=${cat.slug}`}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 hover:bg-gray-100 hover:text-black transition-colors text-xs font-semibold"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {cat.itemCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/product?filter=on-sale"
              className="hover:text-gray-600 transition-colors"
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

          {/* Center Right: Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md bg-[#F0F0F0] rounded-full px-4 py-2.5 gap-3 focus-within:ring-2 focus-within:ring-black/10 transition-all"
          >
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-black placeholder-gray-500 focus:outline-none"
            />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                const query = prompt("Search for products:");
                if (query)
                  router.push(
                    `/product?search=${encodeURIComponent(query.trim())}`,
                  );
              }}
              className="md:hidden p-2 text-black hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist Button (BEFORE CART) */}
            <Link
              href="/wishlist"
              className="p-2 text-black hover:text-rose-600 transition-colors relative"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
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
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="p-1 hover:opacity-80 transition-all flex items-center gap-2"
                aria-label="User Profile"
                title={`${user.firstName || user.email || "Profile"}`}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-black/20 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-black text-white font-black text-xs flex items-center justify-center shadow-xs">
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

      {/* Mobile Navigation Drawer with Buttery Smooth 60FPS Framer Motion Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex overflow-hidden">
            {/* Hardware-accelerated Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{ willChange: "opacity", transform: "translateZ(0)" }}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Left Sliding Drawer Panel with 60fps GPU Hardware Acceleration */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.32,
                ease: [0.32, 0.72, 0, 1], // iOS style smooth cubic-bezier curve
              }}
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
              className="relative w-80 max-w-[85vw] bg-white text-black z-10 flex flex-col shadow-2xl p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
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

              {/* Navigation Links */}
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
                  <span className="bg-red-100 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    HOT
                  </span>
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
                      <span className="bg-rose-100 text-rose-600 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>My Profile & Orders</span>
                  <User className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
                >
                  <span>Shopping Cart</span>
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                </Link>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


