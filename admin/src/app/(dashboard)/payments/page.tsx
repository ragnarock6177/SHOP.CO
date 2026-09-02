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
import { CustomSelect } from "@/components/ui/select";

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
      meta: { skeleton: "text-2lines" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-slate-500" />
          <div>
            <span className="font-semibold text-slate-900">{row.original.provider}</span>
            <p className="text-[10px] text-slate-500">{row.original.providerPaymentId || "COD / Direct"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Reference",
      meta: { skeleton: "text" },
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-slate-800 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      meta: { skeleton: "numeric" },
      cell: ({ row }) => (
        <span className="font-bold text-slate-900">
          ₹{row.original.amount} {row.original.currency}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Payment Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        
        <div className="flex justify-end">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Payment Statuses" },
              { value: "CAPTURED", label: "Captured" },
              { value: "AUTHORIZED", label: "Authorized" },
              { value: "PENDING", label: "Pending" },
              { value: "FAILED", label: "Failed" },
              { value: "REFUNDED", label: "Refunded" },
            ]}
            triggerClassName="w-44"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
