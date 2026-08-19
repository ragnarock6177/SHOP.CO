"use client";

import React, { useState } from "react";
import Link from "next/link.js";
import { ColumnDef } from "@tanstack/react-table";
import { Truck, Plus, ExternalLink } from "lucide-react";
import { useShipments, useCreateShipment, useUpdateShipmentStatus, ShipmentItem } from "../../../hooks/queries/useFulfillment";
import { DataTable } from "../../../components/data-table/DataTable";
import { Pagination } from "../../../components/data-table/Pagination";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { CreateShipmentModal } from "../../../components/fulfillment/CreateShipmentModal";
import { PermissionGate } from "../../../components/rbac/PermissionGate";

export default function ShipmentsPage() {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data, isLoading } = useShipments({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const createMutation = useCreateShipment();
  const updateStatusMutation = useUpdateShipmentStatus();

  const handleCreateShipment = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const columns: ColumnDef<ShipmentItem>[] = [
    {
      accessorKey: "trackingNumber",
      header: "Carrier & Tracking",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-zinc-100">{row.original.carrier}</span>
          <div className="flex items-center space-x-1">
            <code className="text-[11px] text-zinc-400 font-mono">{row.original.trackingNumber}</code>
            {row.original.trackingUrl && (
              <a
                href={row.original.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-zinc-100"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "orderId",
      header: "Order Reference",
      cell: ({ row }) => (
        <Link href={`/orders/${row.original.orderId}`} className="text-xs font-semibold text-zinc-200 hover:underline">
          #{row.original.orderNumber || row.original.orderId.slice(0, 8)}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: "Shipment Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Update Tracking",
      cell: ({ row }) => (
        <PermissionGate permission="fulfillment:update">
          {row.original.status !== "DELIVERED" && (
            <select
              value=""
              onChange={(e) => updateStatusMutation.mutate({ id: row.original.id, status: e.target.value as any })}
              disabled={updateStatusMutation.isPending}
              className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="" disabled>
                Shift Status...
              </option>
              {row.original.status === "PENDING" && <option value="SHIPPED">Mark SHIPPED</option>}
              <option value="DELIVERED">Mark DELIVERED</option>
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
          <h1 className="text-xl font-bold text-zinc-100">Package Shipments & Fulfillment</h1>
          <p className="text-xs text-zinc-400">Track logistics carrier status, tracking numbers, and package delivery</p>
        </div>
        <PermissionGate permission="fulfillment:create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Shipment</span>
          </button>
        </PermissionGate>
      </div>

      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="">All Shipment Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} />

      <Pagination pagination={data?.pagination} onPageChange={(p) => setPage(p)} />

      <CreateShipmentModal
        isOpen={isModalOpen}
        isLoading={createMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateShipment}
      />
    </div>
  );
}
