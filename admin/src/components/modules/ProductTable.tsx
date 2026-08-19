'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, Plus } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CommonTable, StatusBadge } from '@/components/common';
import Link from 'next/link';

// Mock Data
const data: Product[] = [
  {
    id: 'prod-1',
    sku: 'ARV-TS-001',
    title: 'Essential Heavyweight Tee',
    description: 'Premium organic cotton heavyweight t-shirt.',
    price: 85,
    stock: 124,
    status: 'IN_STOCK',
    category: 'Apparel',
    tags: ['Tops', 'Essentials'],
    images: ['/placeholder.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'ARV-HD-002',
    title: 'Monochrome Logo Hoodie',
    description: 'Minimalist logo embroidered hoodie.',
    price: 165,
    stock: 0,
    status: 'OUT_OF_STOCK',
    category: 'Apparel',
    tags: ['Hoodies', 'Outerwear'],
    images: ['/placeholder.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'ARV-AC-003',
    title: 'Matte Black Stainless Bottle',
    description: 'Double-wall insulated water bottle.',
    price: 45,
    stock: 45,
    status: 'IN_STOCK',
    category: 'Accessories',
    tags: ['Drinkware', 'Everyday'],
    images: ['/placeholder.jpg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function ProductTable() {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4 h-8 text-xs font-semibold uppercase tracking-wider"
          >
            Product
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-black dark:text-white">{row.getValue('title')}</span>
          <span className="text-xs text-neutral-500">{row.original.sku}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'IN_STOCK') {
          return <StatusBadge status="In Stock" variant="success" />;
        }
        if (status === 'OUT_OF_STOCK') {
          return <StatusBadge status="Out of Stock" variant="danger" />;
        }
        return <StatusBadge status="Archived" variant="neutral" />;
      },
    },
    {
      accessorKey: 'stock',
      header: () => <div className="text-right">Inventory</div>,
      cell: ({ row }) => {
        const stock = parseInt(row.getValue('stock'));
        return <div className="text-right font-medium">{stock}</div>;
      },
    },
    {
      accessorKey: 'price',
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price'));
        const formatted = formatCurrency(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-500 hover:text-black dark:hover:text-white">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-neutral-200 dark:border-neutral-800">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer">Edit Product</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              <DropdownMenuItem className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 dark:text-rose-500 dark:focus:bg-rose-950/50">Delete Product</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <CommonTable
      columns={columns}
      data={data}
      searchPlaceholder="Search products by name or SKU..."
      toolbarExtra={
        <Button asChild size="sm" className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      }
    />
  );
}
