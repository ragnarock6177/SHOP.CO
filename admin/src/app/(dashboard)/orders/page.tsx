"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { ShoppingBag, Eye } from "lucide-react";
import { useOrders, OrderItem } from "../../../hooks/queries/useOrders";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function OrdersPage() {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const columns: ColumnDef<OrderItem>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <div>
          <Link href={`/orders/${row.original.id}`} className="font-semibold text-slate-900 hover:underline">
            #{row.original.orderNumber}
          </Link>
          <p className="text-[10px] text-slate-500">{new Date(row.original.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-slate-800">{row.original.customerName}</span>
          <p className="text-[10px] text-slate-500">{row.original.customerEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total (₹)",
      cell: ({ row }) => <span className="font-bold text-slate-900">₹{row.original.totalAmount}</span>,
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <PermissionGate permission="orders:read">
          <Link
            href={`/orders/${row.original.id}`}
            className="flex items-center space-x-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Eye className="h-3 w-3" />
            <span>Manage</span>
          </Link>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order Operations Directory</h1>
          <p className="text-xs text-slate-500">Track incoming orders, status transitions, and fulfillment packaging</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by order # or customer email..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
          >
            <option value="">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
