"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useProducts, useArchiveProduct, ProductItem } from "../../../hooks/queries/useProducts";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { ConfirmDialog } from "../../../components/feedback/ConfirmDialog";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function ProductsPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const { data, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const archiveMutation = useArchiveProduct();

  const handleConfirmArchive = () => {
    if (archiveId) {
      archiveMutation.mutate(archiveId, {
        onSuccess: () => setArchiveId(null),
      });
    }
  };

  const columns: ColumnDef<ProductItem>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div>
          <Link href={`/products/${row.original.id}`} className="font-semibold text-zinc-100 hover:underline">
            {row.original.name}
          </Link>
          <p className="text-[10px] text-zinc-500">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "basePrice",
      header: "Base Price",
      cell: ({ row }) => <span className="font-semibold text-zinc-200">₹{row.original.basePrice}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-zinc-400 uppercase">{row.original.visibility}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <PermissionGate permission="products:update">
            <Link
              href={`/products/${row.original.id}`}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </PermissionGate>
          <PermissionGate permission="products:delete">
            <button
              onClick={() => setArchiveId(row.original.id)}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Product Catalog</h1>
          <p className="text-xs text-zinc-400">Manage ecommerce products, pricing, and variants</p>
        </div>
        <PermissionGate permission="products:create">
          <Link
            href="/products/new"
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </Link>
        </PermissionGate>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search products by name or slug..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />

      <ConfirmDialog
        isOpen={!!archiveId}
        title="Archive Product"
        description="Are you sure you want to soft-archive this product? It will be hidden from the storefront."
        isDestructive
        isLoading={archiveMutation.isPending}
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveId(null)}
      />
    </div>
  );
}
