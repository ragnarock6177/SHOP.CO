'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  BarChart3,
  ChevronDown,
  Layers,
  Sliders,
  Box
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
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { 
    name: 'Products', 
    href: '/products', 
    icon: Package,
    subItems: [
      { name: 'Product', href: '/products', icon: Box },
      { name: 'Category', href: '/products/categories', icon: Layers },
      { name: 'Variant', href: '/products/variants', icon: Sliders },
    ]
  },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Products: true,
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black sm:flex">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-2xl font-bold uppercase tracking-widest text-black dark:text-white">
          AIRAVE
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubActive = hasSubItems && item.subItems?.some(sub => pathname === sub.href);
          const isMainActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !hasSubItems);
          const isActive = isMainActive || isSubActive;
          const isOpen = !!openMenus[item.name];

          if (hasSubItems) {
            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200 text-neutral-400',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                    {item.subItems?.map((sub) => {
                      const isSubCurrent = pathname === sub.href;
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            isSubCurrent
                              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                              : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50'
                          )}
                        >
                          {SubIcon && <SubIcon className="h-3.5 w-3.5 opacity-70" />}
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
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-50'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin User</span>
            <span className="text-xs text-neutral-500">admin@airave.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

