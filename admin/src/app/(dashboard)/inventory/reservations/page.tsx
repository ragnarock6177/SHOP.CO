"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useInventoryReservations } from "../../../../hooks/queries/useInventory";
import { DataTable } from "../../../../components/data-table/DataTable";
import { Pagination } from "../../../../components/data-table/Pagination";

export default function InventoryReservationsPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useInventoryReservations({ page, limit: 10 });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-[11px] text-zinc-400">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "variantSku",
      header: "SKU",
      cell: ({ row }) => <code className="text-xs font-semibold text-zinc-200">{row.original.variantSku || row.original.sku}</code>,
    },
    {
      accessorKey: "quantityReserved",
      header: "Reserved Qty",
      cell: ({ row }) => <span className="font-semibold text-amber-400">{row.original.quantityReserved || row.original.quantity}</span>,
    },
    {
      accessorKey: "orderId",
      header: "Order / Cart Reference",
      cell: ({ row }) => (
        <span className="text-[11px] text-zinc-300">
          {row.original.orderId || row.original.cartId || "Cart Holding"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Active Inventory Reservations</h1>
        <p className="text-xs text-zinc-400">View active cart stock locks and order reservations</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
