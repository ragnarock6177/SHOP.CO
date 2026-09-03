"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useInventoryReservations,
  useReleaseReservation,
  useSweepExpiredReservations,
} from "@/hooks/queries/useInventory";
import { DataTable } from "@/components/data-table/DataTable";
import { Pagination } from "@/components/data-table/Pagination";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Clock, RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function InventoryReservationsPage() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedForRelease, setSelectedForRelease] = useState<any | null>(null);

  const queryParams = {
    page,
    limit: 10,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  };

  const { data, isLoading } = useInventoryReservations(queryParams);
  const releaseMutation = useReleaseReservation();
  const sweepMutation = useSweepExpiredReservations();

  const handleConfirmRelease = async () => {
    if (!selectedForRelease) return;
    await releaseMutation.mutateAsync(selectedForRelease.id);
    setSelectedForRelease(null);
  };

  const handleSweepExpired = async () => {
    await sweepMutation.mutateAsync();
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "sku",
      header: "Product & SKU",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-0.5">
          <span className="text-xs font-bold text-slate-900 line-clamp-1">
            {row.original.productName || "Product Variant"}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {row.original.sku || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Reserved Qty",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-900">
          {row.original.quantity} unit{row.original.quantity > 1 ? "s" : ""}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "ACTIVE") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Hold
            </span>
          );
        }
        if (status === "EXPIRED") {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Expired (Pending Sweep)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Released
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Hold Created",
      cell: ({ row }) => (
        <span className="text-[11px] font-medium text-slate-600">
          {new Date(row.original.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires At",
      cell: ({ row }) => {
        const isPast = new Date(row.original.expiresAt) <= new Date();
        return (
          <span
            className={`text-[11px] font-medium ${
              isPast && !row.original.releasedAt ? "text-amber-700 font-bold" : "text-slate-600"
            }`}
          >
            {new Date(row.original.expiresAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => (
        <span className="text-[11px] font-medium text-slate-700">
          {row.original.orderId
            ? `Order #${row.original.orderId.slice(0, 8)}`
            : row.original.cartId
            ? `Cart #${row.original.cartId.slice(0, 8)}`
            : "Checkout Hold"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const canRelease = !row.original.releasedAt;
        if (!canRelease) {
          return <span className="text-[11px] text-slate-400">—</span>;
        }

        return (
          <button
            onClick={() => setSelectedForRelease(row.original)}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            Release Hold
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col min-h-0 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
            Stock Reservations
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Manage real-time checkout holds and automated 15-minute expiration lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
            {["ALL", "ACTIVE", "EXPIRED", "RELEASED"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Sweep Expired Button */}
          <button
            onClick={handleSweepExpired}
            disabled={sweepMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${sweepMutation.isPending ? "animate-spin" : ""}`} />
            Sweep Expired
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-xs">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          embedded
        />

        <div className="shrink-0">
          <Pagination
            pagination={data?.pagination}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Release Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedForRelease)}
        title="Release Stock Hold?"
        description={`This will release the reserved hold of ${selectedForRelease?.quantity} unit(s) for "${selectedForRelease?.sku}" and immediately restore available stock.`}
        confirmLabel="Release Stock"
        cancelLabel="Cancel"
        isLoading={releaseMutation.isPending}
        onConfirm={handleConfirmRelease}
        onCancel={() => setSelectedForRelease(null)}
      />
    </div>
  );
}
