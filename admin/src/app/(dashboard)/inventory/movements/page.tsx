"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useInventoryMovements } from "../../../../hooks/queries/useInventory";
import { DataTable } from "../../../../components/data-table/DataTable";
import { Pagination } from "../../../../components/data-table/Pagination";
import { StatusBadge } from "../../../../components/ui/StatusBadge";

export default function StockMovementsPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useInventoryMovements({ page, limit: 10 });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "variantSku",
      header: "SKU",
      cell: ({ row }) => <code className="text-xs font-semibold text-slate-800">{row.original.variantSku || row.original.sku}</code>,
    },
    {
      accessorKey: "movementType",
      header: "Movement Type",
      cell: ({ row }) => <StatusBadge status={row.original.movementType} />,
    },
    {
      accessorKey: "quantityChange",
      header: "Change",
      cell: ({ row }) => (
        <span className={`font-semibold ${row.original.quantityChange > 0 ? "text-emerald-400" : "text-rose-600"}`}>
          {row.original.quantityChange > 0 ? `+${row.original.quantityChange}` : row.original.quantityChange}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => <span className="text-[11px] text-slate-500">{row.original.notes || "-"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Stock Movements Log</h1>
        <p className="text-xs text-slate-500">Read-only audit history of all inventory balance changes</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
