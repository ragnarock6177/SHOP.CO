"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { DataTable } from "@/components/data-table/DataTable";
import { Pagination } from "@/components/data-table/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";

export interface PaymentItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  provider: string;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED";
  createdAt: string;
}

export default function PaymentsPage() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments", { page, limit: 10, status: statusFilter || undefined }],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<PaymentItem>>("/admin/payments", {
        params: { page, limit: 10, status: statusFilter || undefined },
      });
      return response.data;
    },
  });

  const columns: ColumnDef<PaymentItem>[] = [
    {
      accessorKey: "provider",
      header: "Provider & Ref",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-slate-500" />
          <div>
            <span className="font-semibold text-slate-900">{row.original.provider}</span>
            <p className="text-[10px] text-slate-500 font-mono">{row.original.providerPaymentId || "COD / Direct"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Reference",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-slate-800 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-bold text-slate-900">
          ₹{row.original.amount} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Payment Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payment Gateway Transactions</h1>
          <p className="text-xs text-slate-500">Read-only oversight of gateway payment attempts and authorization statuses</p>
        </div>
        <div className="flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="">All Payment Statuses</option>
            <option value="CAPTURED">Captured</option>
            <option value="AUTHORIZED">Authorized</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
