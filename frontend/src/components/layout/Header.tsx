'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CATEGORIES } from '../../data/mockData';
import { AuthDrawer } from '../auth/AuthDrawer';

export const Header: React.FC = () => {
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 transition-all">
        {/* Top Black Announcement Bar */}
        {showAnnouncement && (
          <div className="bg-black text-white py-2 px-4 text-center text-xs sm:text-sm font-normal relative flex items-center justify-center">
            <div className="flex items-center gap-1">
              <span>Sign up and get 20% off to your first order.</span>
              <Link href="/signup" className="font-medium underline hover:text-gray-300 transition-colors ml-1">
                Sign Up Now
              </Link>
            </div>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              aria-label="Close Announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Navigation */}
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
                <span className="font-integral text-2xl sm:text-3xl font-black tracking-tighter text-black">
                  SHOP.CO
                </span>
              </Link>
            </div>

            {/* Center Left: Desktop Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-black">
              {/* Shop Dropdown */}
              <div className="relative group py-4 cursor-pointer">
                <Link href="/shop" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                  Shop
                  <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                </Link>

                <div className="absolute top-full left-0 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 block">
                    Categories
                  </span>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-800 hover:bg-gray-100 hover:text-black transition-colors text-xs font-semibold"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-gray-400">{cat.itemCount}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <Link href="/shop?filter=on-sale" className="hover:text-gray-600 transition-colors">
                On Sale
              </Link>

              <Link href="/shop?sort=newest" className="hover:text-gray-600 transition-colors">
                New Arrivals
              </Link>

              <Link href="/#brands" className="hover:text-gray-600 transition-colors">
                Brands
              </Link>
            </nav>

            {/* Center Right: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md bg-[#F0F0F0] rounded-full px-4 py-2.5 gap-3">
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
                  const query = prompt('Search for products:');
                  if (query) router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
                }}
                className="md:hidden p-2 text-black hover:text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>

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
              <button
                onClick={() => setIsAuthOpen(true)}
                className="p-2 text-black hover:text-gray-600 transition-colors"
                aria-label="User Account"
                title="Account Login / Sign Up"
              >
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Left Drawer (Smooth Slide Entrance & Exit Animations) */}
      <div
        className={`fixed inset-0 z-50 md:hidden flex transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Dark Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Left Sliding Panel */}
        <div
          className={`relative w-80 max-w-[85vw] bg-white text-black z-10 flex flex-col shadow-2xl p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-integral text-2xl font-black text-black">
                SHOP.CO
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

          {/* Search Input inside Left Drawer */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-2.5 gap-3 mb-6">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search clothes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-black placeholder-gray-500 focus:outline-none"
            />
          </form>

          {/* Navigation Links */}
          <nav className="space-y-4 font-bold text-sm text-black flex-1">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
            >
              <span>Shop All</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>

            <Link
              href="/shop?filter=on-sale"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
            >
              <span>On Sale</span>
              <span className="bg-red-100 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded-full">HOT</span>
            </Link>

            <Link
              href="/shop?sort=newest"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 border-b border-gray-100 hover:text-gray-600 transition-colors"
            >
              <span>New Arrivals</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
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

          {/* Bottom Auth Buttons */}
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase rounded-full text-center block shadow-md transition-all"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 bg-[#F0F0F0] hover:bg-gray-200 text-black font-bold text-xs uppercase rounded-full text-center block transition-all"
            >
              Log In
            </Link>
          </div>

        </div>
      </div>

      {/* Auth Drawer Modal */}
      <AuthDrawer isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
