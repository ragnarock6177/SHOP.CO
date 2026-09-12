"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfileAddressesPanel } from "@/components/address/ProfileAddressesPanel";
import { ProfileOrdersPanel } from "@/components/orders/ProfileOrdersPanel";
import { ProfileSettingsPanel } from "@/components/profile/ProfileSettingsPanel";
import { getUserAddressesApi } from "@/lib/addressApi";
import type { UserAddress } from "@/types/address";

export default function ProfilePage() {
  const router = useRouter();
  const { wishlistProducts, addToCart, toggleWishlist, wishlistCount } = useCart();
  const { user: authUser, token, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "orders" | "addresses" | "payments" | "wishlist" | "settings"
  >("orders");

  // User Profile Display Calculations
  const displayName = authUser
    ? [authUser.firstName, authUser.lastName].filter(Boolean).join(" ") ||
      authUser.email ||
      authUser.phoneNumber ||
      "AIRAVÉ Member"
    : "Guest User";

  const userEmail = authUser?.email || "No email connected";
  const userPhone = authUser?.phone || authUser?.phoneNumber || "No mobile number connected";
  const userInitial = (
    authUser?.firstName?.[0] ||
    authUser?.email?.[0] ||
    authUser?.phoneNumber?.[0] ||
    "U"
  ).toUpperCase();

  const memberSince = authUser?.createdAt
    ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "2026";

  const authProviderLabel = authUser?.authProvider
    ? `${authUser.authProvider} ACCOUNT`
    : "VERIFIED ACCOUNT";

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setAddresses([]);
      return;
    }

    let cancelled = false;

    getUserAddressesApi(token)
      .then((data) => {
        if (!cancelled) {
          setAddresses(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAddresses([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Mock Payment Cards
  const [cards] = useState([
    {
      id: "card-1",
      brand: "Visa",
      last4: "4242",
      expiry: "08/28",
      holder: displayName.toUpperCase(),
      isDefault: true,
    },
  ]);

  const wishedProducts = wishlistProducts;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="max-w-md mx-auto my-12 px-4 py-10 text-center bg-[#F4F4F4] rounded-3xl space-y-4 font-be-vietnam-pro">
        <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">
          ?
        </div>
        <h2 className="font-be-vietnam-pro-black text-xl font-black text-black uppercase">
          LOG IN TO VIEW PROFILE
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          Please log in or create an account to access your profile, order history, and saved addresses.
        </p>
        <Link
          href="/login"
          className="inline-block px-7 py-3 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors shadow-md uppercase"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-16 space-y-6 sm:space-y-8 text-black font-be-vietnam-pro gpu-layer">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4 sm:pb-6">
        <div>
          <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black uppercase text-black tracking-tight">
            MY ACCOUNT
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage your profile, order history, shipping addresses, and account settings.
          </p>
        </div>

        <Link
          href="/product"
          className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#F4F4F4] hover:bg-gray-200 rounded-full text-xs font-bold text-black transition-colors shrink-0"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Continue Shopping</span>
          <span className="sm:hidden">Shop</span>
        </Link>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#F4F4F4] rounded-3xl p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: User Avatar & Info */}
        <div className="md:col-span-8 flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-black shrink-0 bg-black text-white flex items-center justify-center shadow-2xs">
            {authUser?.profileImage ? (
              <Image
                src={authUser.profileImage}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black">
                {userInitial}
              </span>
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black truncate">
                {displayName}
              </h2>
              <span className="bg-black text-white text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {authProviderLabel}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-medium truncate">
              {userEmail} &bull; {userPhone}
            </p>

            <p className="text-[11px] text-gray-400 font-medium pt-0.5">
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="md:col-span-4 grid grid-cols-3 gap-2 border-t md:border-t-0 md:border-l border-gray-300/70 pt-3.5 md:pt-0 md:pl-6 text-center">
          <div>
            <span className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black block">
              {orderCount}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase">
              Orders
            </span>
          </div>

          <div>
            <span className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black block">
              {wishlistCount}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase">
              Wishlist
            </span>
          </div>

          <div>
            <span className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black block">
              {addresses.length}
            </span>
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase">
              Addresses
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Tabs Track & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs Track (Horizontal Track on Mobile / Sidebar on Desktop) */}
        <aside className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-2.5 sm:p-4 shadow-2xs">
          <div className="flex lg:flex-col overflow-x-auto whitespace-nowrap scrollbar-none gap-1.5">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 lg:w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-black text-white shadow-2xs"
                  : "text-gray-600 bg-[#F4F4F4] lg:bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Orders ({orderCount})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex-1 lg:w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "addresses"
                  ? "bg-black text-white shadow-2xs"
                  : "text-gray-600 bg-[#F4F4F4] lg:bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Addresses ({addresses.length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`flex-1 lg:w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "payments"
                  ? "bg-black text-white shadow-2xs"
                  : "text-gray-600 bg-[#F4F4F4] lg:bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Payments</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex-1 lg:w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "wishlist"
                  ? "bg-black text-white shadow-2xs"
                  : "text-gray-600 bg-[#F4F4F4] lg:bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Wishlist ({wishlistCount})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 lg:w-full flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-black text-white shadow-2xs"
                  : "text-gray-600 bg-[#F4F4F4] lg:bg-transparent hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>

          <div className="pt-2 mt-2 border-t border-gray-100 hidden lg:block">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-6">
          {/* TAB 1: MY ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black uppercase text-black">
                Order History
              </h2>
              <ProfileOrdersPanel onOrdersLoaded={setOrderCount} />
            </div>
          )}

          {/* TAB 2: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <ProfileAddressesPanel onAddressesChange={setAddresses} />
          )}

          {/* TAB 3: PAYMENT METHODS */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black uppercase text-black">
                  Payment Methods
                </h2>
                <button
                  onClick={() => alert("Add Payment Card Modal")}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-black text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors uppercase cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-black text-white rounded-3xl p-5 space-y-4 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-be-vietnam-pro-black text-base font-black tracking-widest uppercase">
                        {card.brand}
                      </span>
                      {card.isDefault && (
                        <span className="bg-white/20 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                          Primary
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-base tracking-widest pt-1">
                      •••• •••• •••• {card.last4}
                    </p>

                    <div className="flex justify-between items-end text-xs text-gray-300 font-medium">
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-bold">
                          Cardholder
                        </span>
                        <span className="font-bold text-white">
                          {card.holder}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-bold">
                          Expires
                        </span>
                        <span className="font-bold text-white">
                          {card.expiry}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              <h2 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black uppercase text-black">
                My Saved Wishlist ({wishedProducts.length})
              </h2>

              {wishedProducts.length === 0 ? (
                <div className="bg-[#F4F4F4] rounded-3xl p-8 text-center space-y-3">
                  <Heart className="w-9 h-9 text-gray-400 mx-auto" />
                  <p className="text-gray-600 text-xs font-medium">
                    Your wishlist is currently empty.
                  </p>
                  <Link
                    href="/product"
                    className="inline-block px-6 py-2.5 bg-black text-white font-bold text-xs uppercase rounded-full"
                  >
                    Browse Clothes
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {wishedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-gray-200/80 rounded-2xl p-2 space-y-2 relative group shadow-2xs"
                    >
                      <div className="relative aspect-3/4 bg-[#F0EEED] rounded-xl overflow-hidden">
                        <Image
                          src={prod.image}
                          alt={prod.title}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => toggleWishlist(prod)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white text-rose-500 shadow-xs cursor-pointer"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div>
                        <h4 className="font-bold text-[11px] text-black truncate">
                          {prod.title}
                        </h4>
                        <span className="font-black text-xs text-black block mt-0.5">
                          ${prod.price}
                        </span>
                      </div>

                      <button
                        onClick={() => addToCart(prod)}
                        className="w-full py-1.5 bg-black hover:bg-neutral-800 text-white font-bold text-[10px] uppercase rounded-full transition-all cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
              <h2 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black uppercase text-black border-b border-gray-100 pb-3.5">
                Account Settings & Security
              </h2>
              <ProfileSettingsPanel />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
