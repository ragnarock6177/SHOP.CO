"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  ArrowRight,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getProductsApi, getCategoriesApi } from "@/lib/productApi";
import { Category, Product } from "@/types/ecommerce";
import { useAuthRedirectUrls } from "@/hooks/useAuthRedirectUrls";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/layout/MegaMenu";
import {
  NavUnderlineButton,
  NavUnderlineLink,
  isNavLinkActive,
} from "@/components/layout/NavUnderlineLink";
import {
  NavActionIconLink,
  NavActionMobileLink,
} from "@/components/layout/NavActionIconLink";
import {
  COLLECTION_MOBILE_BROWSE_LINKS,
  COLLECTION_NAV_LABEL,
  FUTURE_NAV_ITEMS,
  HOME_NAV_LINK,
  PRIMARY_NAV_LINKS,
  SEARCH_SUGGESTIONS,
} from "@/config/navigation";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { loginUrl } = useAuthRedirectUrls();
  const { cartCount, wishlistCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [navCategories, setNavCategories] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileCollectionOpen, setIsMobileCollectionOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const collectionCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const openCollectionMenu = () => {
    if (collectionCloseTimerRef.current) {
      clearTimeout(collectionCloseTimerRef.current);
      collectionCloseTimerRef.current = null;
    }
    setIsCollectionMenuOpen(true);
  };

  const closeCollectionMenuImmediately = () => {
    if (collectionCloseTimerRef.current) {
      clearTimeout(collectionCloseTimerRef.current);
      collectionCloseTimerRef.current = null;
    }
    setIsCollectionMenuOpen(false);
  };

  const closeCollectionMenu = () => {
    collectionCloseTimerRef.current = setTimeout(() => {
      setIsCollectionMenuOpen(false);
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (collectionCloseTimerRef.current) {
        clearTimeout(collectionCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    getCategoriesApi()
      .then(setNavCategories)
      .catch(() => setNavCategories([]));
  }, []);

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

  // Live Predictive Search API call with 250ms debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      getProductsApi({ search: searchQuery.trim(), limit: 6 })
        .then(({ products }) => {
          setSearchResults(products);
        })
        .catch(() => {
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const isCollectionActive = isNavLinkActive("/product", pathname);
  const isWishlistActive = isNavLinkActive("/wishlist", pathname);
  const isCartActive = isNavLinkActive("/cart", pathname);
  const isProfileActive = isNavLinkActive("/profile", pathname);

  return (
    <div
      className={`w-full bg-white transition-all duration-300 px-3 sm:px-6 lg:px-8 overflow-x-clip ${
        isScrolled ? "shadow-xs border-b border-gray-200" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 md:h-[4.5rem] min-w-0">
          {/* Left: Mobile Menu Trigger & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-black focus:outline-none hover:text-gray-600 transition-colors"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center min-w-0">
              <span className="font-be-vietnam-pro-black text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-black truncate">
                AIRAVÉ
              </span>
            </Link>
          </div>

          {/* Tablet: compact nav */}
          <nav className="hidden md:flex lg:hidden items-center gap-3 xl:gap-4 min-w-0 overflow-hidden text-[9px] font-bold uppercase tracking-[0.12em] text-black">
            <NavUnderlineLink
              href={HOME_NAV_LINK.href}
              isActive={isNavLinkActive(HOME_NAV_LINK.href, pathname)}
              className="shrink-0"
            >
              {HOME_NAV_LINK.label}
            </NavUnderlineLink>
            <NavUnderlineLink
              href="/product"
              isActive={isCollectionActive}
              className="shrink-0"
            >
              {COLLECTION_NAV_LABEL}
            </NavUnderlineLink>
            {PRIMARY_NAV_LINKS.map((link) => (
              <NavUnderlineLink
                key={link.label}
                href={link.href}
                isActive={isNavLinkActive(link.href, pathname)}
                className="shrink-0"
              >
                {link.label}
              </NavUnderlineLink>
            ))}
          </nav>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 min-w-0 flex-1 px-2 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.12em] xl:tracking-[0.14em] text-black">
            <NavUnderlineLink href={HOME_NAV_LINK.href} isActive={isNavLinkActive(HOME_NAV_LINK.href, pathname)}>
              {HOME_NAV_LINK.label}
            </NavUnderlineLink>

            <div
              className="relative shrink-0"
              onMouseEnter={openCollectionMenu}
              onMouseLeave={closeCollectionMenu}
            >
              <NavUnderlineButton
                isActive={isCollectionActive || isCollectionMenuOpen}
                className="inline-flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={isCollectionMenuOpen}
                onFocus={openCollectionMenu}
                onBlur={closeCollectionMenu}
              >
                {COLLECTION_NAV_LABEL}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${
                    isCollectionMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </NavUnderlineButton>
            </div>

            {PRIMARY_NAV_LINKS.map((link) => (
              <NavUnderlineLink
                key={link.label}
                href={link.href}
                isActive={isNavLinkActive(link.href, pathname)}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1 rounded-full bg-black px-1.5 py-0.5 text-[7px] xl:text-[8px] font-black tracking-[0.06em] text-white">
                    {link.badge}
                  </span>
                )}
              </NavUnderlineLink>
            ))}

            {FUTURE_NAV_ITEMS.map((item) => (
              <span
                key={item.label}
                className="hidden xl:inline cursor-not-allowed shrink-0 whitespace-nowrap text-neutral-300"
                title={item.description}
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center shrink min-w-0 w-full max-w-[140px] sm:max-w-[180px] lg:max-w-[220px] xl:max-w-[260px]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between bg-[#F4F4F4] hover:bg-gray-100 border border-transparent hover:border-gray-200/80 rounded-full px-4 py-2 text-xs text-gray-500 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3 truncate">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors shrink-0" />
                <span className="truncate text-gray-500 font-medium">Search the collection...</span>
              </div>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-black hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>

            <NavActionIconLink
              href="/wishlist"
              label="My Wishlist"
              count={wishlistCount}
              isActive={isWishlistActive}
              icon={Heart}
              fillWhenActive
            />

            <NavActionIconLink
              href="/cart"
              label="My Cart"
              count={cartCount}
              isActive={isCartActive}
              icon={ShoppingBag}
            />

            {/* User Account / Profile */}
            {isAuthenticated && user ? (
              <Link
                href="/profile"
                className="group relative flex h-9 w-9 items-center justify-center transition-all duration-300 ease-out hover:opacity-90"
                aria-label="User Profile"
                aria-current={isProfileActive ? "page" : undefined}
                title={user.firstName || user.email || "Profile"}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName || "User"}
                    className={cn(
                      "h-9 w-9 rounded-full object-cover transition-all duration-300",
                      isProfileActive
                        ? "shadow-[0_8px_28px_-10px_rgba(0,0,0,0.45)] ring-1 ring-neutral-950/10"
                        : "ring-1 ring-neutral-200/80 group-hover:ring-neutral-300",
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold tracking-wide transition-all duration-300",
                      isProfileActive
                        ? "bg-neutral-950 text-white shadow-[0_8px_28px_-10px_rgba(0,0,0,0.45)]"
                        : "bg-neutral-100 text-neutral-800 group-hover:bg-neutral-200/80 group-hover:text-neutral-950",
                    )}
                  >
                    {userInitial}
                  </div>
                )}
                {isProfileActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10"
                  />
                )}
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-out",
                  isProfileActive
                    ? "bg-neutral-950 text-white shadow-[0_8px_28px_-10px_rgba(0,0,0,0.45)]"
                    : "text-neutral-800/80 hover:bg-neutral-100/90 hover:text-neutral-950",
                )}
                aria-label="User Account"
                title="Account Login"
              >
                <User className="h-[19px] w-[19px]" strokeWidth={isProfileActive ? 2 : 1.5} />
              </Link>
            )}
          </div>
        </div>

        {/* Full-width mega menu aligned to header container (never overflows viewport) */}
        <AnimatePresence>
          {isCollectionMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="hidden lg:block absolute left-0 right-0 top-full z-50 pt-2"
              onMouseEnter={openCollectionMenu}
              onMouseLeave={closeCollectionMenu}
            >
              <MegaMenu categories={navCategories} onLinkClick={closeCollectionMenuImmediately} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Predictive Dynamic Live Search Overlay */}
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
                  {isSearching ? (
                    <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black animate-spin" />
                  ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shirts, categories, styles..."
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

                {/* Dynamic Live API Search Results */}
                {searchQuery.trim().length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Live Results ({searchResults.length})
                      </h4>
                      {isSearching && (
                        <span className="text-[10px] font-bold text-gray-400 animate-pulse">Searching catalog...</span>
                      )}
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug || product.id}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
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
                              <span className="font-extrabold text-sm text-black">₹{product.price}</span>
                              {product.originalPrice && (
                                <span className="block text-xs text-gray-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    ) : isSearching ? (
                      <div className="py-8 text-center text-gray-400 animate-pulse text-xs font-semibold">
                        Searching products...
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
                      {SEARCH_SUGGESTIONS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-black hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 h-dvh z-50 md:hidden flex overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 h-dvh bg-black/60 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div
          className={`relative w-80 max-w-[85vw] h-dvh bg-white text-black z-10 flex flex-col shadow-2xl p-6 overflow-y-auto gpu-layer transition-transform duration-300 ease-out transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-be-vietnam-pro-black text-2xl font-black text-black">
                AIRAVÉ
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-1 font-bold text-sm text-black flex-1">
            <NavUnderlineLink
              href={HOME_NAV_LINK.href}
              isActive={isNavLinkActive(HOME_NAV_LINK.href, pathname)}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-between py-3 border-b border-gray-100 hover:text-gray-600 transition-colors"
            >
              <span>{HOME_NAV_LINK.label}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </NavUnderlineLink>

            <div className="pt-1 pb-2">
              <button
                type="button"
                onClick={() => setIsMobileCollectionOpen((open) => !open)}
                className="flex w-full items-center justify-between py-3 border-b border-gray-100 text-left hover:text-gray-600 transition-colors"
                aria-expanded={isMobileCollectionOpen}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  {COLLECTION_NAV_LABEL}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    isMobileCollectionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMobileCollectionOpen && (
                <div className="space-y-1 pb-2">
                  {navCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/product?category=${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 pl-3 border-b border-gray-50 hover:text-gray-600 transition-colors"
                    >
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-[10px] font-normal text-gray-400">{cat.itemCount}</span>
                    </Link>
                  ))}

                  {COLLECTION_MOBILE_BROWSE_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 pl-3 border-b border-gray-50 hover:text-gray-600 transition-colors"
                    >
                      <span className="font-medium">{link.label}</span>
                      {link.badge ? (
                        <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-black text-white">
                          {link.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 border-b border-gray-100 hover:text-gray-600 transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}

            <div className="pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
              Coming Soon
            </div>
            {FUTURE_NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 text-gray-300"
              >
                <span>{item.label}</span>
                <span className="text-[10px] font-normal">Soon</span>
              </div>
            ))}

            <NavActionMobileLink
              href="/cart"
              label="My Cart"
              count={cartCount}
              isActive={isCartActive}
              icon={ShoppingBag}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <NavActionMobileLink
              href="/wishlist"
              label="My Wishlist"
              count={wishlistCount}
              isActive={isWishlistActive}
              icon={Heart}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isProfileActive ? "page" : undefined}
              className={cn(
                "mb-1.5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-semibold tracking-wide transition-all duration-300",
                isProfileActive
                  ? "border-neutral-200 bg-neutral-50 text-neutral-950 shadow-[inset_3px_0_0_0_#0a0a0a]"
                  : "border-transparent text-neutral-700 hover:border-neutral-100 hover:bg-neutral-50/80 hover:text-neutral-950",
              )}
            >
              <User
                className={cn("h-4 w-4", isProfileActive ? "text-neutral-950" : "text-neutral-500")}
                strokeWidth={isProfileActive ? 2 : 1.5}
              />
              <span>My Profile & Orders</span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};
