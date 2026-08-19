"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { SlidersHorizontal, ArrowLeftRight } from "lucide-react";
import { useInventory, useAdjustInventory, InventoryItem } from "../../../hooks/queries/useInventory";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { StockAdjustModal } from "../../../components/forms/StockAdjustModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function InventoryPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const { data, isLoading } = useInventory({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const adjustMutation = useAdjustInventory();

  const handleAdjustSubmit = (payload: any) => {
    adjustMutation.mutate(payload, {
      onSuccess: () => setSelectedItem(null),
    });
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "sku",
      header: "SKU / Product",
      cell: ({ row }) => (
        <div>
          <span className="font-mono text-xs font-semibold text-zinc-100">{row.original.sku}</span>
          <p className="text-[11px] text-zinc-400">{row.original.productName}</p>
        </div>
      ),
    },
    {
      accessorKey: "quantityOnHand",
      header: "On Hand",
      cell: ({ row }) => <span className="font-semibold text-zinc-200">{row.original.quantityOnHand}</span>,
    },
    {
      accessorKey: "quantityReserved",
      header: "Reserved",
      cell: ({ row }) => <span className="text-zinc-400">{row.original.quantityReserved}</span>,
    },
    {
      accessorKey: "availableQuantity",
      header: "Available",
      cell: ({ row }) => <span className="font-semibold text-emerald-400">{row.original.availableQuantity}</span>,
    },
    {
      accessorKey: "stockStatus",
      header: "Stock Status",
      cell: ({ row }) => <StatusBadge status={row.original.stockStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <PermissionGate permission="inventory:adjust">
          <button
            onClick={() => setSelectedItem(row.original)}
            className="flex items-center space-x-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Adjust</span>
          </button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Stock Inventory Balances</h1>
          <p className="text-xs text-zinc-400">Monitor stock on hand, reservations, and execute balance adjustments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/inventory/movements"
            className="flex items-center space-x-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>Movements Log</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by SKU, barcode, or product name..."
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
            <option value="">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />

      <StockAdjustModal
        item={selectedItem}
        isOpen={!!selectedItem}
        isLoading={adjustMutation.isPending}
        onClose={() => setSelectedItem(null)}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
}
