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
import { CustomSelect } from "@/components/ui/select";

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
          <span className="text-xs font-semibold text-slate-900">{row.original.returnNumber}</span>
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
            <CustomSelect
              value=""
              placeholder="Shift Status..."
              onChange={(val) => {
                if (val) {
                  updateStatusMutation.mutate({ id: row.original.id, status: val as any });
                }
              }}
              disabled={updateStatusMutation.isPending}
              options={[
                ...(row.original.status === "REQUESTED"
                  ? [
                      { value: "APPROVED", label: "Approve Return" },
                      { value: "REJECTED", label: "Reject Return" },
                    ]
                  : []),
                ...(row.original.status === "APPROVED"
                  ? [{ value: "RECEIVED", label: "Mark Items RECEIVED" }]
                  : []),
                ...(row.original.status === "RECEIVED"
                  ? [{ value: "COMPLETED", label: "Mark COMPLETED" }]
                  : []),
              ]}
              triggerClassName="h-7 px-2.5 text-[11px] w-40"
            />
          )}
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CustomSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          options={[
            { value: "", label: "All Return Statuses" },
            { value: "REQUESTED", label: "Requested" },
            { value: "APPROVED", label: "Approved" },
            { value: "RECEIVED", label: "Received" },
            { value: "COMPLETED", label: "Completed" },
            { value: "REJECTED", label: "Rejected" },
          ]}
          triggerClassName="w-44"
        />
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} currentPage={page} isLoading={isLoading} onPageChange={(p) => setPage(p)} />
    </div>
  );
}
