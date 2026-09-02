"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, Plus } from "lucide-react";
import { useRefunds, useProcessRefund } from "../../../hooks/queries/useReturns";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { RefundModal } from "../../../components/forms/RefundModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function RefundsPage() {
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isPending, isFetching } = useRefunds({ page, limit: 10 });
  const refundMutation = useProcessRefund();

  const handleProcessRefund = (payload: any) => {
    refundMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Link",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-slate-800 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Refund Amount",
      meta: { skeleton: "numeric" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-1 font-bold text-rose-600">
          <DollarSign className="h-3.5 w-3.5" />
          <span>₹{row.original.amount}</span>
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      meta: { skeleton: "text" },
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.reason}</span>,
    },
    {
      accessorKey: "status",
      header: "Gateway Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => (
        <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          {row.original.status || "PROCESSED"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 shrink-0">
        <PermissionGate permission="refunds:process">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Process Refund</span>
          </button>
        </PermissionGate>
      </div>

      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable columns={columns} data={data?.data || []} isLoading={isPending && !data} isFetching={isFetching} embedded />

        <div className="shrink-0">
          <Pagination pagination={data?.pagination} currentPage={page} isLoading={isPending && !data} isFetching={isFetching} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <RefundModal
        isOpen={isModalOpen}
        isLoading={refundMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProcessRefund}
      />
    </div>
  );
}
