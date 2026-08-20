"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Printer } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse } from "@/types/api";
import { DataTable } from "@/components/data-table/DataTable";
import { Pagination } from "@/components/data-table/Pagination";

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber?: string;
  customerEmail: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  issueDate: string;
}

export default function InvoicesPage() {
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "invoices", { page, limit: 10 }],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<InvoiceItem>>("/admin/payments/invoices", {
        params: { page, limit: 10 },
      });
      return response.data;
    },
  });

  const columns: ColumnDef<InvoiceItem>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="font-mono text-xs font-semibold text-slate-900">{row.original.invoiceNumber}</span>
        </div>
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
      accessorKey: "customerEmail",
      header: "Customer",
      cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.customerEmail}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => <span className="font-bold text-slate-900">₹{row.original.totalAmount}</span>,
    },
    {
      id: "actions",
      header: "Print",
      cell: () => (
        <button
          onClick={() => typeof window !== "undefined" && window.print()}
          className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Printer className="h-3 w-3" />
          <span>Print</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Billing Invoices Directory</h1>
        <p className="text-xs text-slate-500">View and print customer tax invoices and order receipts</p>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
