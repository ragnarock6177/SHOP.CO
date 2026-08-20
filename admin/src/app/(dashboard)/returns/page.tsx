"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import { useReturns, useUpdateReturnStatus, ReturnRequestItem } from "../../../hooks/queries/useReturns";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function ReturnsPage() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useReturns({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateReturnStatus();

  const columns: ColumnDef<ReturnRequestItem>[] = [
    {
      accessorKey: "returnNumber",
      header: "Return #",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 text-slate-500" />
          <span className="font-mono text-xs font-semibold text-slate-900">{row.original.returnNumber}</span>
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
      accessorKey: "reason",
      header: "Reason & Customer",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-slate-800">{row.original.reason}</span>
          <p className="text-[10px] text-slate-500">{row.original.customerEmail}</p>
        </div>
      ),
    },
    {
      accessorKey: "refundAmount",
      header: "Refund Amount",
      cell: ({ row }) => <span className="font-bold text-slate-900">₹{row.original.refundAmount}</span>,
    },
    {
      accessorKey: "status",
      header: "Return Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Update Status",
      cell: ({ row }) => (
        <PermissionGate permission="returns:update">
          {row.original.status !== "COMPLETED" && row.original.status !== "REJECTED" && (
            <select
              value=""
              onChange={(e) => updateStatusMutation.mutate({ id: row.original.id, status: e.target.value as any })}
              disabled={updateStatusMutation.isPending}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:outline-none"
            >
              <option value="" disabled>
                Shift Status...
              </option>
              {row.original.status === "REQUESTED" && (
                <>
                  <option value="APPROVED">Approve Return</option>
                  <option value="REJECTED">Reject Return</option>
                </>
              )}
              {row.original.status === "APPROVED" && <option value="RECEIVED">Mark Items RECEIVED</option>}
              {row.original.status === "RECEIVED" && <option value="COMPLETED">Mark COMPLETED</option>}
            </select>
          )}
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">After-Sales Return Requests</h1>
          <p className="text-xs text-slate-500">Inspect customer return submissions, item inspect states, and approval flows</p>
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
            <option value="">All Return Statuses</option>
            <option value="REQUESTED">Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="RECEIVED">Received</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
