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

  const { data, isLoading } = useRefunds({ page, limit: 10 });
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
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Link",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-slate-800 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Refund Amount",
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
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.original.reason}</span>,
    },
    {
      accessorKey: "status",
      header: "Gateway Status",
      cell: ({ row }) => (
        <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          {row.original.status || "PROCESSED"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Transactional Refunds Log</h1>
          <p className="text-xs text-slate-500">View payment gateway refund transactions and issue manual refunds</p>
        </div>
        <PermissionGate permission="refunds:process">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Process Refund</span>
          </button>
        </PermissionGate>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />

      <RefundModal
        isOpen={isModalOpen}
        isLoading={refundMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleProcessRefund}
      />
    </div>
  );
}
