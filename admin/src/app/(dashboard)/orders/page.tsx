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
import { CustomSelect } from "@/components/ui/select";

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
      meta: { skeleton: "text-2lines" },
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
      meta: { skeleton: "text-2lines" },
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
      meta: { skeleton: "numeric" },
      cell: ({ row }) => <span className="font-bold text-slate-900">₹{row.original.totalAmount}</span>,
    },
    {
      accessorKey: "status",
      header: "Order Status",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      meta: { skeleton: "badge" },
      cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
    },
    {
      id: "actions",
      header: "Actions",
      meta: { skeleton: <div className="h-7 w-[76px] rounded animate-shimmer bg-slate-100 border border-slate-200/60" /> },
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
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: "", label: "All Order Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "PROCESSING", label: "Processing" },
              { value: "SHIPPED", label: "Shipped" },
              { value: "DELIVERED", label: "Delivered" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "REFUNDED", label: "Refunded" },
            ]}
            triggerClassName="w-40"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
