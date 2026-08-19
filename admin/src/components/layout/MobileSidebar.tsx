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
  { name: "Audit Logs", href: "/audit-logs", icon: Activity, permission: "audit_logs:read" },
];

export interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-sm">
      <div className="relative flex w-4/5 max-w-xs flex-col border-r border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <Link href="/" onClick={onClose} className="text-sm font-black tracking-widest text-zinc-100 uppercase">
            AIRAVÉ ADMIN
          </Link>
          <button onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-zinc-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
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
