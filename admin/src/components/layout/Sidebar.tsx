'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ChevronDown,
  Layers,
  Sliders,
  Box,
  Tag,
  Warehouse,
  Truck,
  CreditCard,
  FileText,
  Ticket,
  Star,
  RotateCcw,
  RefreshCw,
  UserCog,
  Shield,
  ScrollText,
  LogOut,
} from 'lucide-react';

interface SubItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubItem[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  {
    name: 'Catalog',
    href: '/products',
    icon: Package,
    subItems: [
      { name: 'Products', href: '/products', icon: Box },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Collections', href: '/collections', icon: Tag },
      { name: 'Attributes', href: '/attributes', icon: Sliders },
    ],
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Warehouse,
    subItems: [
      { name: 'Stock Balances', href: '/inventory', icon: Warehouse },
      { name: 'Movements', href: '/inventory/movements', icon: RefreshCw },
      { name: 'Reservations', href: '/inventory/reservations', icon: Package },
    ],
  },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Shipments', href: '/shipments', icon: Truck },
  { name: 'Customers', href: '/customers', icon: Users },
  {
    name: 'Payments',
    href: '/payments',
    icon: CreditCard,
    subItems: [
      { name: 'Transactions', href: '/payments', icon: CreditCard },
      { name: 'Invoices', href: '/invoices', icon: FileText },
    ],
  },
  { name: 'Coupons', href: '/coupons', icon: Ticket },
  { name: 'Reviews', href: '/reviews', icon: Star },
  {
    name: 'After-Sales',
    href: '/returns',
    icon: RotateCcw,
    subItems: [
      { name: 'Returns', href: '/returns', icon: RotateCcw },
      { name: 'Refunds', href: '/refunds', icon: RefreshCw },
    ],
  },
  {
    name: 'Administration',
    href: '/staff',
    icon: UserCog,
    subItems: [
      { name: 'Staff', href: '/staff', icon: UserCog },
      { name: 'Roles', href: '/roles', icon: Shield },
    ],
  },
  { name: 'Audit Logs', href: '/audit-logs', icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getDefaultOpen = () => {
    const open: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.subItems) {
        const isActive = item.subItems.some(
          (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
        ) || pathname === item.href || pathname.startsWith(item.href + '/');
        if (isActive) open[item.name] = true;
      }
    });
    return open;
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(getDefaultOpen);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const getDisplayName = () => {
    if (!user) return 'Admin User';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-neutral-200 bg-white sm:flex">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-neutral-200 px-6">
        <span className="text-xl font-black uppercase tracking-[0.2em] text-black">
          AIRAVÉ
        </span>
        <span className="ml-1.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-500 tracking-widest">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubActive =
            hasSubItems &&
            item.subItems?.some(
              (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
            );
          const isMainActive =
            pathname === item.href ||
            (!hasSubItems && item.href !== '/' && pathname.startsWith(item.href + '/'));
          const isActive = isMainActive || isSubActive;
          const isOpen = !!openMenus[item.name];

          if (hasSubItems) {
            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 opacity-50',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-neutral-200 pl-3">
                    {item.subItems?.map((sub) => {
                      const isSubCurrent =
                        pathname === sub.href ||
                        (sub.href !== '/' && pathname.startsWith(sub.href + '/'));
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
                            isSubCurrent
                              ? 'bg-neutral-900 text-white font-semibold'
                              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                          )}
                        >
                          {SubIcon && <SubIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                          <span>{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-neutral-200 p-3">
        <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">
              {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-neutral-900">{getDisplayName()}</span>
              <span className="truncate text-[10px] text-neutral-400">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log out"
            className="shrink-0 rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
