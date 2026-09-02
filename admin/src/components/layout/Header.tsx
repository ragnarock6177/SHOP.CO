"use client";

import React from "react";
import { Search, Bell, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getPageInfo = () => {
    if (!pathname) return { title: "Dashboard", subtitle: "Overview of your store" };
    
    if (pathname.startsWith("/products")) {
      if (pathname === "/products") return { title: "Product Catalog", subtitle: "Manage ecommerce products, pricing, and variants" };
      return { title: "Product Details", subtitle: "View and edit product" };
    }
    if (pathname.startsWith("/categories")) return { title: "Categories", subtitle: "Manage product categories" };
    if (pathname.startsWith("/collections")) return { title: "Collections", subtitle: "Manage product collections" };
    if (pathname.startsWith("/attributes")) return { title: "Attributes", subtitle: "Manage product attributes" };
    if (pathname.startsWith("/orders")) return { title: "Orders", subtitle: "Manage customer orders" };
    if (pathname.startsWith("/customers")) return { title: "Customers", subtitle: "Manage customers and their data" };
    if (pathname.startsWith("/inventory")) return { title: "Inventory", subtitle: "Manage stock levels" };
    if (pathname.startsWith("/staff")) return { title: "Staff", subtitle: "Manage team members and roles" };
    if (pathname.startsWith("/settings")) return { title: "Settings", subtitle: "Store configurations" };
    if (pathname.startsWith("/coupons")) return { title: "Coupons", subtitle: "Manage discount codes" };
    if (pathname.startsWith("/roles")) return { title: "Roles", subtitle: "Manage staff roles and permissions" };
    if (pathname.startsWith("/audit-logs")) return { title: "Audit Logs", subtitle: "View system activities" };
    return { title: "Dashboard", subtitle: "Overview of your store" };
  };

  const { title, subtitle } = getPageInfo();

  const getInitials = () => {
    if (!user) return "A";
    const first = user.firstName ? user.firstName[0] : "";
    const last = user.lastName ? user.lastName[0] : "";
    return (first + last).toUpperCase() || user.email[0].toUpperCase() || "A";
  };

  const getDisplayName = () => {
    if (!user) return "Admin User";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 gap-4">
      
      {/* Title Section - Left */}
      <div className="flex flex-1 items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Global Search - Middle */}
      <div className="flex flex-1 items-center justify-center">
        <form className="hidden w-full max-w-md lg:flex" onSubmit={(e) => e.preventDefault()}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search orders, SKUs, customers..."
              className="w-full h-9 appearance-none rounded-md border-slate-200 bg-slate-50/80 pl-9 pr-12 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-slate-900/10 focus-visible:border-slate-400 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs">
              <span className="text-[11px]">⌘</span>K
            </div>
          </div>
        </form>
      </div>

      {/* User Actions - Right */}
      <div className="flex flex-1 items-center justify-end gap-3">
        <button
          className="relative rounded-md border border-slate-200/80 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-all"
          title="Notifications"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-transform active:scale-95">
              <Avatar className="h-9 w-9 border-2 border-white bg-slate-900 shadow-xs ring-1 ring-slate-200">
                <AvatarFallback className="bg-slate-900 text-xs font-bold text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-md border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl">
            <DropdownMenuLabel className="flex flex-col space-y-1 p-2.5">
              <span className="text-xs font-bold text-slate-900">{getDisplayName()}</span>
              <span className="text-[11px] text-slate-500 font-normal">{user?.email}</span>
              {user?.isSuperAdmin && (
                <span className="inline-block w-max rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider border border-slate-200/80 mt-1">
                  Super Admin
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <DropdownMenuItem className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer">
              <User className="h-4 w-4 text-slate-400" />
              <span>Staff Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;
