"use client";

import React from "react";
import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Sliders,
  Boxes,
  Users,
  ShoppingBag,
  Truck,
  CreditCard,
  FileText,
  Ticket,
  Star,
  RotateCcw,
  UserCheck,
  Shield,
  Activity,
  Settings,
  X,
} from "lucide-react";
import { PermissionGate } from "../rbac/PermissionGate";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package, permission: "products:read" },
  { name: "Categories", href: "/categories", icon: Layers, permission: "categories:read" },
  { name: "Collections", href: "/collections", icon: Tag, permission: "collections:read" },
  { name: "Attributes", href: "/attributes", icon: Sliders, permission: "attributes:read" },
  { name: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory:read" },
  { name: "Customers", href: "/customers", icon: Users, permission: "customers:read" },
  { name: "Orders", href: "/orders", icon: ShoppingBag, permission: "orders:read" },
  { name: "Shipments", href: "/shipments", icon: Truck, permission: "fulfillment:read" },
  { name: "Payments", href: "/payments", icon: CreditCard, permission: "payments:read" },
  { name: "Invoices", href: "/invoices", icon: FileText, permission: "payments:read" },
  { name: "Coupons", href: "/coupons", icon: Ticket, permission: "coupons:read" },
  { name: "Reviews", href: "/reviews", icon: Star, permission: "reviews:read" },
  { name: "Returns", href: "/returns", icon: RotateCcw, permission: "returns:read" },
  { name: "Staff Users", href: "/staff", icon: UserCheck, permission: "staff:read" },
  { name: "Roles & Permissions", href: "/roles", icon: Shield, permission: "roles:read" },
  { name: "General Settings", href: "/settings/general", icon: Settings, permission: "settings:manage" },
  { name: "Homepage Sections", href: "/settings/homepage", icon: Settings, permission: "settings:manage" },
  { name: "Header & Announcement", href: "/settings/header", icon: Settings, permission: "settings:manage" },
  { name: "Footer Settings", href: "/settings/footer", icon: Settings, permission: "settings:manage" },
  { name: "Contact Details", href: "/settings/contact", icon: Settings, permission: "settings:manage" },
  { name: "Social Media", href: "/settings/social", icon: Settings, permission: "settings:manage" },
  { name: "SEO & Metadata", href: "/settings/seo", icon: Settings, permission: "settings:manage" },
  { name: "Hero Banners", href: "/settings/banners", icon: Settings, permission: "settings:manage" },
];

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex w-4/5 max-w-xs flex-col border-r border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <span className="text-base font-black tracking-widest text-slate-900 uppercase">
              AIRAVÉ
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
              Admin
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1 sidebar-scrollbar">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );

            if (item.permission) {
              return (
                <PermissionGate key={item.href} permission={item.permission}>
                  {linkContent}
                </PermissionGate>
              );
            }

            return linkContent;
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
