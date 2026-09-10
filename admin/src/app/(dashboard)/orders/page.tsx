"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Package } from "lucide-react";
import { useOrders, OrderListItem } from "../../../hooks/queries/useOrders";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { SearchInput } from "../../../components/filters/SearchInput";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";
import {
  formatINR,
  formatOrderDateTime,
  formatRelativeTime,
  getCustomerInitials,
} from "@/lib/orders/format";
import { getOrderStatusLabel } from "@/lib/orders/status";

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isPending, isFetching } = useOrders({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    setSearch((prev) => {
      if (prev !== val) setPage(1);
      return val;
    });
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter((prev) => {
      if (prev !== val) setPage(1);
      return val;
    });
  }, []);

  const columns: ColumnDef<OrderListItem>[] = [
    {
      id: "order",
      header: "Order",
      meta: { skeleton: "image-text" },
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="group/order flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-transform duration-200 group-hover/order:scale-110">
              <Package className="h-5 w-5 stroke-[1.5]" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/orders/${order.id}`}
                className="block truncate font-semibold text-slate-900 hover:underline"
              >
                #{order.orderNumber}
              </Link>
              <p
                className="truncate text-[10px] text-slate-500"
                title={formatOrderDateTime(order.placedAt || order.createdAt)}
              >
                {formatRelativeTime(order.placedAt || order.createdAt)}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <Package className="h-3 w-3" />
                {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: "Customer",
      meta: { skeleton: "avatar" },
      cell: ({ row }) => {
        const order = row.original;
        const initials = getCustomerInitials(order.customerName, order.customerEmail);
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">
                {order.customerName || "Guest Customer"}
              </p>
              <p className="truncate text-[10px] text-slate-500">{order.customerEmail || "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      meta: { skeleton: "text", hideBelow: "lg" },
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[10rem]">
          <p className="truncate text-xs font-medium text-slate-800">
            {row.original.previewItemName || "—"}
          </p>
          {row.original.lineItemCount > 1 && (
            <p className="text-[10px] text-slate-500">
              +{row.original.lineItemCount - 1} more
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      meta: { skeleton: "numeric" },
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-semibold text-slate-800">
          {formatINR(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Fulfillment",
      meta: { skeleton: "badge", hideBelow: "md" },
      cell: ({ row }) => (
        <div className="space-y-1 whitespace-nowrap">
          <StatusBadge status={row.original.status} />
          {row.original.trackingNumber && (
            <p className="font-mono text-[10px] text-slate-500">
              {row.original.trackingNumber}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "payment",
      header: "Payment",
      meta: { skeleton: "badge", hideBelow: "md" },
      cell: ({ row }) => (
        <div className="space-y-1 whitespace-nowrap">
          <StatusBadge status={row.original.paymentStatus} />
          {row.original.paymentProvider && (
            <p className="text-[10px] font-semibold uppercase text-slate-500">
              {row.original.paymentProvider}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      meta: { skeleton: "actions-2" },
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <PermissionGate permission="orders:read">
            <Link
              href={`/orders/${row.original.id}`}
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="h-4 w-4" />
            </Link>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4">
      <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search order #, email, phone, or customer..."
          className="w-full sm:w-72"
        />

        <CustomSelect
          value={statusFilter}
          onChange={handleStatusChange}
          options={[
            { value: "", label: "All fulfillment statuses" },
            ...["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(
              (status) => ({
                value: status,
                label: getOrderStatusLabel(status),
              }),
            ),
          ]}
          triggerClassName="w-full sm:w-52"
        />
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isPending && !data}
          isFetching={isFetching}
          onRowClick={(row) => router.push(`/orders/${row.id}`)}
          embedded
        />

        <div className="shrink-0">
          <Pagination
            pagination={data?.pagination}
            currentPage={page}
            isLoading={isPending && !data}
            isFetching={isFetching}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
